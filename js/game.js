(function(){
'use strict';
const $ = id => document.getElementById(id);
const MAXG = 6, PHOTO_PTS = [400, 320, 260, 200, 150, 100], MAKE_PTS = 50, BASE = 100, BONUS = 50, BONUS_MS = 20000;
const MAX_TOTAL = PHOTO_PTS[0] + 6 * (BASE + BONUS);
const ZOOM = [0.22, 0.32, 0.45, 0.6, 0.8, 1];
const EPOCH = new Date(2026, 10, 1);
const BANK = buildBank(BANK_SRC, MAKE_ALIASES, MODEL_ALIASES);
const byId = {}; BANK.entries.forEach(e => byId[e.id] = e);
const fmt = n => n.toLocaleString('en-US');
const ORD = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'];

// ---------- daily pick ----------
const ROT = ROTATION.map(id => ANSWERS.find(a => a.id === id));
function todayNo(){ const n = new Date(), mid = new Date(n.getFullYear(), n.getMonth(), n.getDate()); return Math.max(1, Math.round((mid - EPOCH) / 864e5) + 1); }
const TODAY = todayNo();
const ansFor = day => ROT[(day - 1) % ROT.length];
const lapName = d => 'Lap ' + String(d).padStart(3, '0');
const dateFor = d => new Date(EPOCH.getFullYear(), EPOCH.getMonth(), EPOCH.getDate() + d - 1).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

// ---------- photos ----------
const imgs = {};
function photo(a, cb){ let im = imgs[a.id]; if (!im) { im = new Image(); im.src = 'photos/' + PHOTO_FILE[a.id]; imgs[a.id] = im; }
  if (cb) { if (im.complete && im.naturalWidth) cb(im); else im.addEventListener('load', () => cb(im), { once: true }); } return im; }
const CW = 960, CH = 600;
function viewFor(im, a, z){
  const W = im.naturalWidth, H = im.naturalHeight; if (z >= 1) return { x: 0, y: 0, w: W, h: H, full: true };
  let w = W * z, h = w * CH / CW; if (h > H) { h = H; w = h * CW / CH; }
  const f = TRIVIA[a.id].f, cx = f[0] * W, cy = f[1] * H;
  return { x: Math.min(Math.max(0, cx - w / 2), W - w), y: Math.min(Math.max(0, cy - h / 2), H - h), w, h };
}
function paint(cv, im, v){
  const ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  const cw = cv.width, ch = cv.height; ctx.fillStyle = '#E4E5E8'; ctx.fillRect(0, 0, cw, ch);
  if (v.full) { const s = Math.max(cw / v.w, ch / v.h), w = v.w * s, h = v.h * s; ctx.drawImage(im, (cw - w) / 2, (ch - h) / 2, w, h); }
  else ctx.drawImage(im, v.x, v.y, v.w, v.h, 0, 0, cw, ch);
}
function xphoto(key, cb){ let im = imgs[key]; if (!im) { im = new Image(); im.src = 'photos/' + PHOTO_FILE[key]; imgs[key] = im; }
  if (cb) { if (im.complete && im.naturalWidth) cb(im); else im.addEventListener('load', () => cb(im), { once: true }); } return im; }
function paintContain(cv, im){ const ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; const cw = cv.width, ch = cv.height; ctx.fillStyle = '#E4E5E8'; ctx.fillRect(0, 0, cw, ch); const s = Math.min(cw / im.naturalWidth, ch / im.naturalHeight), w = im.naturalWidth * s, h = im.naturalHeight * s; ctx.drawImage(im, (cw - w) / 2, (ch - h) / 2, w, h); }
function xcredit(key){ const c = XCREDITS[key], p = el('p', 'credit', 'Photo by ' + c.a + ', ' + c.l + ', via '); const l = el('a', '', 'Wikimedia Commons'); l.href = c.u; l.target = '_blank'; l.rel = 'noopener'; p.appendChild(l); p.appendChild(document.createTextNode('. Lettering and plates blurred.')); return p; }
function fullCanvas(a, w, h){ const c = document.createElement('canvas'); c.width = w || CW; c.height = h || CH; photo(a, im => paint(c, im, viewFor(im, a, 1))); return c; }

// ---------- state ----------
let store = { days: {}, arch: {}, unlocked: false };
try { const s = JSON.parse(localStorage.getItem('tentenths.v4') || 'null'); if (s && s.days) store = Object.assign(store, s); } catch (e) {}
function save(){ try { localStorage.setItem('tentenths.v4', JSON.stringify(store)); } catch (e) {} }
function rec(d, prac){ const bag = prac ? store.arch : store.days; if (!bag[d]) bag[d] = { g: [], typed: [], photo: null, qs: [], step: 0, done: false }; return bag[d]; }
const total = r => (r.photo ? r.photo.pts : 0) + r.qs.reduce((a, q) => a + (q && q.pts || 0), 0);
const correct = r => (r.photo && r.photo.win ? 1 : 0) + r.qs.filter(q => q && q.ok).length;
function season(){ return Object.values(store.days).reduce((a, r) => a + (r.done ? total(r) : 0), 0); }
function streak(){ let s = 0, d = TODAY; if (!(store.days[d] && store.days[d].done)) d--; while (store.days[d] && store.days[d].done) { s++; d--; } return s; }

let day = TODAY, practice = false, cur = null, ans = null, QS = [];

// ---------- shared leaderboard ----------
let db = null, user = null, uid = null;
(async function(){ try { if (!window.claude || !window.claude.use) return; const r = await Promise.all([window.claude.use('db'), window.claude.use('user')]); db = r[0]; user = r[1]; uid = user ? await user.id() : null; } catch (e) {} })();
async function pushScore(){
  if (!db || !uid) return;
  const days = {}; for (const k in store.days) { const r = store.days[k]; if (r.done) days[k] = { pts: total(r), correct: correct(r), g: r.g.length, ms: r.qs.reduce((a, q) => a + (q && q.ms || 0), 0) }; }
  try { await db.doc('scores/' + uid).set({ days: days, total: season(), streak: streak(), upd: Date.now(), v: 4 }); } catch (e) {}
}
const timeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);

// ---------- score display (counts up) ----------
let shown = 0, scoreAnim = 0, gainT = 0;
const still = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function setScore(target, gained){
  cancelAnimationFrame(scoreAnim);
  if (gained) { const g = $('gain'); g.textContent = '+' + gained; g.classList.add('on'); clearTimeout(gainT); gainT = setTimeout(() => g.classList.remove('on'), 1400); }
  if (still() || !gained) { shown = target; $('score').textContent = fmt(target); return; }
  const from = shown, t0 = performance.now();
  (function step(now){ const p = Math.min(1, (now - t0) / 800), e = 1 - Math.pow(1 - p, 3); shown = Math.round(from + (target - from) * e); $('score').textContent = fmt(shown); if (p < 1) scoreAnim = requestAnimationFrame(step); })(t0);
}

// ---------- helpers ----------
function el(tag, cls, text){ const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
function btn(cls, text, fn){ const b = el('button', cls, text); b.type = 'button'; b.onclick = fn; return b; }
function credit(a){ const p = el('p', 'credit', 'Photo by ' + a.credit.a + ', ' + a.credit.l + ', via '); const l = el('a', '', 'Wikimedia Commons'); l.href = a.credit.u; l.target = '_blank'; l.rel = 'noopener'; p.appendChild(l); p.appendChild(document.createTextNode('. Number plates and name scripts blurred.')); return p; }
function countdown(){ const n = new Date(), m = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1), s = Math.floor((m - n) / 1000); return [s / 3600, s / 60 % 60, s % 60].map(v => String(Math.floor(v)).padStart(2, '0')).join(':'); }
let ticker = 0, timerRaf = 0;
function clearTimers(){ clearInterval(ticker); cancelAnimationFrame(timerRaf); cancelAnimationFrame(zoomRaf); }

// ---------- home ----------
function renderHome(){
  clearTimers();
  $('home').classList.remove('hide'); $('play').classList.add('hide'); $('scoreBox').classList.add('hide'); document.body.classList.add('at-home');
  const a = ansFor(TODAY), r = store.days[TODAY];
  $('hLot').textContent = lapName(TODAY); $('hDate').textContent = dateFor(TODAY);
  photo(a, im => paint($('teaser'), im, viewFor(im, a, r && r.done ? 1 : ZOOM[0])));
  const box = $('homeState'); box.textContent = '';
  if (r && r.done) {
    const p = el('p', 'result-line'); p.appendChild(document.createTextNode('You scored ')); p.appendChild(el('b', '', fmt(total(r)))); p.appendChild(document.createTextNode(' of ' + fmt(MAX_TOTAL) + ' on ' + lapName(TODAY).toLowerCase() + '.'));
    box.appendChild(p); box.appendChild(btn('primary', 'See your lap card', () => openDay(TODAY, false)));
    const cd = el('p', 'muted'); const tick = () => cd.textContent = 'The next lap opens in ' + countdown() + '.'; tick(); ticker = setInterval(tick, 1000); box.appendChild(cd);
  } else if (r && (r.g.length || r.photo)) {
    box.appendChild(btn('primary', 'Continue ' + lapName(TODAY).toLowerCase(), () => openDay(TODAY, false)));
    box.appendChild(el('p', 'muted', 'You’re on round ' + (r.photo ? Math.min(7, r.qs.length + 2) : 1) + ' of 7. Your score so far: ' + fmt(total(r)) + '.'));
  } else box.appendChild(btn('primary', 'Start ' + lapName(TODAY).toLowerCase(), () => openDay(TODAY, false)));
}

// ---------- play ----------
function openDay(d, prac){
  clearTimers(); closePanel();
  day = d; practice = prac; cur = rec(d, prac); ans = ansFor(d); QS = buildRounds(d, ans.id).map(r => Object.assign({}, r, { a: r.ans })); QS.forEach(q => { if (q.img) xphoto(q.img); }); zview = null;
  save(); photo(ans);
  $('home').classList.add('hide'); $('play').classList.remove('hide'); $('scoreBox').classList.remove('hide'); document.body.classList.remove('at-home');
  $('pLot').textContent = lapName(d) + (prac ? ' (archive)' : ''); $('pDate').textContent = dateFor(d);
  setScore(total(cur)); render(); window.scrollTo(0, 0);
}
function renderTrack(){
  const t = $('track'); t.textContent = '';
  const labels = ['Photo'].concat(QS.map(q => q.label));
  labels.forEach((l, i) => {
    let st = '';
    if (i === 0) st = cur.photo ? (cur.photo.win ? 'ok' : 'miss') : 'cur';
    else { const q = cur.qs[i - 1]; st = q && q.pick != null ? (q.ok ? 'ok' : 'miss') : (cur.photo && i === cur.step ? 'cur' : ''); }
    if (i === 0 && cur.step === 0 && cur.photo) st = (cur.photo.win ? 'ok' : 'miss');
    const li = el('li', st); li.appendChild(el('span', 'seg')); li.appendChild(el('span', 'lbl', l)); li.setAttribute('aria-label', 'Round ' + (i + 1) + ', ' + l + (st === 'cur' ? ', current' : st === 'ok' ? ', correct' : st === 'miss' ? ', missed' : '')); t.appendChild(li);
  });
}
function render(){
  clearTimers(); renderTrack();
  const s = $('stage'); s.textContent = '';
  if (cur.step === 0) { if (!cur.photo) renderPhotoRound(s); else renderReveal(s); }
  else if (cur.step <= 6) renderQuestion(s, cur.step - 1);
  else renderCard(s);
}

// ----- round 1: photo, zoom out -----
let zview = null, zoomRaf = 0;
function misses(){ return cur.g.length; }
function zoomTo(cv){
  const im = photo(ans); if (!im.naturalWidth) { photo(ans, () => zoomTo(cv)); return; }
  const to = viewFor(im, ans, ZOOM[Math.min(misses(), ZOOM.length - 1)]), from = zview || to, t0 = performance.now();
  cancelAnimationFrame(zoomRaf);
  if (still() || !zview || from === to) { zview = to; paint(cv, im, to); return; }
  (function step(now){ const p = Math.min(1, (now - t0) / 700), e = 1 - Math.pow(1 - p, 3);
    zview = { x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e, w: from.w + (to.w - from.w) * e, h: from.h + (to.h - from.h) * e, full: p >= 1 && to.full };
    paint(cv, im, zview); if (p < 1) zoomRaf = requestAnimationFrame(step); })(t0);
}
function renderPhotoRound(s){
  s.appendChild(el('p', 'kicker', 'Round 1 of 7'));
  s.appendChild(el('h2', 'q', 'Name the car'));
  s.appendChild(el('p', 'sub', 'Close-up ' + (misses() + 1) + ' of 6. The view widens after each miss. Fewer guesses, more points.'));
  const fr = el('div', 'photo'), cv = el('canvas'); cv.width = CW; cv.height = CH; cv.setAttribute('aria-label', 'A close-up of the car'); fr.appendChild(cv); s.appendChild(fr);
  const f = el('form', 'guessform'); f.autocomplete = 'off';
  const inp = el('input'); inp.id = 'q'; inp.type = 'text'; inp.placeholder = 'Make, model, or both'; inp.autocapitalize = 'off'; inp.spellcheck = false; inp.setAttribute('aria-label', 'Your guess'); inp.setAttribute('aria-controls', 'sugg');
  const go = el('button', 'primary', 'Guess'); go.type = 'submit';
  f.appendChild(inp); f.appendChild(go); s.appendChild(f);
  const sg = el('div', 'sugg hide'); sg.id = 'sugg'; sg.setAttribute('role', 'listbox'); s.appendChild(sg);
  const note = el('p', 'note'); note.id = 'note'; note.setAttribute('aria-live', 'polite'); s.appendChild(note);
  const list = el('ol', 'guesses'); s.appendChild(list);
  cur.g.map((id, n) => [id, n]).reverse().forEach(([id, n]) => list.appendChild(guessRow(id, n)));
  wireInput(inp, f, sg);
  zoomTo(cv);
}
function guessRow(id, n){
  const e = byId[id], r = judge(BANK, e, ans), li = el('li');
  li.appendChild(el('span', 'nm', e.label));
  const ch = el('span', 'chips');
  ch.appendChild(el('span', 'chip' + (r.makeOk ? ' hit' : ''), r.makeOk ? 'Right make' : 'Wrong make'));
  ch.appendChild(el('span', 'chip ' + (r.country === 'hit' ? 'hit' : r.country === 'near' ? 'near' : ''), r.country === 'hit' ? 'Right country' : r.country === 'near' ? 'Same continent' : 'Wrong country'));
  if (e.kind === 'model') ch.appendChild(el('span', 'chip' + (r.modelOk ? ' hit' : r.near ? ' near' : ''), r.modelOk ? 'Right model' : r.near ? 'So close' : 'Wrong model'));
  li.appendChild(ch);
  const t = cur.typed[n], bits = [];
  if (t && norm(t) !== norm(e.label)) bits.push('You typed “' + t + '”');
  if (r.near) bits.push(r.near);
  if (bits.length) li.appendChild(el('span', 'typed', bits.join('. ')));
  return li;
}
let sugg = [], act = -1;
function wireInput(inp, form, box){
  const hide = () => { box.classList.add('hide'); sugg = []; act = -1; };
  const show = () => {
    const q = inp.value; box.textContent = ''; act = -1;
    if (!q.trim()) { hide(); return; }
    sugg = search(BANK, q, 6).filter(x => x.s >= 40);
    if (!sugg.length) box.appendChild(el('button', '', 'No match yet. Check the spelling or try just the make.'));
    sugg.forEach((x, i) => { const b = el('button'); b.type = 'button'; b.setAttribute('role', 'option');
      b.appendChild(el('span', '', x.e.label)); b.appendChild(el('em', '', x.fuzzy && i === 0 ? 'Did you mean this?' : x.e.kind === 'make' ? 'Make only' : x.e.country));
      b.onmousedown = ev => ev.preventDefault(); b.onclick = () => guess(x.e, q); box.appendChild(b); });
    box.classList.remove('hide');
  };
  const hl = () => [...box.children].forEach((b, i) => b.classList.toggle('act', i === act));
  inp.addEventListener('input', show);
  inp.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' && sugg.length) { act = (act + 1) % sugg.length; hl(); e.preventDefault(); }
    else if (e.key === 'ArrowUp' && sugg.length) { act = (act - 1 + sugg.length) % sugg.length; hl(); e.preventDefault(); }
    else if (e.key === 'Escape') hide();
  });
  inp.addEventListener('blur', () => setTimeout(hide, 150));
  form.addEventListener('submit', e => {
    e.preventDefault(); const q = inp.value; if (!q.trim()) return;
    const list = sugg.length ? sugg : search(BANK, q, 6), pick = act >= 0 ? list[act] : list[0];
    if (!pick || pick.s < 55) { $('note').textContent = '“' + q + '” isn’t in our list of cars. Check the spelling or try just the make. That didn’t use a guess.'; return; }
    guess(pick.e, q);
  });
}
function guess(e, typed){
  if (cur.photo) return;
  if (cur.g.includes(e.id)) { $('note').textContent = 'You already tried ' + e.label + '.'; return; }
  cur.g.push(e.id); cur.typed.push(typed || e.label);
  const r = judge(BANK, e, ans), madeMake = cur.g.some(id => ans.makes.includes(byId[id].make));
  let msg = '';
  if (r.win) { cur.photo = { win: true, pts: PHOTO_PTS[cur.g.length - 1] }; }
  else if (cur.g.length >= MAXG) { cur.photo = { win: false, make: madeMake, pts: madeMake ? MAKE_PTS : 0 }; }
  else if (r.near) msg = r.near + ' The view widens.';
  else if (r.makeOk && e.kind === 'make') msg = 'Right make. Which ' + e.make + ' is it?';
  else if (r.makeOk) msg = 'Right make, wrong model. The view widens.';
  else if (r.country === 'hit') msg = 'Wrong make, but the right country. The view widens.';
  else msg = 'Not this one. The view widens.';
  save();
  if (cur.photo) { setScore(total(cur), cur.photo.pts); render(); return; }
  const s = $('stage'); const cv = s.querySelector('canvas'); renderTrack();
  s.querySelector('.sub').textContent = 'Close-up ' + (misses() + 1) + ' of 6. The view widens after each miss. Fewer guesses, more points.';
  const list = s.querySelector('.guesses'); list.insertBefore(guessRow(e.id, cur.g.length - 1), list.firstChild);
  $('q').value = ''; $('sugg').classList.add('hide'); $('note').textContent = msg; zoomTo(cv); $('q').focus();
}
function renderReveal(s){
  const p = cur.photo;
  s.appendChild(el('p', 'kicker', 'Round 1 of 7'));
  const fr = el('div', 'photo'); fr.appendChild(fullCanvas(ans)); s.appendChild(fr);
  s.appendChild(el('p', 'sub', p.win ? 'You named it on your ' + ORD[cur.g.length - 1] + ' guess.' : p.make ? 'You found the make but not the model.' : 'You didn’t name it this time. Here it is.'));
  s.appendChild(el('h2', 'carname', ans.label));
  s.appendChild(el('p', 'pts' + (p.pts ? '' : ' zero'), p.pts ? '+' + p.pts + ' points' : 'No points this round'));
  s.appendChild(el('p', 'why', 'Now six questions about ' + LAPS[ans.id].maker + ', its engines and its rivals. Each correct answer earns 100 points, plus up to 50 for answering within 20 seconds.'));
  const b = btn('primary', 'Start round 2', () => { cur.step = 1; save(); render(); window.scrollTo(0, 0); }); s.appendChild(b);
  s.appendChild(credit(ans)); b.focus();
}

// ----- rounds 2-7: questions -----
function carChip(){
  const d = el('div', 'carchip'), c = el('canvas'); c.width = 240; c.height = 150; photo(ans, im => paint(c, im, viewFor(im, ans, 1)));
  d.appendChild(c); d.appendChild(el('span', '', ans.label)); return d;
}
function renderQuestion(s, i){
  const Q = QS[i]; if (!cur.qs[i]) { cur.qs[i] = { t0: Date.now(), pick: null }; save(); }
  const st = cur.qs[i], answered = st.pick != null;
  s.appendChild(carChip());
  s.appendChild(el('p', 'kicker', 'Round ' + (i + 2) + ' of 7: ' + Q.label));
  if (Q.img) { const fr = el('div', 'photo qphoto'), cv = el('canvas'); cv.width = CW; cv.height = CH; cv.setAttribute('aria-label', 'Photo for this question'); fr.appendChild(cv); s.appendChild(fr); xphoto(Q.img, im => paintContain(cv, im)); }
  if (Q.stats) { const dl = el('dl', 'specs'); Q.stats.forEach(([k, v]) => { const d = el('div'); d.appendChild(el('dt', '', k)); d.appendChild(el('dd', '', v)); dl.appendChild(d); }); s.appendChild(dl); }
  s.appendChild(el('h2', 'q', Q.q));
  const tm = el('div', 'timer'), bar = el('i'); tm.appendChild(bar); s.appendChild(tm);
  const hint = el('p', 'hint', answered ? '' : 'Answer within 20 seconds for up to 50 bonus points.'); s.appendChild(hint);
  const box = el('div', 'opts'); s.appendChild(box);
  const after = el('div', 'after'); s.appendChild(after);
  const buttons = Q.opts.map((o, k) => { const b = el('button', 'opt'); b.type = 'button'; b.appendChild(el('kbd', '', String(k + 1))); b.appendChild(el('span', '', o)); b.onclick = () => answer(i, k); box.appendChild(b); return b; });
  function showResult(){
    buttons.forEach((b, k) => { b.disabled = true; if (k === Q.a) b.classList.add('right'); else if (k === st.pick) b.classList.add('wrong'); else b.classList.add('fade'); });
    const v = el('p', 'verdict' + (st.ok ? ' good' : ''), st.ok ? 'Correct, +' + st.pts + ' points' + (st.pts > BASE ? ' with a speed bonus of ' + (st.pts - BASE) : '') : 'Not quite. The answer is ' + Q.opts[Q.a] + '.');
    after.appendChild(v); if (Q.why) after.appendChild(el('p', 'why', Q.why));
    const last = i === QS.length - 1;
    const nb = btn('primary', last ? 'See your lap card' : 'Start round ' + (i + 3), () => { cur.step = i + 2; save(); render(); window.scrollTo(0, 0); });
    after.appendChild(nb); if (Q.img) after.appendChild(xcredit(Q.img)); nb.focus(); bar.style.setProperty('--p', Math.max(0, 1 - (st.ms || 0) / BONUS_MS)); hint.textContent = '';
  }
  if (answered) { showResult(); return; }
  (function tick(){ const p = Math.max(0, 1 - (Date.now() - st.t0) / BONUS_MS); bar.style.setProperty('--p', p); if (p > 0 && cur.qs[i].pick == null) timerRaf = requestAnimationFrame(tick); else if (p <= 0) hint.textContent = 'The speed bonus has run out, but a correct answer still earns 100 points.'; })();
  renderQuestion.showResult = showResult;
  if (buttons[0]) buttons[0].focus({ preventScroll: true });
}
function answer(i, k){
  const st = cur.qs[i]; if (st.pick != null) return;
  cancelAnimationFrame(timerRaf);
  const Q = QS[i], ms = Date.now() - st.t0, ok = k === Q.a;
  st.pick = k; st.ok = ok; st.ms = ms; st.pts = ok ? BASE + Math.round(BONUS * Math.max(0, 1 - ms / BONUS_MS)) : 0;
  if (i === QS.length - 1) cur.done = true;
  save(); renderTrack(); setScore(total(cur), st.pts);
  renderQuestion.showResult();
  if (cur.done && !practice) pushScore();
}
document.addEventListener('keydown', e => {
  if ($('pg-game').hidden) return;
  if ($('ov').classList.contains('on') || !cur || cur.step < 1 || cur.step > 6) return;
  const n = parseInt(e.key, 10); const Q = QS[cur.step - 1];
  if (n >= 1 && n <= Q.opts.length && cur.qs[cur.step - 1] && cur.qs[cur.step - 1].pick == null) answer(cur.step - 1, n - 1);
});

// ----- the lap card -----
const tenths = t => (Math.round(t / MAX_TOTAL * 100) / 10).toFixed(1);
function shareText(){
  const marks = cur.qs.map(q => q && q.ok ? '✅' : '❌').join('');
  return 'Ten Tenth’s ' + lapName(day).toLowerCase() + ': ' + fmt(total(cur)) + ' of ' + fmt(MAX_TOTAL) + ' (' + tenths(total(cur)) + ' tenths)\n' +
    'Photo: ' + (cur.photo.win ? 'named on guess ' + cur.g.length : cur.photo.make ? 'make only' : 'missed') + '\nQuestions: ' + marks;
}
function renderCard(s){
  const card = el('article', 'lotcard'), hd = el('header');
  hd.appendChild(el('span', 'lap', lapName(day))); hd.appendChild(el('span', 'date', dateFor(day))); card.appendChild(hd);
  const pic = el('div', 'pic'); pic.appendChild(fullCanvas(ans)); card.appendChild(pic);
  const body = el('div', 'body'); body.appendChild(el('h2', '', ans.label));
  const t = el('table'), add = (k, v, ok, pts, note) => { const tr = el('tr'); tr.appendChild(el('td', 'k', k)); const td = el('td', 'v'); td.appendChild(el('span', ok ? '' : 'x', v)); if (note) td.appendChild(el('small', '', note)); tr.appendChild(td); tr.appendChild(el('td', 'p' + (pts ? '' : ' z'), pts ? '+' + pts : '0')); t.appendChild(tr); };
  const p = cur.photo;
  add('Photo', p.win ? 'Named on guess ' + cur.g.length + ' of 6' : p.make ? 'Found the make only' : 'Not named', p.win || p.make, p.pts);
  QS.forEach((Q, i) => { const st = cur.qs[i] || {}; add(Q.label, (st.ok ? '✓ ' : '✕ ') + Q.opts[Q.a], st.ok, st.pts || 0, st.ok || st.pick == null ? '' : 'You picked ' + Q.opts[st.pick]); });
  body.appendChild(t); card.appendChild(body);
  const ft = el('footer'); ft.appendChild(el('span', '', 'You ran at ' + tenths(total(cur)) + ' tenths')); const tb = el('div'); tb.appendChild(el('b', '', fmt(total(cur)))); tb.appendChild(el('span', '', ' of ' + fmt(MAX_TOTAL))); ft.appendChild(tb); card.appendChild(ft);
  s.appendChild(card);
  const ac = el('div', 'actions');
  const cp = btn('primary', 'Copy result', async () => { try { await navigator.clipboard.writeText(shareText()); cp.textContent = 'Copied'; } catch (e) { cp.textContent = 'Copy is blocked here'; } });
  ac.appendChild(cp); ac.appendChild(btn('secondary', practice ? 'Back to the archive' : 'Leaderboard', () => openPanel(practice ? 'arch' : 'board'))); s.appendChild(ac);
  if (!practice) { const cd = el('p', 'muted'); const tick = () => cd.textContent = 'The next lap opens in ' + countdown() + '.'; tick(); ticker = setInterval(tick, 1000); s.appendChild(cd); }
  else s.appendChild(el('p', 'muted', 'Archive laps are practice. They don’t count toward the leaderboard.'));
  s.appendChild(credit(ans));
}

// ---------- panels ----------
function closePanel(){ $('ov').classList.remove('on'); }
function head(p, title){ const h = el('h3', '', title); h.appendChild(btn('textbtn', 'Close', closePanel)); p.appendChild(h); }
function thumb(a, show){ const c = document.createElement('canvas'); c.width = 320; c.height = 200; if (show) photo(a, im => paint(c, im, viewFor(im, a, 1))); return c; }
const PANELS = {
  menu(p){ head(p, 'Menu'); const m = el('div', 'menu');
    [['Today’s lap', () => { closePanel(); renderHome(); }], ['Leaderboard', 'board'], ['Archive', 'arch'], ['My garage', 'garage'], ['How it works', 'how']].forEach(([t, a]) => m.appendChild(btn('', t, typeof a === 'string' ? () => openPanel(a) : a)));
    m.appendChild(btn('test', 'Reset today (testing)', () => openPanel('reset'))); p.appendChild(m); },
  how(p){ head(p, 'How it works'); const ol = el('ol');
    ['Every day there’s one car, the same for everyone. A new lap opens at midnight.',
     'Round 1: name it from a close-up of plain bodywork. Type any make, model or both; spelling doesn’t need to be perfect. Each miss widens the view, and a name we don’t recognise doesn’t use a guess.',
     'Naming it on the first guess earns 400 points, then 320, 260, 200, 150 and 100. Finding only the make earns 50.',
     'Rounds 2 to 7: six questions about the car’s maker and its class. Name a famous engine from a photo and its specs, spot another model from the same maker, pick out a rival from the same country, and answer three questions on the maker’s history.',
     'Each correct answer earns 100 points, plus up to 50 for answering within 20 seconds.',
     'The best possible day is ' + fmt(MAX_TOTAL) + ' points. Your daily scores add up to your season total on the leaderboard.'].forEach(t => ol.appendChild(el('li', '', t))); p.appendChild(ol); },
  board(p){ head(p, 'Leaderboard'); const tabs = el('div', 'tabs'), body = el('div'); let mode = 'today';
    const tb = [['today', 'Today'], ['all', 'Season']].map(([k, t]) => { const b = btn(k === mode ? 'on' : '', t, () => { mode = k; tb.forEach(x => x.classList.toggle('on', x === b)); draw(); }); tabs.appendChild(b); return b; });
    p.appendChild(tabs); p.appendChild(body); let rows = null, names = {};
    function draw(){ body.textContent = '';
      if (!rows) { body.appendChild(el('p', '', db ? 'Loading the leaderboard…' : 'The shared leaderboard isn’t available in this view. Your scores are still saved on this device.')); return; }
      const list = mode === 'today' ? rows.filter(r => r.days && r.days[TODAY] && r.days[TODAY].pts != null).map(r => ({ id: r.id, a: r.days[TODAY].pts, b: r.days[TODAY].ms || 0, c: (r.days[TODAY].correct || 0) + ' of 7' })).sort((x, y) => y.a - x.a || x.b - y.b)
        : rows.filter(r => r.v === 4).map(r => ({ id: r.id, a: r.total || 0, c: Object.keys(r.days || {}).length })).sort((x, y) => y.a - x.a);
      if (!list.length) { body.appendChild(el('p', '', mode === 'today' ? 'No one has finished today’s lap yet.' : 'No season scores yet.')); return; }
      const t = el('table', 'board'), hr = el('tr'); ['', 'Player', 'Points', mode === 'today' ? 'Correct' : 'Laps'].forEach((h, i) => hr.appendChild(el('th', i > 1 ? 'n' : '', h))); t.appendChild(hr);
      list.slice(0, 50).forEach((r, i) => { const tr = el('tr', r.id === uid ? 'me' : ''); const nm = (names[r.id] && names[r.id].name) || 'Player';
        [i + 1, nm + (r.id === uid ? ' (you)' : ''), fmt(r.a), r.c].forEach((c, j) => tr.appendChild(el('td', j !== 1 ? 'n' : '', c))); t.appendChild(tr); });
      body.appendChild(t); }
    draw();
    if (db) timeout(db.collection('scores').limit(500).get(), 10000).then(async snap => { rows = snap.docs.map(d => Object.assign({ id: d.id }, d.data())); try { names = user ? await user.profiles(rows.map(r => r.id)) : {}; } catch (e) {} draw(); }).catch(() => { body.textContent = ''; body.appendChild(el('p', '', 'The leaderboard can’t be reached right now. Try again in a minute.')); });
  },
  arch(p){ head(p, 'Archive');
    if (!store.unlocked) { const pay = el('div', 'pay'); pay.appendChild(el('p', '', 'Play every past lap, any time, for a one-time $5.')); pay.appendChild(el('p', '', 'This is a prototype: checkout isn’t connected and no payment is taken. The button only previews the unlocked archive.'));
      pay.appendChild(btn('secondary', 'Preview the unlocked archive', () => { store.unlocked = true; save(); openPanel('arch'); })); p.appendChild(pay); }
    const list = el('div', 'arch');
    for (let d = TODAY - 1; d >= 1; d--) { const r = store.arch[d], b = btn('', '', () => openDay(d, true)); b.appendChild(el('span', '', lapName(d))); b.appendChild(el('span', '', !store.unlocked ? 'Locked' : r && r.done ? fmt(total(r)) + ' points' : r && (r.g.length || r.photo) ? 'In progress' : 'Play')); b.disabled = !store.unlocked; list.appendChild(b); }
    p.appendChild(list); p.appendChild(el('p', 'muted', 'Archive laps are practice. They don’t count toward the leaderboard.')); },
  garage(p){ head(p, 'My garage'); const done = Object.values(store.days).filter(r => r.done);
    const st = el('div', 'stats'); [[fmt(season()), 'season points'], [done.length, 'laps played'], [streak(), 'day streak'], [done.length ? fmt(Math.round(season() / done.length)) : '0', 'average'], [done.length ? fmt(Math.max.apply(null, done.map(total))) : '0', 'best day'], [done.filter(r => r.photo && r.photo.win).length, 'cars named']].forEach(([v, l]) => { const d = el('div'); d.appendChild(el('b', '', v)); d.appendChild(el('small', '', l)); st.appendChild(d); }); p.appendChild(st);
    const found = new Set(); [store.days, store.arch].forEach(bag => { for (const k in bag) if (bag[k].photo && bag[k].photo.win) found.add(ansFor(+k).id); });
    p.appendChild(el('p', '', 'Cars you’ve named this test week: ' + found.size + ' of ' + ROT.length + '.'));
    const g = el('div', 'garage'); ROT.forEach(a => { const f = el('figure'), has = found.has(a.id); f.appendChild(thumb(a, has)); f.appendChild(el('figcaption', has ? '' : 'x', has ? a.label : 'Not found yet')); g.appendChild(f); }); p.appendChild(g); },
  reset(p){ head(p, 'Reset today (testing)');
    p.appendChild(el('p', '', 'This is a prototype tool. It deletes your ' + lapName(TODAY).toLowerCase() + ' run on this device and removes it from the shared leaderboard, so you can play today again.'));
    const r = el('div', 'btnrow'); r.appendChild(btn('primary', 'Reset and play today again', () => { delete store.days[TODAY]; save(); pushScore(); openDay(TODAY, false); })); r.appendChild(btn('secondary', 'Cancel', closePanel)); p.appendChild(r); },
  contact(p){ head(p, 'Contact'); p.appendChild(el('p', '', 'Ten Tenth’s is a RoadStar game. Contact details will go here before launch.')); },
  terms(p){ head(p, 'Terms and photo credits'); p.appendChild(el('p', '', 'Terms of use will go here before launch.'));
    p.appendChild(el('p', '', 'Photos come from Wikimedia Commons under free licences (CC BY, CC BY-SA, CC0 or public domain). Each photographer and licence are shown once that lap’s car is revealed. We cropped the photos and blurred number plates and name scripts; edited photos under share-alike licences are shared under the same licence.'));
    p.appendChild(el('p', '', 'Car names identify the vehicles in the game. Ten Tenth’s isn’t affiliated with or endorsed by any manufacturer.')); },
  privacy(p){ head(p, 'Privacy'); p.appendChild(el('p', '', 'The privacy policy will go here before launch.')); }
};
function openPanel(name){ const p = $('panel'); p.textContent = ''; PANELS[name](p); $('ov').classList.add('on'); $('ov').scrollTop = 0; const f = p.querySelector('button'); if (f) f.focus({ preventScroll: true }); }
$('menuBtn').onclick = () => openPanel('menu');
$('homeLink').onclick = () => { closePanel(); renderHome(); };
$('ov').addEventListener('click', e => { if (e.target === $('ov')) closePanel(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closePanel(); });
document.querySelectorAll('#pg-game [data-open]').forEach(b => b.onclick = () => openPanel(b.dataset.open));

renderHome();
window.__bf = { openDay, ansFor, TODAY, QS: () => QS, store: () => store, cur: () => cur };
window.TT = { openPanel, renderHome, ansFor, TODAY, lapName, dateFor, viewFor, paint, photo, ZOOM };
})();
