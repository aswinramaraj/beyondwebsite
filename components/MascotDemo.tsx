'use client';
/** Test page for the mascot (/mascot-demo): one button per clip, idle mode, a runtime check of the model's clips, and the interactions. */
import { useRef, useState } from 'react';
import Mascot, { type Action, type Idle, type MascotHandle, type Phase } from './Mascot';

const ALL: Action[] = ['Rotate', 'Fly', 'Lift', 'Backflip', 'Bite', 'Fire'];
const HINT: Record<Action, string> = {
  Rotate: 'Happy 360° spin with a hop',
  Fly: 'Take off and hover (Lift → Fly)',
  Lift: 'Takeoff – chains into Fly by itself',
  Backflip: 'Crouch, jump, full backward flip',
  Bite: 'Lunge with a double chomp',
  Fire: 'Inhale, then a flame blast',
};

export default function MascotDemo() {
  const pet = useRef<MascotHandle>(null);
  const [idle, setIdle] = useState<Idle>('rest');
  const [auto, setAuto] = useState(false);
  const [phase, setPhase] = useState<Phase>('rest');
  const [clips, setClips] = useState<string[] | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const fireAt = useRef(-Infinity);

  const onPhase = (p: Phase) => { setPhase(p); setLog((l) => [`${new Date().toLocaleTimeString([], { hour12: false })}  ${p}`, ...l].slice(0, 7)); };
  const play = (a: Action) => pet.current?.play(a, { queue: true });
  const breatheFire = () => { const n = performance.now(); if (n - fireAt.current > 3000) { fireAt.current = n; pet.current?.play('Fire'); } };
  const active = (a: Action) => phase === a || (a === 'Fly' && (phase === 'fly' || phase === 'lift'));
  const missing = clips ? ALL.filter((a) => !clips.includes(a)) : [];
  const extra = clips ? clips.filter((c) => !(ALL as string[]).includes(c)) : [];

  return (
    <main className="bl-md">
      <header className="bl-md-head">
        <p className="bl-md-kicker">Beyond Logik</p>
        <h1>Meet the mascot</h1>
        <p className="bl-md-lead">A rigged 3D model with six animation clips. Try them below – the same component lives next to the Contact button in the site header.</p>
      </header>

      <section className="bl-md-stage" aria-label="Mascot stage">
        <Mascot ref={pet} idle={idle} autoplay={auto} yaw={0.35} onReady={setClips} onPhase={onPhase} />
        <span className="bl-md-phase" aria-live="polite">now: <b>{phase}</b></span>
      </section>

      <section className="bl-md-panel">
        <h2>Actions</h2>
        <div className="bl-md-actions">
          {ALL.map((a) => (
            <button key={a} type="button" className={active(a) ? 'is-on' : ''} onClick={() => play(a)} title={HINT[a]}>
              <b>{a}</b><span>{HINT[a]}</span>
            </button>
          ))}
        </div>

        <div className="bl-md-row">
          <div className="bl-md-seg" role="group" aria-label="Idle behaviour">
            <span>Idle</span>
            <button type="button" className={idle === 'rest' ? 'is-on' : ''} onClick={() => setIdle('rest')}>Rest</button>
            <button type="button" className={idle === 'fly' ? 'is-on' : ''} onClick={() => setIdle('fly')}>Fly</button>
          </div>
          <label className="bl-md-check"><input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} /> Random trick every 9–14 s</label>
        </div>
      </section>

      <section className="bl-md-panel">
        <h2>Interactions</h2>
        <ul className="bl-md-list">
          <li><b>Hover the pet</b> → Rotate <em>(built)</em></li>
          <li><b>Click the pet</b> (or Enter on it) → Backflip <em>(built)</em></li>
          <li><b>Scroll into view</b> → Lift, then Fly – set Idle to <i>Fly</i>, scroll down and back up <em>(built)</em></li>
          <li><b>CTA hover</b> → Fire: <button type="button" className="bl-md-cta" onMouseEnter={breatheFire} onFocus={breatheFire}>Book a call</button> <em>(built; the site header does this on Contact)</em></li>
        </ul>
        <p className="bl-md-note"><b>More ideas, not built:</b> Bite when a form is submitted · Backflip on a successful submit · Fire on the dock&apos;s “Book a call” · eyes that follow the cursor (needs eye bones) · Rotate when a new section scrolls in · a “Land” clip so Fly can return to the ground smoothly.</p>
      </section>

      <section className="bl-md-panel">
        <h2>Runtime check</h2>
        {clips === null ? (
          <p className="bl-md-note">Loading the model… (it downloads when the stage is near the viewport)</p>
        ) : (
          <>
            <div className="bl-md-chips">
              {ALL.map((a) => <span key={a} className={clips.includes(a) ? 'ok' : 'bad'}>{clips.includes(a) ? '✓' : '✗'} {a}</span>)}
            </div>
            <p className="bl-md-note">
              {missing.length === 0 && extra.length === 0 ? `Exactly the six expected clips were found (${clips.join(', ')}).` : `Mismatch – missing: ${missing.join(', ') || 'none'}; unexpected: ${extra.join(', ') || 'none'}.`}
              {' '}The same list is written to the browser console (<code>[mascot] animation clips</code>).
            </p>
          </>
        )}
        <pre className="bl-md-log" aria-label="Event log">{log.length ? log.join('\n') : 'events appear here'}</pre>
      </section>

      <section className="bl-md-scroll">
        <p>Scroll test: with <b>Idle = Fly</b> the mascot takes off (Lift → Fly) every time its stage re-enters the viewport. Scroll back up.</p>
      </section>
    </main>
  );
}
