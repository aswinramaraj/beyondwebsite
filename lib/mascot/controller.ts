/**
 * Beyond Logik mascot: loads the rigged GLB, owns its animation state machine and render loop. Framework-free (the React wrapper is
 * components/Mascot.tsx).
 *
 * Clips (case-sensitive, from fantasy_pet.glb): Rotate · Fly (loop) · Lift · Backflip · Bite · Fire.
 *  - Fly starts mid-air, so it is never played from standing: Lift always runs first and chains into Fly by itself.
 *  - Lift, Rotate, Backflip, Bite and Fire play once (clamped on their last frame); cross-fades are 0.2 s.
 *  - When a one-shot ends the pet returns to its idle state: `idle: 'fly'` → Lift → Fly again, `idle: 'rest'` → fades back to the standing pose.
 *  - The Fire_* meshes are always in the scene and are shrunk to ~1.5 cm inside the trunk tip by the rig – never hide or toggle them.
 */
import * as THREE from 'three';

export const ACTIONS = ['Rotate', 'Fly', 'Lift', 'Backflip', 'Bite', 'Fire'] as const;
export type Action = (typeof ACTIONS)[number];
export type Idle = 'rest' | 'fly';
/** what the pet is doing right now: standing, taking off, hovering, or the name of the one-shot clip that is playing */
export type Phase = 'rest' | 'lift' | 'fly' | Action;

const FADE = 0.2; // cross-fade between clips (s)
const TRICKS: Action[] = ['Rotate', 'Backflip', 'Bite']; // what `autoplay` cycles through
/**
 * World-space box (metres) that contains every pose of every clip for a facing angle up to ~0.6 rad, measured with tools/mascot/verify.mjs
 * (union over all clips: x ±2.95, y −0.40 … 3.99, fire reaches z 3.4). The camera frames this box, so nothing is ever cropped.
 */
const FRAME = { halfW: 3.0, yMin: -0.45, yMax: 4.05 };

export interface MascotOptions {
  canvas: HTMLCanvasElement;
  url: string;
  idle?: Idle;
  /** rotation about Y in radians (0 = facing the viewer, + = turned toward screen-right) */
  yaw?: number;
  /** play a random trick every 9–14 s while idle */
  autoplay?: boolean;
  onPhase?: (phase: Phase) => void;
}

export class MascotController {
  readonly clipNames: string[] = [];
  ready = false;
  idle: Idle;
  phase: Phase = 'rest';
  autoplay: boolean;

  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 600);
  private root: THREE.Group | null = null;
  private mixer: THREE.AnimationMixer | null = null;
  private actions = {} as Record<Action, THREE.AnimationAction>;
  private current: THREE.AnimationAction | null = null;
  private mode: 'rest' | 'lift' | 'fly' | 'shot' = 'rest';
  private queued: Action | null = null;
  private visible = false;
  private raf = 0;
  private last = 0;
  private trickTimer = 6;
  private trickIdx = 0;
  private size = { w: 0, h: 0 };
  private disposed = false;

  constructor(private o: MascotOptions) {
    this.idle = o.idle ?? 'rest';
    this.autoplay = !!o.autoplay;
    const r = (this.renderer = new THREE.WebGLRenderer({ canvas: o.canvas, alpha: true, antialias: true, powerPreference: 'low-power' }));
    r.setClearColor(0x000000, 0);
    r.toneMapping = THREE.ACESFilmicToneMapping;
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x9fb0d0, 1.05));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(-2, 4, 5);
    this.scene.add(key);
    this.camera.position.z = 300;
  }

  /** download (meshopt-compressed GLB), build the mixer and validate the clips; resolves with the clip names */
  async load(): Promise<string[]> {
    const [{ GLTFLoader }, { MeshoptDecoder }] = await Promise.all([
      import('three/examples/jsm/loaders/GLTFLoader.js'),
      import('three/examples/jsm/libs/meshopt_decoder.module.js'),
    ]);
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    const gltf = await loader.loadAsync(this.o.url);
    if (this.disposed) return [];
    const root = gltf.scene;
    root.rotation.y = this.o.yaw ?? 0.55;
    root.traverse((m) => { m.frustumCulled = false; }); // skinned bounds come from the bind pose; the pet leaves it (fly, flip)
    this.scene.add(root);
    this.root = root;
    const mixer = (this.mixer = new THREE.AnimationMixer(root));
    this.clipNames.push(...gltf.animations.map((c) => c.name));
    const missing = ACTIONS.filter((a) => !this.clipNames.includes(a));
    const extra = this.clipNames.filter((n) => !(ACTIONS as readonly string[]).includes(n));
    console.info('[mascot] animation clips:', this.clipNames.join(', '));
    if (missing.length || extra.length) console.warn('[mascot] clip names differ from the expected six – missing:', missing, 'unexpected:', extra);
    for (const clip of gltf.animations) {
      if (!(ACTIONS as readonly string[]).includes(clip.name)) continue;
      const a = mixer.clipAction(clip);
      if (clip.name === 'Fly') a.setLoop(THREE.LoopRepeat, Infinity);
      else { a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = true; }
      this.actions[clip.name as Action] = a;
    }
    mixer.addEventListener('finished', (e) => this.onFinished(e.action));
    this.ready = true;
    this.layout();
    return this.clipNames;
  }

  // ───────────────────────────── playing ─────────────────────────────

  /**
   * Play a clip. Returns false if the pet is busy with a one-shot (unless `queue` is set: then it plays right after).
   * 'Fly' and 'Lift' both mean "take off and hover" (Lift → Fly is chained automatically).
   */
  play(a: Action, o: { queue?: boolean } = {}): boolean {
    if (!this.ready || !this.actions[a]) return false;
    if (this.mode === 'shot') {
      if (!o.queue) return false;
      this.queued = a;
      return true;
    }
    if (a === 'Fly' || a === 'Lift') this.goLift();
    else this.startShot(a);
    return true;
  }

  setIdle(idle: Idle) {
    this.idle = idle;
    if (!this.ready) return;
    if (idle === 'fly' && this.mode === 'rest' && this.visible) this.goLift();
    if (idle === 'rest' && (this.mode === 'fly' || this.mode === 'lift')) this.toRest();
  }

  /** the pet is on screen: render, and (for `idle: 'fly'`) take off; off screen: stop rendering and go back to the standing pose */
  setVisible(v: boolean) {
    if (v === this.visible) return;
    this.visible = v;
    if (v) {
      this.trickTimer = 5;
      this.startLoop();
      if (this.ready && this.idle === 'fly' && this.mode === 'rest') this.goLift();
    } else {
      this.stopLoop();
      this.reset();
    }
  }

  private fadeTo(next: THREE.AnimationAction) {
    const prev = this.current;
    next.reset().play();
    if (prev && prev !== next) prev.crossFadeTo(next, FADE, false);
    else next.fadeIn(FADE);
    this.current = next;
  }
  private goLift() {
    if (this.mode === 'lift' || this.mode === 'fly') return;
    this.fadeTo(this.actions.Lift);
    this.mode = 'lift';
    this.emit('lift');
  }
  private startShot(a: Action) {
    this.queued = null;
    this.fadeTo(this.actions[a]);
    this.mode = 'shot';
    this.emit(a);
  }
  private toRest() {
    this.current?.fadeOut(0.3);
    this.current = null;
    this.mode = 'rest';
    this.queued = null;
    this.emit('rest');
  }
  private reset() {
    this.mixer?.stopAllAction();
    this.current = null;
    this.mode = 'rest';
    this.queued = null;
    this.emit('rest');
  }
  private onFinished(action: THREE.AnimationAction) {
    if (action !== this.current) return; // an older clip that was already cross-faded away
    if (this.mode === 'lift') {
      this.fadeTo(this.actions.Fly); // Lift's last frame is Fly's first frame
      this.mode = 'fly';
      this.emit('fly');
      return;
    }
    if (this.mode === 'shot') {
      const q = this.queued;
      this.queued = null;
      this.mode = 'rest';
      if (q) this.play(q);
      else if (this.idle === 'fly') this.goLift(); // one-shots end standing; Lift → Fly takes off again without a pop
      else this.toRest();
    }
  }
  private emit(p: Phase) {
    this.phase = p;
    this.o.onPhase?.(p);
  }

  // ───────────────────────────── frame loop ─────────────────────────────

  tick(dt: number, draw = true) {
    if (!this.ready || !this.mixer) return;
    this.mixer.update(dt);
    if (this.autoplay && (this.mode === 'fly' || this.mode === 'rest')) {
      this.trickTimer -= dt;
      if (this.trickTimer <= 0) {
        this.play(TRICKS[this.trickIdx++ % TRICKS.length]);
        this.trickTimer = 9 + Math.random() * 5;
      }
    }
    if (draw) this.renderer.render(this.scene, this.camera);
  }
  /** stop / restart the render loop without touching the pose (used by tests that step `tick()` by hand) */
  pause() { this.stopLoop(); }
  resume() { if (this.visible) this.startLoop(); }
  private startLoop() {
    if (this.raf || this.disposed) return;
    this.last = performance.now();
    const loop = (now: number) => {
      this.raf = requestAnimationFrame(loop);
      const dt = Math.min((now - this.last) / 1000, 0.1);
      this.last = now;
      this.tick(dt);
    };
    this.raf = requestAnimationFrame(loop);
  }
  private stopLoop() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  /** (re)fit the canvas: the FRAME box is scaled to fill it and sits on its bottom edge */
  resize(w: number, h: number, dpr: number) {
    if (this.disposed || w < 2 || h < 2) return;
    this.size = { w, h };
    this.renderer.setPixelRatio(Math.min(dpr, 2));
    this.renderer.setSize(w, h, false);
    this.camera.left = -w / 2; this.camera.right = w / 2; this.camera.top = h / 2; this.camera.bottom = -h / 2;
    this.camera.updateProjectionMatrix();
    this.layout();
    if (this.ready && !this.raf) this.renderer.render(this.scene, this.camera);
  }
  private layout() {
    const { w, h } = this.size;
    if (!this.root || !w) return;
    const s = Math.min(w / (2 * FRAME.halfW), h / (FRAME.yMax - FRAME.yMin)); // pixels per metre
    this.root.scale.setScalar(s);
    this.root.position.set(0, -h / 2 - FRAME.yMin * s + (h - (FRAME.yMax - FRAME.yMin) * s) / 2, 0);
  }

  // ───────────────────────────── debugging / tests ─────────────────────────────

  /** largest world-space extent (m) of the Fire_* meshes in the current pose – ~0.015 at rest, ~1.5 during Fire */
  fireExtent(): number {
    let max = 0;
    const k = this.root?.scale.x || 1; // the root is scaled to pixels; convert back to metres
    this.root?.traverse((o) => {
      if (!/^Fire_/.test(o.name) || !(o as THREE.Mesh).isMesh) return;
      const s = new THREE.Box3().setFromObject(o, true).getSize(new THREE.Vector3());
      max = Math.max(max, s.x, s.y, s.z);
    });
    return +(max / k).toFixed(4);
  }

  dispose() {
    this.disposed = true;
    this.stopLoop();
    this.mixer?.stopAllAction();
    if (this.root) this.mixer?.uncacheRoot(this.root);
    this.root?.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.geometry.dispose();
      (Array.isArray(m.material) ? m.material : [m.material]).forEach((x) => x.dispose());
      (m as THREE.SkinnedMesh).skeleton?.dispose?.();
    });
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}
