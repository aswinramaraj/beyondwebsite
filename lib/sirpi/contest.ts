/**
 * Sirpi contest (the monthly Stupid Problem Prize) — talks to backend/sirpi through the same-origin proxy /sirpi-api.
 *  · countdown to the end of the contest month (server time zone), burning in the bonfire; prize from the server (PRIZE env)
 *  · leaderboard (top 5) and "See all problems & vote": a dialog with every problem this month, Most votes / Newest, search, paging
 *  · posting and voting need Google sign-in: Google's own button (Google Identity Services, loaded only when someone signs in)
 *    gives us an ID token, the backend verifies it and sets an HttpOnly session cookie.
 *  · only real posts are ever shown. If the backend is unreachable the section says so; if no Google client ID is configured yet,
 *    the contest is read-only.
 */
import type { Ctx } from './film';

const API = '/sirpi-api';
type User = { id: number; name: string; firstName: string; picture: string | null };
type Item = { id: string; text: string; place: string; votes: number; voted: boolean; mine: boolean; author: { name: string; picture: string | null } };
type Config = { googleClientId: string | null; prize: string | null; month: string; monthLabel: string; closesAt: string; maxPerMonth: number };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

const GOOGLE_G = '<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.8 6C12.3 13.4 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/><path fill="#FBBC05" d="M10.4 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.3.8-4.7l-7.8-6C.9 16.6 0 20.2 0 24s.9 7.4 2.6 10.7l7.8-6z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.7-3.9-13.6-9.8l-7.8 6C6.6 42.6 14.6 48 24 48z"/></svg>';

export function initContest(ctx: Ctx) {
  const { root, on, every } = ctx;
  const $ = <T extends HTMLElement = HTMLElement>(s: string) => root.querySelector(s) as T;
  const account = $('#sp-account'), board = $('#sp-board'), boardNote = $('#sp-boardNote');
  const allDlg = $<HTMLDialogElement>('#sp-all'), loginDlg = $<HTMLDialogElement>('#sp-login');
  const allList = $('#sp-allList'), allMore = $('#sp-allMore'), allEmpty = $('#sp-allEmpty'), allSearch = $<HTMLInputElement>('#sp-allSearch');
  const text = $<HTMLTextAreaElement>('#sp-entryText'), where = $<HTMLInputElement>('#sp-entryWhere'), note = $('#sp-entryNote');
  const postBtn = $<HTMLButtonElement>('#sp-entryForm button[type="submit"]');
  const toastEl = $('#sp-toast');

  let cfg: Config | null = null, me: User | null = null, offline = false;
  const items = new Map<string, Item>(); // every item currently shown, by id (board + dialog share them)

  /* ── helpers ── */
  async function api<T = Any>(path: string, body?: unknown): Promise<T> {
    const r = await fetch(API + path, {
      method: body === undefined ? 'GET' : 'POST', credentials: 'same-origin',
      headers: body === undefined ? {} : { 'Content-Type': 'application/json', 'X-Sirpi': '1' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    let j: Any = {};
    try { j = await r.json(); } catch { /* not JSON: the proxy could not reach the backend */ }
    if (!r.ok) throw Object.assign(new Error(j.error || (r.status >= 500 ? 'the contest server is not reachable' : 'HTTP ' + r.status)), { status: r.status, data: j });
    return j;
  }
  let toastT = 0;
  const toast = (msg: string, error = false) => {
    toastEl.textContent = msg;
    toastEl.classList.toggle('sp-is-error', error);
    toastEl.classList.add('sp-is-show');
    clearTimeout(toastT);
    toastT = window.setTimeout(() => toastEl.classList.remove('sp-is-show'), 3600);
  };
  const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ── countdown in the fire ── */
  const clockEls = Array.from(root.querySelectorAll('#sp-clock b')) as HTMLElement[];
  const endsAt = () => {
    if (cfg?.closesAt) return Date.parse(cfg.closesAt);
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth() + 1, 1).getTime();
  };
  const tick = () => {
    const s = Math.max(0, Math.floor((endsAt() - Date.now()) / 1000));
    [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60].forEach((v, i) => (clockEls[i].textContent = String(v).padStart(2, '0')));
  };
  tick();
  every(tick, 1000);

  /* ── account ── */
  function renderAccount() {
    if (offline) { account.innerHTML = '<span>The contest is offline right now. Please check back soon.</span>'; return; }
    if (me) {
      account.innerHTML = `${me.picture ? `<img src="${esc(me.picture)}" alt="" referrerpolicy="no-referrer" />` : ''}<span>Signed in as <b>${esc(me.firstName)}</b></span><button type="button" class="sp-linkbtn" data-signout>Sign out</button>`;
    } else if (cfg && !cfg.googleClientId) {
      account.innerHTML = '<span>Sign-in opens soon — you can already read this month’s problems.</span>';
    } else {
      account.innerHTML = `<button type="button" class="sp-gsign" data-signin>${GOOGLE_G}Sign in with Google</button><span>to post and vote</span>`;
    }
    note.textContent = me ? `Posting as ${me.firstName} · up to ${cfg?.maxPerMonth ?? 3} problems a month` : `Sign in with Google to post · up to ${cfg?.maxPerMonth ?? 3} problems a month`;
  }
  on(account, 'click', (e: Event) => {
    const t = e.target as HTMLElement;
    if (t.closest('[data-signin]')) requireLogin('post and vote', () => {});
    if (t.closest('[data-signout]')) signOut();
  });

  /* ── rows ── */
  function row(it: Item, rank: number) {
    items.set(it.id, it);
    const li = document.createElement('li');
    li.dataset.id = String(it.id);
    if (it.mine) li.classList.add('sp-is-mine');
    const by = `${it.author.picture ? `<img src="${esc(it.author.picture)}" alt="" referrerpolicy="no-referrer" />` : ''}by ${esc(it.author.name)}${it.mine ? ' (you)' : ''}`;
    li.innerHTML = `<span class="sp-board__rank">${rank}</span>
      <div class="sp-board__text">${esc(it.text)}<span class="sp-board__where">${it.place ? esc(it.place) + ' · ' : ''}<span class="sp-board__by">${by}</span></span></div>`;
    const v = document.createElement('button');
    v.type = 'button';
    v.className = 'sp-vote';
    paintVote(v, it);
    li.appendChild(v);
    return li;
  }
  function paintVote(v: HTMLButtonElement, it: Item) {
    v.classList.toggle('sp-is-voted', it.voted);
    v.disabled = it.mine || offline;
    v.setAttribute('aria-pressed', String(it.voted));
    v.setAttribute('aria-label', it.mine ? 'Your problem' : `${it.voted ? 'Remove your vote for' : 'Vote for'}: ${it.text}`);
    v.title = it.mine ? 'You can’t vote for your own problem' : '';
    v.innerHTML = `▲ ${it.votes}<small>${it.voted ? 'voted' : 'vote'}</small>`;
  }
  const repaint = (id: string) => {
    const it = items.get(id);
    root.querySelectorAll(`li[data-id="${CSS.escape(id)}"] .sp-vote`).forEach((b) => paintVote(b as HTMLButtonElement, it));
  };
  const onVoteClick = (e: Event) => {
    const b = (e.target as HTMLElement).closest('.sp-vote') as HTMLButtonElement | null;
    if (!b || b.disabled) return;
    const id = (b.closest('li') as HTMLElement).dataset.id;
    requireLogin('vote', () => vote(id));
  };
  on(board, 'click', onVoteClick);
  on(allList, 'click', onVoteClick);

  async function vote(id: string) {
    const it = items.get(id);
    if (!it || it.mine) return;
    try {
      const r = await api<{ votes: number; voted: boolean }>(`/problems/${encodeURIComponent(id)}/vote`, {});
      const delta = r.voted === it.voted ? 0 : r.voted ? 1 : -1;
      it.votes = r.votes; it.voted = r.voted;
      repaint(id);
      bumpStats(0, delta);
    } catch (e) { handleError(e); }
  }

  /* ── stats + leaderboard ── */
  const statP = $('#sp-statProblems'), statV = $('#sp-statVotes'), allCount = $('#sp-allCount');
  let stats = { problems: 0, votes: 0 };
  const paintStats = () => {
    statP.textContent = String(stats.problems);
    statV.textContent = String(stats.votes);
    allCount.textContent = stats.problems ? `(${stats.problems})` : '';
    if (!offline) boardNote.textContent = stats.problems ? `${stats.votes} ${stats.votes === 1 ? 'vote' : 'votes'} so far` : '';
  };
  const bumpStats = (dp: number, dv: number) => { stats = { problems: stats.problems + dp, votes: stats.votes + dv }; paintStats(); };

  async function loadTop() {
    try {
      const r = await api<{ items: Item[]; stats: typeof stats }>('/problems?sort=top&limit=5');
      stats = r.stats; paintStats();
      board.textContent = '';
      if (!r.items.length) {
        board.innerHTML = '<li class="sp-board__empty">No problems yet this month. Post the first one — and light the fire.</li>';
      } else {
        r.items.forEach((it, i) => board.appendChild(row(it, i + 1)));
      }
    } catch { goOffline(); }
  }
  function goOffline() {
    offline = true;
    board.textContent = '';
    board.innerHTML = '<li class="sp-board__empty">The contest is offline right now. Please check back soon.</li>';
    boardNote.textContent = '';
    renderAccount();
  }

  /* ── all problems dialog ── */
  const all = { sort: 'top', q: '', offset: 0, loading: false, seq: 0 };
  async function loadAll(reset: boolean) {
    if (all.loading && !reset) return;
    const seq = ++all.seq;
    all.loading = true;
    if (reset) { all.offset = 0; allList.textContent = ''; }
    try {
      if (offline) throw new Error('offline');
      const r = await api<{ items: Item[]; more: boolean }>(`/problems?sort=${all.sort}&limit=30&offset=${all.offset}&q=${encodeURIComponent(all.q)}`);
      if (seq !== all.seq) return; // a newer search/tab replaced this one
      r.items.forEach((it, i) => allList.appendChild(row(it, all.offset + i + 1)));
      all.offset += r.items.length;
      allMore.hidden = !r.more;
      allEmpty.hidden = allList.children.length > 0;
    } catch {
      if (seq !== all.seq) return;
      if (offline) { allEmpty.textContent = 'The contest is offline right now. Please check back soon.'; allEmpty.hidden = false; allMore.hidden = true; }
      else toast('Could not load the problems. Try again in a moment.', true);
    } finally { if (seq === all.seq) all.loading = false; }
  }
  on($('#sp-allBtn'), 'click', () => {
    $('#sp-allMonth').textContent = cfg ? cfg.monthLabel : '';
    allDlg.showModal();
    loadAll(true);
  });
  on(allMore, 'click', () => loadAll(false));
  root.querySelectorAll('.sp-tabs [data-sort]').forEach((t) => on(t, 'click', () => {
    all.sort = (t as HTMLElement).dataset.sort;
    root.querySelectorAll('.sp-tabs [data-sort]').forEach((x) => x.setAttribute('aria-selected', String(x === t)));
    loadAll(true);
  }));
  let searchT = 0;
  on(allSearch, 'input', () => { clearTimeout(searchT); searchT = window.setTimeout(() => { all.q = allSearch.value.trim(); loadAll(true); }, 300); });
  // close buttons and clicks on the backdrop
  for (const d of [allDlg, loginDlg]) {
    on(d, 'click', (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('[data-close]')) { d.close(); return; }
      const r = d.getBoundingClientRect();
      if (e.target === d && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) d.close();
    });
  }

  /* ── sign in with Google ── */
  let pending: (() => void) | null = null;
  let gisReady: Promise<void> | null = null;
  const loadGis = () => (gisReady ??= new Promise<void>((res, rej) => {
    if ((window as Any).google?.accounts?.id) return res();
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.onload = () => res();
    s.onerror = () => { gisReady = null; rej(new Error('gsi')); };
    document.head.appendChild(s);
  }));
  async function signedIn(user: User) {
    me = user;
    loginDlg.close();
    renderAccount();
    toast(`Welcome, ${user.firstName}!`);
    await loadTop();
    if (allDlg.open) loadAll(true);
    const p = pending; pending = null;
    p?.();
  }
  function requireLogin(why: string, then: () => void) {
    if (me) { then(); return; }
    if (offline) { toast('The contest server is offline right now.', true); return; }
    pending = then;
    $('#sp-loginWhy').textContent = why;
    const msg = $('#sp-loginMsg'), gbtn = $('#sp-gbtn');
    msg.textContent = ''; gbtn.textContent = '';
    loginDlg.showModal();
    if (!cfg?.googleClientId) { msg.textContent = 'Google sign-in is not switched on yet.'; return; }
    msg.textContent = 'Loading Google sign-in…';
    loadGis().then(() => {
      const gid = (window as Any).google.accounts.id;
      gid.initialize({
        client_id: cfg.googleClientId,
        callback: async (resp: { credential: string }) => {
          msg.textContent = 'Signing you in…';
          try { signedIn((await api<{ user: User }>('/auth/google', { credential: resp.credential })).user); }
          catch (e) { msg.textContent = (e as Error).message; }
        },
        auto_select: false, cancel_on_tap_outside: true, context: 'signin', ux_mode: 'popup',
      });
      gid.renderButton(gbtn, { theme: 'filled_black', size: 'large', shape: 'pill', text: 'continue_with', logo_alignment: 'left', width: 280 });
      msg.textContent = '';
    }).catch(() => { msg.textContent = 'Could not reach Google. Check your connection and try again.'; });
  }
  async function signOut() {
    try { await api('/auth/logout', {}); } catch { /* the cookie expires anyway */ }
    (window as Any).google?.accounts?.id?.disableAutoSelect?.();
    me = null;
    renderAccount();
    toast('Signed out.');
    loadTop();
  }

  /* ── post a problem ── */
  on($('#sp-entryForm'), 'submit', (ev: Event) => {
    ev.preventDefault();
    const t = text.value.trim().replace(/\s+/g, ' ');
    if (t.length < 8) { toast('Tell us a little more (at least 8 characters).', true); text.focus(); return; }
    requireLogin('post your problem', async () => {
      postBtn.disabled = true;
      try {
        await api('/problems', { text: t, place: where.value.trim() });
        text.value = ''; where.value = '';
        toast('Posted! It’s in the fire — now get people to vote.');
        await loadTop();
        if (allDlg.open) loadAll(true);
      } catch (e) { handleError(e); }
      finally { postBtn.disabled = false; }
    });
  });

  function handleError(e: unknown) {
    const err = e as { status?: number; message: string };
    if (err.status === 401) { me = null; renderAccount(); toast('Please sign in again.', true); return; }
    toast(err.message.charAt(0).toUpperCase() + err.message.slice(1), true);
  }

  /* ── boot ── */
  (async () => {
    try {
      const [c, m] = await Promise.all([api<Config>('/config'), api<{ user: User | null }>('/me')]);
      if (ctx.dead()) return;
      cfg = c; me = m.user;
      $('#sp-contestMonth').textContent = `${c.monthLabel} edition`;
      const prize = $('#sp-prize');
      prize.textContent = c.prize || 'to be announced';
      prize.classList.toggle('sp-is-tba', !c.prize);
      tick();
      renderAccount();
      await loadTop();
    } catch {
      if (!ctx.dead()) goOffline();
    }
  })();
  account.innerHTML = '<span>Connecting to the contest…</span>';

  return () => { clearTimeout(toastT); clearTimeout(searchT); if (allDlg.open) allDlg.close(); if (loginDlg.open) loginDlg.close(); };
}
