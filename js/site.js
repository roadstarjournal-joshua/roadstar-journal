(function(){
'use strict';
const $ = id => document.getElementById(id);
const SECTIONS = { news: 'News', reviews: 'Reviews', opinion: 'Opinion', features: 'Features' };
const SECTION_DESC = { news: 'Reporting from the car world.', reviews: 'Buyer’s guides, drives and verdicts.', opinion: 'Columns and arguments from our writers.', features: 'Longer stories about the cars and people that matter.' };
const BASE_PAGES = ['pg-front', 'pg-section', 'pg-story', 'pg-cross', 'pg-desk', 'pg-write', 'pg-game'];
const ROLE_NAME = { writer: 'Writer', editor: 'Editor', owner: 'Owner', reader: 'Reader' };
let db = null, user = null, assets = null;
let posts = null, staff = {}, staffLoaded = false, loadNote = '';
const me = { id: null, name: '', role: 'reader', maybeWriter: false };
const isEditor = () => me.role === 'editor' || me.role === 'owner';
const isStaff = () => isEditor() || me.role === 'writer';

// ---------- helpers ----------
function el(tag, cls, text){ const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
function link(href, cls, text){ const a = el('a', cls, text); a.href = pathHref(href); return a; }
// ---------- addresses ----------
// The live site (window.RS_LIVE) uses real page addresses such as /story/<slug>; the prototype and test file keep #story-<slug>.
const LIVE_URLS = !!window.RS_LIVE;
const PATH_PREFIXES = ['edit-post', 'ten-tenths', 'story', 'author', 'tag', 'desk', 'new', 'edit', 'profile'];
function routeToPath(h){
  h = String(h || '').replace(/^#/, '');
  if (!h || h === 'home') return '/';
  for (const p of PATH_PREFIXES) if (h.indexOf(p + '-') === 0) return '/' + p + '/' + encodeURIComponent(h.slice(p.length + 1));
  return '/' + h;
}
function pathToRoute(path){
  const segs = String(path || '/').split('/').filter(Boolean).map(x => { try { return decodeURIComponent(x); } catch (e) { return x; } });
  if (!segs.length) return 'home';
  if (segs.length > 1 && PATH_PREFIXES.includes(segs[0])) return segs[0] + '-' + segs.slice(1).join('/');
  return segs.join('-');
}
function pathHref(href){ return LIVE_URLS && typeof href === 'string' && href[0] === '#' ? routeToPath(href) : href; }
function currentRoute(){ return LIVE_URLS ? pathToRoute(location.pathname) : (location.hash || '#home').slice(1); }
function navTo(h, replace){
  if (!LIVE_URLS) { if (replace) location.replace(h); else location.hash = h; return; }
  const p = routeToPath(h);
  if (replace) history.replaceState(null, '', p); else if (p !== location.pathname) history.pushState(null, '', p);
  route();
}
function fmtDate(ms){ return new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
function fmtWhen(ms){ return new Date(ms).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); }
function ago(ms){ const m = Math.round((Date.now() - ms) / 60000); if (m < 1) return 'just now'; if (m < 60) return m + ' min ago'; const h = Math.round(m / 60); if (h < 24) return h + ' hr ago'; return fmtDate(ms); }
function esc(s){ return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function slugify(s){ return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60); }
function rand4(){ return Math.random().toString(36).slice(2, 6); }
function initials(name){ return String(name || '?').split(/\s+/).filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'; }
function inline(s){
  s = esc(s || '');
  s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (m, t, u) => '<a href="' + u + '" target="_blank" rel="noopener">' + t + '</a>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
  return s;
}
function plain(s){ return String(s || '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*/g, ''); }

// ---------- story blocks ----------
// Old posts keep a markdown-lite body; new posts store blocks. Both render through blockNode.
function mdToBlocks(text){
  const out = [];
  String(text || '').replace(/\r/g, '').split(/\n\s*\n/).forEach(chunk => {
    const b = chunk.trim(); if (!b) return;
    if (b.startsWith('### ')) out.push({ t: 'h3', x: b.slice(4) });
    else if (b.startsWith('## ')) out.push({ t: 'h2', x: b.slice(3) });
    else if (b.startsWith('> ')) out.push({ t: 'quote', x: b.replace(/^>\s?/gm, '').replace(/\n/g, ' ') });
    else if (/^- /.test(b)) out.push({ t: 'ul', items: b.split('\n').filter(l => /^- /.test(l)).map(l => l.slice(2)) });
    else out.push({ t: 'p', x: b.replace(/\n/g, ' ') });
  });
  return out;
}
function blocksOf(p){ return Array.isArray(p.blocks) ? p.blocks : mdToBlocks(p.body); }
function blockText(b){
  if (b.x != null) return plain(b.x);
  if (b.items) return b.items.map(plain).join(' ');
  if (b.t === 'verdict') return [b.line].concat(b.pros || [], b.cons || []).join(' ');
  if (b.t === 'note') return b.x || '';
  return '';
}
function wordCount(p){ return blocksOf(p).map(blockText).join(' ').split(/\s+/).filter(Boolean).length; }
function readTime(p){ return Math.max(1, Math.round(wordCount(p) / 230)) + ' min read'; }
function creditNode(cr, lead){
  const s = el('span', 'b-credit'); if (!cr || !(cr.a || cr.l)) return s;
  s.appendChild(document.createTextNode((lead || 'Photo') + ': '));
  if (cr.u) { const a = link(cr.u, '', cr.a || 'source'); a.target = '_blank'; a.rel = 'noopener'; s.appendChild(a); } else s.appendChild(document.createTextNode(cr.a || ''));
  if (cr.l) s.appendChild(document.createTextNode((cr.a || cr.u ? ', ' : '') + cr.l));
  return s;
}
function imgEl(src, alt){ const i = el('img'); i.src = src; i.alt = alt || ''; i.loading = 'lazy'; return i; }
const LAY = { left: 'lay-left', right: 'lay-right', wide: 'lay-wide', full: 'lay-full' };
function blockNode(b, bare){
  const lay = !bare && b.lay && LAY[b.lay] ? ' ' + LAY[b.lay] : '';
  let n;
  switch (b.t) {
    case 'h2': case 'h3': n = el(b.t); n.innerHTML = inline(b.x); return n;
    case 'quote': n = el('blockquote'); n.innerHTML = inline(b.x); return n;
    case 'ul': case 'ol': n = el(b.t); (b.items || []).forEach(x => { const li = el('li'); li.innerHTML = inline(x); n.appendChild(li); }); return n;
    case 'hr': return el('hr');
    case 'img': {
      n = el('figure', 'fig' + lay);
      if (b.src) n.appendChild(imgEl(b.src, b.alt)); else n.appendChild(el('div', 'fig-empty', 'No photo chosen'));
      const fc = el('figcaption', 'caption muted'); if (b.cap) fc.appendChild(el('span', 'cap', b.cap + ' '));
      fc.appendChild(creditNode(b.credit)); if (fc.textContent.trim()) n.appendChild(fc); return n;
    }
    case 'gallery': {
      n = el('figure', 'gal-wrap'); const imgs = b.imgs || [];
      const g = el('div', 'gal gal--' + Math.min(imgs.length || 1, 4)); imgs.forEach(x => g.appendChild(imgEl(x.src, x.alt)));
      if (!imgs.length) g.appendChild(el('div', 'fig-empty', 'No photos in this gallery yet'));
      n.appendChild(g);
      const fc = el('figcaption', 'caption muted'); if (b.cap) fc.appendChild(el('span', 'cap', b.cap + ' '));
      const names = imgs.filter(x => x.credit && (x.credit.a || x.credit.l)).map(x => [x.credit.a, x.credit.l].filter(Boolean).join(', '));
      if (names.length) fc.appendChild(el('span', 'b-credit', 'Photos: ' + [...new Set(names)].join('; ')));
      if (fc.textContent.trim()) n.appendChild(fc); return n;
    }
    case 'specs': {
      n = el('aside', 'b-specs' + (!bare && b.lay === 'right' ? ' lay-right' : ''));
      n.appendChild(el('h4', 'label', b.title || 'Specifications'));
      const dl = el('dl'); (b.rows || []).forEach(r => { if (!r[0] && !r[1]) return; const w = el('div'); w.appendChild(el('dt', '', r[0] || '')); w.appendChild(el('dd', '', r[1] || '—')); dl.appendChild(w); });
      n.appendChild(dl); return n;
    }
    case 'verdict': {
      n = el('section', 'b-verdict');
      const sc = el('div', 'v-score'); if (b.score) { sc.appendChild(el('b', '', String(b.score))); sc.appendChild(el('span', '', 'out of 10')); } else sc.appendChild(el('span', '', 'Verdict'));
      n.appendChild(sc);
      const t = el('div', 'v-body'); t.appendChild(el('h4', 'label', 'The verdict')); t.appendChild(el('p', 'v-line', b.line || ''));
      const pc = el('div', 'v-pc');
      [['What we like', b.pros, 'pro'], ['What we don’t', b.cons, 'con']].forEach(([h, list, k]) => { if (!list || !list.filter(Boolean).length) return; const d = el('div'); d.appendChild(el('h5', '', h)); const ul = el('ul', k); list.filter(Boolean).forEach(x => ul.appendChild(el('li', '', x))); d.appendChild(ul); pc.appendChild(d); });
      if (pc.childNodes.length) t.appendChild(pc);
      n.appendChild(t); return n;
    }
    case 'note': {
      n = el('aside', 'upnote'); n.appendChild(el('b', '', (b.kind || 'Update') + ', ' + fmtDate(b.date || Date.now()) + ': ')); n.appendChild(document.createTextNode(b.x || '')); return n;
    }
    default: n = el('p'); n.innerHTML = inline(b.x); return n;
  }
}
function renderBlocks(blocks, into){
  (blocks || []).forEach(b => { if ((b.t === 'p' || b.t === 'h2' || b.t === 'h3' || b.t === 'quote') && !String(b.x || '').trim()) return; if ((b.t === 'ul' || b.t === 'ol') && !(b.items || []).some(x => x.trim())) return; into.appendChild(blockNode(b)); });
  return into;
}

// ---------- people ----------
function authorName(p){ const s = p.authorId && staff[p.authorId]; return (s && s.byline) || p.author || 'RoadStar staff'; }
function avatar(uid, name, size){
  const s = uid && staff[uid]; const d = el('span', 'avatar'); if (size) { d.style.width = d.style.height = size + 'px'; d.style.fontSize = Math.round(size / 2.6) + 'px'; }
  if (s && s.photo && s.photo.src) d.appendChild(imgEl(s.photo.src, '')); else d.textContent = initials(name || (s && s.byline));
  return d;
}

// ---------- reader furniture ----------
function imgSrc(p){ return p && p.image && p.image.src ? p.image.src : ''; }
function thumb(p, cls){ const d = el('div', 'thumb' + (cls ? ' ' + cls : '')); if (imgSrc(p)) d.appendChild(imgEl(p.image.src, p.image.alt)); return d; }
function kicker(p){
  const k = el('div', 'kicker'); k.appendChild(el('span', 'label', SECTIONS[p.section] || 'Story'));
  if (p.rating) k.appendChild(el('span', 'rs-pill rs-pill--active', p.rating + '/10'));
  if (p.sample) k.appendChild(el('span', 'rs-pill sample', 'Sample post'));
  return k;
}
function byline(p, long){
  const b = el('div', 'byline'); const a = el('span'); a.appendChild(document.createTextNode('By '));
  if (long && p.authorId) a.appendChild(link('#author-' + p.authorId, 'byname', authorName(p))); else a.appendChild(el('b', '', authorName(p)));
  b.appendChild(a);
  b.appendChild(el('span', '', long ? fmtDate(p.published) : ago(p.published)));
  if (long) b.appendChild(el('span', '', readTime(p)));
  return b;
}
function storyLink(p){ return link('#story-' + p.id, 'storylink'); }

// ---------- data ----------
// Scheduled stories are stored with a future publish time and stay hidden from readers until then.
function live(){ const now = Date.now(); return (posts || []).filter(p => !p.published || p.published <= now).sort((a, b) => (b.published || 0) - (a.published || 0)); }
let dueTimer = null;
function armDue(){
  clearTimeout(dueTimer); const now = Date.now();
  const next = (posts || []).map(p => p.published).filter(t => t > now).sort((a, b) => a - b)[0];
  if (next && next - now < 2e9) dueTimer = setTimeout(() => { rerender(); armDue(); }, next - now + 500);
}
(async function boot(){
  try {
    if (!window.claude || !window.claude.use) { loadNote = 'unavailable'; rerender(); return; }
    const r = await Promise.all([window.claude.use('db'), window.claude.use('user')]); db = r[0]; user = r[1];
    if (!db) { loadNote = 'unavailable'; rerender(); return; }
    const timer = setTimeout(() => { if (!posts) { loadNote = 'slow'; rerender(); } }, 10000);
    db.collection('posts').orderBy('published', 'desc').limit(400).onSnapshot(snap => {
      clearTimeout(timer); loadNote = ''; posts = snap.docs.map(d => Object.assign({ id: d.id }, d.data())); armDue(); rerender();
    }, () => { clearTimeout(timer); loadNote = 'error'; rerender(); });
    db.collection('staff').limit(300).onSnapshot(snap => {
      staff = {}; snap.docs.forEach(d => { staff[d.id] = d.data(); }); staffLoaded = true; rerender(); if (window.CMS) window.CMS.staffChanged();
    }, () => {});
    if (user) {
      const safe = fn => Promise.resolve().then(fn).catch(() => null);
      const [owner, edit, can, id, prof] = await Promise.all([safe(() => user.isOwner()), safe(() => user.canEdit()), safe(() => user.can('data.write')), safe(() => user.id()), safe(() => user.me())]);
      me.id = id; me.name = (prof && prof.name) || '';
      me.role = owner ? 'owner' : edit ? 'editor' : can === true ? 'writer' : 'reader';
      me.maybeWriter = me.role === 'reader' && can == null;
    }
  } catch (e) { loadNote = 'error'; rerender(); }
})().then(() => { if (window.CMS) window.CMS.start(); });
function loadingBlock(){
  const d = el('div', 'n-empty');
  d.textContent = loadNote === 'unavailable' ? (LIVE_URLS ? 'Stories can’t be loaded right now. Try again in a minute.' : 'Stories can’t be loaded in this view. Open the page on claude.ai while signed in.') :
    loadNote === 'slow' ? 'Stories are taking longer than usual to load. They’ll appear here as soon as they arrive.' :
    loadNote === 'error' ? 'Stories couldn’t be loaded right now. Try again in a minute.' : 'Loading stories…';
  return d;
}

// ---------- front page ----------
function playBand(){
  const band = el('section', 'n-play'); band.setAttribute('aria-label', 'Ten Tenth’s');
  const cv = el('canvas'); cv.width = 960; cv.height = 600; cv.setAttribute('aria-label', 'A close-up of today’s Ten Tenth’s car');
  try { const a = window.TT.ansFor(window.TT.TODAY); window.TT.photo(a, im => window.TT.paint(cv, im, window.TT.viewFor(im, a, window.TT.ZOOM[0]))); } catch (e) {}
  band.appendChild(cv);
  const pad = el('div', 'pad');
  pad.appendChild(el('span', 'label muted', 'Ten Tenth’s · ' + window.TT.lapName(window.TT.TODAY)));
  pad.appendChild(el('h2', 'h1', 'What car is this?'));
  pad.appendChild(el('p', 'muted', 'Name today’s car from a close-up, then take on six rounds about its maker, its engines and its rivals. New lap every day.'));
  const b = link('#ten-tenths', 'rs-btn rs-btn--lg rs-btn--accent', 'Play today’s lap'); b.style.alignSelf = 'flex-start'; pad.appendChild(b);
  band.appendChild(pad); return band;
}
function rowHead(title, href){ const h = el('div', 'n-rowhead'); h.appendChild(el('h2', 'h2', title)); if (href) h.appendChild(link(href, '', 'See all')); return h; }
function card(p){ const a = storyLink(p); const c = el('article', 'n-card'); c.appendChild(thumb(p)); c.appendChild(kicker(p)); c.appendChild(el('h3', 'hl', p.title)); if (p.dek) c.appendChild(el('p', 'dek', p.dek)); c.appendChild(byline(p)); a.appendChild(c); return a; }
function reviewCard(p){ const a = storyLink(p); const c = el('article', 'n-review n-card'); c.appendChild(thumb(p)); const pad = el('div', 'pad'); pad.appendChild(kicker(p)); pad.appendChild(el('h3', 'hl', p.title)); if (p.dek) pad.appendChild(el('p', 'dek', p.dek)); pad.appendChild(byline(p)); c.appendChild(pad); a.appendChild(c); return a; }
function opinionItem(p){ const a = storyLink(p); a.appendChild(kicker(p)); a.appendChild(el('h3', 'hl', p.title)); if (p.dek) a.appendChild(el('p', 'dek', p.dek)); a.appendChild(byline(p)); return a; }
function listItem(p){ const a = storyLink(p); const t = el('div'); t.appendChild(kicker(p)); t.appendChild(el('h3', 'hl', p.title)); if (p.dek) t.appendChild(el('p', 'dek', p.dek)); t.appendChild(byline(p)); a.appendChild(t); if (imgSrc(p)) a.appendChild(thumb(p)); return a; }
function renderFront(){
  const pg = $('pg-front'); pg.textContent = ''; document.title = 'RoadStar';
  const c = el('div', 'n-container'); pg.appendChild(c);
  const dl = el('div', 'n-dateline'); dl.appendChild(el('span', 'label muted', new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })));
  dl.appendChild(link('#ten-tenths', '', 'Today’s Ten Tenth’s is open')); c.appendChild(dl);
  if (!posts) { c.appendChild(loadingBlock()); c.appendChild(playBand()); return; }
  const all = live();
  if (!all.length) { const e = el('div', 'n-empty'); e.appendChild(el('h2', 'h2', 'No stories yet')); e.appendChild(el('p', '', isStaff() ? 'Head to the writer’s desk to write the first one.' : 'Check back soon.')); if (isStaff()) e.appendChild(link('#write', 'rs-btn rs-btn--solid', 'Write a story')); c.appendChild(e); c.appendChild(playBand()); return; }
  const lead = all.find(p => p.featured) || all[0];
  const rest = all.filter(p => p !== lead);
  const top = el('section', 'n-lead');
  const l = storyLink(lead); const la = el('article'); la.appendChild(thumb(lead)); la.appendChild(kicker(lead)); la.appendChild(el('h1', 'd-l hl', lead.title)); if (lead.dek) la.appendChild(el('p', 'dek body-l', lead.dek)); la.appendChild(byline(lead)); l.appendChild(la); top.appendChild(l);
  const latest = el('aside', 'n-latest'); latest.appendChild(el('h2', 'label', 'Latest')); const ol = el('ol');
  rest.slice(0, 5).forEach(p => { const li = el('li'); const a = storyLink(p); a.appendChild(el('span', 'label muted', (SECTIONS[p.section] || '') + '  ·  ' + ago(p.published))); a.appendChild(el('p', 'hl', p.title)); li.appendChild(a); ol.appendChild(li); });
  latest.appendChild(ol); top.appendChild(latest); c.appendChild(top);
  const used = new Set([lead.id]);
  const take = (sec, n) => rest.filter(p => p.section === sec && !used.has(p.id)).slice(0, n).map(p => { used.add(p.id); return p; });
  const feats = take('features', 3);
  if (feats.length) { const r = el('section', 'n-row'); r.appendChild(rowHead('Features', '#features')); const g = el('div', 'n-grid3'); feats.forEach(p => g.appendChild(card(p))); r.appendChild(g); c.appendChild(r); }
  c.appendChild(playBand());
  const ops = take('opinion', 4);
  if (ops.length) { const r = el('section', 'n-row'); r.appendChild(rowHead('Opinion', '#opinion')); const g = el('div', 'n-opinion'); ops.forEach(p => g.appendChild(opinionItem(p))); r.appendChild(g); c.appendChild(r); }
  const revs = take('reviews', 3);
  if (revs.length) { const r = el('section', 'n-row'); r.appendChild(rowHead('Reviews', '#reviews')); const g = el('div', 'n-grid3'); revs.forEach(p => g.appendChild(reviewCard(p))); r.appendChild(g); c.appendChild(r); }
  const more = rest.filter(p => !used.has(p.id)).slice(0, 8);
  if (more.length) { const r = el('section', 'n-row n-list'); r.appendChild(rowHead('More stories', '#news')); more.forEach(p => r.appendChild(listItem(p))); c.appendChild(r); }
}

// ---------- section, author and tag pages ----------
function listPage(head, list, empty){
  const pg = $('pg-section'); pg.textContent = '';
  const c = el('div', 'n-container'); pg.appendChild(c); c.appendChild(head);
  if (!posts) { c.appendChild(loadingBlock()); return; }
  if (!list.length) { c.appendChild(el('p', 'n-empty', empty)); return; }
  const r = el('div', 'n-list'); list.forEach(p => r.appendChild(listItem(p))); c.appendChild(r);
}
function renderSection(sec){
  document.title = SECTIONS[sec] + ' · RoadStar';
  const h = el('div', 'n-section-head'); h.appendChild(el('h1', 'd-l', SECTIONS[sec])); h.appendChild(el('p', 'body-l', SECTION_DESC[sec]));
  listPage(h, live().filter(p => p.section === sec), 'No ' + SECTIONS[sec].toLowerCase() + ' stories yet.');
}
function renderAuthor(uid){
  const s = staff[uid] || {}; const name = s.byline || 'RoadStar writer'; document.title = name + ' · RoadStar';
  const h = el('div', 'n-section-head n-author'); h.appendChild(avatar(uid, name, 96));
  const t = el('div'); t.appendChild(el('h1', 'd-l', name)); if (s.title) t.appendChild(el('p', 'label muted', s.title)); if (s.bio) t.appendChild(el('p', 'body-l', s.bio)); h.appendChild(t);
  listPage(h, live().filter(p => p.authorId === uid), 'No published stories yet.');
}
function renderTag(slug){
  const list = live().filter(p => (p.tags || []).some(t => slugify(t) === slug));
  const name = (list[0] && (list[0].tags || []).find(t => slugify(t) === slug)) || slug.replace(/-/g, ' ');
  document.title = name + ' · RoadStar';
  const h = el('div', 'n-section-head'); h.appendChild(el('span', 'label muted', 'Tagged')); h.appendChild(el('h1', 'd-l', name)); h.appendChild(el('p', 'body-l', list.length + (list.length === 1 ? ' story' : ' stories')));
  listPage(h, list, 'No stories with this tag yet.');
}

// ---------- article ----------
function articleNode(p){
  const art = el('article', 'n-article' + (p.section === 'opinion' ? ' is-opinion' : ''));
  art.appendChild(kicker(p)); art.appendChild(el('h1', 'd-l', p.title || 'Untitled'));
  if (p.dek) art.appendChild(el('p', 'dek body-l', p.dek));
  const bl = byline(Object.assign({ published: Date.now() }, p), true);
  if (p.authorId) { const row = el('div', 'byrow'); row.appendChild(avatar(p.authorId, authorName(p), 44)); const t = el('div'); t.appendChild(bl); const s = staff[p.authorId]; if (s && s.title) t.appendChild(el('div', 'caption muted', s.title)); row.appendChild(t); art.appendChild(row); }
  else art.appendChild(bl);
  if (imgSrc(p)) { const f = el('figure', 'n-hero'); f.appendChild(thumb(p)); const fc = el('figcaption', 'caption muted'); fc.appendChild(creditNode(p.image.credit)); if (fc.textContent) f.appendChild(fc); art.appendChild(f); }
  const body = el('div', 'n-body'); renderBlocks(blocksOf(p), body); art.appendChild(body);
  if ((p.tags || []).length) { const t = el('div', 'n-tags'); t.appendChild(el('span', 'label muted', 'Tags')); p.tags.forEach(x => t.appendChild(link('#tag-' + slugify(x), 'rs-pill rs-pill--outline', x))); art.appendChild(t); }
  return art;
}
function renderStory(id){
  const pg = $('pg-story'); pg.textContent = '';
  const c = el('div', 'n-container'); pg.appendChild(c);
  if (!posts) { c.appendChild(loadingBlock()); return; }
  const p = posts.find(x => x.id === id);
  const early = p && p.published > Date.now();
  if (!p || (early && !isEditor())) { const e = el('div', 'n-empty'); e.appendChild(el('h1', 'h1', 'Story not found')); e.appendChild(el('p', '', 'It may have been moved or unpublished.')); e.appendChild(link('#home', 'rs-btn rs-btn--solid', 'Go to the front page')); c.appendChild(e); return; }
  document.title = ((p.seo && p.seo.title) || p.title) + ' · RoadStar';
  if (early) { const b = el('div', 'n-article ed-banner'); b.textContent = 'Scheduled for ' + fmtWhen(p.published) + '. Only editors can see it until then.'; c.appendChild(b); }
  c.appendChild(articleNode(p));
  if (isStaff() && window.CMS) { const e = window.CMS.storyTools(p); if (e) c.appendChild(e); }
  const all = live();
  const more = all.filter(x => x.id !== p.id && x.section === p.section).slice(0, 3);
  const others = more.length ? more : all.filter(x => x.id !== p.id).slice(0, 3);
  if (others.length) { const r = el('section', 'n-row n-more'); r.appendChild(rowHead(more.length ? 'More ' + (SECTIONS[p.section] || 'stories').toLowerCase() : 'More stories', more.length ? '#' + p.section : '#home')); const g = el('div', 'n-grid3'); others.forEach(x => g.appendChild(card(x))); r.appendChild(g); c.appendChild(r); }
  c.appendChild(playBand());
}

// ---------- optional sections (see modules/) ----------
// Each module adds { pages, group, kind, route(hash) } here; the build only includes modules switched on in build5.py.
const MODULES = [];


// ---------- crossword ----------
function renderCross(){
  const pg = $('pg-cross'); document.title = 'Crossword · RoadStar'; if (pg.childNodes.length) return;
  const c = el('div', 'n-container'); pg.appendChild(c);
  const w = el('div', 'n-cross'); const t = el('div');
  t.appendChild(el('span', 'rs-pill rs-pill--outline', 'Coming soon'));
  const h = el('h1', 'd-xl', 'The daily crossword'); h.style.marginTop = '16px'; t.appendChild(h);
  t.appendChild(el('p', 'body-l', 'A small daily crossword is on its way: a five-by-five grid with car clues, short enough to finish with your morning coffee.'));
  t.appendChild(el('p', 'muted', 'Until then, today’s Ten Tenth’s lap is open.'));
  t.appendChild(link('#ten-tenths', 'rs-btn rs-btn--lg rs-btn--solid', 'Play Ten Tenth’s'));
  w.appendChild(t);
  const g = el('div', 'xgrid'); g.setAttribute('aria-label', 'Preview of an empty five by five crossword grid');
  const blk = new Set([4, 20]), nums = { 0: 1, 1: 2, 2: 3, 3: 4, 5: 5, 10: 6, 15: 7, 21: 8 };
  for (let i = 0; i < 25; i++) { const d = el('div', blk.has(i) ? 'blk' : ''); if (nums[i]) d.appendChild(el('span', '', String(nums[i]))); g.appendChild(d); }
  w.appendChild(g); c.appendChild(w);
}

// ---------- info panels (site) ----------
const INFO = {
  about: ['About RoadStar', ['RoadStar covers the car world for drivers: reporting, reviews, opinion and features, plus Ten Tenth’s, a daily car game. A daily crossword is on the way.', 'This is a draft of the site. Posts marked “Sample post” are placeholders to replace with your own stories.']],
  contact: ['Contact', ['Contact details will go here before launch.']],
  terms: ['Terms', ['Terms of use will go here before launch. Car names identify the vehicles discussed; RoadStar isn’t affiliated with any manufacturer.']],
  privacy: ['Privacy', ['The privacy policy will go here before launch.']],
  credits: ['Photo credits', ['Photos in sample posts and Ten Tenth’s come from Wikimedia Commons under free licences (CC BY, CC BY-SA, CC0 or public domain). Each photographer and licence are shown with the photo. We cropped some photos and blurred number plates and lettering; edited share-alike photos are shared under the same licence.']]
};
function openInfo(key){ const [t, ps] = INFO[key]; const p = $('panel'); p.textContent = ''; const h = el('h3', '', t); const x = el('button', 'textbtn', 'Close'); x.type = 'button'; x.onclick = () => $('ov').classList.remove('on'); h.appendChild(x); p.appendChild(h); ps.forEach(s => p.appendChild(el('p', '', s))); $('ov').classList.add('on'); x.focus(); }
document.querySelectorAll('[data-info]').forEach(b => b.onclick = () => openInfo(b.dataset.info));

// ---------- writer's desk: roles, profiles, templates, editor, review workflow ----------
// Roles come from how RoadStar is shared: Contributor = writer, Editor = editor, owner = owner.
// Stories live at desk/<writer id>/stories/<story id>; writers can only reach their own folder.
// Published copies live at posts/<slug>, which only editors can write.
const TEMPLATES = {
  news: { name: 'News brief', section: 'news', desc: 'Short and fast: the facts, one photo, links to your sources, and update notes when the story moves.',
    blocks: [{ t: 'p', x: '', ph: 'Lead with what happened, who it affects and when. Link to your sources.' }] },
  review: { name: 'Review or buyer’s guide', section: 'reviews', desc: 'A spec box, how it drives, what to check before buying, and a scored verdict.',
    blocks: [{ t: 'specs', title: 'Specifications', lay: 'right', rows: [['Price as tested', ''], ['Engine', ''], ['Power', ''], ['Torque', ''], ['Gearbox', ''], ['0–60 mph', ''], ['Top speed', ''], ['Weight', ''], ['Fuel economy', '']] },
      { t: 'p', x: '', ph: 'Set the scene: what the car is, who it’s for, and the one thing that matters most.' },
      { t: 'h2', x: 'Behind the wheel' }, { t: 'p', x: '', ph: 'How it drives: engine, steering, ride and brakes.' },
      { t: 'h2', x: 'What to check before you buy' }, { t: 'p', x: '', ph: 'The checks a buyer should make. Use the list button for a checklist.' },
      { t: 'verdict', score: null, line: '', pros: [], cons: [] }] },
  opinion: { name: 'Opinion column', section: 'opinion', desc: 'Your argument in your own voice, with your photo and bio beside the byline. A main photo is optional.',
    blocks: [{ t: 'p', x: '', ph: 'Make your argument in the first two sentences.' }] },
  feature: { name: 'Feature or car show report', section: 'features', desc: 'A long read or a show report, with photo galleries and captions.',
    blocks: [{ t: 'p', x: '', ph: 'Open with a scene: a place, a person or a moment.' }, { t: 'gallery', imgs: [], cap: '' }, { t: 'h2', x: '', ph: 'Heading for the next part' }, { t: 'p', x: '', ph: 'Keep going.' }] }
};
const TPL_BY_SECTION = { news: 'news', reviews: 'review', opinion: 'opinion', features: 'feature' };
const STATUS = { draft: 'Draft', review: 'In review', changes: 'Changes requested', scheduled: 'Scheduled', published: 'Published' };
const ROLE_ABOUT = {
  writer: 'Writes and edits their own stories, submits them for review and reads editors’ notes. Can’t publish.',
  editor: 'Reviews, edits and publishes any story, schedules publishing and sends stories back with notes.',
  owner: 'Everything an editor can do, plus running the team: profiles, titles and who appears in bylines.'
};
const TZ = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) { return ''; } })();
const TAG_SUGGEST = (() => { const out = []; try { String(BANK_SRC).trim().split('\n').forEach(l => { const parts = l.split('|'); const mk = (parts[0] || '').trim(); if (!mk) return; out.push(mk); (parts[2] || '').split(',').forEach(m => { m = m.trim(); if (m) out.push(mk + ' ' + m); }); }); } catch (e) {} return out; })();
let bootDone = false, ensured = false, deskTab = null, deskTabPicked = false;
const DEMO = !!window.RS_DEMO;
const LIVE = !!window.RS_AUTH; // live site: real accounts through Neon Auth
const desk = {}; const deskSubs = new Set(); const deskLoaded = new Set();
let ed = null;
const clone = o => JSON.parse(JSON.stringify(o));
const storyPath = (uid, sid) => 'desk/' + uid + '/stories/' + sid;
const newSid = () => 's' + Date.now().toString(36) + rand4();
const myName = () => (staff[me.id] && staff[me.id].byline) || me.name || 'You';
const personName = uid => (uid && staff[uid] && staff[uid].byline) || (uid === me.id ? myName() : 'Someone');
function bylineOf(s){ return (s.authorId && staff[s.authorId] && staff[s.authorId].byline) || s.author || 'RoadStar staff'; }
function contentOf(s){ return { template: s.template, section: s.section, title: s.title || '', dek: s.dek || '', blocks: clone(s.blocks || []), image: s.image ? clone(s.image) : null, tags: (s.tags || []).slice(), seo: Object.assign({}, s.seo || {}), featured: !!s.featured, sample: !!s.sample }; }
function cleanBlocks(blocks){
  return (blocks || []).filter(b => {
    if (['p', 'h2', 'h3', 'quote'].includes(b.t)) return !!String(b.x || '').trim();
    if (b.t === 'ul' || b.t === 'ol') return (b.items || []).some(x => x.trim());
    if (b.t === 'img') return !!b.src;
    if (b.t === 'gallery') return (b.imgs || []).length > 0;
    return true;
  }).map(b => { const c = clone(b); delete c.ph; if (c.items) c.items = c.items.filter(x => x.trim()); return c; });
}
function deskReady(){ return deskLoaded.has(me.id); }
function toast(text, href, linkText){
  const old = document.querySelector('.ed-toast'); if (old) old.remove();
  const t = el('div', 'ed-toast'); t.setAttribute('role', 'status'); t.appendChild(el('span', '', text)); if (href) t.appendChild(link(href, '', linkText || 'View'));
  document.body.appendChild(t); setTimeout(() => t.remove(), 5000);
}
function msgPage(text, cta){ const c = el('div', 'n-container n-desk'); c.appendChild(el('h1', 'h1', 'Writer’s desk')); c.appendChild(el('p', 'body-l', text)); if (cta) c.appendChild(cta); return c; }
function gateMsg(){
  if (!bootDone) return msgPage('Checking your access…');
  if (!db) return msgPage('The writer’s desk needs you to be signed in. Open RoadStar on claude.ai while signed in to Claude.');
  if (!isStaff()) return msgPage(DEMO ? 'The writer’s desk is for RoadStar writers and editors. In this test version, switch to Writer or Editor with the Test version menu at the bottom left.' : 'The writer’s desk is for RoadStar writers and editors.', link('#staff', 'rs-btn rs-btn--solid', 'Go to staff sign-in'));
  return null;
}
function field(label, input, hint, cls){ const f = el('div', 'field' + (cls ? ' ' + cls : '')); const l = el('label', '', label); if (!input.id) input.id = 'f' + rand4() + rand4(); l.htmlFor = input.id; f.appendChild(l); f.appendChild(input); if (hint) f.appendChild(el('span', 'hint', hint)); return f; }
function inp(val, ph, type){ const i = el('input'); i.type = type || 'text'; i.value = val || ''; if (ph) i.placeholder = ph; return i; }
function ta(val, ph, rows){ const t = el('textarea'); t.value = val || ''; if (ph) t.placeholder = ph; t.rows = rows || 3; return t; }
function sel(opts, val){ const s = el('select'); opts.forEach(([v, t]) => { const o = el('option', '', t); o.value = v; if (String(v) === String(val)) o.selected = true; s.appendChild(o); }); return s; }
function btn(text, cls, fn){ const b = el('button', cls == null ? 'rs-btn rs-btn--sm rs-btn--outline' : cls, text); b.type = 'button'; if (fn) b.onclick = fn; return b; }
function statusPill(st){ return el('span', 'rs-pill st st-' + st, STATUS[st] || st); }

// ---------- start-up ----------
async function ensureStaff(){
  if (!isStaff() || !me.id || !staffLoaded) return false;
  if (ensured) return true;
  const s = staff[me.id]; const now = Date.now();
  try {
    if (!s) await db.doc('staff/' + me.id).set({ role: me.role, byline: '', title: '', bio: '', photo: null, active: true, joined: now, seen: now });
    else if (s.role !== me.role || !s.seen || now - s.seen > 6 * 3600e3) await db.doc('staff/' + me.id).update({ role: me.role, seen: now });
    ensured = true; return true;
  } catch (e) { return false; }
}
function subscribeDesk(uid){
  if (!uid || !db || deskSubs.has(uid)) return; deskSubs.add(uid);
  db.collection('desk/' + uid + '/stories').limit(500).onSnapshot(snap => {
    Object.keys(desk).forEach(k => { if (desk[k]._uid === uid) delete desk[k]; });
    snap.docs.forEach(d => { desk[d.id] = Object.assign({ id: d.id, _uid: uid }, d.data()); });
    deskLoaded.add(uid); cmsRerender(current);
  }, () => { deskLoaded.add(uid); cmsRerender(current); });
}
function startStaff(){
  $('deskLink').hidden = false; $('deskLink2').hidden = false;
  subscribeDesk(me.id); if (isEditor()) Object.keys(staff).forEach(subscribeDesk);
  ensureStaff();
  if (!assets) window.claude.use('assets').then(a => { assets = a; }).catch(() => {});
}
function start(){ bootDone = true; if (db && isStaff()) startStaff(); rerender(); }
function staffChanged(){ if (!bootDone || !isStaff()) return; if (isEditor()) Object.keys(staff).forEach(subscribeDesk); ensureStaff(); }

// ---------- routing ----------
function cmsRoute(h){
  if (h === 'staff') { current = 'staff'; show('pg-desk'); renderStaff(); return true; }
  if (h === 'desk' || h.indexOf('desk-') === 0) { current = 'desk'; if (h !== 'desk') { deskTab = h.slice(5); deskTabPicked = true; } show('pg-desk'); renderDesk(); return true; }
  if (h === 'write') { current = 'write'; show('pg-write'); renderChooser(); return true; }
  if (h.indexOf('new-') === 0) { current = 'new:' + h.slice(4); show('pg-write'); createStory(h.slice(4)); return true; }
  if (h.indexOf('edit-post-') === 0) { current = 'editpost:' + h.slice(10); show('pg-write'); openFromPost(h.slice(10)); return true; }
  if (h.indexOf('edit-') === 0) { current = 'edit:' + h.slice(5); show('pg-write'); renderEditor(h.slice(5)); return true; }
  if (h === 'profile' || h.indexOf('profile-') === 0) { current = 'profile:' + (h.slice(8) || ''); show('pg-desk'); renderProfile(h.slice(8) || me.id); return true; }
  return false;
}
function cmsRerender(cur){
  if (LIVE) { const a = document.activeElement; if (a && a.closest && a.closest('.n-signin, .n-access')) return; }
  if (cur === 'staff') renderStaff();
  else if (cur === 'desk') renderDesk();
  else if (cur === 'write') renderChooser();
  else if (cur.indexOf('new:') === 0) { if (newWait && !creating) { const t = newWait; newWait = null; createStory(t); } }
  else if (cur.indexOf('edit:') === 0) { if (ed && ed.sid === cur.slice(5)) ed.refresh(); else renderEditor(cur.slice(5)); }
  else if (cur.indexOf('editpost:') === 0) openFromPost(cur.slice(9));
  else if (cur.indexOf('profile:') === 0) renderProfile(cur.slice(8) || me.id, true);
}
function leaving(){ if (ed) { ed.flush(); ed.destroy(); ed = null; } }
window.addEventListener('beforeunload', e => { if (ed && ed.unsaved()) { ed.flush(); e.preventDefault(); e.returnValue = ''; } });

// ---------- staff sign-in ----------
// ---------- live sign-in (Neon Auth) ----------
const authUI = { mode: 'in', email: '', note: '' };
let lastAuthBox = null, accessEl = null;
const authKey = () => authUI.mode + '|' + authUI.note;
const authBoxKept = () => (lastAuthBox && lastAuthBox.dataset.key === authKey() ? lastAuthBox : authBox());
function authError(e){
  const m = String((e && e.message) || '');
  if (/invalid email or password|invalid password|user not found|credential/i.test(m)) return 'That email and password don’t match an account.';
  if (/sign ?up is not enabled|disabled/i.test(m)) return 'New accounts are switched off. Ask the RoadStar owner to create your account.';
  if (/already exists|already registered/i.test(m)) return 'There’s already an account with that email. Sign in instead.';
  if (/password.*(short|length|at least)/i.test(m)) return 'Use a password of at least 8 characters.';
  if (/invalid otp|otp|code/i.test(m) && /invalid|expired|incorrect/i.test(m)) return 'That code didn’t work. Check it, or send a new one.';
  if (/too many|rate/i.test(m)) return 'Too many tries. Wait a minute, then try again.';
  return m || 'Something went wrong. Try again.';
}
async function afterSignIn(){
  let s = null; try { s = await fetch('/api/me', { credentials: 'same-origin', headers: { accept: 'application/json' } }).then(r => r.json()); } catch (e) {}
  location.href = s && ['writer', 'editor', 'owner'].includes(s.role) ? '/desk' : '/staff';
}
function authBox(){
  const A = window.RS_AUTH; const m = authUI.mode;
  const box = el('form', 'n-signin'); box.noValidate = true; box.dataset.key = authKey(); lastAuthBox = box;
  const err = el('p', 'err'); err.setAttribute('role', 'alert');
  const go = mode => { authUI.mode = mode; authUI.note = ''; renderStaff(); };
  const email = inp(authUI.email, 'you@example.com', 'email'); email.autocomplete = 'email'; email.required = true;
  const pass = inp('', '', 'password'); pass.required = true;
  const name = inp('', 'Your name'); name.autocomplete = 'name';
  const code = inp('', '6-digit code'); code.inputMode = 'numeric'; code.autocomplete = 'one-time-code';
  const primary = el('button', 'rs-btn rs-btn--lg rs-btn--solid'); primary.type = 'submit';
  const alt = el('div', 'alt');
  const altBtn = (text, fn) => { const b = el('button', '', text); b.type = 'button'; b.onclick = fn; alt.appendChild(b); return b; };
  let submit = null;
  const head = (t, p) => { box.appendChild(el('h2', 'h3', t)); if (p) box.appendChild(el('p', 'muted', p)); };
  if (authUI.note) box.appendChild(el('p', 'ok', authUI.note));
  box.appendChild(err);
  if (m === 'in') {
    head('Sign in', 'For RoadStar writers, editors and the owner.');
    pass.autocomplete = 'current-password';
    box.appendChild(field('Email', email)); box.appendChild(field('Password', pass));
    primary.textContent = 'Sign in';
    submit = async () => {
      authUI.email = email.value.trim();
      try { await A.signIn(authUI.email, pass.value); await afterSignIn(); }
      catch (e) {
        if (e.status === 403 || /not verified/i.test(e.message)) { try { await A.sendCode(authUI.email, 'email-verification'); } catch (x) {} authUI.mode = 'verify'; authUI.note = 'Confirm your email first. We sent a code to ' + authUI.email + '.'; renderStaff(); return; }
        throw e;
      }
    };
    altBtn('Forgot your password?', () => { authUI.email = email.value.trim(); go('forgot'); });
    altBtn('New to the team? Create your account', () => { authUI.email = email.value.trim(); go('up'); });
  } else if (m === 'up') {
    head('Create your account', 'Use the email the RoadStar owner knows you by. The owner then gives your account a role.');
    pass.autocomplete = 'new-password'; pass.minLength = 8;
    box.appendChild(field('Name', name)); box.appendChild(field('Email', email)); box.appendChild(field('Password', pass, 'At least 8 characters.'));
    primary.textContent = 'Create account';
    submit = async () => {
      authUI.email = email.value.trim();
      if (pass.value.length < 8) throw new Error('Use a password of at least 8 characters.');
      const r = await A.signUp(name.value.trim() || authUI.email.split('@')[0], authUI.email, pass.value);
      const u = r && r.user;
      if (u && u.emailVerified) { await afterSignIn(); return; }
      try { await A.sendCode(authUI.email, 'email-verification'); } catch (x) {}
      authUI.mode = 'verify'; authUI.note = 'Account created. We sent a code to ' + authUI.email + ' to confirm it’s yours.'; renderStaff();
    };
    altBtn('Already have an account? Sign in', () => go('in'));
  } else if (m === 'verify') {
    head('Confirm your email', 'Enter the 6-digit code we emailed to ' + (authUI.email || 'you') + '. It may take a minute to arrive.');
    if (!authUI.email) box.appendChild(field('Email', email));
    box.appendChild(field('Code', code));
    primary.textContent = 'Confirm email';
    submit = async () => {
      const em = authUI.email || email.value.trim(); authUI.email = em;
      await A.verify(em, code.value.trim());
      const s = await A.refresh();
      if (s && s.signedIn) { await afterSignIn(); return; }
      authUI.mode = 'in'; authUI.note = 'Email confirmed. Sign in to continue.'; renderStaff();
    };
    altBtn('Send a new code', async () => { try { await A.sendCode(authUI.email || email.value.trim(), 'email-verification'); err.textContent = ''; authUI.note = 'New code sent.'; renderStaff(); } catch (e) { err.textContent = authError(e); } });
    altBtn('Back to sign in', () => go('in'));
  } else if (m === 'forgot') {
    head('Reset your password', 'We’ll email you a code to set a new password.');
    box.appendChild(field('Email', email));
    primary.textContent = 'Send code';
    submit = async () => { authUI.email = email.value.trim(); await A.sendCode(authUI.email, 'forget-password'); authUI.mode = 'reset'; authUI.note = 'Code sent to ' + authUI.email + '.'; renderStaff(); };
    altBtn('Back to sign in', () => go('in'));
  } else if (m === 'reset') {
    head('Set a new password', 'Enter the code we emailed to ' + authUI.email + ' and your new password.');
    pass.autocomplete = 'new-password';
    box.appendChild(field('Code', code)); box.appendChild(field('New password', pass, 'At least 8 characters.'));
    primary.textContent = 'Set new password';
    submit = async () => {
      if (pass.value.length < 8) throw new Error('Use a password of at least 8 characters.');
      await A.resetPassword(authUI.email, code.value.trim(), pass.value);
      authUI.mode = 'in'; authUI.note = 'Password changed. Sign in with your new password.'; renderStaff();
    };
    altBtn('Send a new code', async () => { try { await A.sendCode(authUI.email, 'forget-password'); authUI.note = 'New code sent.'; renderStaff(); } catch (e) { err.textContent = authError(e); } });
    altBtn('Back to sign in', () => go('in'));
  }
  box.appendChild(primary); box.appendChild(alt);
  box.onsubmit = async ev => {
    ev.preventDefault(); err.textContent = ''; primary.disabled = true;
    try { await submit(); } catch (e) { err.textContent = authError(e); }
    primary.disabled = false;
  };
  setTimeout(() => { const f = box.querySelector('input'); if (f && !f.value) f.focus(); }, 0);
  return box;
}
function signOutBtn(){
  return btn('Sign out', 'rs-btn rs-btn--lg rs-btn--ghost', async e => { e.target.disabled = true; try { await window.RS_AUTH.signOut(); } catch (x) {} location.href = '/staff'; });
}
function liveStaffHero(top){
  const S = window.RS_AUTH.now() || { signedIn: false };
  const label = S.user ? (S.user.name || S.user.email) : '';
  if (!S.signedIn) { top.appendChild(el('p', 'body-l', 'Writers, editors and the owner sign in here to reach the writer’s desk.')); top.appendChild(authBoxKept()); return; }
  if (S.user && !S.user.emailVerified) {
    if (authUI.mode !== 'verify') { authUI.mode = 'verify'; authUI.email = S.user.email; }
    top.appendChild(el('p', 'body-l', 'You’re signed in as ' + label + ', but your email isn’t confirmed yet.'));
    top.appendChild(authBoxKept()); top.appendChild(signOutBtn()); return;
  }
  if (isStaff()) {
    const who = el('div', 'who who--lg'); who.appendChild(avatar(me.id, myName(), 56)); const t = el('div');
    t.appendChild(el('b', '', 'Signed in as ' + myName())); t.appendChild(el('span', 'rs-pill rs-pill--active', ROLE_NAME[me.role])); who.appendChild(t); top.appendChild(who);
    const acts = el('div', 'n-acts'); acts.appendChild(link('#desk', 'rs-btn rs-btn--lg rs-btn--solid', 'Open the writer’s desk')); acts.appendChild(link('#profile', 'rs-btn rs-btn--lg rs-btn--outline', 'Edit your profile')); acts.appendChild(signOutBtn()); top.appendChild(acts);
    return;
  }
  top.appendChild(el('p', 'body-l', 'You’re signed in as ' + label + '. This account can’t write for RoadStar yet: the owner gives it a role under Writer’s desk, then Team.'));
  if (S.ownerExists === false) {
    const n = el('div', 'card-note card-note--col');
    n.appendChild(el('b', '', 'Setting up RoadStar?'));
    n.appendChild(el('p', '', 'To make this the owner account, open the Neon Console, then Better Auth, then Users. Choose Make admin next to ' + (S.user.email || 'your email') + ', then sign out and sign in again.'));
    top.appendChild(n);
  }
  top.appendChild(signOutBtn());
}
// owner's Staff access panel: every account that can sign in, and its role
function liveAccessNode(){
  const A = window.RS_AUTH; const box = el('section', 'n-access');
  box.appendChild(el('h2', 'h3', 'Staff access'));
  box.appendChild(el('p', 'muted', 'Everyone who has an account. Give someone a role to let them into the writer’s desk; set No access to take it away. Changes apply the next time they load a page.'));
  const holder = el('div'); box.appendChild(holder);
  const load = () => {
    holder.textContent = ''; holder.appendChild(el('p', 'n-empty', 'Loading accounts…'));
    A.team.list().then(j => {
      holder.textContent = '';
      const users = (j && j.users) || [];
      if (!users.length) { holder.appendChild(el('p', 'n-empty', 'No accounts yet.')); return; }
      const rows = users.map(u => {
        const tr = el('tr'); const td = el('td'); const who = el('div', 'who'); who.appendChild(avatar(u.id, u.name || u.email, 32)); const st = el('div', 'stack'); st.appendChild(el('b', '', u.name || u.email)); st.appendChild(el('span', 'caption muted', u.email)); who.appendChild(st); td.appendChild(who); tr.appendChild(td);
        tr.appendChild(el('td', '', u.emailVerified ? 'Confirmed' : 'Not yet'));
        const rc = el('td');
        if (u.owner) rc.appendChild(el('b', '', 'Owner'));
        else {
          const s = sel([['none', 'No access'], ['writer', 'Writer'], ['editor', 'Editor']], u.role || 'none');
          s.setAttribute('aria-label', 'Role for ' + (u.name || u.email));
          s.onchange = async () => { s.disabled = true; try { await A.team.setRole(u.id, s.value); toast(s.value === 'none' ? 'Access removed.' : 'Role updated to ' + ROLE_NAME[s.value] + '.'); } catch (e) { toast('That didn’t save: ' + authError(e)); load(); } s.disabled = false; };
          rc.appendChild(s);
        }
        tr.appendChild(rc); return tr;
      });
      holder.appendChild(table(['Account', 'Email', 'Role'], rows));
    }).catch(e => { holder.textContent = ''; holder.appendChild(el('p', 'n-empty', 'Accounts couldn’t be loaded: ' + authError(e))); });
  };
  load();
  const f = el('form', 'n-signin n-addstaff'); f.noValidate = true;
  f.appendChild(el('h3', 'h3', 'Add a staff account'));
  f.appendChild(el('p', 'muted', 'Creates the account with a temporary password. Send it to them; they sign in at roadstarjournal.com/staff, confirm their email with a code, and can change the password with Forgot your password.'));
  const err = el('p', 'err'); err.setAttribute('role', 'alert'); f.appendChild(err);
  const nm = inp('', 'Their name'); const em = inp('', 'name@example.com', 'email'); const pw = inp('', 'At least 8 characters'); const rl = sel([['writer', 'Writer'], ['editor', 'Editor']], 'writer');
  f.appendChild(field('Name', nm)); f.appendChild(field('Email', em)); f.appendChild(field('Temporary password', pw)); f.appendChild(field('Role', rl));
  const b = el('button', 'rs-btn rs-btn--lg rs-btn--solid', 'Create account'); b.type = 'submit'; f.appendChild(b);
  f.onsubmit = async ev => {
    ev.preventDefault(); err.textContent = '';
    if (!nm.value.trim() || !em.value.trim() || pw.value.length < 8) { err.textContent = 'Add a name, an email and a temporary password of at least 8 characters.'; return; }
    b.disabled = true;
    try { await A.team.create({ name: nm.value.trim(), email: em.value.trim(), password: pw.value, role: rl.value }); toast('Account created for ' + em.value.trim() + '.'); nm.value = ''; em.value = ''; pw.value = ''; load(); }
    catch (e) { err.textContent = authError(e); }
    b.disabled = false;
  };
  box.appendChild(f);
  return box;
}
function renderStaff(){
  const pg = $('pg-desk'); pg.textContent = ''; document.title = 'Staff sign-in · RoadStar';
  const c = el('div', 'n-container'); pg.appendChild(c);
  const top = el('div', 'n-staff-hero'); top.appendChild(el('h1', 'd-l', 'Staff sign-in')); c.appendChild(top);
  if (!bootDone) top.appendChild(el('p', 'body-l', 'Checking who you are…'));
  else if (LIVE) liveStaffHero(top);
  else if (!db) top.appendChild(el('p', 'body-l', 'Sign in to Claude with the account RoadStar was shared with, then open this page again.'));
  else if (isStaff()) {
    const who = el('div', 'who who--lg'); who.appendChild(avatar(me.id, myName(), 56)); const t = el('div');
    t.appendChild(el('b', '', 'Signed in as ' + myName())); t.appendChild(el('span', 'rs-pill rs-pill--active', ROLE_NAME[me.role])); who.appendChild(t); top.appendChild(who);
    const acts = el('div', 'n-acts'); acts.appendChild(link('#desk', 'rs-btn rs-btn--lg rs-btn--solid', 'Open the writer’s desk')); acts.appendChild(link('#profile', 'rs-btn rs-btn--lg rs-btn--outline', 'Edit your profile')); top.appendChild(acts);
  } else if (me.maybeWriter) {
    top.appendChild(el('p', 'body-l', 'You’re signed in' + (me.name ? ' as ' + me.name : '') + '. If RoadStar was shared with you as a writer, open the desk to get started.'));
    const note = el('p', 'ed-msg'); const b = btn('Open the writer’s desk', 'rs-btn rs-btn--lg rs-btn--solid', async () => {
      b.disabled = true; me.role = 'writer'; ensured = false;
      if (await ensureStaff()) { startStaff(); navTo('#desk'); } else { me.role = 'reader'; b.disabled = false; note.textContent = 'This account can read RoadStar but can’t write for it. Ask the owner to share RoadStar with you as a Contributor.'; }
    }); top.appendChild(b); top.appendChild(note);
  } else {
    top.appendChild(el('p', 'body-l', DEMO ? 'You’re browsing as a reader. To try the writer’s desk, open the Test version menu at the bottom left of the page and switch to Writer or Editor.' : 'You’re signed in' + (me.name ? ' as ' + me.name : '') + '. This account can read RoadStar but can’t write for it. Ask the RoadStar owner to add you as a writer or an editor.'));
  }
  const r = el('section', 'n-row'); r.style.borderBottom = '0'; r.appendChild(rowHead('Who can do what'));
  const g = el('div', 'n-roles'); ['writer', 'editor', 'owner'].forEach(k => { const d = el('div', me.role === k ? 'on' : ''); d.appendChild(el('h3', 'h3', ROLE_NAME[k])); d.appendChild(el('p', '', ROLE_ABOUT[k])); g.appendChild(d); });
  r.appendChild(g);
  r.appendChild(el('p', 'muted body-s n-fine', LIVE ? 'Staff sign in with their email and password. The owner gives each account a role under Writer’s desk, then Team, and can take it away there too.' : DEMO ? 'In this test version, the Test version menu at the bottom left switches between roles, and everything you write stays in this browser. At launch, staff sign in with their RoadStar account.' : 'In this preview, sign-in runs through the Claude account RoadStar is shared with: share it as a Contributor to add a writer, or as an Editor to add an editor. At launch, staff sign in with their RoadStar account and keep the same roles.'));
  c.appendChild(r);
}

// ---------- desk ----------
function storyRow(s){
  const tr = el('tr'); const td = el('td'); td.appendChild(el('div', 'hl', s.title || 'Untitled story'));
  const sub = el('div', 'caption muted', (TEMPLATES[s.template] || {}).name || ''); if (s.sample) sub.appendChild(el('span', 'rs-pill sample', 'Sample post')); td.appendChild(sub); tr.appendChild(td);
  tr.appendChild(el('td', '', bylineOf(s)));
  const st = el('td'); st.appendChild(statusPill(s.status)); if (s.status === 'scheduled' && s.publishAt) st.appendChild(el('div', 'caption muted', fmtWhen(s.publishAt))); tr.appendChild(st);
  tr.appendChild(el('td', '', ago(s.updated || s.created || Date.now())));
  const a = el('td', 'acts'); a.appendChild(link('#edit-' + s.id, 'rs-btn rs-btn--sm rs-btn--outline', 'Open')); tr.appendChild(a);
  return tr;
}
function postRow(p){
  const tr = el('tr'); const td = el('td'); td.appendChild(el('div', 'hl', p.title)); const sub = el('div', 'caption muted', SECTIONS[p.section] || ''); if (p.sample) sub.appendChild(el('span', 'rs-pill sample', 'Sample post')); td.appendChild(sub); tr.appendChild(td);
  tr.appendChild(el('td', '', authorName(p)));
  const st = el('td'); st.appendChild(statusPill(p.published > Date.now() ? 'scheduled' : 'published')); tr.appendChild(st);
  tr.appendChild(el('td', '', p.published > Date.now() ? fmtWhen(p.published) : fmtDate(p.published)));
  const a = el('td', 'acts'); a.appendChild(link('#edit-post-' + p.id, 'rs-btn rs-btn--sm rs-btn--outline', 'Edit')); a.appendChild(link('#story-' + p.id, 'rs-btn rs-btn--sm rs-btn--ghost', 'View')); tr.appendChild(a);
  return tr;
}
function table(heads, rows){ const t = el('table'); const hr = el('tr'); heads.forEach(h => hr.appendChild(el('th', '', h))); t.appendChild(hr); rows.forEach(r => t.appendChild(r)); const w = el('div', 'tbl'); w.appendChild(t); return w; }
function renderDesk(){
  const pg = $('pg-desk'); pg.textContent = ''; document.title = 'Writer’s desk · RoadStar';
  const gm = gateMsg(); if (gm) { pg.appendChild(gm); return; }
  const c = el('div', 'n-container n-desk'); pg.appendChild(c);
  const head = el('div', 'n-rowhead'); head.appendChild(el('h1', 'h1', 'Writer’s desk')); head.appendChild(link('#write', 'rs-btn rs-btn--solid', 'New story')); c.appendChild(head);
  const who = el('div', 'who'); who.appendChild(avatar(me.id, myName(), 36)); const wt = el('div'); wt.appendChild(el('b', '', myName())); wt.appendChild(el('span', 'rs-pill', ROLE_NAME[me.role])); wt.appendChild(link('#profile', '', 'Edit your profile')); who.appendChild(wt); c.appendChild(who);
  if (staffLoaded && !(staff[me.id] && staff[me.id].byline)) { const n = el('div', 'card-note'); n.appendChild(el('p', '', 'Set up your byline. Readers see your name, photo and bio on every story you write.')); n.appendChild(link('#profile', 'rs-btn rs-btn--sm rs-btn--solid', 'Set up your profile')); c.appendChild(n); }
  if (!deskReady()) { c.appendChild(el('p', 'n-empty', 'Loading stories…')); return; }
  const all = Object.values(desk).sort((a, b) => (b.updated || 0) - (a.updated || 0));
  const now = Date.now(); let tabs;
  if (isEditor()) {
    const ps = (posts || []).slice().sort((a, b) => (b.published || 0) - (a.published || 0));
    tabs = [['review', 'Needs review', all.filter(s => s.status === 'review'), 'Nothing is waiting for review.'],
      ['drafts', 'Drafts', all.filter(s => s.status === 'draft' || s.status === 'changes'), 'No drafts. Start a new story.'],
      ['scheduled', 'Scheduled', ps.filter(p => p.published > now), 'Nothing is scheduled.'],
      ['published', 'Published', ps.filter(p => !(p.published > now)), 'Nothing published yet.'],
      ['team', 'Team', null]];
  } else {
    const mine = all.filter(s => s._uid === me.id);
    tabs = [['mine', 'My stories', mine.filter(s => s.status !== 'published' && s.status !== 'scheduled'), 'You haven’t started a story yet.'],
      ['published', 'Published', mine.filter(s => s.status === 'published' || s.status === 'scheduled'), 'None of your stories are published yet.']];
  }
  const allLoaded = !isEditor() || Object.keys(staff).every(u => deskLoaded.has(u));
  if (!deskTabPicked || !tabs.some(t => t[0] === deskTab)) deskTab = isEditor() ? (tabs[0][2].length || !allLoaded ? 'review' : 'drafts') : 'mine';
  const tb = el('div', 'n-tabs'); tb.setAttribute('role', 'tablist');
  tabs.forEach(([k, label, list]) => { const b = btn(label + (list ? ' ' + list.length : ''), 'rs-pill ' + (k === deskTab ? 'rs-pill--active' : 'rs-pill--outline'), () => { deskTab = k; deskTabPicked = true; renderDesk(); }); b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', String(k === deskTab)); tb.appendChild(b); });
  c.appendChild(tb);
  const tab = tabs.find(t => t[0] === deskTab);
  if (deskTab === 'team') { c.appendChild(teamNode()); return; }
  const list = tab[2];
  if (!list.length) { const e = el('div', 'n-empty'); e.appendChild(el('p', '', tab[3])); if (deskTab === 'mine' || deskTab === 'drafts') e.appendChild(link('#write', 'rs-btn rs-btn--solid', 'New story')); c.appendChild(e); return; }
  const isPosts = isEditor() && (deskTab === 'scheduled' || deskTab === 'published');
  c.appendChild(table(['Story', 'Writer', 'Status', isPosts ? 'Date' : 'Last change', ''], list.map(x => isPosts ? postRow(x) : storyRow(x))));
}
function teamNode(){
  const w = el('div');
  if (me.role === 'owner' && LIVE) { if (!accessEl) accessEl = liveAccessNode(); w.appendChild(accessEl); }
  if (LIVE && me.role === 'owner') w.appendChild(el('h2', 'h3', 'Profiles and bylines'));
  if (me.role === 'owner' && !LIVE) {
    const n = el('div', 'card-note card-note--col');
    n.appendChild(el('p', '', DEMO ? 'In this test version, everyone who opens the writer’s desk in this browser appears here. At launch, the owner adds writers and editors by giving their RoadStar accounts a staff role.' : 'To add someone, share RoadStar with them from Claude. Choose Contributor for a writer or Editor for an editor. They appear here the first time they open the writer’s desk.'));
    if (!DEMO) n.appendChild(el('p', 'muted', 'To remove someone, change their access in Claude, then switch off “Show on the team” in their profile.'));
    w.appendChild(n);
  }
  const order = { owner: 0, editor: 1, writer: 2 };
  const ids = Object.keys(staff).filter(id => me.role === 'owner' || staff[id].active !== false).sort((a, b) => (order[staff[a].role] ?? 3) - (order[staff[b].role] ?? 3) || String(staff[a].byline).localeCompare(String(staff[b].byline)));
  if (!ids.length) { w.appendChild(el('p', 'n-empty', 'No one has opened the writer’s desk yet.')); return w; }
  const rows = ids.map(id => {
    const s = staff[id]; const tr = el('tr'); if (s.active === false) tr.className = 'off';
    const td = el('td'); const p = el('div', 'who'); p.appendChild(avatar(id, s.byline, 32)); const t = el('div', 'stack'); t.appendChild(el('b', '', s.byline || 'No byline yet')); if (s.title) t.appendChild(el('span', 'caption muted', s.title)); if (s.active === false) t.appendChild(el('span', 'caption muted', 'Hidden from the team')); p.appendChild(t); td.appendChild(p); tr.appendChild(td);
    tr.appendChild(el('td', '', ROLE_NAME[s.role] || 'Writer'));
    tr.appendChild(el('td', '', String((posts || []).filter(x => x.authorId === id).length)));
    tr.appendChild(el('td', '', s.seen ? ago(s.seen) : ''));
    const a = el('td', 'acts'); if (me.role === 'owner' || id === me.id) a.appendChild(link('#profile-' + id, 'rs-btn rs-btn--sm rs-btn--outline', 'Edit profile')); a.appendChild(link('#author-' + id, 'rs-btn rs-btn--sm rs-btn--ghost', 'Author page')); tr.appendChild(a);
    return tr;
  });
  w.appendChild(table(['Person', 'Role', 'Stories', 'Last seen', ''], rows));
  return w;
}

// ---------- profile ----------
let profState = null;
function renderProfile(uid, soft){
  const pg = $('pg-desk');
  if (soft && profState && profState.uid === uid && profState.dirty) return;
  pg.textContent = ''; document.title = 'Profile · RoadStar';
  const gm = gateMsg(); if (gm) { pg.appendChild(gm); return; }
  if (!staffLoaded) { pg.appendChild(msgPage('Loading…')); return; }
  const self = uid === me.id; if (!self && me.role !== 'owner') { pg.appendChild(msgPage('Only the owner can edit other people’s profiles.')); return; }
  const s = staff[uid] || {}; const st = profState = { uid, dirty: false, photo: s.photo || null };
  const c = el('div', 'n-container n-desk'); pg.appendChild(c);
  const head = el('div', 'n-rowhead'); head.appendChild(el('h1', 'h1', self ? 'Your profile' : 'Edit profile')); head.appendChild(link('#desk', '', 'Back to the desk')); c.appendChild(head);
  const grid = el('div', 'n-form'); c.appendChild(grid);
  const main = el('div'); const side = el('aside', 'n-side'); grid.appendChild(main); grid.appendChild(side);
  const fBy = inp(s.byline || (self ? me.name : ''), 'Name as it appears on stories'); const fTi = inp(s.title, 'For example: Senior writer, Columnist, Road test editor'); const fBio = ta(s.bio, 'A sentence or two about you and the cars you love', 3); fBio.maxLength = 280;
  main.appendChild(field('Byline', fBy, 'Required. This is the name readers see.')); main.appendChild(field('Title', fTi)); main.appendChild(field('Short bio', fBio, 'Up to 280 characters. Shown on your author page and under opinion columns.', 'short'));
  const pf = el('div', 'field'); pf.appendChild(el('label', '', 'Photo')); const prow = el('div', 'who'); const pav = el('span'); prow.appendChild(pav); pf.appendChild(prow);
  const up = inp('', '', 'file'); up.accept = 'image/*'; up.setAttribute('aria-label', 'Upload a profile photo'); const upMsg = el('span', 'hint');
  const rm = btn('Remove photo', 'rs-btn rs-btn--sm rs-btn--ghost', () => { st.photo = null; st.dirty = true; paint(); });
  prow.appendChild(up); prow.appendChild(rm); pf.appendChild(upMsg); main.appendChild(pf);
  up.onchange = async () => { const f = up.files && up.files[0]; if (!f) return; upMsg.textContent = 'Uploading…'; try { st.photo = { src: await uploadFile(f) }; st.dirty = true; upMsg.textContent = 'Uploaded. Save your profile to keep it.'; paint(); } catch (e) { upMsg.textContent = e.message || 'The upload didn’t work. Try a smaller image.'; } };
  let fAct = null; if (!self) { const l = el('label', 'check'); fAct = el('input'); fAct.type = 'checkbox'; fAct.checked = s.active !== false; l.appendChild(fAct); l.appendChild(document.createTextNode('Show on the team')); main.appendChild(l); }
  const msg = el('p', 'status'); msg.setAttribute('aria-live', 'polite');
  const save = btn('Save profile', 'rs-btn rs-btn--solid', async () => {
    const by = fBy.value.trim(); if (!by) { msg.textContent = 'Add a byline before saving.'; fBy.focus(); return; }
    const d = { byline: by, title: fTi.value.trim(), bio: fBio.value.trim().slice(0, 280), photo: st.photo };
    if (fAct) d.active = fAct.checked;
    save.disabled = true;
    try { if (staff[uid]) await db.doc('staff/' + uid).update(d); else await db.doc('staff/' + uid).set(Object.assign({ role: me.role, active: true, joined: Date.now(), seen: Date.now() }, d)); st.dirty = false; msg.textContent = 'Profile saved.'; toast('Profile saved', '#author-' + uid, 'View author page'); }
    catch (e) { msg.textContent = 'That didn’t save. Check your connection and try again.'; }
    save.disabled = false;
  });
  main.appendChild(save); main.appendChild(msg);
  side.appendChild(el('h3', 'h3', 'How bylines look'));
  const prev = el('div'); side.appendChild(prev);
  function paint(){
    pav.textContent = ''; const a = el('span', 'avatar'); a.style.width = a.style.height = '56px'; a.style.fontSize = '20px'; if (st.photo && st.photo.src) a.appendChild(imgEl(st.photo.src, '')); else a.textContent = initials(fBy.value); pav.appendChild(a); rm.hidden = !st.photo;
    prev.textContent = ''; const row = el('div', 'byrow'); const a2 = a.cloneNode(true); a2.style.width = a2.style.height = '44px'; a2.style.fontSize = '16px'; row.appendChild(a2); const t = el('div'); const b = el('div', 'byline'); const sp = el('span'); sp.appendChild(document.createTextNode('By ')); sp.appendChild(el('b', '', fBy.value || 'Your name')); b.appendChild(sp); b.appendChild(el('span', '', fmtDate(Date.now()))); t.appendChild(b); if (fTi.value) t.appendChild(el('div', 'caption muted', fTi.value)); row.appendChild(t); prev.appendChild(row);
    if (fBio.value) prev.appendChild(el('p', 'body-s muted', fBio.value));
  }
  [fBy, fTi, fBio].forEach(i => i.addEventListener('input', () => { st.dirty = true; paint(); }));
  if (fAct) fAct.onchange = () => { st.dirty = true; };
  paint();
}
async function uploadFile(f){
  if (!assets) throw new Error('Photo uploads aren’t available for your account in this preview.');
  if (f.size > 20e6) throw new Error('That photo is over 20 MB. Try a smaller one.');
  const r = await assets.upload(f); return r.url;
}

// ---------- new story ----------
function renderChooser(){
  const pg = $('pg-write'); pg.textContent = ''; document.title = 'New story · RoadStar';
  const gm = gateMsg(); if (gm) { pg.appendChild(gm); return; }
  const c = el('div', 'n-container n-desk'); pg.appendChild(c);
  const head = el('div', 'n-rowhead'); head.appendChild(el('h1', 'h1', 'New story')); head.appendChild(link('#desk', '', 'Back to the desk')); c.appendChild(head);
  c.appendChild(el('p', 'body-l muted', 'Pick a format. Each one starts with the parts that kind of story needs, and you can add or remove anything.'));
  const g = el('div', 'chooser');
  Object.entries(TEMPLATES).forEach(([k, T]) => { const b = link('#new-' + k, 'chooser-card'); b.appendChild(el('span', 'label muted', SECTIONS[T.section])); b.appendChild(el('h2', 'h2', T.name)); b.appendChild(el('p', '', T.desc)); g.appendChild(b); });
  c.appendChild(g);
}
let creating = false, newWait = null; // newWait: a new story asked for before sign-in finished loading
async function createStory(tpl){
  const pg = $('pg-write'); pg.textContent = '';
  const gm = gateMsg(); if (gm) { pg.appendChild(gm); if (!bootDone) newWait = tpl; return; }
  const T = TEMPLATES[tpl]; if (!T) { navTo('#write', true); return; }
  if (creating) return; creating = true; pg.appendChild(msgPage('Setting up your story…'));
  const sid = newSid(); const now = Date.now();
  const data = { template: tpl, section: T.section, title: '', dek: '', blocks: clone(T.blocks), image: null, tags: [], seo: {}, featured: false, sample: false,
    authorId: me.id, status: 'draft', statusAt: now, notes: [], created: now, updated: now, updatedBy: me.id, postId: null, publishAt: null, lastVersionAt: 0 };
  try { await db.doc(storyPath(me.id, sid)).set(data); desk[sid] = Object.assign({ id: sid, _uid: me.id }, data); creating = false; navTo('#edit-' + sid, true); }
  catch (e) { creating = false; pg.textContent = ''; pg.appendChild(msgPage('The story couldn’t be created. Check your connection and try again.', link('#write', 'rs-btn rs-btn--solid', 'Try again'))); }
}
const importing = new Set();
async function openFromPost(pid){
  const pg = $('pg-write');
  const gm = gateMsg(); if (gm) { pg.textContent = ''; pg.appendChild(gm); return; }
  if (!posts || !deskReady()) { pg.textContent = ''; pg.appendChild(msgPage('Loading the story…')); return; }
  const ex = Object.values(desk).find(s => s.postId === pid);
  if (ex) { navTo('#edit-' + ex.id, true); return; }
  if (!isEditor()) { pg.textContent = ''; pg.appendChild(msgPage('Only editors can change a published story.')); return; }
  const p = posts.find(x => x.id === pid); if (!p) { pg.textContent = ''; pg.appendChild(msgPage('That story wasn’t found.')); return; }
  if (importing.has(pid)) return; importing.add(pid);
  pg.textContent = ''; pg.appendChild(msgPage('Opening the story…'));
  const sid = newSid(); const now = Date.now();
  const data = { template: TPL_BY_SECTION[p.section] || 'news', section: p.section, title: p.title || '', dek: p.dek || '', blocks: clone(blocksOf(p)), image: p.image ? clone(p.image) : null, tags: (p.tags || []).slice(), seo: Object.assign({}, p.seo || {}), featured: !!p.featured, sample: !!p.sample,
    authorId: p.authorId || null, author: p.author || 'RoadStar staff', status: p.published > now ? 'scheduled' : 'published', statusAt: now, postId: pid, publishAt: p.published, notes: [], created: now, updated: now, updatedBy: me.id, lastVersionAt: now };
  try {
    await db.doc(storyPath(me.id, sid)).set(data); desk[sid] = Object.assign({ id: sid, _uid: me.id }, data);
    db.doc(storyPath(me.id, sid) + '/versions/v' + now.toString(36) + rand4()).set({ at: now, by: me.id, label: 'Copied from the live story', content: contentOf(data) }).catch(() => {});
    navTo('#edit-' + sid, true);
  } catch (e) { importing.delete(pid); pg.textContent = ''; pg.appendChild(msgPage('The story couldn’t be opened for editing. Check your connection and try again.')); }
}
function storyTools(p){
  const w = el('div', 'n-article ed-storytools');
  if (isEditor()) { w.appendChild(link('#edit-post-' + p.id, 'rs-btn rs-btn--sm rs-btn--outline', 'Edit this story')); return w; }
  const s = Object.values(desk).find(x => x.postId === p.id && x._uid === me.id); if (!s) return null;
  w.appendChild(link('#edit-' + s.id, 'rs-btn rs-btn--sm rs-btn--outline', 'Open in the writer’s desk')); return w;
}

// ---------- modal ----------
function modal(title, wide){
  const ov = el('div', 'ed-modal'); const dlg = el('div', 'ed-dialog' + (wide ? ' ed-dialog--wide' : '')); dlg.setAttribute('role', 'dialog'); dlg.setAttribute('aria-modal', 'true'); dlg.setAttribute('aria-label', title);
  const head = el('div', 'ed-mhead'); head.appendChild(el('h2', 'h3', title)); const x = btn('Close', 'rs-btn rs-btn--sm rs-btn--ghost'); head.appendChild(x);
  const body = el('div', 'ed-mbody'); const foot = el('div', 'ed-mfoot'); const msg = el('p', 'ed-msg'); msg.setAttribute('aria-live', 'polite');
  dlg.appendChild(head); dlg.appendChild(body); dlg.appendChild(msg); dlg.appendChild(foot); ov.appendChild(dlg); document.body.appendChild(ov);
  const prev = document.activeElement;
  function onKey(e){ if (e.key === 'Escape') { e.stopPropagation(); close(); } }
  function close(){ ov.remove(); document.removeEventListener('keydown', onKey, true); try { if (prev && prev.focus && document.contains(prev)) prev.focus({ preventScroll: true }); } catch (e) {} }
  document.addEventListener('keydown', onKey, true);
  ov.addEventListener('mousedown', e => { if (e.target === ov) close(); });
  x.onclick = close;
  setTimeout(() => { const f = body.querySelector('input:not([type=file]),textarea,select'); if (f) f.focus(); }, 0);
  return { body, foot, msg, close };
}
function photoPicker(onPick, current){
  const w = el('div', 'pick');
  const lib = el('div', 'lib'); NEWS_LIB.forEach(x => { const b = btn('', ''); b.dataset.src = x.src; b.setAttribute('aria-label', 'Use photo: ' + x.alt); b.appendChild(imgEl(x.src, '')); b.onclick = () => { onPick({ src: x.src, alt: x.alt, credit: Object.assign({}, x.credit) }); mark(x.src); }; lib.appendChild(b); });
  function mark(src){ [...lib.children].forEach(b => b.classList.toggle('on', b.dataset.src === src)); }
  w.appendChild(el('p', 'hint muted body-s', 'Pick from the photo library or upload your own.')); w.appendChild(lib);
  if (assets) {
    const up = inp('', '', 'file'); up.accept = 'image/*'; up.multiple = true; const um = el('span', 'hint');
    up.onchange = async () => { const fs = [...(up.files || [])]; for (const f of fs) { um.textContent = 'Uploading ' + f.name + '…'; try { onPick({ src: await uploadFile(f), alt: '', credit: { a: '', l: '', u: '' } }); um.textContent = 'Uploaded. Add alt text and a credit.'; } catch (e) { um.textContent = e.message; } } up.value = ''; };
    w.appendChild(field('Upload', up)); w.appendChild(um);
  }
  if (current) mark(current);
  return w;
}
function creditFields(cr){
  cr = cr || {}; const a = inp(cr.a, 'Photographer or source'), l = inp(cr.l, 'For example: CC BY-SA 4.0, or Courtesy of Porsche'), u = inp(cr.u, 'https://…', 'url');
  const g = el('div', 'grid2'); g.appendChild(field('Photo credit', a, '', 'compact')); g.appendChild(field('Licence or rights', l, '', 'compact')); const gu = field('Source link', u, '', 'compact'); gu.classList.add('span2'); g.appendChild(gu);
  return { node: g, get: () => ({ a: a.value.trim(), l: l.value.trim(), u: /^https?:\/\//.test(u.value.trim()) ? u.value.trim() : '' }), set: c => { a.value = c.a || ''; l.value = c.l || ''; u.value = c.u || ''; } };
}
function photoModal(b, hero, onSave){
  const m = modal(hero ? 'Main photo' : (b.src ? 'Edit photo' : 'Add a photo'));
  const cur = clone(b);
  const pv = el('div', 'thumb pick-prev'); function showPrev(){ pv.textContent = ''; if (cur.src) pv.appendChild(imgEl(cur.src, '')); else pv.appendChild(el('div', 'fig-empty', 'No photo chosen yet')); }
  m.body.appendChild(pv);
  const fAlt = inp(cur.alt, 'Describe what’s in the photo'); const cf = creditFields(cur.credit);
  m.body.appendChild(photoPicker(p => { cur.src = p.src; fAlt.value = p.alt || ''; cf.set(p.credit || {}); showPrev(); }, cur.src));
  m.body.appendChild(field('Alt text', fAlt, 'Required. Read aloud to people who can’t see the photo.'));
  let fCap = null, fLay = null;
  if (!hero) { fCap = inp(cur.cap, 'Optional caption shown under the photo'); m.body.appendChild(field('Caption', fCap)); }
  m.body.appendChild(cf.node);
  if (!hero) { fLay = sel([['wide', 'Column width'], ['left', 'Wrap text, photo on the left'], ['right', 'Wrap text, photo on the right'], ['full', 'Full width']], cur.lay || 'wide'); m.body.appendChild(field('Layout', fLay, 'Wrapped photos sit beside the text on large screens and go full width on phones.')); }
  showPrev();
  m.foot.appendChild(btn('Cancel', 'rs-btn rs-btn--ghost', m.close));
  m.foot.appendChild(btn(b.src ? 'Save photo' : 'Add photo', 'rs-btn rs-btn--solid', () => {
    if (!cur.src) { m.msg.textContent = 'Choose a photo first.'; return; }
    if (!fAlt.value.trim()) { m.msg.textContent = 'Add alt text: a short description of the photo.'; fAlt.focus(); return; }
    const out = { src: cur.src, alt: fAlt.value.trim(), credit: cf.get() };
    if (!hero) Object.assign(out, { t: 'img', cap: fCap.value.trim(), lay: fLay.value });
    onSave(out); m.close();
  }));
}
function galleryModal(b, onSave){
  const m = modal('Photo gallery', true); const imgs = clone(b.imgs || []);
  const list = el('div', 'glist'); m.body.appendChild(list);
  const fCap = inp(b.cap, 'Optional caption for the whole gallery');
  function paint(){
    list.textContent = '';
    if (!imgs.length) list.appendChild(el('p', 'muted', 'No photos yet. Add some below.'));
    imgs.forEach((x, i) => {
      const r = el('div', 'grow'); r.appendChild(imgEl(x.src, ''));
      const f = el('div'); const alt = inp(x.alt, 'Alt text (required)'); alt.setAttribute('aria-label', 'Alt text for photo ' + (i + 1)); alt.oninput = () => { x.alt = alt.value; };
      const ca = inp(x.credit && x.credit.a, 'Photo credit'); ca.setAttribute('aria-label', 'Credit for photo ' + (i + 1)); ca.oninput = () => { x.credit = Object.assign({}, x.credit, { a: ca.value }); };
      const cl = inp(x.credit && x.credit.l, 'Licence'); cl.setAttribute('aria-label', 'Licence for photo ' + (i + 1)); cl.oninput = () => { x.credit = Object.assign({}, x.credit, { l: cl.value }); };
      const row = el('div', 'grid2'); row.appendChild(ca); row.appendChild(cl); f.appendChild(alt); f.appendChild(row);
      const acts = el('div', 'gacts');
      acts.appendChild(btn('Up', 'rs-btn rs-btn--sm rs-btn--ghost', () => { if (i) { imgs.splice(i - 1, 0, imgs.splice(i, 1)[0]); paint(); } }));
      acts.appendChild(btn('Remove', 'rs-btn rs-btn--sm rs-btn--ghost', () => { imgs.splice(i, 1); paint(); }));
      f.appendChild(acts); r.appendChild(f); list.appendChild(r);
    });
  }
  paint();
  m.body.appendChild(el('h3', 'h3 ed-sub', 'Add photos'));
  m.body.appendChild(photoPicker(p => { imgs.push(p); paint(); }));
  m.body.appendChild(field('Caption', fCap));
  m.foot.appendChild(btn('Cancel', 'rs-btn rs-btn--ghost', m.close));
  m.foot.appendChild(btn('Save gallery', 'rs-btn rs-btn--solid', () => {
    if (imgs.some(x => !String(x.alt || '').trim())) { m.msg.textContent = 'Every photo needs alt text.'; return; }
    onSave({ t: 'gallery', imgs: imgs.map(x => ({ src: x.src, alt: x.alt.trim(), credit: { a: (x.credit && x.credit.a || '').trim(), l: (x.credit && x.credit.l || '').trim(), u: (x.credit && x.credit.u) || '' } })), cap: fCap.value.trim() }); m.close();
  }));
}
function specsModal(b, onSave){
  const m = modal('Spec box'); const rows = clone(b.rows || []);
  const fT = inp(b.title || 'Specifications', 'Title'); m.body.appendChild(field('Title', fT, 'For example: 2026 Porsche 911 GT3 specifications'));
  const list = el('div'); m.body.appendChild(list);
  function paint(){ list.textContent = ''; rows.forEach((r, i) => { const w = el('div', 'srow'); const k = inp(r[0], 'Label'); k.setAttribute('aria-label', 'Row ' + (i + 1) + ' label'); k.oninput = () => { r[0] = k.value; }; const v = inp(r[1], 'Value'); v.setAttribute('aria-label', 'Row ' + (i + 1) + ' value'); v.oninput = () => { r[1] = v.value; }; w.appendChild(k); w.appendChild(v); w.appendChild(btn('Remove', 'rs-btn rs-btn--sm rs-btn--ghost', () => { rows.splice(i, 1); paint(); })); list.appendChild(w); }); }
  paint();
  m.body.appendChild(btn('Add a row', 'rs-btn rs-btn--sm rs-btn--outline', () => { rows.push(['', '']); paint(); const ins = list.querySelectorAll('input'); if (ins.length) ins[ins.length - 2].focus(); }));
  const fLay = sel([['right', 'Beside the text'], ['wide', 'Across the column']], b.lay || 'right'); m.body.appendChild(field('Layout', fLay));
  m.foot.appendChild(btn('Cancel', 'rs-btn rs-btn--ghost', m.close));
  m.foot.appendChild(btn('Save spec box', 'rs-btn rs-btn--solid', () => { onSave({ t: 'specs', title: fT.value.trim(), lay: fLay.value, rows: rows.map(r => [r[0].trim(), r[1].trim()]).filter(r => r[0] || r[1]) }); m.close(); }));
}
function verdictModal(b, onSave){
  const m = modal('Verdict');
  const fS = sel([['', 'No score']].concat([10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(n => [n, n + ' out of 10'])), b.score || ''); m.body.appendChild(field('Score', fS, 'Scores show on review cards across the site.'));
  const fL = inp(b.line, 'One sentence that sums it up'); m.body.appendChild(field('Verdict', fL));
  const g = el('div', 'grid2'); const fP = ta((b.pros || []).join('\n'), 'One per line', 4), fC = ta((b.cons || []).join('\n'), 'One per line', 4);
  g.appendChild(field('What we like', fP)); g.appendChild(field('What we don’t', fC)); m.body.appendChild(g);
  m.foot.appendChild(btn('Cancel', 'rs-btn rs-btn--ghost', m.close));
  m.foot.appendChild(btn('Save verdict', 'rs-btn rs-btn--solid', () => { const lines = t => t.value.split('\n').map(x => x.trim()).filter(Boolean); onSave({ t: 'verdict', score: fS.value ? Number(fS.value) : null, line: fL.value.trim(), pros: lines(fP), cons: lines(fC) }); m.close(); }));
}
function noteModal(b, onSave){
  const m = modal('Update note');
  const fK = sel([['Update', 'Update'], ['Correction', 'Correction'], ['Editor’s note', 'Editor’s note']], b.kind || 'Update'); m.body.appendChild(field('Type', fK));
  const fX = ta(b.x, 'What changed, in a sentence or two', 3); m.body.appendChild(field('Note', fX, 'Dated automatically. Put it where readers will see it, usually at the top.'));
  m.foot.appendChild(btn('Cancel', 'rs-btn rs-btn--ghost', m.close));
  m.foot.appendChild(btn('Save note', 'rs-btn rs-btn--solid', () => { if (!fX.value.trim()) { m.msg.textContent = 'Write the note first.'; return; } onSave({ t: 'note', kind: fK.value, x: fX.value.trim(), date: b.date || Date.now() }); m.close(); }));
}
function confirmModal(title, text, label, onYes, needNote){
  const m = modal(title); m.body.appendChild(el('p', '', text)); let fN = null;
  if (needNote) { fN = ta('', needNote, 4); m.body.appendChild(field('Note to the writer', fN)); }
  m.foot.appendChild(btn('Cancel', 'rs-btn rs-btn--ghost', m.close));
  m.foot.appendChild(btn(label, 'rs-btn rs-btn--solid', () => { if (fN && !fN.value.trim()) { m.msg.textContent = 'Add a note so the writer knows what to change.'; return; } m.close(); onYes(fN ? fN.value.trim() : ''); }));
}
function scheduleModal(cur, onYes){
  const m = modal('Schedule this story');
  const d = new Date(cur || Date.now() + 864e5); if (!cur) d.setHours(8, 0, 0, 0);
  const pad = n => String(n).padStart(2, '0'); const v = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  const f = inp(v, '', 'datetime-local'); m.body.appendChild(field('Publish at', f, TZ ? 'Your time zone: ' + TZ.replace(/_/g, ' ') + '.' : ''));
  m.body.appendChild(el('p', 'muted body-s', 'The story stays hidden from readers until then and appears on the front page at that time.'));
  m.foot.appendChild(btn('Cancel', 'rs-btn rs-btn--ghost', m.close));
  m.foot.appendChild(btn('Schedule', 'rs-btn rs-btn--solid', () => { const t = new Date(f.value).getTime(); if (!t || t < Date.now() + 60000) { m.msg.textContent = 'Pick a time at least a minute from now.'; return; } m.close(); onYes(t); }));
}

// ---------- editor ----------
function renderEditor(sid){
  const pg = $('pg-write');
  const gm = gateMsg(); if (gm) { if (ed) { ed.destroy(); ed = null; } pg.textContent = ''; pg.appendChild(gm); return; }
  const s = desk[sid];
  if (!s) { if (ed) { ed.destroy(); ed = null; } pg.textContent = ''; pg.appendChild(msgPage(deskReady() && (!isEditor() || Object.keys(staff).every(u => deskLoaded.has(u))) ? 'That story wasn’t found. It may have been deleted.' : 'Loading the story…', deskReady() ? link('#desk', 'rs-btn rs-btn--solid', 'Back to the desk') : null)); return; }
  if (ed && ed.sid === sid) return;
  if (ed) { ed.destroy(); ed = null; }
  pg.textContent = ''; document.title = (s.title || 'Untitled story') + ' · Writer’s desk';
  ed = makeEditor(pg, s);
}
function makeEditor(pg, s0){
  const E = { sid: s0.id, uid: s0._uid, story: s0, dirty: false, saving: false, pending: false, timer: null, bTimer: null, lastSaved: s0.updated || 0, lastVersionAt: s0.lastVersionAt || 0, range: null, preview: false };
  const path = storyPath(E.uid, E.sid);
  const T = TEMPLATES[s0.template] || TEMPLATES.news;
  const PH = new WeakMap();
  const canEditStory = () => isEditor() ? true : (E.uid === me.id && E.story.status !== 'published' && E.story.status !== 'scheduled');
  let readOnly = !canEditStory();
  let image = s0.image ? clone(s0.image) : null; let tags = (s0.tags || []).slice();

  const c = el('div', 'n-container'); pg.appendChild(c);
  // top bar
  const top = el('div', 'ed-top'); c.appendChild(top);
  top.appendChild(link('#desk', 'back', 'Writer’s desk'));
  const pillBox = el('span'); top.appendChild(pillBox);
  const saveEl = el('span', 'ed-save'); saveEl.setAttribute('aria-live', 'polite'); top.appendChild(saveEl);
  const acts = el('div', 'ed-acts'); top.appendChild(acts);
  const banners = el('div', 'ed-banners'); c.appendChild(banners);
  const grid = el('div', 'ed-grid'); c.appendChild(grid);
  const main = el('div', 'ed-main'); const side = el('aside', 'ed-side'); grid.appendChild(main); grid.appendChild(side);

  main.appendChild(el('p', 'label muted', T.name));
  const fTitle = ta(s0.title, 'Headline', 1); fTitle.className = 'ed-title'; fTitle.setAttribute('aria-label', 'Headline'); main.appendChild(fTitle);
  const fDek = ta(s0.dek, 'Standfirst: one or two sentences that sell the story', 1); fDek.className = 'ed-dek'; fDek.setAttribute('aria-label', 'Standfirst'); main.appendChild(fDek);
  const dekCount = el('div', 'caption muted ed-count'); main.appendChild(dekCount);
  const heroBox = el('div', 'ed-hero'); main.appendChild(heroBox);
  const tools = el('div', 'ed-tools'); tools.setAttribute('role', 'toolbar'); tools.setAttribute('aria-label', 'Formatting'); main.appendChild(tools);
  const canvas = el('div', 'ed-canvas n-body'); canvas.setAttribute('role', 'textbox'); canvas.setAttribute('aria-multiline', 'true'); canvas.setAttribute('aria-label', 'Story'); main.appendChild(canvas);
  const prevBox = el('div', 'ed-previewbox'); prevBox.hidden = true; main.appendChild(prevBox);

  function autosize(t){ t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px'; }
  [fTitle, fDek].forEach(t => { t.addEventListener('input', () => { autosize(t); if (t === fDek) countDek(); changed(); }); t.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); if (t === fTitle) fDek.focus(); else canvas.focus(); } }); });
  function countDek(){ const n = fDek.value.length; dekCount.textContent = n ? n + ' of 200 characters' : ''; dekCount.classList.toggle('over', n > 200); }

  // main photo
  function paintHero(){
    heroBox.textContent = '';
    if (image && image.src) {
      const th = el('div', 'thumb'); th.appendChild(imgEl(image.src, image.alt)); heroBox.appendChild(th);
      const row = el('div', 'row'); const cap = el('span', 'caption muted'); cap.appendChild(creditNode(image.credit)); if (!image.alt) cap.appendChild(document.createTextNode(' Needs alt text.')); row.appendChild(cap);
      if (!readOnly) { row.appendChild(btn('Change photo', 'rs-btn rs-btn--sm rs-btn--outline', () => photoModal(image, true, v => { image = v; paintHero(); changed(); }))); row.appendChild(btn('Remove', 'rs-btn rs-btn--sm rs-btn--ghost', () => { image = null; paintHero(); changed(); })); }
      heroBox.appendChild(row);
    } else if (!readOnly) {
      const b = btn('', 'ed-addhero', () => photoModal({ src: '', alt: '', credit: {} }, true, v => { image = v; paintHero(); changed(); }));
      b.appendChild(el('b', '', 'Add a main photo')); b.appendChild(el('span', '', s0.template === 'opinion' ? 'Optional for opinion columns' : 'Shown at the top of the story and on cards'));
      heroBox.appendChild(b);
    }
  }

  // canvas content
  const TEXT_TAGS = ['P', 'H2', 'H3', 'BLOCKQUOTE'];
  function editNode(b){
    if (['p', 'h2', 'h3', 'quote', 'ul', 'ol'].includes(b.t)) {
      const n = blockNode(b, true);
      if (['p', 'h2', 'h3', 'quote'].includes(b.t) && !String(b.x || '').trim()) { n.textContent = ''; n.appendChild(el('br')); }
      if (b.ph) PH.set(n, b.ph);
      return n;
    }
    return atomNode(b);
  }
  function atomNode(b){ const w = el('div', 'ed-atom'); w.contentEditable = 'false'; w.dataset.b = JSON.stringify(b); paintAtom(w); return w; }
  function paintAtom(w){
    const b = JSON.parse(w.dataset.b); w.textContent = '';
    const lay = b.t === 'img' ? b.lay : b.t === 'specs' ? (b.lay === 'right' ? 'right' : '') : '';
    w.className = 'ed-atom ed-' + b.t + (lay && LAY[lay] ? ' ' + LAY[lay] : '');
    if (!readOnly) {
      const ctl = el('div', 'ed-ctl'); ctl.addEventListener('mousedown', e => { if (e.target.tagName !== 'SELECT') e.preventDefault(); });
      const name = { img: 'Photo', gallery: 'Gallery', specs: 'Spec box', verdict: 'Verdict', note: 'Update note', hr: 'Divider' }[b.t] || 'Block';
      if (b.t === 'img' || b.t === 'specs') {
        const opts = b.t === 'img' ? [['wide', 'Column'], ['left', 'Wrap left'], ['right', 'Wrap right'], ['full', 'Full width']] : [['right', 'Beside text'], ['wide', 'Column']];
        const s = sel(opts, b.lay || opts[0][0]); s.setAttribute('aria-label', name + ' layout'); s.onchange = () => { b.lay = s.value; w.dataset.b = JSON.stringify(b); paintAtom(w); changed(); }; ctl.appendChild(s);
      }
      if (b.t !== 'hr') { const eb = btn('Edit', ''); eb.setAttribute('aria-label', 'Edit ' + name.toLowerCase()); eb.onclick = () => editAtom(w); ctl.appendChild(eb); }
      const up = btn('Up', ''); up.setAttribute('aria-label', 'Move ' + name.toLowerCase() + ' up'); up.onclick = () => { const p = w.previousElementSibling; if (p) { canvas.insertBefore(w, p); changed(); } }; ctl.appendChild(up);
      const dn = btn('Down', ''); dn.setAttribute('aria-label', 'Move ' + name.toLowerCase() + ' down'); dn.onclick = () => { const n = w.nextElementSibling; if (n) { canvas.insertBefore(n, w); changed(); } }; ctl.appendChild(dn);
      const rm = btn('Remove', ''); rm.setAttribute('aria-label', 'Remove ' + name.toLowerCase()); rm.onclick = () => { const n = w.nextElementSibling || w.previousElementSibling; w.remove(); ensureTail(); if (n && !n.classList.contains('ed-atom')) caretTo(n); changed(); }; ctl.appendChild(rm);
      w.appendChild(ctl);
    }
    const inner = blockNode(b, true);
    if (b.t === 'verdict' && !b.line && !b.score) inner.appendChild(el('p', 'ed-hint', 'Add a score, a one-line verdict, and what you like and don’t. Click Edit.'));
    if (b.t === 'specs' && (b.rows || []).some(r => r[0] && !r[1])) inner.appendChild(el('p', 'ed-hint', 'Fill in the specs with Edit. Empty rows show as a dash.'));
    w.appendChild(inner);
    if (!readOnly && b.t !== 'hr') inner.addEventListener('dblclick', () => editAtom(w));
  }
  function editAtom(w){
    const b = JSON.parse(w.dataset.b);
    const done = nb => { w.dataset.b = JSON.stringify(Object.assign(b.t === 'img' ? {} : {}, nb)); paintAtom(w); changed(); };
    if (b.t === 'img') photoModal(b, false, done);
    else if (b.t === 'gallery') galleryModal(b, done);
    else if (b.t === 'specs') specsModal(b, done);
    else if (b.t === 'verdict') verdictModal(b, done);
    else if (b.t === 'note') noteModal(b, done);
  }
  function fillCanvas(blocks){
    canvas.textContent = '';
    (blocks && blocks.length ? blocks : [{ t: 'p', x: '', ph: 'Start writing.' }]).forEach(b => canvas.appendChild(editNode(b)));
    ensureTail(); refreshPh();
  }
  function ensureTail(){ const l = canvas.lastElementChild; if (!l || l.classList.contains('ed-atom') || l.tagName === 'UL' || l.tagName === 'OL') { const p = el('p'); p.appendChild(el('br')); canvas.appendChild(p); } }
  function refreshPh(){
    [...canvas.children].forEach(n => {
      if (!TEXT_TAGS.includes(n.tagName)) return;
      const empty = !n.textContent.trim() && !n.querySelector('img');
      n.classList.toggle('is-empty', empty);
      const ph = PH.get(n) || (n.tagName === 'H2' ? 'Heading' : n.tagName === 'H3' ? 'Subheading' : n.tagName === 'BLOCKQUOTE' ? 'Pull quote' : (canvas.children.length === 1 ? 'Start writing.' : ''));
      if (empty && ph) n.dataset.ph = ph; else delete n.dataset.ph;
      if (!n.className) n.removeAttribute('class');
    });
  }
  // DOM -> blocks
  function mdOf(n){
    let s = '';
    n.childNodes.forEach(ch => {
      if (ch.nodeType === 3) { s += ch.textContent.replace(/ /g, ' ').replace(/\n/g, ' '); return; }
      if (ch.nodeType !== 1) return;
      const t = ch.tagName, inner = mdOf(ch), st = ch.getAttribute('style') || '';
      const wrapM = m => { const x = inner.trim(); if (!x) return inner; return inner.match(/^\s*/)[0] + m + x + m + inner.match(/\s*$/)[0]; };
      if (t === 'BR') s += ' ';
      else if (t === 'P' || t === 'DIV' || t === 'LI') s += inner + ' ';
      else if (t === 'B' || t === 'STRONG' || /font-weight:\s*(bold|[6-9]00)/.test(st)) s += wrapM('**');
      else if (t === 'I' || t === 'EM' || /font-style:\s*italic/.test(st)) s += wrapM('*');
      else if (t === 'A' && /^https?:\/\//.test(ch.getAttribute('href') || '')) { const x = inner.replace(/[\[\]]/g, '').trim(); s += x ? '[' + x + '](' + ch.getAttribute('href').replace(/[\s()]/g, encodeURIComponent) + ')' : ''; }
      else s += inner;
    });
    return s;
  }
  const BLOCKY = new Set(['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'UL', 'OL', 'HR', 'FIGURE']);
  function ser(n, out){
    if (n.nodeType === 3) { const x = n.textContent.replace(/ /g, ' ').trim(); if (x) out.push({ t: 'p', x }); return; }
    if (n.nodeType !== 1) return;
    if (n.classList.contains('ed-atom')) { try { out.push(JSON.parse(n.dataset.b)); } catch (e) {} return; }
    const t = n.tagName;
    if ((t === 'DIV' || t === 'P' || t === 'BLOCKQUOTE') && [...n.children].some(ch => BLOCKY.has(ch.tagName) && ch.tagName !== 'P') ) { [...n.childNodes].forEach(ch => ser(ch, out)); return; }
    if (t === 'UL' || t === 'OL') { out.push({ t: t.toLowerCase(), items: [...n.querySelectorAll('li')].map(li => mdOf(li).replace(/\s+/g, ' ').trim()).filter(Boolean) }); return; }
    if (t === 'HR') { out.push({ t: 'hr' }); return; }
    const kind = t === 'H1' || t === 'H2' ? 'h2' : /^H[3-6]$/.test(t) ? 'h3' : t === 'BLOCKQUOTE' ? 'quote' : 'p';
    const x = mdOf(n).replace(/\s+/g, ' ').trim(); const ph = PH.get(n);
    if (x) out.push({ t: kind, x }); else if (ph) out.push({ t: kind, x: '', ph });
  }
  function serialize(){ const out = []; [...canvas.childNodes].forEach(n => ser(n, out)); return out; }

  // toolbar
  let blockSel = null; const toggles = {};
  function tool(label, title, fn, cls, into){ const b = btn(label, 'tb' + (cls ? ' ' + cls : '')); b.title = title; b.setAttribute('aria-label', title); b.addEventListener('mousedown', e => e.preventDefault()); b.onclick = fn; (into || tools).appendChild(b); return b; }
  function sep(){ tools.appendChild(el('span', 'sep')); }
  let menu = null, insBtn = null;
  function closeMenu(back){ if (!menu || menu.hidden) return; menu.hidden = true; insBtn.setAttribute('aria-expanded', 'false'); if (back) restoreRange(); }
  function onDocDown(e){ if (menu && !menu.hidden && !e.target.closest('.ed-insert')) closeMenu(); }
  document.addEventListener('mousedown', onDocDown);
  function buildTools(){
    tools.textContent = '';
    blockSel = sel([['p', 'Paragraph'], ['h2', 'Heading'], ['h3', 'Subheading'], ['blockquote', 'Pull quote']], 'p'); blockSel.setAttribute('aria-label', 'Text style'); blockSel.onchange = () => setBlock(blockSel.value); tools.appendChild(blockSel);
    toggles.bold = tool('B', 'Bold (Ctrl+B)', () => exec('bold'), 'tb-b');
    toggles.italic = tool('I', 'Italic (Ctrl+I)', () => exec('italic'), 'tb-i');
    tool('Link', 'Add a link (Ctrl+K)', linkPop);
    toggles.ul = tool('• List', 'Bulleted list', () => exec('insertUnorderedList'));
    toggles.ol = tool('1. List', 'Numbered list', () => exec('insertOrderedList'));
    sep();
    const wrap = el('div', 'ed-insert'); tools.appendChild(wrap);
    insBtn = tool('Insert', 'Insert a photo, gallery, spec box, verdict, note or divider', () => { const open = menu.hidden; menu.hidden = !open; insBtn.setAttribute('aria-expanded', String(open)); if (open) menu.querySelector('button').focus({ preventScroll: true }); }, 'tb-ins', wrap);
    insBtn.setAttribute('aria-haspopup', 'menu'); insBtn.setAttribute('aria-expanded', 'false');
    menu = el('div', 'ed-menu'); menu.setAttribute('role', 'menu'); menu.hidden = true; wrap.appendChild(menu);
    [['Photo', 'In the column, full width, or wrapped beside the text', () => photoModal({ src: '', alt: '', credit: {}, lay: 'wide' }, false, insertAtom)],
     ['Gallery', 'Several photos in a grid, for features and show reports', () => galleryModal({ imgs: [], cap: '' }, insertAtom)],
     ['Spec box', 'Price, engine and performance figures', () => specsModal({ title: 'Specifications', lay: 'right', rows: [['Price as tested', ''], ['Engine', ''], ['Power', '']] }, insertAtom)],
     ['Verdict', 'A score out of 10 with what you like and don’t', () => verdictModal({}, insertAtom)],
     ['Update note', 'A dated update or correction', () => noteModal({}, insertAtom)],
     ['Divider', 'A short rule between sections', () => insertAtom({ t: 'hr' })]].forEach(([t, d, fn]) => {
      const it = btn('', 'ed-mi'); it.setAttribute('role', 'menuitem'); it.appendChild(el('b', '', t)); it.appendChild(el('span', '', d));
      it.addEventListener('mousedown', e => e.preventDefault()); it.onclick = () => { closeMenu(); fn(); }; menu.appendChild(it);
    });
    menu.addEventListener('keydown', e => {
      const items = [...menu.querySelectorAll('button')]; const i = items.indexOf(document.activeElement);
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeMenu(true); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
    });
    sep();
    tool('Undo', 'Undo (Ctrl+Z)', () => exec('undo'));
    tool('Redo', 'Redo (Ctrl+Shift+Z)', () => exec('redo'));
  }
  function inCanvas(node){ return node && (node === canvas || canvas.contains(node)); }
  function restoreRange(){ const s = getSelection(); if (E.range && inCanvas(E.range.startContainer)) { canvas.focus({ preventScroll: true }); s.removeAllRanges(); s.addRange(E.range); return true; } canvas.focus({ preventScroll: true }); return false; }
  function topBlock(){ const s = getSelection(); let n = s.rangeCount ? s.getRangeAt(0).startContainer : null; if (!inCanvas(n)) return null; while (n && n.parentNode !== canvas) n = n.parentNode; return n; }
  function caretTo(n, end){ const r = document.createRange(); r.selectNodeContents(n); r.collapse(!end ? true : false); if (end) r.collapse(false); const s = getSelection(); s.removeAllRanges(); s.addRange(r); E.range = r.cloneRange(); }
  function exec(cmd, val){ restoreRange(); document.execCommand(cmd, false, val); changed(); onSel(); }
  function setBlock(tag){
    restoreRange(); const tb = topBlock(); if (!tb || (tb.classList && tb.classList.contains('ed-atom'))) return;
    if (tb.tagName === 'UL' || tb.tagName === 'OL') document.execCommand(tb.tagName === 'UL' ? 'insertUnorderedList' : 'insertOrderedList');
    const cur = topBlock(); if (!cur || cur.nodeType !== 1) { document.execCommand('formatBlock', false, tag); changed(); return; }
    // swap the element itself so headings, quotes and paragraphs convert cleanly in every browser
    const n = document.createElement(tag); while (cur.firstChild) n.appendChild(cur.firstChild); if (!n.firstChild) n.appendChild(el('br'));
    if (PH.has(cur)) PH.set(n, PH.get(cur)); cur.replaceWith(n); caretTo(n, true); changed(); onSel();
  }
  function insertAtom(b){
    const had = restoreRange(); const tb = had ? topBlock() : null; const w = atomNode(b);
    if (tb && TEXT_TAGS.includes(tb.tagName) && !tb.textContent.trim()) { canvas.insertBefore(w, tb); caretTo(tb); }
    else if (tb) { tb.after(w); let nx = w.nextElementSibling; if (!nx || !TEXT_TAGS.includes(nx.tagName)) { nx = el('p'); nx.appendChild(el('br')); w.after(nx); } caretTo(nx); }
    else { const l = canvas.lastElementChild; if (l && TEXT_TAGS.includes(l.tagName) && !l.textContent.trim()) canvas.insertBefore(w, l); else canvas.appendChild(w); ensureTail(); }
    changed();
  }
  // link popover
  function linkPop(){
    if (readOnly) return; restoreRange(); const r = E.range ? E.range.cloneRange() : null; if (!r) return;
    const old = tools.querySelector('.ed-pop'); if (old) old.remove();
    let a = r.startContainer; while (a && a !== canvas && a.tagName !== 'A') a = a.parentNode; if (a === canvas) a = null;
    const pop = el('div', 'ed-pop'); const u = inp(a ? a.getAttribute('href') : '', 'https://', 'url'); u.setAttribute('aria-label', 'Link address'); pop.appendChild(u);
    const close = () => { pop.remove(); };
    const apply = () => {
      let url = u.value.trim(); if (url && !/^https?:\/\//i.test(url)) url = 'https://' + url;
      if (!/^https?:\/\/[^\s.]+\.[^\s]+$/i.test(url)) { u.focus(); u.setCustomValidity('Enter a full web address'); u.reportValidity(); return; }
      const s = getSelection(); canvas.focus({ preventScroll: true }); s.removeAllRanges(); s.addRange(r);
      if (a) { a.setAttribute('href', url); } else if (r.collapsed) document.execCommand('insertHTML', false, '<a href="' + esc(url) + '">' + esc(url.replace(/^https?:\/\//, '')) + '</a>'); else document.execCommand('createLink', false, url);
      close(); changed();
    };
    pop.appendChild(btn('Add link', 'rs-btn rs-btn--sm rs-btn--solid', apply));
    if (a) pop.appendChild(btn('Remove link', 'rs-btn rs-btn--sm rs-btn--ghost', () => { const s = getSelection(); const rr = document.createRange(); rr.selectNodeContents(a); s.removeAllRanges(); s.addRange(rr); document.execCommand('unlink'); close(); changed(); }));
    pop.appendChild(btn('Cancel', 'rs-btn rs-btn--sm rs-btn--ghost', () => { close(); restoreRange(); }));
    u.addEventListener('input', () => u.setCustomValidity(''));
    u.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); apply(); } if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); restoreRange(); } });
    tools.appendChild(pop); u.focus();
  }
  function onSel(){
    const s = getSelection(); if (!s.rangeCount || !inCanvas(s.anchorNode)) return;
    E.range = s.getRangeAt(0).cloneRange();
    const tb = topBlock(); if (blockSel && tb && tb.nodeType === 1) { const t = tb.tagName.toLowerCase(); blockSel.value = ['h2', 'h3', 'blockquote'].includes(t) ? t : 'p'; }
    try { ['bold', 'italic'].forEach(k => toggles[k] && toggles[k].setAttribute('aria-pressed', String(document.queryCommandState(k)))); toggles.ul.setAttribute('aria-pressed', String(!!tb && tb.tagName === 'UL')); toggles.ol.setAttribute('aria-pressed', String(!!tb && tb.tagName === 'OL')); } catch (e) {}
  }
  document.addEventListener('selectionchange', onSel);
  canvas.addEventListener('input', () => { if (!canvas.firstChild) { const p = el('p'); p.appendChild(el('br')); canvas.appendChild(p); caretTo(p); } changed(); });
  canvas.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); linkPop(); }
  });
  canvas.addEventListener('paste', e => {
    e.preventDefault(); if (readOnly) return;
    const t = (e.clipboardData || window.clipboardData).getData('text/plain'); if (!t) return;
    const paras = t.replace(/\r/g, '').split(/\n+/).map(x => x.trim()).filter(Boolean);
    if (paras.length <= 1) document.execCommand('insertText', false, paras[0] || '');
    else document.execCommand('insertHTML', false, paras.map(p => '<p>' + esc(p) + '</p>').join(''));
    changed();
  });
  canvas.addEventListener('drop', e => {
    e.preventDefault(); if (readOnly) return;
    const f = e.dataTransfer && [...e.dataTransfer.files].find(x => /^image\//.test(x.type));
    if (f) { uploadFile(f).then(src => photoModal({ src, alt: '', cap: '', credit: {}, lay: 'wide' }, false, insertAtom)).catch(err => toast(err.message)); return; }
    const t = e.dataTransfer && e.dataTransfer.getData('text/plain'); if (t) { document.execCommand('insertText', false, t); changed(); }
  });

  // side panel
  const setCard = el('section', 'ed-card'); setCard.appendChild(el('h3', '', 'Story settings')); side.appendChild(setCard);
  const fSec = sel(Object.entries(SECTIONS), s0.section); setCard.appendChild(field('Section', fSec)); fSec.onchange = changed;
  const byl = el('p', 'body-s'); setCard.appendChild(byl);
  const tagWrap = el('div', 'field'); tagWrap.appendChild(el('label', '', 'Tags')); const chips = el('div', 'ed-chips'); tagWrap.appendChild(chips);
  const fTag = inp('', 'Add a make or model'); fTag.setAttribute('aria-label', 'Add a tag'); fTag.setAttribute('list', 'rs-tags'); tagWrap.appendChild(fTag); tagWrap.appendChild(el('span', 'hint', 'Press Enter to add. Tags link stories about the same cars. Up to 8.')); setCard.appendChild(tagWrap);
  if (!$('rs-tags')) { const dl = el('datalist'); dl.id = 'rs-tags'; TAG_SUGGEST.forEach(t => { const o = el('option'); o.value = t; dl.appendChild(o); }); document.body.appendChild(dl); }
  function paintTags(){ chips.textContent = ''; tags.forEach((t, i) => { const b = btn(t + '  ×', 'rs-pill rs-pill--outline', () => { if (readOnly) return; tags.splice(i, 1); paintTags(); changed(); }); b.setAttribute('aria-label', 'Remove tag ' + t); chips.appendChild(b); }); fTag.hidden = readOnly || tags.length >= 8; }
  function addTag(){ const v = fTag.value.replace(/,/g, ' ').replace(/\s+/g, ' ').trim(); if (!v) return; if (!tags.some(t => t.toLowerCase() === v.toLowerCase()) && tags.length < 8) tags.push(v); fTag.value = ''; paintTags(); changed(); }
  fTag.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } });
  fTag.addEventListener('change', () => { if (TAG_SUGGEST.includes(fTag.value)) addTag(); });
  let fFeat = null, fSample = null;
  if (isEditor()) {
    const l = el('label', 'check'); fFeat = el('input'); fFeat.type = 'checkbox'; fFeat.checked = !!s0.featured; fFeat.onchange = changed; l.appendChild(fFeat); l.appendChild(document.createTextNode('Lead story on the front page')); setCard.appendChild(l);
    if (s0.sample) { const l2 = el('label', 'check'); fSample = el('input'); fSample.type = 'checkbox'; fSample.checked = true; fSample.onchange = changed; l2.appendChild(fSample); l2.appendChild(document.createTextNode('Marked as a sample post')); setCard.appendChild(l2); }
  }
  const seoD = el('details', 'ed-seo'); seoD.appendChild(el('summary', '', 'Search and sharing'));
  const fSlug = inp((s0.seo && s0.seo.slug) || '', 'made-from-the-headline'); const fSeoT = inp((s0.seo && s0.seo.title) || '', 'Defaults to the headline'); const fSeoD = ta((s0.seo && s0.seo.desc) || '', 'Defaults to the standfirst', 2);
  const slugField = field('Web address', fSlug, 'Set once, when the story is first published.'); seoD.appendChild(slugField); seoD.appendChild(field('Search title', fSeoT, 'Up to about 60 characters.')); seoD.appendChild(field('Search description', fSeoD, 'Up to about 155 characters.'));
  [fSlug, fSeoT, fSeoD].forEach(i => i.addEventListener('input', changed)); setCard.appendChild(seoD);
  const chkCard = el('section', 'ed-card'); chkCard.appendChild(el('h3', '', 'Before you publish')); const chkList = el('ul', 'checks'); chkCard.appendChild(chkList); side.appendChild(chkCard);
  const notesCard = el('section', 'ed-card'); notesCard.appendChild(el('h3', '', 'Notes')); const notesList = el('div', 'notes'); notesCard.appendChild(notesList);
  const fNote = ta('', 'Leave a note for the writer or editors', 2); fNote.setAttribute('aria-label', 'New note'); notesCard.appendChild(fNote);
  const noteBtn = btn('Add note', 'rs-btn rs-btn--sm rs-btn--outline', async () => { const t = fNote.value.trim(); if (!t) return; noteBtn.disabled = true; try { await db.doc(path).update({ notes: (E.story.notes || []).concat({ by: me.id, at: Date.now(), text: t }) }); fNote.value = ''; } catch (e) { toast('The note didn’t save. Try again.'); } noteBtn.disabled = false; });
  notesCard.appendChild(noteBtn); side.appendChild(notesCard);
  function paintNotes(){ notesList.textContent = ''; const ns = E.story.notes || []; if (!ns.length) notesList.appendChild(el('p', 'body-s muted', 'No notes yet.')); ns.forEach(n => { const d = el('div', 'ed-note'); const h = el('div'); h.appendChild(el('b', '', personName(n.by))); h.appendChild(el('small', '', ago(n.at))); d.appendChild(h); d.appendChild(el('p', '', n.text)); notesList.appendChild(d); }); }

  // content in and out
  function collect(){
    return { template: s0.template, section: fSec.value, title: fTitle.value.trim(), dek: fDek.value.trim(), blocks: serialize(), image: image ? clone(image) : null, tags: tags.slice(),
      seo: { slug: slugify(fSlug.value), title: fSeoT.value.trim(), desc: fSeoD.value.trim() }, featured: fFeat ? fFeat.checked : !!E.story.featured, sample: fSample ? fSample.checked : !!E.story.sample };
  }
  function applyContent(c){
    fTitle.value = c.title || ''; fDek.value = c.dek || ''; autosize(fTitle); autosize(fDek); countDek();
    image = c.image ? clone(c.image) : null; tags = (c.tags || []).slice(); fSec.value = c.section || s0.section;
    fSlug.value = (c.seo && c.seo.slug) || ''; fSeoT.value = (c.seo && c.seo.title) || ''; fSeoD.value = (c.seo && c.seo.desc) || '';
    if (fFeat) fFeat.checked = !!c.featured;
    paintHero(); paintTags(); fillCanvas(c.blocks);
  }
  function checks(c){
    const blocks = c.blocks; const texts = blocks.filter(b => b.t === 'p' && plain(b.x).trim());
    const photos = blocks.filter(b => b.t === 'img' && b.src).concat(...blocks.filter(b => b.t === 'gallery').map(b => b.imgs || [])).concat(c.image ? [c.image] : []);
    const v = blocks.find(b => b.t === 'verdict'); const sp = blocks.find(b => b.t === 'specs');
    return [
      { label: 'Headline', ok: !!c.title, req: true },
      { label: 'Standfirst, 200 characters or fewer', ok: !!c.dek && c.dek.length <= 200, req: true },
      { label: 'Story text', ok: texts.length > 0, req: true },
      c.template !== 'opinion' ? { label: 'Main photo', ok: !!(c.image && c.image.src), req: true } : null,
      { label: 'Alt text and a credit on every photo', ok: photos.every(x => x.alt && x.credit && (x.credit.a || x.credit.l)), req: true },
      c.template === 'review' ? { label: 'Verdict with a score', ok: !!(v && v.score && v.line), req: true } : null,
      c.template === 'review' ? { label: 'Spec box filled in', ok: !!sp && (sp.rows || []).every(r => !r[0] || r[1]), req: false } : null,
      c.template === 'news' ? { label: 'A link to at least one source', ok: blocks.some(b => /\]\(https?:/.test(b.x || '') || (b.items || []).some(x => /\]\(https?:/.test(x))), req: false } : null,
      c.template === 'feature' ? { label: 'A gallery or at least two photos', ok: photos.length >= 3 || blocks.some(b => b.t === 'gallery' && (b.imgs || []).length >= 2), req: false } : null,
      { label: 'At least one tag', ok: c.tags.length > 0, req: false }
    ].filter(Boolean);
  }
  function paintChecks(){
    const list = checks(collect()); chkList.textContent = '';
    list.forEach(k => { const li = el('li', (k.ok ? 'ok' : 'todo') + (k.req ? '' : ' ck-opt')); li.appendChild(el('span', 'ic', k.ok ? '✓' : '')); li.appendChild(el('span', '', k.label + (k.req ? '' : ' (recommended)'))); chkList.appendChild(li); });
    return list;
  }
  function blocking(){ return paintChecks().filter(k => k.req && !k.ok).map(k => k.label); }

  // saving
  let chkTimer = null;
  function setSave(t){ saveEl.textContent = t; }
  function changed(){
    if (readOnly) return;
    refreshPh(); E.dirty = true; setSave('Unsaved changes');
    clearTimeout(E.timer); E.timer = setTimeout(save, 2000);
    clearTimeout(E.bTimer); E.bTimer = setTimeout(backup, 800);
    clearTimeout(chkTimer); chkTimer = setTimeout(paintChecks, 400);
  }
  function backup(){ try { localStorage.setItem('rs-ed-' + E.sid, JSON.stringify({ at: Date.now(), c: collect() })); } catch (e) {} }
  function clearBackup(){ try { localStorage.removeItem('rs-ed-' + E.sid); } catch (e) {} }
  const tstamp = ms => new Date(ms).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  async function addVersion(label, c){ const now = Date.now(); E.lastVersionAt = now; await db.doc(path + '/versions/v' + now.toString(36) + rand4()).set({ at: now, by: me.id, label, content: c || collect() }); }
  async function save(){
    if (readOnly || !E.dirty) return; if (E.saving) { E.pending = true; return; }
    E.saving = true; E.dirty = false; setSave('Saving…'); clearTimeout(E.timer);
    const c = collect(); const now = Date.now(); const upd = Object.assign({}, c, { updated: now, updatedBy: me.id });
    const checkpoint = now - (E.lastVersionAt || 0) > 15 * 60000; if (checkpoint) upd.lastVersionAt = now;
    try {
      await db.doc(path).update(upd); E.lastSaved = now;
      if (!E.dirty) clearBackup();
      setSave('Saved at ' + tstamp(now));
      if (checkpoint) addVersion('Autosave checkpoint', c).catch(() => {});
    } catch (e) { E.dirty = true; setSave('Not saved yet. Your work is kept on this page; trying again…'); clearTimeout(E.timer); E.timer = setTimeout(save, 5000); }
    E.saving = false; if (E.pending) { E.pending = false; save(); }
  }

  // workflow
  async function act(fn){
    [...acts.querySelectorAll('button')].forEach(b => b.disabled = true);
    try { await fn(); } catch (e) { setSave('That didn’t go through. Check your connection and try again.'); }
    [...acts.querySelectorAll('button')].forEach(b => b.disabled = false);
  }
  function ready(){ const miss = blocking(); if (miss.length) { setSave('Before this can go out, add: ' + miss.join(', ') + '.'); chkCard.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); chkCard.classList.add('flash'); setTimeout(() => chkCard.classList.remove('flash'), 1200); return false; } return true; }
  async function writeStory(extra, withContent){
    clearTimeout(E.timer); const now = Date.now(); const c = withContent ? collect() : null;
    const upd = Object.assign({}, c || {}, c ? { updated: now, updatedBy: me.id } : {}, extra, { statusAt: now });
    await db.doc(path).update(upd); if (c) { E.dirty = false; E.lastSaved = now; clearBackup(); }
    Object.assign(E.story, upd); return c;
  }
  function buildPost(c, when){
    const blocks = cleanBlocks(c.blocks); const v = blocks.find(b => b.t === 'verdict');
    const post = { template: c.template, section: c.section, title: c.title, dek: c.dek, blocks, image: c.image, tags: c.tags, seo: c.seo, featured: !!c.featured, sample: !!c.sample,
      authorId: E.story.authorId || null, author: bylineOf(E.story), published: when, updated: Date.now(), rating: v && v.score ? v.score : null };
    post.words = wordCount(post); return post;
  }
  function postId(c){ return E.story.postId || ((slugify(c.seo.slug || c.title) || 'story') + '-' + rand4()); }
  const doSubmit = () => act(async () => { if (!ready()) return; const c = await writeStory({ status: 'review', submittedAt: Date.now() }, true); await addVersion('Submitted for review', c); toast('Submitted for review. Editors can see it now.'); refresh(); });
  const doWithdraw = () => act(async () => { await writeStory({ status: 'draft' }); toast('Withdrawn. It’s back in your drafts.'); refresh(); });
  const doSendBack = () => confirmModal('Send back to the writer', 'The story goes back to ' + bylineOf(E.story) + ' with your note, marked “Changes requested”.', 'Send back', note => act(async () => {
    await writeStory({ status: 'changes', notes: (E.story.notes || []).concat({ by: me.id, at: Date.now(), text: note }) }, true); await addVersion('Sent back for changes'); toast('Sent back with your note.'); refresh();
  }), 'What needs to change?');
  const doPublish = when => act(async () => {
    if (!ready()) return; const c = collect(); const pid = postId(c); const t = when || Date.now(); const update = E.story.status === 'published';
    const keep = update ? ((posts || []).find(p => p.id === pid) || {}).published || E.story.publishAt || t : t;
    await db.doc('posts/' + pid).set(buildPost(c, keep));
    await writeStory({ status: keep > Date.now() + 1000 ? 'scheduled' : 'published', postId: pid, publishAt: keep, publishedBy: me.id }, true);
    await addVersion(update ? 'Updated the live story' : when ? 'Scheduled for ' + fmtWhen(t) : 'Published', c);
    if (update) { toast('Story updated.', '#story-' + pid); refresh(); }
    else if (when) { toast('Scheduled for ' + fmtWhen(t) + '.'); refresh(); }
    else { toast('Published.'); navTo('#story-' + pid); }
  });
  const doSchedule = () => { if (!ready()) return; scheduleModal(E.story.status === 'scheduled' ? E.story.publishAt : null, t => doPublish(t)); };
  const doPublishNow = () => act(async () => { if (!ready()) return; const c = collect(); const pid = postId(c); await db.doc('posts/' + pid).set(buildPost(c, Date.now())); await writeStory({ status: 'published', postId: pid, publishAt: Date.now(), publishedBy: me.id }, true); await addVersion('Published', c); toast('Published.'); navTo('#story-' + pid); });
  const doUnpublish = label => confirmModal(label === 'unschedule' ? 'Unschedule this story' : 'Unpublish this story', label === 'unschedule' ? 'It won’t go live. It goes back to drafts, where you can schedule it again.' : 'Readers won’t be able to see it any more. It goes back to drafts with everything kept.', label === 'unschedule' ? 'Unschedule' : 'Unpublish', () => act(async () => {
    if (E.story.postId) await db.doc('posts/' + E.story.postId).delete(); await writeStory({ status: 'draft', publishAt: null }, true); toast(label === 'unschedule' ? 'Unscheduled.' : 'Unpublished. It’s back in drafts.'); refresh();
  }));
  const doDelete = () => confirmModal('Delete this story', 'This deletes the story and its saved versions for good. It can’t be undone.', 'Delete for good', () => act(async () => {
    try { const vs = await db.collection(path + '/versions').limit(200).get(); for (const d of vs.docs) await db.doc(path + '/versions/' + d.id).delete(); } catch (e) {}
    await db.doc(path).delete(); clearBackup(); E.dirty = false; toast('Story deleted.'); navTo('#desk');
  }));
  function versionsModal(){
    const m = modal('Version history', true); const list = el('div'); m.body.appendChild(list); list.appendChild(el('p', 'muted', 'Loading versions…'));
    if (!readOnly) m.foot.appendChild(btn('Save a version now', 'rs-btn rs-btn--outline', async () => { await save(); await addVersion('Saved by ' + myName()); m.close(); toast('Version saved.'); }));
    db.collection(path + '/versions').limit(200).get().then(snap => {
      const vs = snap.docs.map(d => Object.assign({ id: d.id }, d.data())).sort((a, b) => b.at - a.at); list.textContent = '';
      if (!vs.length) { list.appendChild(el('p', 'muted', 'No saved versions yet. Versions are saved when a story is submitted, published or scheduled, every 15 minutes while you write, and when you save one here.')); return; }
      const ul = el('ul', 'vlist'); vs.forEach(v => {
        const li = el('li'); const t = el('div'); t.appendChild(el('b', '', v.label)); t.appendChild(el('div', 'caption muted', fmtWhen(v.at) + ', ' + personName(v.by))); li.appendChild(t);
        const a = el('div', 'acts');
        a.appendChild(btn('Preview', 'rs-btn rs-btn--sm rs-btn--ghost', () => { list.textContent = ''; const back = btn('Back to versions', 'rs-btn rs-btn--sm rs-btn--outline', () => { m.close(); versionsModal(); }); list.appendChild(back); const pv = el('div', 'ed-vprev'); pv.appendChild(articleNode(Object.assign({ published: v.at, authorId: E.story.authorId, author: E.story.author }, v.content, { blocks: cleanBlocks(v.content.blocks) }))); list.appendChild(pv); }));
        if (!readOnly) a.appendChild(btn('Restore', 'rs-btn rs-btn--sm rs-btn--outline', async () => { await save(); await addVersion('Before restoring an earlier version'); applyContent(v.content); m.close(); changed(); toast('Restored the version from ' + fmtWhen(v.at) + '.'); }));
        li.appendChild(a); ul.appendChild(li);
      }); list.appendChild(ul);
    }).catch(() => { list.textContent = ''; list.appendChild(el('p', 'ed-msg', 'Versions couldn’t be loaded. Try again in a minute.')); });
  }
  function togglePreview(){
    E.preview = !E.preview; prevBox.textContent = '';
    [fTitle, fDek, dekCount, heroBox, tools, canvas].forEach(n => n.hidden = E.preview); main.firstChild.hidden = E.preview;
    prevBox.hidden = !E.preview;
    if (E.preview) { const c = collect(); prevBox.appendChild(articleNode(Object.assign({ published: E.story.publishAt || Date.now(), authorId: E.story.authorId, author: E.story.author }, c, { blocks: cleanBlocks(c.blocks), rating: ((c.blocks.find(b => b.t === 'verdict') || {}).score) || null }))); }
    paintActs();
  }
  function paintActs(){
    acts.textContent = ''; const st = E.story.status;
    acts.appendChild(btn(E.preview ? 'Back to editing' : 'Preview', 'rs-btn rs-btn--sm rs-btn--ghost', togglePreview));
    acts.appendChild(btn('Versions', 'rs-btn rs-btn--sm rs-btn--ghost', versionsModal));
    if (E.story.postId && (st === 'published' || st === 'scheduled')) acts.appendChild(link('#story-' + E.story.postId, 'rs-btn rs-btn--sm rs-btn--ghost', 'View story'));
    if (readOnly) return;
    if (isEditor()) {
      if (st === 'published') { acts.appendChild(btn('Unpublish', 'rs-btn rs-btn--sm rs-btn--ghost', () => doUnpublish('unpublish'))); acts.appendChild(btn('Update story', 'rs-btn rs-btn--sm rs-btn--solid', () => doPublish())); }
      else if (st === 'scheduled') { acts.appendChild(btn('Unschedule', 'rs-btn rs-btn--sm rs-btn--ghost', () => doUnpublish('unschedule'))); acts.appendChild(btn('Change time', 'rs-btn rs-btn--sm rs-btn--outline', doSchedule)); acts.appendChild(btn('Publish now', 'rs-btn rs-btn--sm rs-btn--solid', doPublishNow)); }
      else { acts.appendChild(btn('Delete', 'rs-btn rs-btn--sm rs-btn--ghost', doDelete)); if (st === 'review' && E.story.authorId !== me.id) acts.appendChild(btn('Send back', 'rs-btn rs-btn--sm rs-btn--outline', doSendBack)); acts.appendChild(btn('Schedule', 'rs-btn rs-btn--sm rs-btn--outline', doSchedule)); acts.appendChild(btn('Publish', 'rs-btn rs-btn--sm rs-btn--solid', () => doPublish())); }
    } else {
      if (st === 'review') acts.appendChild(btn('Withdraw', 'rs-btn rs-btn--sm rs-btn--outline', doWithdraw));
      else { acts.appendChild(btn('Delete', 'rs-btn rs-btn--sm rs-btn--ghost', doDelete)); acts.appendChild(btn('Submit for review', 'rs-btn rs-btn--sm rs-btn--solid', doSubmit)); }
    }
  }
  function paintBanners(){
    banners.textContent = ''; const st = E.story.status; const add = (t, kids) => { const b = el('div', 'ed-banner'); b.appendChild(el('span', '', t)); (kids || []).forEach(k => b.appendChild(k)); banners.appendChild(b); return b; };
    if (readOnly) add(st === 'published' || st === 'scheduled' ? 'This story is ' + (st === 'scheduled' ? 'scheduled' : 'published') + '. Ask an editor if it needs changes; you can still leave a note.' : 'You can read this story but not change it.');
    else if (st === 'review' && !isEditor()) add('With the editors. You can keep making changes; they see the latest version.');
    else if (st === 'review' && isEditor() && E.story.authorId !== me.id) add(bylineOf(E.story) + ' submitted this ' + ago(E.story.submittedAt || E.story.statusAt || Date.now()) + '. Edit it directly, send it back with a note, or publish it.');
    if (st === 'changes') { const n = (E.story.notes || []).slice().reverse().find(x => x.by !== E.story.authorId); add('Changes requested' + (n ? ' by ' + personName(n.by) + ': “' + n.text + '”' : '.')); }
    if (st === 'scheduled' && E.story.publishAt) add('Goes live ' + fmtWhen(E.story.publishAt) + '.');
    const s = E.story; if (!readOnly && s.updatedBy && s.updatedBy !== me.id && (s.updated || 0) > E.lastSaved + 1000) {
      add(personName(s.updatedBy) + ' saved changes ' + ago(s.updated) + '.', [btn('Load their version', 'rs-btn rs-btn--sm rs-btn--outline', () => { applyContent(contentOf(s)); E.lastSaved = s.updated; E.dirty = false; setSave('Loaded the latest version.'); paintBanners(); })]);
    }
    if (E.backup) add('This device has changes from ' + tstamp(E.backup.at) + ' that weren’t saved.', [btn('Restore them', 'rs-btn rs-btn--sm rs-btn--solid', () => { const b = E.backup; E.backup = null; applyContent(b.c); changed(); paintBanners(); }), btn('Discard', 'rs-btn rs-btn--sm rs-btn--ghost', () => { E.backup = null; clearBackup(); paintBanners(); })]);
  }
  function paintMeta(){
    pillBox.textContent = ''; pillBox.appendChild(statusPill(E.story.status));
    byl.textContent = ''; byl.appendChild(document.createTextNode('Byline: ')); byl.appendChild(el('b', '', bylineOf(E.story)));
    slugField.querySelector('.hint').textContent = E.story.postId ? 'Live at #story-' + E.story.postId + '. The address stays the same once a story is published.' : 'Set once, when the story is first published.';
    fSlug.disabled = !!E.story.postId || readOnly;
    paintNotes(); paintActs(); paintBanners();
  }
  function setReadOnly(){
    canvas.contentEditable = String(!readOnly); tools.hidden = readOnly || E.preview;
    [fTitle, fDek, fSec, fTag, fSeoT, fSeoD].forEach(i => { i.disabled = readOnly; }); if (fFeat) fFeat.disabled = readOnly;
  }
  function refresh(){
    const latest = desk[E.sid]; if (!latest) return; E.story = latest;
    const ro = !canEditStory(); if (ro !== readOnly) { readOnly = ro; setReadOnly(); paintHero(); fillCanvas(serialize()); paintTags(); }
    paintMeta();
  }

  // first paint
  buildTools(); applyContent(contentOf(s0)); setReadOnly(); paintMeta(); paintChecks();
  try { const b = JSON.parse(localStorage.getItem('rs-ed-' + E.sid) || 'null'); if (b && b.at > (s0.updated || 0) + 1000 && !readOnly) { E.backup = b; paintBanners(); } } catch (e) {}
  setSave(s0.updated ? 'Saved ' + ago(s0.updated) : '');
  requestAnimationFrame(() => { autosize(fTitle); autosize(fDek); if (!readOnly && !s0.title) fTitle.focus(); });

  return {
    sid: E.sid, refresh,
    unsaved: () => E.dirty || E.saving,
    flush: () => { clearTimeout(E.timer); if (E.dirty) { backup(); save(); } },
    destroy: () => { document.removeEventListener('selectionchange', onSel); document.removeEventListener('mousedown', onDocDown); clearTimeout(E.timer); clearTimeout(E.bTimer); clearTimeout(chkTimer); }
  };
}

window.CMS = { start, route: cmsRoute, rerender: cmsRerender, leaving, staffChanged, storyTools };


// ---------- navigation ----------
function closeMenus(except){ document.querySelectorAll('.n-dd>button').forEach(b => { if (b !== except) { b.setAttribute('aria-expanded', 'false'); $(b.getAttribute('aria-controls')).hidden = true; } }); }
document.querySelectorAll('.n-dd>button').forEach(b => b.onclick = e => { e.stopPropagation(); const open = b.getAttribute('aria-expanded') === 'true'; closeMenus(b); b.setAttribute('aria-expanded', String(!open)); $(b.getAttribute('aria-controls')).hidden = open; });
document.addEventListener('click', e => { if (!e.target.closest('.n-dd')) closeMenus(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeMenus(); $('sheet').hidden = true; $('burger').setAttribute('aria-expanded', 'false'); } });
$('burger').onclick = () => { const s = $('sheet'); s.hidden = !s.hidden; $('burger').setAttribute('aria-expanded', String(!s.hidden)); };

let current = 'front';
function show(id, kind){
  const pages = BASE_PAGES.concat(...MODULES.map(m => m.pages));
  pages.forEach(p => { if ($(p)) $(p).hidden = p !== id; });
  $('ftKind').textContent = kind || 'publication';
  const mod = MODULES.find(m => m.pages.includes(id));
  const group = mod ? mod.group : id === 'pg-game' ? 'game' : id === 'pg-cross' ? 'cross' : ['pg-front', 'pg-section', 'pg-story'].includes(id) ? 'news' : '';
  document.querySelectorAll('.n-dd>button').forEach(b => b.classList.toggle('on', b.dataset.group === group));
}
let modResult = null;
function route(){
  closeMenus(); $('sheet').hidden = true; $('burger').setAttribute('aria-expanded', 'false');
  if (window.CMS) window.CMS.leaving();
  const h = currentRoute() || 'home';
  if (h === '' || h === 'home') { current = 'front'; show('pg-front'); renderFront(); }
  else if (SECTIONS[h]) { current = 'section:' + h; show('pg-section'); renderSection(h); }
  else if (h.indexOf('story-') === 0) { current = 'story:' + h.slice(6); show('pg-story'); renderStory(h.slice(6)); }
  else if (h.indexOf('author-') === 0) { current = 'author:' + h.slice(7); show('pg-section'); renderAuthor(h.slice(7)); }
  else if (h.indexOf('tag-') === 0) { current = 'tag:' + h.slice(4); show('pg-section'); renderTag(h.slice(4)); }
  else if (h.indexOf('ten-tenths') === 0) { current = 'game'; show('pg-game', 'game'); document.title = 'Ten Tenth’s · RoadStar';
    const sub = h.slice(11); if (window.TT) { if (sub === 'board' || sub === 'archive' || sub === 'how') window.TT.openPanel(sub === 'archive' ? 'arch' : sub); } }
  else if (h === 'crossword') { current = 'cross'; show('pg-cross', 'puzzle'); renderCross(); }
  else if (window.CMS && window.CMS.route(h)) { /* staff pages */ }
  else if (MODULES.some(m => (modResult = m.route(h)))) { if (modResult === 'stay') return; }
  else { current = 'front'; show('pg-front'); renderFront(); }
  window.scrollTo(0, 0);
}
function rerender(){
  if (current === 'front') renderFront();
  else if (current.indexOf('section:') === 0) renderSection(current.slice(8));
  else if (current.indexOf('story:') === 0) renderStory(current.slice(6));
  else if (current.indexOf('author:') === 0) renderAuthor(current.slice(7));
  else if (current.indexOf('tag:') === 0) renderTag(current.slice(4));
  else if (window.CMS) window.CMS.rerender(current);
}
if (LIVE_URLS) {
  // old #links (bookmarks, shared links) move to their real address
  if (location.hash.length > 1 && /^#[a-z]/.test(location.hash)) history.replaceState(null, '', routeToPath(location.hash));
  document.querySelectorAll('a[href^="#"]').forEach(a => a.setAttribute('href', routeToPath(a.getAttribute('href'))));
  window.addEventListener('popstate', route);
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    const raw = a.getAttribute('href') || ''; let h = null;
    if (raw[0] === '#') h = raw.slice(1);
    else {
      let u; try { u = new URL(a.href); } catch (err) { return; }
      if (u.origin !== location.origin || u.pathname.indexOf('/api/') === 0 || /\.[a-z0-9]{2,5}$/i.test(u.pathname)) return;
      h = pathToRoute(u.pathname);
    }
    if (!h) return;
    e.preventDefault(); navTo('#' + h);
  });
} else window.addEventListener('hashchange', route);
route();
})();
