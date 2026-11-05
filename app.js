/* Planting Guide Naija - app logic (no server needed; everything is saved on the phone) */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const app = document.getElementById('app');
  const CFG = window.PGN_CONFIG || {};
  const byId = (id) => CROPS.find((c) => c.id === id);

  /* ---------- storage ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage full */ } },
    del(k) { try { localStorage.removeItem(k); } catch { /* ignore */ } }
  };
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = (n) => String(n).padStart(2, '0');
  const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const addDays = (s, n) => { const d = new Date(s + 'T00:00:00'); d.setDate(d.getDate() + n); return ymd(d); };
  const daysBetween = (a, b) => Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 864e5);
  const fmtDate = (s) => new Date(s + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const S = {
    user: null, tab: 'home', q: '', chip: 'all', authMode: 'login',
    settings: Object.assign({ dataSaver: false }, store.get('pgn_settings', {})),
    cropTab: 'plant'
  };

  const season = () => { const m = new Date().getMonth(); return m >= 3 && m <= 9 ? 'rainy' : 'dry'; };
  const seasonLabel = () => (season() === 'rainy' ? 'Rainy Season' : 'Dry Season');
  const monthYear = () => new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  const daysText = (c) => `${c.days[0]}-${c.days[1]} days`;
  const monthsText = (c) => { const a = Math.round(c.days[0] / 30), b = Math.round(c.days[1] / 30); return a === b ? `${a} months` : `${a}-${b} months`; };

  /* ---------- icons ---------- */
  const I = {
    leaf: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21v-8"/><path d="M12 13C12 8 8 5 3 5c0 5 3 8 9 8Z"/><path d="M12 15c0-4 3-7 9-7 0 5-3 7-9 7Z"/></svg>',
    bell: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/></svg>',
    home: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/></svg>',
    book: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4h7a3 3 0 0 1 3 3v14a2 2 0 0 0-2-2H2z"/><path d="M22 4h-7a3 3 0 0 0-3 3v14a2 2 0 0 1 2-2h8z"/></svg>',
    cloud: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 18a4 4 0 0 1-.5-7.97A5.5 5.5 0 0 1 17 9a4.5 4.5 0 0 1 .5 9z"/></svg>',
    news: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h13a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2z"/><path d="M19 9h2v9a2 2 0 0 1-2 2"/><path d="M8 8h7M8 12h7M8 16h4"/></svg>',
    user: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>',
    search: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    back: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    eye: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>'
  };

  /* ---------- toast / layers ---------- */
  let toastT;
  function toast(msg) {
    const t = $('#toast'); if (!t) return;
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 3200);
  }
  const stack = []; let pendingAfterPop = null;
  function pushLayer(type) { stack.push(type); history.pushState({ l: stack.length }, ''); }
  function closeTop(cb) { if (!stack.length) { cb && cb(); return; } pendingAfterPop = cb || null; history.back(); }
  window.addEventListener('popstate', () => {
    const t = stack.pop();
    if (t === 'sh') { const s = $('#sheet'); if (s) { s.classList.remove('open'); setTimeout(() => { s.innerHTML = ''; }, 250); } }
    if (t === 'ov') { const o = $('#overlay'); if (o) { o.classList.remove('open'); setTimeout(() => { o.innerHTML = ''; }, 250); } }
    const cb = pendingAfterPop; pendingAfterPop = null; if (cb) cb();
  });
  function showOverlay(html) { const o = $('#overlay'); o.innerHTML = html; requestAnimationFrame(() => o.classList.add('open')); pushLayer('ov'); }
  function showSheet(html) { const s = $('#sheet'); s.innerHTML = `<div class="backdrop" data-act="close"></div><div class="panel"><i class="grab"></i>${html}</div>`; requestAnimationFrame(() => s.classList.add('open')); pushLayer('sh'); }

  /* ---------- photos ---------- */
  function photoUrl(c, i, w) {
    const f = c.photos[i]; if (!f) return '';
    if (/^(https?:|img\/)/.test(f)) return f;
    return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(f)}?width=${w}`;
  }
  function photo(c, w, cls = '') {
    const width = S.settings.dataSaver ? Math.round(w / 2) : w;
    return `<div class="photo ${cls}" style="--g1:${c.grad[0]};--g2:${c.grad[1]}" data-emoji="${c.emoji}"><img src="${photoUrl(c, 0, width)}" alt="${esc(c.name)}" loading="lazy" decoding="async" data-crop="${c.id}" data-i="0" data-w="${width}"></div>`;
  }
  async function searchPhotos(c) {
    const k = 'pgn_ph_' + c.id; let list = store.get(k, null);
    if (list && list.length) return list;
    try {
      const q = encodeURIComponent((c.search || c.name) + ' filetype:bitmap');
      const r = await fetch(`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${q}&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url|mime&iiurlwidth=900&format=json&origin=*`);
      const j = await r.json();
      list = Object.values((j.query && j.query.pages) || {}).sort((a, b) => a.index - b.index)
        .map((p) => p.imageinfo && p.imageinfo[0]).filter((i) => i && /jpeg/.test(i.mime) && i.thumburl).map((i) => i.thumburl);
      if (list.length) store.set(k, list);
    } catch { list = []; }
    return list || [];
  }
  document.addEventListener('error', async (e) => {
    const img = e.target; if (!img || img.tagName !== 'IMG' || !img.dataset.crop) return;
    const c = byId(img.dataset.crop); if (!c) return;
    if (img.dataset.s === undefined) {
      const i = +img.dataset.i + 1, u = photoUrl(c, i, img.dataset.w);
      if (u) { img.dataset.i = i; img.src = u; return; }
      img.dataset.s = '0';
    } else img.dataset.s = String(+img.dataset.s + 1);
    const list = await searchPhotos(c), u = list[+img.dataset.s];
    if (!img.isConnected) return;
    if (u) img.src = u; else { img.parentElement.classList.add('nophoto'); img.remove(); }
  }, true);
  document.addEventListener('load', (e) => { if (e.target.tagName === 'IMG') e.target.classList.add('in'); }, true);

  /* ---------- accounts (saved on this phone only) ---------- */
  const enc = new TextEncoder();
  const b64 = (b) => btoa(String.fromCharCode(...new Uint8Array(b)));
  const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  async function hashPw(pw, saltB64) {
    if (!(window.crypto && crypto.subtle)) return { salt: '', hash: 'x' + btoa(unescape(encodeURIComponent(pw))) };
    const salt = saltB64 ? unb64(saltB64) : crypto.getRandomValues(new Uint8Array(16));
    const key = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 120000, hash: 'SHA-256' }, key, 256);
    return { salt: b64(salt), hash: b64(bits) };
  }
  const pwRules = [
    ['At least 8 characters', (p) => p.length >= 8],
    ['An uppercase letter (A-Z)', (p) => /[A-Z]/.test(p)],
    ['A lowercase letter (a-z)', (p) => /[a-z]/.test(p)],
    ['A number (0-9)', (p) => /\d/.test(p)],
    ['A special character (! @ # $ ...)', (p) => /[^A-Za-z0-9]/.test(p)]
  ];
  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const phoneDigits = (v) => v.replace(/[\s\-()+]/g, '');
  const isPhone = (v) => /^\d{10,14}$/.test(phoneDigits(v));
  const contactKey = (v) => (isEmail(v) ? v.trim().toLowerCase() : phoneDigits(v).slice(-10));
  const users = () => store.get('pgn_users', []);

  /* ---------- farm + reminders data ---------- */
  const farmKey = () => 'pgn_farm_' + S.user.username;
  const remKey = () => 'pgn_rem_' + S.user.username;
  const getFarm = () => store.get(farmKey(), []);
  const getRem = () => store.get(remKey(), []);

  function stageOf(c, date) {
    const d = daysBetween(date, ymd(new Date())), max = c.days[1], f = d / max;
    let label = 'Seeds sprouting';
    if (d < 0) label = 'Planting soon';
    else if (d >= c.days[0]) label = 'Ready to harvest';
    else if (f >= 0.7) label = 'Almost ready';
    else if (f >= 0.4) label = 'Growing strong';
    else if (f >= 0.12) label = 'Young plants';
    return { d: Math.max(d, 0), pct: Math.max(0, Math.min(100, (d / max) * 100)), label, left: Math.max(0, c.days[0] - d), ready: d >= c.days[0] };
  }

  /* ======================================================
     AUTH SCREEN
     ====================================================== */
  const fld = (id, label, type, extra = '') =>
    `<label class="fld"><input id="${id}" name="${id}" type="${type}" placeholder=" " ${extra}><span>${label}</span><b class="err" data-err="${id}"></b></label>`;
  const pwFld = (id, label, ac) =>
    `<label class="fld pw"><input id="${id}" name="${id}" type="password" placeholder=" " autocomplete="${ac}"><span>${label}</span><button type="button" class="eye" data-act="eye" aria-label="Show password">${I.eye}</button><b class="err" data-err="${id}"></b></label>`;

  function loginForm() {
    return `<form data-form="login" novalidate class="form-in">
      <h2>Welcome back 👋</h2><p class="sub">Login to see your farm and reminders.</p>
      ${fld('identifier', 'Username, email or phone', 'text', 'autocomplete="username" autocapitalize="none"')}
      ${pwFld('password', 'Password', 'current-password')}
      <p class="formerr" id="formErr"></p>
      <button class="btn big shine" type="submit"><span>Login</span><i class="spin"></i></button>
      <p class="switch">New here? <a href="#" data-act="authmode" data-m="register">Create account</a></p>
    </form>`;
  }
  function registerForm() {
    return `<form data-form="register" novalidate class="form-in">
      <h2>Join the farm 🌱</h2><p class="sub">It takes less than a minute.</p>
      ${fld('name', 'Full name', 'text', 'autocomplete="name"')}
      ${fld('username', 'Username', 'text', 'autocomplete="username" autocapitalize="none"')}
      ${fld('contact', 'Email or phone number', 'text', 'autocomplete="email" inputmode="email"')}
      ${pwFld('password', 'Password', 'new-password')}
      <div class="meter"><i></i><i></i><i></i><i></i><i></i></div>
      <ul class="rules">${pwRules.map((r, i) => `<li data-r="${i}">${r[0]}</li>`).join('')}</ul>
      <p class="formerr" id="formErr"></p>
      <button class="btn big shine" type="submit"><span>Create account</span><i class="spin"></i></button>
      <p class="switch">Have an account? <a href="#" data-act="authmode" data-m="login">Login</a></p>
    </form>`;
  }

  function renderAuth() {
    const reg = S.authMode === 'register';
    const emojis = ['🍃', '🌱', '🌽', '🍅', '🌾', '🥬', '🌶️', '🍉'];
    app.innerHTML = `
    <div class="auth">
      <div class="aurora"><i></i><i></i><i></i></div>
      <div class="floaters">${Array.from({ length: 16 }, (_, i) => `<span style="--i:${i}">${emojis[i % emojis.length]}</span>`).join('')}</div>
      <svg class="hills" viewBox="0 0 480 160" preserveAspectRatio="none" aria-hidden="true"><path class="h1" d="M0 70 C90 20 170 30 250 66 S410 110 480 54 V160 H0Z"/><path class="h2" d="M0 108 C100 66 200 92 280 100 S420 76 480 98 V160 H0Z"/></svg>
      <div class="auth-wrap">
        <div class="hero">
          <svg class="grow" viewBox="0 0 200 210" aria-hidden="true">
            <ellipse class="mound" cx="100" cy="196" rx="52" ry="10"/>
            <path class="stem" d="M100 194 C100 160 97 126 100 78"/>
            <g class="lf l1"><path d="M100 160 C68 160 46 140 44 114 C74 114 98 132 100 160Z"/></g>
            <g class="lf l2"><path d="M100 132 C132 132 154 112 156 86 C126 86 102 104 100 132Z"/></g>
            <g class="lf l3"><path d="M100 104 C76 102 62 88 60 68 C80 70 98 84 100 104Z"/></g>
            <g class="lf l4"><path d="M100 80 C90 62 94 42 108 30 C118 48 114 68 100 80Z"/></g>
            <circle class="spark s1" cx="150" cy="50" r="3"/><circle class="spark s2" cx="52" cy="46" r="2.5"/><circle class="spark s3" cx="160" cy="130" r="2"/>
          </svg>
          <h1><span>Planting</span> <span>Guide</span> <em>Naija</em></h1>
          <p class="tag">Plant right. Harvest more.</p>
        </div>
        <div class="glass authcard">
          <div class="seg ${reg ? 'reg' : ''}" id="seg"><i class="thumb"></i>
            <button data-act="authmode" data-m="login" class="${!reg ? 'on' : ''}">Login</button>
            <button data-act="authmode" data-m="register" class="${reg ? 'on' : ''}">Register</button>
          </div>
          <div id="authForm">${reg ? registerForm() : loginForm()}</div>
        </div>
        <p class="foot">Your data stays on this phone. 🔒</p>
      </div>
    </div>
    <div id="toast"></div>`;
  }

  function setErrors(form, errs) {
    $$('[data-err]', form).forEach((b) => { const m = errs[b.dataset.err] || ''; b.textContent = m; b.closest('.fld').classList.toggle('bad', !!m); });
    if (Object.keys(errs).length) { form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake'); }
  }

  async function doRegister(f, btn) {
    const v = Object.fromEntries(new FormData(f)); const errs = {};
    const name = (v.name || '').trim(), uname = (v.username || '').trim().toLowerCase(), contact = (v.contact || '').trim(), pw = v.password || '';
    if (name.length < 3 || !/[A-Za-z]/.test(name)) errs.name = 'Enter your full name';
    if (!/^[a-z0-9_.]{3,20}$/.test(uname)) errs.username = '3-20 letters, numbers, _ or .';
    if (!isEmail(contact) && !isPhone(contact)) errs.contact = 'Enter a valid email or phone number';
    const failed = pwRules.filter((r) => !r[1](pw));
    if (failed.length) errs.password = 'Password is not strong enough';
    const list = users();
    if (!errs.username && list.some((u) => u.username === uname)) errs.username = 'This username is taken';
    if (!errs.contact && list.some((u) => u.contactKey === contactKey(contact))) errs.contact = 'This email or phone is already registered';
    setErrors(f, errs); if (Object.keys(errs).length) return;
    btn.classList.add('busy');
    const h = await hashPw(pw);
    list.push({ name, username: uname, contact, contactKey: contactKey(contact), salt: h.salt, hash: h.hash, created: Date.now() });
    store.set('pgn_users', list); store.set('pgn_session', uname);
    S.user = list[list.length - 1];
    burst(btn); setTimeout(() => { renderShell(); toast(`Welcome, ${name.split(' ')[0]}! 🌱`); }, 650);
  }

  async function doLogin(f, btn) {
    const v = Object.fromEntries(new FormData(f)); const id = (v.identifier || '').trim(), pw = v.password || ''; const errs = {};
    if (!id) errs.identifier = 'Enter your username, email or phone';
    if (!pw) errs.password = 'Enter your password';
    setErrors(f, errs); $('#formErr').textContent = ''; if (Object.keys(errs).length) return;
    btn.classList.add('busy');
    const key = (isEmail(id) || isPhone(id)) ? contactKey(id) : null;
    const u = users().find((x) => x.username === id.toLowerCase() || (key && x.contactKey === key));
    let ok = false;
    if (u) { const h = await hashPw(pw, u.salt || null); ok = h.hash === u.hash; }
    btn.classList.remove('busy');
    if (!ok) { $('#formErr').textContent = 'Wrong details. Check and try again.'; f.classList.remove('shake'); void f.offsetWidth; f.classList.add('shake'); return; }
    store.set('pgn_session', u.username); S.user = u;
    burst(btn); setTimeout(() => { renderShell(); toast(`Welcome back, ${u.name.split(' ')[0]}! 🌿`); }, 600);
  }

  function burst(btn) {
    const r = btn.getBoundingClientRect();
    for (let i = 0; i < 14; i++) {
      const s = document.createElement('span'); s.className = 'confetti'; s.textContent = ['🍃', '🌱', '✨'][i % 3];
      s.style.left = r.left + r.width / 2 + 'px'; s.style.top = r.top + r.height / 2 + 'px';
      s.style.setProperty('--dx', (Math.random() * 240 - 120) + 'px'); s.style.setProperty('--dy', (-Math.random() * 180 - 40) + 'px');
      document.body.appendChild(s); setTimeout(() => s.remove(), 1000);
    }
  }

  /* ======================================================
     MAIN SHELL
     ====================================================== */
  const TABS = [['home', 'Home', I.home], ['guide', 'Guide', I.book], ['weather', 'Weather', I.cloud], ['news', 'News', I.news], ['profile', 'Profile', I.user]];

  function renderShell() {
    const initial = esc(S.user.name.trim()[0].toUpperCase());
    app.innerHTML = `
    <div class="shell">
      <header class="top">
        <div class="brand"><span class="logo">${I.leaf}</span><h1>Planting Guide</h1></div>
        <div class="top-r"><button class="iconbtn" data-act="reminders" aria-label="Reminders">${I.bell}<i class="dot" id="bellDot" hidden></i></button>
        <button class="avatar" data-act="tab" data-t="profile" aria-label="Profile">${initial}</button></div>
      </header>
      <main id="view"></main>
      <nav class="nav">${TABS.map(([k, l, ic]) => `<button data-act="tab" data-t="${k}" class="${S.tab === k ? 'on' : ''}">${ic}<span>${l}</span></button>`).join('')}</nav>
    </div>
    <div id="overlay" class="overlay"></div><div id="sheet" class="sheet"></div><div id="toast"></div>`;
    renderView(); updateBell();
  }

  function setTab(t) {
    S.tab = t; $$('.nav button').forEach((b) => b.classList.toggle('on', b.dataset.t === t)); renderView();
    const v = $('#view'); v.scrollTop = 0; window.scrollTo(0, 0);
  }

  function renderView() {
    const v = $('#view'); if (!v) return;
    const map = { home: viewHome, guide: viewGuide, weather: viewWeather, news: viewNews, profile: viewProfile };
    v.className = 'view enter'; v.innerHTML = map[S.tab]();
    if (S.tab === 'weather') loadWeather();
    if (S.tab === 'news') loadNews();
  }

  /* ---------- HOME ---------- */
  const TIPS = [
    'Plant maize after the first rain for best yield.',
    'Water in the morning or evening. Never at noon.',
    'Mix manure into the soil 2 weeks before you plant.',
    'Check your leaves every 2 days for small insects.',
    'Dry your seeds well before you store them.',
    'Use mulch (dry grass) to keep soil wet and cool.'
  ];
  const plantNow = (c) => c.seasons.includes(season());
  function filtered() {
    const q = S.q.trim().toLowerCase();
    return CROPS.filter((c) => {
      if (q && !(c.name.toLowerCase().includes(q) || c.tip.toLowerCase().includes(q) || c.soil.toLowerCase().includes(q) || c.badge.toLowerCase().includes(q))) return false;
      if (S.chip === 'now') return plantNow(c);
      if (S.chip === 'easy') return c.difficulty === 'Easy';
      if (S.chip === 'quick') return c.days[1] <= 85;
      return true;
    });
  }
  function cardHtml(c) {
    return `<button class="ccard" data-act="crop" data-id="${c.id}">
      <div class="phwrap">${photo(c, 480)}<span class="badge">${plantNow(c) && c.badge !== 'Hot' ? 'Plant now' : esc(c.badge)}</span></div>
      <h3>${esc(c.name)}</h3><p>Ready in ${daysText(c)}</p>
      <span class="pill ${c.difficulty.toLowerCase()}">${c.difficulty}</span></button>`;
  }
  function gridHtml() {
    const l = filtered();
    return l.length ? l.map(cardHtml).join('') : `<div class="empty"><span>🔎</span><p>No crop found.<br>Try another word.</p></div>`;
  }
  function viewHome() {
    const first = esc(S.user.name.trim().split(' ')[0]);
    const farm = getFarm().filter((p) => p.status !== 'harvested');
    let farmCard;
    if (farm.length) {
      const next = farm.map((p) => ({ p, c: byId(p.cropId), st: stageOf(byId(p.cropId), p.date) })).sort((a, b) => a.st.left - b.st.left)[0];
      farmCard = `<button class="farmcard" data-act="farm"><span class="fc-ico">🧑🏾‍🌾</span><div><b>My Farm: ${farm.length} crop${farm.length > 1 ? 's' : ''} growing</b><small>${next.st.ready ? `${esc(next.c.name)} is ready to harvest!` : `Next harvest: ${esc(next.c.name)} in about ${next.st.left} days`}</small></div><em>Open →</em></button>`;
    } else {
      farmCard = `<button class="farmcard empty" data-act="farm"><span class="fc-ico">🌱</span><div><b>Add my farm</b><small>Log what you planted and the date. We count the days for you.</small></div><em>Start →</em></button>`;
    }
    return `
      <section class="greet"><h2>Hi, ${first}! 👋</h2><p>What will you plant today? • Season: ${seasonLabel()} • ${monthYear()}</p></section>
      <label class="search">${I.search}<input id="q" type="search" placeholder="Search crops, tips..." value="${esc(S.q)}" autocomplete="off"></label>
      ${farmCard}
      <div class="chips" id="chips">${[['all', 'All'], ['now', 'Plant now'], ['easy', 'Easy'], ['quick', 'Quick crops']].map(([k, l]) => `<button class="chip ${S.chip === k ? 'on' : ''}" data-act="chip" data-k="${k}">${l}</button>`).join('')}</div>
      <div class="sec"><h2>Crops to Plant ${S.chip === 'now' ? 'Now' : ''}</h2><span class="count" id="count">${filtered().length} crops</span></div>
      <div class="grid" id="grid">${gridHtml()}</div>
      <div class="tipbar"><span>🍃</span><p><b>Tip:</b> ${TIPS[new Date().getDate() % TIPS.length]}</p></div>`;
  }

  /* ---------- GUIDE ---------- */
  function viewGuide() {
    const now = CROPS.filter(plantNow);
    const basics = [
      ['🏞️', 'Choose the right land', ['Pick land with sun for most of the day.', 'Choose land that drains water. No standing water.', 'Stay close to water for dry days.']],
      ['🪴', 'Prepare the soil', ['Clear weeds and stones.', 'Dig or make ridges and beds.', 'Mix in compost or animal manure 2 weeks before planting.']],
      ['🌱', 'Plant the right way', ['Use good, clean seeds.', 'Follow depth and spacing for each crop.', 'Plant in the morning or evening, not in hot sun.']],
      ['💧', 'Water well', ['Small water often when plants are young.', 'Water at the root, not on leaves.', 'Do not flood. Roots need air.']],
      ['🌾', 'Weed and feed', ['Weed at 2 weeks and again at 5 weeks.', 'Add manure or fertiliser as your extension officer says.', 'Keep soil covered with dry grass (mulch).']],
      ['🐛', 'Protect from pests', ['Check leaves every 2 days.', 'Remove sick plants fast. Do not leave them on the farm.', 'Neem leaf water spray helps against small insects.']],
      ['🧺', 'Harvest and store', ['Harvest in the cool morning.', 'Dry grains and seeds well before storing.', 'Store in a clean, dry and airy place.']]
    ];
    return `
      <section class="pagehead"><h2>Farming Guide 📖</h2><p>Simple steps for every crop.</p></section>
      <div class="seasoncard"><div><small>Good to plant in</small><b>${seasonLabel()}</b></div><span>${season() === 'rainy' ? '🌧️' : '☀️'}</span></div>
      <div class="chips wrap">${now.map((c) => `<button class="chip crop" data-act="crop" data-id="${c.id}">${c.emoji} ${esc(c.name)}</button>`).join('')}</div>
      <div class="sec"><h2>Farm basics</h2></div>
      <div class="acc">${basics.map(([e, t, l], i) => `<details ${i === 0 ? 'open' : ''}><summary><span>${e}</span>${t}</summary><ul>${l.map((x) => `<li>${x}</li>`).join('')}</ul></details>`).join('')}</div>
      <div class="sec"><h2>Crop guides</h2></div>
      <div class="list">${CROPS.map((c) => `<button class="lrow" data-act="crop" data-id="${c.id}">${photo(c, 160, 'sm')}<div><b>${esc(c.name)}</b><small>Ready in ${daysText(c)} • ${c.difficulty}</small></div><em>›</em></button>`).join('')}</div>`;
  }

  /* ---------- CROP DETAIL ---------- */
  function openCrop(id, tab = 'plant') {
    const c = byId(id); if (!c) return; S.cropTab = tab;
    showOverlay(`
      <div class="detail" data-crop="${c.id}">
        <div class="dhero">${photo(c, 900, 'hero')}<div class="shade"></div>
          <button class="roundbtn back" data-act="back" aria-label="Back">${I.back}</button>
          <div class="dtitle"><h2>${esc(c.name)}</h2><div class="meta"><span>⏱ ${daysText(c)}</span><span>${c.difficulty === 'Easy' ? '🟢' : '🟡'} ${c.difficulty}</span><span>${c.seasons.length > 1 ? '🌦 Rainy + Dry' : c.seasons[0] === 'rainy' ? '🌧 Rainy' : '☀️ Dry'}</span></div></div>
        </div>
        <div class="tabs" id="ctabs">${[['plant', 'How to Plant'], ['where', 'Where to Plant'], ['image', 'Image Guide'], ['harvest', 'Harvest']].map(([k, l]) => `<button data-act="ctab" data-k="${k}" class="${tab === k ? 'on' : ''}">${l}</button>`).join('')}</div>
        <div class="dbody" id="cbody">${cropPanel(c, tab)}</div>
        <div class="dbar"><button class="btn big water" data-act="remind" data-id="${c.id}">💧 Set Reminder to Water</button><button class="btn big ghost" data-act="addfarm" data-id="${c.id}">+ My Farm</button></div>
      </div>`);
  }
  const row = (ico, t, v, cl = '') => `<li class="irow"><span class="ico ${cl}">${ico}</span><div><small>${t}</small><b>${v}</b></div></li>`;
  function cropPanel(c, tab) {
    if (tab === 'plant') return `
      <ul class="irows">
        ${row('🕳️', 'Hole depth', `${c.depth} cm`, 'brown')}
        ${row('🌱', c.seedShape ? 'Cutting / piece per hole' : 'Seeds per hole', c.seeds, 'green')}
        ${row('↔️', 'Spacing between holes', `${c.hole} cm`, 'blue')}
        ${row('↕️', 'Spacing between rows', `${c.row} cm`, 'purple')}
        ${row('💧', 'Watering', esc(c.water), 'sky')}
      </ul>
      <h3 class="h3">Step by step</h3>
      <ol class="steps">${c.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
      <div class="note">💡 <b>Tip:</b> ${esc(c.tip)}</div>`;
    if (tab === 'where') return `
      <ul class="irows">
        ${row('☀️', 'Sunny area', esc(c.sun), 'yellow')}
        ${row('🪱', 'Well-drained soil', esc(c.soil), 'brown')}
        ${row('🗓️', 'Best season', esc(c.best), 'green')}
        ${row('⚠️', 'Avoid', esc(c.avoid), 'red')}
      </ul>
      <h3 class="h3">Good for these seasons</h3>
      <div class="seasonrow"><span class="${c.seasons.includes('rainy') ? 'yes' : ''}">🌧️ Rainy<br><small>Apr - Oct</small></span><span class="${c.seasons.includes('dry') ? 'yes' : ''}">☀️ Dry<br><small>Nov - Mar</small></span></div>
      <p class="muted center">${plantNow(c) ? `✅ Good to plant in ${seasonLabel()} (now).` : `⏳ Better to wait for the ${season() === 'rainy' ? 'dry' : 'rainy'} season.`}</p>`;
    if (tab === 'image') return `
      <figure class="fig"><div class="svgwrap">${Diagrams.top(c)}</div><figcaption><b>1. Spacing (top view)</b>Holes ${c.hole} cm apart. Rows ${c.row} cm apart.</figcaption></figure>
      <figure class="fig"><div class="svgwrap">${Diagrams.side(c)}</div><figcaption><b>2. Depth (side view)</b>Dig ${c.depth} cm deep. Put ${esc(c.seeds)} in. Cover with loose soil.</figcaption></figure>
      <figure class="fig"><div class="svgwrap">${Diagrams.thin()}</div><figcaption><b>3. Thin the weak plants</b>${esc(c.thin)}</figcaption></figure>`;
    return `
      <div class="ready"><span>🧺</span><div><small>Ready in</small><b>${daysText(c)}</b>${c.days[1] >= 150 ? `<em>about ${monthsText(c)}</em>` : ''}</div></div>
      <h3 class="h3">Growth timeline</h3>
      <ol class="timeline">${c.stages.map(([w, t]) => `<li><b>${esc(w)}</b><span>${esc(t)}</span></li>`).join('')}</ol>
      <h3 class="h3">Signs it is ready</h3><ul class="bul">${c.signs.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
      <h3 class="h3">How to harvest</h3><ul class="bul">${c.harvestHow.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
      <ul class="irows">${row('🏠', 'After harvest', esc(c.store), 'brown')}${row('🐛', 'Watch out for', esc(c.pests), 'red')}</ul>`;
  }

  /* ---------- REMINDERS ---------- */
  function openReminder(id) {
    const c = byId(id), ex = getRem().find((r) => r.cropId === id);
    const t = ex ? ex.times : ['06:30', '17:30'];
    showSheet(`
      <h3 class="sheeth">💧 Water reminder: ${esc(c.name)}</h3>
      <p class="muted">${esc(c.water)}</p>
      <form data-form="reminder" data-id="${id}">
        <label class="toggle"><input type="checkbox" name="am" ${t.some((x) => x < '12:00') ? 'checked' : ''}><span>🌅 Morning</span><input type="time" name="amt" value="${t.find((x) => x < '12:00') || '06:30'}"></label>
        <label class="toggle"><input type="checkbox" name="pm" ${t.some((x) => x >= '12:00') ? 'checked' : ''}><span>🌇 Evening</span><input type="time" name="pmt" value="${t.find((x) => x >= '12:00') || '17:30'}"></label>
        <label class="sel"><span>Remind me for</span><select name="len"><option value="14">14 days</option><option value="30">30 days</option><option value="${c.days[1]}" selected>Until harvest (${c.days[1]} days)</option></select></label>
        <button class="btn big water" type="submit">Save reminder</button>
        <p class="muted small">Reminders ring while the app is open or installed. For best results, install the app to your home screen.</p>
      </form>`);
  }
  async function saveReminder(f) {
    const v = Object.fromEntries(new FormData(f)), times = [];
    if (v.am) times.push(v.amt || '06:30'); if (v.pm) times.push(v.pmt || '17:30');
    if (!times.length) { toast('Pick morning or evening'); return; }
    const today = ymd(new Date()), list = getRem().filter((r) => r.cropId !== f.dataset.id);
    list.push({ id: 'r' + Date.now(), cropId: f.dataset.id, times: times.sort(), start: today, end: addDays(today, +v.len) });
    store.set(remKey(), list);
    let perm = 'unsupported';
    if ('Notification' in window) { perm = Notification.permission; if (perm === 'default') { try { perm = await Notification.requestPermission(); } catch { /* ignore */ } } }
    closeTop(() => { updateBell(); toast(perm === 'granted' ? '✅ Reminder saved' : '✅ Saved. Turn on notifications in Profile to get alerts.'); if (S.tab === 'profile') renderView(); });
  }
  function showReminders() {
    const l = getRem();
    showSheet(`<h3 class="sheeth">🔔 My reminders</h3>${l.length ? l.map((r) => { const c = byId(r.cropId); return `<div class="remrow"><span>${c.emoji}</span><div><b>${esc(c.name)}</b><small>${r.times.join(' & ')} • until ${fmtDate(r.end)}</small></div><button class="x" data-act="delrem" data-id="${r.id}" aria-label="Delete">✕</button></div>`; }).join('') : '<p class="muted center">No reminders yet.<br>Open a crop and tap “Set Reminder to Water”.</p>'}`);
  }
  function updateBell() { const d = $('#bellDot'); if (d) d.hidden = !getRem().length; }

  const mins = (hm) => +hm.slice(0, 2) * 60 + +hm.slice(3, 5);
  function checkReminders() {
    if (!S.user) return;
    const now = new Date(), today = ymd(now), nm = now.getHours() * 60 + now.getMinutes();
    const fired = store.get('pgn_fired', {});
    getRem().forEach((r) => {
      if (today < r.start || today > r.end) return;
      r.times.forEach((t) => {
        const key = `${r.id}|${today}|${t}`, diff = nm - mins(t);
        if (fired[key] || diff < 0 || diff > 120) return;
        fired[key] = 1; const c = byId(r.cropId);
        notify(`💧 Time to water your ${c.name}`, t < '12:00' ? 'Good morning! Water your plants now.' : 'Good evening! Water your plants now.');
      });
    });
    const keep = {}; Object.keys(fired).forEach((k) => { if (k.split('|')[1] === today) keep[k] = 1; });
    store.set('pgn_fired', keep);
  }
  function notify(title, body) {
    toast(title);
    if ('Notification' in window && Notification.permission === 'granted' && navigator.serviceWorker) {
      navigator.serviceWorker.getRegistration().then((reg) => reg && reg.showNotification(title, { body, icon: 'icons/icon.svg', badge: 'icons/icon.svg', tag: title, vibrate: [120, 60, 120] })).catch(() => {});
    }
  }

  /* ---------- MY FARM ---------- */
  function openFarm() {
    const list = getFarm();
    showOverlay(`<div class="page">
      <div class="phead"><button class="roundbtn dark" data-act="back" aria-label="Back">${I.back}</button><h2>🧑🏾‍🌾 My Farm</h2></div>
      <div class="farmlist" id="farmlist">${farmListHtml(list)}</div>
      <button class="fab" data-act="addfarm">＋ Add what I planted</button></div>`);
  }
  function farmListHtml(list) {
    if (!list.length) return `<div class="empty big"><span>🌱</span><p><b>No crops yet</b><br>Add what you planted and the date.<br>We will count the days to harvest.</p></div>`;
    return [...list].sort((a, b) => (a.status === 'harvested') - (b.status === 'harvested') || b.date.localeCompare(a.date)).map((p) => {
      const c = byId(p.cropId), st = stageOf(c, p.date), done = p.status === 'harvested';
      return `<article class="fcard ${done ? 'done' : ''}">
        <div class="fhead">${photo(c, 160, 'sm')}<div><b>${esc(c.name)}</b><small>${p.plot ? esc(p.plot) + ' • ' : ''}Planted ${fmtDate(p.date)}</small>
        <span class="pill ${done ? 'easy' : st.ready ? 'ready' : 'medium'}">${done ? 'Harvested ✅' : st.label}</span></div></div>
        <div class="bar"><i style="width:${done ? 100 : st.pct}%"></i></div>
        <div class="fmeta"><span>Day <b>${st.d}</b></span><span>${done ? 'Well done!' : st.ready ? 'Harvest time!' : `${st.left} days to go`}</span></div>
        ${p.notes ? `<p class="muted small">📝 ${esc(p.notes)}</p>` : ''}
        <div class="fbtns">${done ? '' : `<button data-act="remind" data-id="${c.id}">💧 Water</button><button data-act="harvested" data-pid="${p.id}">🧺 Harvested</button>`}<button class="del" data-act="delplant" data-pid="${p.id}">Delete</button></div></article>`;
    }).join('');
  }
  function openAddFarm(id) {
    showSheet(`<h3 class="sheeth">🌱 Add to my farm</h3>
      <form data-form="farm">
        <label class="sel"><span>Crop</span><select name="crop">${CROPS.map((c) => `<option value="${c.id}" ${c.id === id ? 'selected' : ''}>${c.emoji} ${c.name}</option>`).join('')}</select></label>
        <label class="sel"><span>Date planted</span><input type="date" name="date" value="${ymd(new Date())}" max="${addDays(ymd(new Date()), 30)}" required></label>
        <label class="fld"><input name="plot" placeholder=" " maxlength="40"><span>Plot name (optional)</span></label>
        <label class="fld"><input name="notes" placeholder=" " maxlength="80"><span>Note (optional)</span></label>
        <button class="btn big" type="submit">Save to my farm</button></form>`);
  }
  function saveFarm(f) {
    const v = Object.fromEntries(new FormData(f)); if (!v.crop || !v.date) return;
    const list = getFarm(); list.push({ id: 'p' + Date.now(), cropId: v.crop, date: v.date, plot: (v.plot || '').trim(), notes: (v.notes || '').trim(), status: 'growing' });
    store.set(farmKey(), list);
    closeTop(() => { toast('🌱 Added to My Farm'); refreshFarmUI(); });
  }
  function refreshFarmUI() { const fl = $('#farmlist'); if (fl) fl.innerHTML = farmListHtml(getFarm()); if (S.tab === 'home') { const v = $('#view'); const sc = v.scrollTop; v.innerHTML = viewHome(); v.scrollTop = sc; } if (S.tab === 'profile') renderView(); }

  /* ---------- WEATHER ---------- */
  const CITIES = { Lagos: [6.5244, 3.3792], Abuja: [9.0765, 7.3986], Kano: [12.0022, 8.592], Ibadan: [7.3775, 3.947], 'Port Harcourt': [4.8156, 7.0498], Enugu: [6.4584, 7.5464], Kaduna: [10.5105, 7.4165], Benin: [6.335, 5.6037], Jos: [9.8965, 8.8583], Ilorin: [8.4966, 4.5421], Maiduguri: [11.8311, 13.151], Sokoto: [13.0059, 5.2476], Owerri: [5.4836, 7.0333] };
  const WMO = (c) => (c === 0 ? ['☀️', 'Clear sky'] : c <= 2 ? ['⛅', 'Partly cloudy'] : c === 3 ? ['☁️', 'Cloudy'] : c <= 48 ? ['🌫️', 'Foggy or hazy'] : c <= 57 ? ['🌦️', 'Light drizzle'] : c <= 67 ? ['🌧️', 'Rain'] : c <= 82 ? ['🌦️', 'Rain showers'] : ['⛈️', 'Thunderstorm']);
  const wxPlace = () => store.get('pgn_wxplace', { name: 'Lagos', lat: 6.5244, lon: 3.3792 });
  function viewWeather() {
    const p = wxPlace();
    return `<section class="pagehead"><h2>Weather ⛅</h2><p>Plan your planting and watering.</p></section>
      <div class="wxbar"><label class="sel inline"><span>City</span><select id="city">${Object.keys(CITIES).map((n) => `<option ${n === p.name ? 'selected' : ''}>${n}</option>`).join('')}${p.name === 'My location' ? '<option selected>My location</option>' : ''}</select></label><button class="chip" data-act="geo">📍 Near me</button></div>
      <div id="wx"><div class="skeleton"></div></div>`;
  }
  async function loadWeather() {
    const p = wxPlace(), key = 'pgn_wx_' + p.name, box = $('#wx'); if (!box) return;
    const cached = store.get(key, null);
    if (cached && Date.now() - cached.t < 3600e3) { box.innerHTML = wxHtml(cached.d, p, cached.t, false); return; }
    try {
      const u = `https://api.open-meteo.com/v1/forecast?latitude=${p.lat}&longitude=${p.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum&timezone=auto&forecast_days=5`;
      const r = await fetch(u); if (!r.ok) throw 0; const d = await r.json();
      store.set(key, { t: Date.now(), d }); if ($('#wx')) $('#wx').innerHTML = wxHtml(d, p, Date.now(), false);
    } catch {
      if (cached) box.innerHTML = wxHtml(cached.d, p, cached.t, true);
      else box.innerHTML = `<div class="empty big"><span>📡</span><p><b>No internet</b><br>Connect once to load the weather.<br>We will save it for later.</p></div>`;
    }
  }
  function wxHtml(d, p, t, old) {
    const cur = d.current, dl = d.daily, [ic, desc] = WMO(cur.weather_code);
    const rain3 = dl.precipitation_sum.slice(0, 3).reduce((a, b) => a + b, 0), prob = dl.precipitation_probability_max[0];
    let adv = ['🚿', 'No rain soon', 'Water your crops in the morning and evening.'];
    if (rain3 > 25) adv = ['⚠️', 'Heavy rain is coming', 'Do not plant seeds now. They can rot. Check that water can drain out.'];
    else if (prob >= 60 || rain3 > 8) adv = ['🌧️', 'Rain is likely', 'Good time to plant. Skip watering when it rains.'];
    else if (prob >= 30) adv = ['🌤️', 'Maybe some rain', 'Plant, then water lightly. Check the sky in the evening.'];
    const day = (s) => new Date(s + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short' });
    return `<div class="wxnow"><div><small>${esc(p.name)}</small><b>${Math.round(cur.temperature_2m)}°C</b><span>${desc}</span></div><i>${ic}</i></div>
      <div class="wxstats"><span>💧 ${cur.relative_humidity_2m}%<small>Humidity</small></span><span>💨 ${Math.round(cur.wind_speed_10m)} km/h<small>Wind</small></span><span>☔ ${prob ?? 0}%<small>Rain today</small></span></div>
      <div class="advice"><span>${adv[0]}</span><div><b>${adv[1]}</b><p>${adv[2]}</p></div></div>
      <div class="sec"><h2>Next 5 days</h2></div>
      <div class="fc">${dl.time.map((s, i) => `<div><b>${i ? day(s) : 'Today'}</b><i>${WMO(dl.weather_code[i])[0]}</i><span>${Math.round(dl.temperature_2m_max[i])}° / ${Math.round(dl.temperature_2m_min[i])}°</span><small>☔ ${dl.precipitation_probability_max[i] ?? 0}%</small></div>`).join('')}</div>
      <p class="muted small center">${old ? '📴 Offline. Showing saved weather from ' : 'Updated '}${new Date(t).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}. Data: Open-Meteo.</p>`;
  }

  /* ---------- NEWS ---------- */
  const SOURCES = [
    ['🌍', 'FAO Newsroom', 'Food and farming news from the United Nations.', 'https://www.fao.org/newsroom/en'],
    ['🌱', 'IITA News', 'Research for African crops such as cassava, yam and maize.', 'https://www.iita.org/news/'],
    ['🔬', 'CGIAR News', 'New seeds, climate and farming science.', 'https://www.cgiar.org/news-events/'],
    ['🗞️', 'Google News: Farming Nigeria', 'Latest stories about farming in Nigeria.', 'https://news.google.com/search?q=farming%20Nigeria']
  ];
  function viewNews() {
    return `<section class="pagehead"><h2>Crop News 🌍</h2><p>World news about crops and farming.</p></section><div id="news"><div class="skeleton"></div></div>`;
  }
  async function loadNews() {
    const box = $('#news'); if (!box) return;
    const src = `<div class="sec"><h2>Trusted sources</h2></div><div class="list">${SOURCES.map(([e, t, d, u]) => `<a class="lrow" href="${u}" target="_blank" rel="noopener"><span class="srcico">${e}</span><div><b>${t}</b><small>${d}</small></div><em>↗</em></a>`).join('')}</div>`;
    if (!CFG.newsApiKey) {
      box.innerHTML = `<div class="note">📰 Live headlines are off. Add a free GNews key in <b>js/config.js</b> to turn them on.</div>${src}`; return;
    }
    const key = 'pgn_news', cached = store.get(key, null);
    if (cached && Date.now() - cached.t < 3 * 3600e3) { box.innerHTML = newsHtml(cached.a, cached.t, false) + src; return; }
    try {
      const r = await fetch(`https://gnews.io/api/v4/search?q=${encodeURIComponent(CFG.newsQuery)}&lang=en&max=10&token=${CFG.newsApiKey}`);
      if (!r.ok) throw 0; const j = await r.json(); const a = (j.articles || []).slice(0, 10);
      store.set(key, { t: Date.now(), a }); if ($('#news')) $('#news').innerHTML = newsHtml(a, Date.now(), false) + src;
    } catch {
      box.innerHTML = (cached ? newsHtml(cached.a, cached.t, true) : '<div class="note">📴 Could not load headlines. Check your internet.</div>') + src;
    }
  }
  function newsHtml(a, t, old) {
    const img = !S.settings.dataSaver;
    return `<div class="newslist">${a.map((n) => `<a class="ncard" href="${esc(n.url)}" target="_blank" rel="noopener">${img && n.image ? `<img src="${esc(n.image)}" alt="" loading="lazy" onerror="this.remove()">` : ''}<div><small>${esc(n.source && n.source.name)} • ${new Date(n.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</small><b>${esc(n.title)}</b><p>${esc(n.description || '')}</p></div></a>`).join('')}</div>
      <p class="muted small center">${old ? '📴 Offline. Showing saved news.' : 'Updated just now.'}</p>`;
  }

  /* ---------- PROFILE ---------- */
  let deferredInstall = null;
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredInstall = e; if (S.tab === 'profile') renderView(); });
  function viewProfile() {
    const u = S.user, farm = getFarm(), rem = getRem(), perm = 'Notification' in window ? Notification.permission : 'unsupported';
    const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    return `<section class="pcard"><div class="bigav">${esc(u.name.trim()[0].toUpperCase())}</div><h2>${esc(u.name)}</h2><p>@${esc(u.username)} • ${esc(u.contact)}</p></section>
      <div class="stats"><button data-act="farm"><b>${farm.filter((p) => p.status !== 'harvested').length}</b><span>Growing</span></button><button data-act="farm"><b>${farm.filter((p) => p.status === 'harvested').length}</b><span>Harvested</span></button><button data-act="reminders"><b>${rem.length}</b><span>Reminders</span></button></div>
      <button class="btn big" data-act="farm">🧑🏾‍🌾 Open My Farm</button>
      <div class="sec"><h2>Settings</h2></div>
      <div class="setlist">
        <label class="srow"><span>📶 Data saver<small>Smaller photos, no news pictures</small></span><input type="checkbox" class="sw" data-set="dataSaver" ${S.settings.dataSaver ? 'checked' : ''}></label>
        <div class="srow"><span>🔔 Notifications<small>${perm === 'granted' ? 'On' : perm === 'denied' ? 'Blocked in browser settings' : perm === 'unsupported' ? 'Not supported on this browser' : 'Off'}</small></span>${perm === 'default' ? '<button class="chip on" data-act="askperm">Turn on</button>' : ''}</div>
        ${standalone ? '' : `<div class="srow"><span>📲 Install app<small>${deferredInstall ? 'Add to home screen' : 'Browser menu → Add to Home screen'}</small></span>${deferredInstall ? '<button class="chip on" data-act="install">Install</button>' : ''}</div>`}
        <div class="srow"><span>🗣️ Language<small>Simple English</small></span></div>
      </div>
      <button class="btn big ghost red" data-act="logout">Logout</button>
      <p class="muted small center">Planting Guide Naija v1.0</p>`;
  }

  /* ======================================================
     EVENTS
     ====================================================== */
  const actions = {
    tab: (t) => { if (stack.length) return; setTab(t.dataset.t); },
    crop: (t) => openCrop(t.dataset.id),
    back: () => closeTop(),
    close: () => closeTop(),
    ctab: (t) => {
      const c = byId($('.detail').dataset.crop); S.cropTab = t.dataset.k;
      $$('#ctabs button').forEach((b) => b.classList.toggle('on', b === t));
      const body = $('#cbody'); body.classList.remove('swap'); void body.offsetWidth; body.innerHTML = cropPanel(c, t.dataset.k); body.classList.add('swap'); body.scrollTop = 0;
      $('.detail').scrollTo({ top: $('.dhero').offsetHeight - 70, behavior: 'smooth' });
    },
    chip: (t) => { S.chip = t.dataset.k; $$('#chips .chip').forEach((b) => b.classList.toggle('on', b === t)); $('#grid').innerHTML = gridHtml(); $('#count').textContent = filtered().length + ' crops'; },
    remind: (t) => { if ($('#sheet').classList.contains('open')) return; openReminder(t.dataset.id); },
    reminders: () => showReminders(),
    delrem: (t) => { store.set(remKey(), getRem().filter((r) => r.id !== t.dataset.id)); closeTop(() => { updateBell(); showReminders(); if (S.tab === 'profile') renderView(); }); },
    farm: () => openFarm(),
    addfarm: (t) => openAddFarm(t.dataset.id),
    harvested: (t) => { const l = getFarm(); const p = l.find((x) => x.id === t.dataset.pid); if (p) { p.status = 'harvested'; store.set(farmKey(), l); toast('🧺 Great harvest!'); refreshFarmUI(); } },
    delplant: (t) => { if (!confirm('Delete this crop from My Farm?')) return; store.set(farmKey(), getFarm().filter((x) => x.id !== t.dataset.pid)); refreshFarmUI(); },
    geo: (t) => {
      if (!navigator.geolocation) { toast('Location not supported'); return; }
      t.textContent = 'Finding...';
      navigator.geolocation.getCurrentPosition((pos) => { store.set('pgn_wxplace', { name: 'My location', lat: +pos.coords.latitude.toFixed(3), lon: +pos.coords.longitude.toFixed(3) }); renderView(); }, () => { t.textContent = '📍 Near me'; toast('Could not get your location'); }, { timeout: 10000 });
    },
    eye: (t) => { const i = t.parentElement.querySelector('input'); i.type = i.type === 'password' ? 'text' : 'password'; t.classList.toggle('on', i.type === 'text'); },
    authmode: (t, e) => {
      e.preventDefault(); const m = t.dataset.m; if (m === S.authMode) return; S.authMode = m;
      $('#seg').classList.toggle('reg', m === 'register'); $$('#seg button').forEach((b) => b.classList.toggle('on', b.dataset.m === m));
      const f = $('#authForm'); f.innerHTML = m === 'register' ? registerForm() : loginForm();
    },
    askperm: async () => { if ('Notification' in window) { await Notification.requestPermission(); renderView(); } },
    install: async () => { if (deferredInstall) { deferredInstall.prompt(); await deferredInstall.userChoice; deferredInstall = null; renderView(); } },
    logout: () => { store.del('pgn_session'); S.user = null; S.tab = 'home'; S.authMode = 'login'; stack.length = 0; renderAuth(); }
  };
  document.addEventListener('click', (e) => { const t = e.target.closest('[data-act]'); if (!t) return; const fn = actions[t.dataset.act]; if (fn) fn(t, e); });

  document.addEventListener('submit', (e) => {
    const f = e.target.closest('form[data-form]'); if (!f) return; e.preventDefault();
    const btn = $('button[type=submit]', f), k = f.dataset.form;
    if (k === 'login') doLogin(f, btn); else if (k === 'register') doRegister(f, btn); else if (k === 'reminder') saveReminder(f); else if (k === 'farm') saveFarm(f);
  });

  document.addEventListener('input', (e) => {
    const t = e.target;
    if (t.id === 'q') { S.q = t.value; $('#grid').innerHTML = gridHtml(); $('#count').textContent = filtered().length + ' crops'; }
    if (t.id === 'password' && t.closest('[data-form=register]')) {
      const p = t.value, ok = pwRules.map((r) => r[1](p)), n = ok.filter(Boolean).length, f = t.closest('form');
      $$('.rules li', f).forEach((li, i) => li.classList.toggle('ok', ok[i]));
      $$('.meter i', f).forEach((b, i) => { b.className = i < n ? 'on l' + n : ''; });
    }
    const fl = t.closest('.fld'); if (fl && fl.classList.contains('bad')) { fl.classList.remove('bad'); const er = $('.err', fl); if (er) er.textContent = ''; }
  });
  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.id === 'city') { const n = t.value; if (CITIES[n]) store.set('pgn_wxplace', { name: n, lat: CITIES[n][0], lon: CITIES[n][1] }); $('#wx').innerHTML = '<div class="skeleton"></div>'; loadWeather(); }
    if (t.dataset && t.dataset.set) { S.settings[t.dataset.set] = t.checked; store.set('pgn_settings', S.settings); toast(t.checked ? 'Data saver on 📶' : 'Data saver off'); }
  });

  /* ======================================================
     START
     ====================================================== */
  function init() {
    if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
    const name = store.get('pgn_session', null);
    S.user = name ? users().find((u) => u.username === name) || null : null;
    if (S.user) renderShell(); else renderAuth();
    checkReminders();
    setInterval(checkReminders, (CFG.reminderCheckEvery || 30) * 1000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) checkReminders(); });
  }
  init();
})();
