// Stand-in data layer for the preview stage. The site talks to its data only through
// window.claude.use('db' | 'user' | 'assets'), so the live version swaps this one file
// for js/runtime-live.js (server functions + Neon) without touching the rest of the site.
// RoadStar test version: stands in for the hosted database so the whole site runs from one file.
// Everything is saved in this browser only. The Test version menu switches roles and resets the data.
(function(){
  'use strict';
  var KEY = 'roadstar-test.v1', RKEY = 'roadstar-test.role';
  var SEED = [
 {
  "op": "set",
  "path": "posts/welcome-to-roadstar",
  "data": {
   "section": "news",
   "published": 1794236400000,
   "featured": false,
   "image": null,
   "title": "Welcome to RoadStar",
   "dek": "Reporting, reviews and opinion for people who love cars, plus a daily car game and, soon, a crossword.",
   "body": "RoadStar is a home for drivers: the people who notice a car's shut lines before its price, who know which engine is under the bonnet, and who argue about it afterwards.\n\n## What we cover\n\n- **News** from the car world, reported plainly.\n- **Reviews** and buyer's guides that tell you what to check before you spend your money.\n- **Opinion** from writers with something to say.\n- **Features** on the cars and people that shaped driving.\n\n## Play every day\n\nTen Tenth's is our daily car game. Name the car from a close-up, then take on six rounds about its maker: famous engines, other models, rivals and history. Scores count toward a daily and season leaderboard.\n\nA small daily crossword is next.\n\n> Every story on this draft site marked \"Sample post\" is a placeholder, ready to be replaced with your own.",
   "author": "RoadStar staff",
   "sample": true,
   "updated": 1794236400000
  }
 },
 {
  "op": "set",
  "path": "posts/lancia-stratos-three-titles",
  "data": {
   "section": "features",
   "published": 1794232800000,
   "featured": true,
   "image": {
    "src": "news/stratos.jpg",
    "alt": "Blue Lancia Stratos Stradale on a lawn",
    "credit": {
     "a": "Mr.choppers",
     "l": "CC BY-SA 3.0",
     "u": "https://commons.wikimedia.org/wiki/File:1974_Lancia_Stratos_Stradale_at_Greenwich_2021,_front_left.jpg"
    }
   },
   "title": "Three titles in three years: how the Lancia Stratos rewrote rallying",
   "dek": "Built around a Ferrari V6 and a very short wheelbase, the Stratos was drawn from a blank sheet to win rallies, and it did.",
   "body": "Most rally cars of the early 1970s started life as road cars. The Lancia Stratos went the other way. It was designed to win the World Rally Championship, and road versions were built because the rules required them.\n\n## A wedge with a Ferrari heart\n\nThe shape came from Marcello Gandini at Bertone, who had stunned the 1970 Turin motor show with the Stratos Zero concept. The production car kept the wedge but wrapped it around a short, wide cabin, with the Ferrari Dino's 2.4-litre V6 mounted behind the seats.\n\nThe short wheelbase made it nervous at the limit and brilliant on loose surfaces. In the right hands it turned in like nothing else in the field.\n\n> The Stratos was designed from a blank sheet to win rallies.\n\n## The results\n\nLancia won the manufacturers' title in 1974, 1975 and 1976. Sandro Munari won the Monte Carlo Rally three years running in a Stratos, from 1975 to 1977.\n\nCompany politics ended the works programme: Fiat preferred to promote its 131 Abarth. But the Stratos set the template that purpose-built rally cars have followed ever since.",
   "author": "RoadStar staff",
   "sample": true,
   "updated": 1794232800000
  }
 },
 {
  "op": "set",
  "path": "posts/ten-tenths-is-overrated",
  "data": {
   "section": "opinion",
   "published": 1794178800000,
   "featured": false,
   "image": null,
   "title": "Ten-tenths is overrated",
   "dek": "The best drives happen well below the limit. Save the last three tenths for the track.",
   "body": "Racing drivers talk about driving at ten-tenths: every ounce of grip used, nothing left in reserve. It is a wonderful idea. It is also the wrong way to enjoy a car on the road.\n\n## Seven-tenths is where the fun lives\n\nAt seven-tenths you have time to notice things. The way the steering weights up as you load the front tyres. The note of the engine as it climbs through the mid-range. The small adjustment of the throttle that settles the car through a long bend.\n\nYou also have a margin for the things you cannot see: the gravel on the apex, the cyclist round the corner, the tractor pulling out of a field.\n\n> A great road car is one you enjoy at seven-tenths. A great track car is one you trust at ten.\n\n## So where does ten-tenths belong?\n\nOn a circuit, with marshals, run-off and a helmet. Track days are cheaper and more accessible than most drivers think, and they give you somewhere to find the limit without betting your licence on it.\n\nDrive the road at seven-tenths and the track at ten. Then come back and tell us which you enjoyed more.",
   "author": "RoadStar staff",
   "sample": true,
   "updated": 1794178800000
  }
 },
 {
  "op": "set",
  "path": "posts/buyers-guide-honda-nsx",
  "data": {
   "section": "reviews",
   "published": 1794150000000,
   "featured": false,
   "image": {
    "src": "news/nsx.jpg",
    "alt": "Red first-generation Honda NSX parked on a street",
    "credit": {
     "a": "ed g2s",
     "l": "CC BY-SA 3.0",
     "u": "https://commons.wikimedia.org/wiki/File:Honda_NSX_red.jpg"
    }
   },
   "title": "Buyer's guide: the first-generation Honda NSX",
   "dek": "More than thirty-five years on, the everyday supercar has become a collector's car. Here's what to check before you buy one.",
   "body": "Honda launched the NSX in 1990, sold as the Acura NSX in North America, with an idea no supercar maker had really tried: make it easy to live with. It still is, which is why good ones are no longer cheap.\n\n## What you're buying\n\nAn aluminium body and chassis, a mid-mounted 3.0-litre V6 with VTEC, and a cabin with the visibility of a hatchback. Later manual cars got a 3.2-litre engine and a six-speed gearbox, and a 2002 facelift swapped the pop-up headlights for fixed lamps. Production ended in 2005.\n\n## What to check\n\n- **Service history.** The V6 is durable, but the cam belt needs changing on schedule. Ask for receipts.\n- **Body damage.** Aluminium repairs are specialist work. Look for uneven panel gaps and paint that doesn't match.\n- **Originality.** Unmodified cars carry a clear premium. Keep any parts that have been swapped.\n- **Coupe or targa.** The NSX-T's removable roof adds weight. Purists prefer the coupe; the targa is nicer on a summer evening.\n\n> Buy the best history you can afford, not the lowest mileage.\n\n## Verdict\n\nThe NSX rewards a careful buyer. Find one with a thick folder of receipts and it may be the least stressful supercar you ever own.",
   "author": "RoadStar staff",
   "sample": true,
   "updated": 1794150000000
  }
 },
 {
  "op": "set",
  "path": "posts/mustang-invented-the-pony-car",
  "data": {
   "section": "features",
   "published": 1794067200000,
   "featured": false,
   "image": {
    "src": "news/mustang.jpg",
    "alt": "Red 1965 Ford Mustang hardtop",
    "credit": {
     "a": "Kroelleboelle",
     "l": "CC BY-SA 3.0",
     "u": "https://commons.wikimedia.org/wiki/File:1965_Ford_Mustang_2D_Hardtop_Front.jpg"
    }
   },
   "title": "How the Mustang invented the pony car",
   "dek": "Ford's 1964 gamble used humble Falcon parts, a long options list and a World's Fair launch to create a new kind of car.",
   "body": "On 17 April 1964, Ford unveiled the Mustang at the New York World's Fair. Under the long bonnet and short tail sat parts from the plain Ford Falcon, and that was the point: the Mustang looked expensive without being expensive.\n\n## Built from the parts bin\n\nLee Iacocca, who ran the Ford division, pushed the project through. Using the Falcon's underpinnings kept the price low, and a long options list let buyers turn a six-cylinder commuter into a V8 hot rod.\n\n> The Mustang looked expensive without being expensive.\n\n## A category of its own\n\nBuyers queued at dealers, and Ford sold more than 400,000 in the first year. Rivals rushed to follow, including the Chevrolet Camaro, the Pontiac Firebird and the Dodge Challenger, and the press named the whole group after the Mustang's galloping-horse badge: pony cars.\n\nSixty-two years later, it is the only one of those originals that has never left production.",
   "author": "RoadStar staff",
   "sample": true,
   "updated": 1794067200000
  }
 },
 {
  "op": "set",
  "path": "posts/delorean-belfast-to-hollywood",
  "data": {
   "section": "features",
   "published": 1793984400000,
   "featured": false,
   "image": {
    "src": "news/delorean.jpg",
    "alt": "DeLorean DMC-12 with its gull-wing doors open",
    "credit": {
     "a": "Kevin Abato",
     "l": "CC BY-SA 3.0",
     "u": "https://commons.wikimedia.org/wiki/File:Delorean_DMC-12_side.jpg"
    }
   },
   "title": "Built in Belfast, saved by Hollywood: the DeLorean story",
   "dek": "A stainless-steel sports car from a brand-new company should have been a footnote. Then came 1985.",
   "body": "John DeLorean left General Motors to build a sports car of his own. The result, the DMC-12, arrived in 1981 from a new factory at Dunmurry, on the edge of Belfast.\n\n## Stainless and gull-winged\n\nBrushed stainless-steel panels covered a fibreglass body, with gull-wing doors and a wedge shape drawn by Giorgetto Giugiaro. Behind the rear axle sat a 2.85-litre V6 shared with Peugeot, Renault and Volvo.\n\nIt looked like the future. It drove like a heavy car without much power, and it cost far more than planned.\n\n## Collapse and comeback\n\nSales were slow, the money ran out and the company went into receivership in 1982, after about 9,000 cars.\n\n> It looked like the future, which turned out to be the point.\n\nThen Back to the Future made it the most famous time machine in the world. Owners' clubs keep thousands on the road today, and the car that struggled in the showroom never left the poster wall.",
   "author": "RoadStar staff",
   "sample": true,
   "updated": 1793984400000
  }
 },
 {
  "op": "set",
  "path": "posts/in-praise-of-the-boring-car",
  "data": {
   "section": "opinion",
   "published": 1793916000000,
   "featured": false,
   "image": {
    "src": "news/volvo.jpg",
    "alt": "White Volvo 240 GL estate parked by a kerb",
    "credit": {
     "a": "OSX",
     "l": "Public domain",
     "u": "https://commons.wikimedia.org/wiki/File:1988-1991_Volvo_240_GL_station_wagon_(2011-06-15)_01.jpg"
    }
   },
   "title": "In praise of the boring car",
   "dek": "The Volvo 240 never set a lap record. It set something better: a standard for cars that refuse to die.",
   "body": "Nobody ever bought a Volvo 240 to impress the neighbours. They bought it because it would start on a January morning, carry a wardrobe and a dog, and do it again for twenty years.\n\n## The brick that wouldn't quit\n\nThe 240 went on sale in 1974 and stayed in production until 1993. Its square body earned it the nickname \"the Brick\", and more than two and a half million were built.\n\nIt was slow, upright and about as aerodynamic as its nickname. It was also simple, tough and easy to fix with a basic toolkit.\n\n> A car that never lets you down is its own kind of thrill.\n\n## Why it matters now\n\nPlenty of modern cars are faster and safer than a 240. Few will still be running in thirty years. If we care about cars that last, the boring ones deserve more respect than they get.",
   "author": "RoadStar staff",
   "sample": true,
   "updated": 1793916000000
  }
 },
 {
  "op": "set",
  "path": "posts/mini-sideways-idea",
  "data": {
   "section": "features",
   "published": 1793808000000,
   "featured": false,
   "image": {
    "src": "news/mini.jpg",
    "alt": "Cream 1959 Morris Mini-Minor",
    "credit": {
     "a": "DeFacto",
     "l": "CC BY-SA 2.5",
     "u": "https://commons.wikimedia.org/wiki/File:Morris_Mini-Minor_1959_(621_AOK).jpg"
    }
   },
   "title": "Ten feet, four seats: the Mini's sideways idea",
   "dek": "Alec Issigonis turned the engine 90 degrees and changed small cars for good.",
   "body": "When the Suez crisis pushed up fuel prices in 1956, the British Motor Corporation asked Alec Issigonis for a small, economical car, quickly. In 1959, the Mini arrived.\n\n## The sideways trick\n\nIssigonis mounted the four-cylinder engine across the car, with the gearbox in the sump beneath it, driving the front wheels. With the wheels pushed to the corners and the machinery packed into the nose, most of a car about three metres long was left for people and luggage.\n\n## Giant killer\n\nJohn Cooper, who built Formula 1 cars, saw how well the Mini handled and made it fast. The Mini Cooper S won the Monte Carlo Rally in 1964, 1965 and 1967.\n\n> Most small cars on sale today follow the layout the Mini made normal.\n\nThe original stayed in production until 2000, and its front-wheel-drive, transverse-engine recipe became the standard for small cars everywhere.",
   "author": "RoadStar staff",
   "sample": true,
   "updated": 1793808000000
  }
 }
];
  // library photos are embedded once; saved stories keep the short name (news/x.jpg) and get the photo when read
  var IMG = window.RS_IMG = {};
  var REV = {}; Object.keys(IMG).forEach(function(k){ REV[IMG[k]] = k; });
  function deep(o, f){ if (typeof o === 'string') return f(o); if (Array.isArray(o)) return o.map(function(x){ return deep(x, f); }); if (o && typeof o === 'object') { var r = {}; Object.keys(o).forEach(function(k){ r[k] = deep(o[k], f); }); return r; } return o; }
  var toStore = function(s){ return REV[s] || s; }, fromStore = function(s){ return IMG[s] || s; };
  var ROLES = {
    reader: { id: 'u_test_reader', name: 'Guest reader', lvl: 1, label: 'Reader', about: 'Read stories and play Ten Tenth’s.' },
    writer: { id: 'u_test_writer', name: 'Test Writer', lvl: 2, label: 'Writer', about: 'Write stories and submit them for review.' },
    editor: { id: 'u_test_editor', name: 'Test Editor', lvl: 3, label: 'Editor', about: 'Review, publish and schedule any story.' },
    owner: { id: 'u_test_owner', name: 'Test Owner', lvl: 3, owner: true, label: 'Owner', about: 'Everything an editor can do, plus the team.' }
  };
  var ls = null;
  try { ls = window.localStorage; ls.setItem('roadstar-test.ping', '1'); ls.removeItem('roadstar-test.ping'); } catch (e) { ls = null; }
  var role = 'reader'; try { role = (ls && ls.getItem(RKEY)) || 'reader'; } catch (e) {}
  if (!ROLES[role]) role = 'reader';
  var R = ROLES[role];
  var notice = '';
  function clone(o){ return JSON.parse(JSON.stringify(o)); }
  function fresh(){ var s = {}; SEED.forEach(function(op){ s[op.path] = clone(op.data); }); return s; }
  var store = null; try { store = ls ? JSON.parse(ls.getItem(KEY) || 'null') : null; } catch (e) { store = null; }
  if (!store || typeof store !== 'object') store = fresh();
  if (!ls) notice = 'This browser isn’t keeping data for this page, so anything you write disappears when you close it.';
  function persist(){
    if (!ls) return;
    try { ls.setItem(KEY, JSON.stringify(store)); }
    catch (e) { notice = 'This browser’s storage for the test is full, so new changes will be lost when you close the page. Reset test data to start fresh.'; paintNotice(); }
  }
  persist();

  // same permissions as the live site: posts are editor-only, desk/<id> and staff/<id> belong to their owner
  function canWrite(path){
    var s = path.split('/');
    if (s[0] === 'posts' || s[0] === 'drafts') return R.lvl >= 3;
    if (s[0] === 'desk' || s[0] === 'staff') return R.lvl >= 3 || (R.lvl >= 2 && s[1] === R.id);
    if (s[0] === 'scores') return R.lvl >= 3 || s[1] === R.id; // in the test version every visitor can save their own game score
    return R.lvl >= 2;
  }
  function canRead(path){ var s = path.split('/'); if (s[0] === 'desk' || s[0] === 'drafts') return R.lvl >= 3 || (R.lvl >= 2 && s[1] === R.id); return true; }
  function denied(){ var e = new Error('permission-denied'); e.code = 'permission-denied'; return Promise.reject(e); }
  var later = function(fn){ return new Promise(function(res){ setTimeout(function(){ res(fn()); }, 15); }); };
  var subs = [];
  function snapDoc(path){ var has = Object.prototype.hasOwnProperty.call(store, path); return { id: path.split('/').pop(), exists: has, data: function(){ return has ? deep(store[path], fromStore) : undefined; } }; }
  function query(coll, ord, lim){
    var depth = coll.split('/').length + 1;
    var docs = Object.keys(store).filter(function(p){ return p.indexOf(coll + '/') === 0 && p.split('/').length === depth; }).map(snapDoc);
    if (ord) docs.sort(function(a, b){ var x = a.data()[ord[0]] || 0, y = b.data()[ord[0]] || 0; return (ord[1] === 'desc' ? -1 : 1) * (x < y ? -1 : x > y ? 1 : 0); });
    if (lim) docs = docs.slice(0, lim);
    return { docs: docs, size: docs.length, empty: !docs.length };
  }
  function notify(){ subs.forEach(function(s){ setTimeout(function(){ s.next(query(s.coll, s.ord, s.lim)); }, 5); }); }
  function collection(path){
    var ord = null, lim = null;
    var q = {
      orderBy: function(f, d){ ord = [f, d || 'asc']; return q; },
      limit: function(n){ lim = n; return q; },
      where: function(){ return q; },
      doc: function(id){ return doc(path + '/' + id); },
      get: function(){ return canRead(path + '/x') ? later(function(){ return query(path, ord, lim); }) : denied(); },
      onSnapshot: function(next, err){
        if (!canRead(path + '/x')) { setTimeout(function(){ if (err) err(new Error('permission-denied')); }, 10); return function(){}; }
        var s = { coll: path, ord: ord, lim: lim, next: next }; subs.push(s);
        setTimeout(function(){ next(query(path, ord, lim)); }, 20);
        return function(){ var i = subs.indexOf(s); if (i >= 0) subs.splice(i, 1); };
      }
    };
    return q;
  }
  function doc(path){
    return {
      id: path.split('/').pop(), path: path,
      get: function(){ return canRead(path) ? later(function(){ return snapDoc(path); }) : denied(); },
      set: function(d){ if (!canWrite(path)) return denied(); var v = deep(d, toStore); return later(function(){ store[path] = v; persist(); notify(); }); },
      update: function(d){ if (!canWrite(path)) return denied(); if (!Object.prototype.hasOwnProperty.call(store, path)) return Promise.reject(new Error('not-found')); var add = deep(d, toStore); return later(function(){ var cur = store[path]; Object.keys(add).forEach(function(k){ cur[k] = add[k]; }); persist(); notify(); }); },
      delete: function(){ if (!canWrite(path)) return denied(); return later(function(){ delete store[path]; persist(); notify(); }); }
    };
  }
  window.addEventListener('storage', function(e){ if (e.key === KEY && e.newValue) { try { store = JSON.parse(e.newValue); notify(); } catch (err) {} } });
  var db = { collection: collection, doc: doc };
  var NAMES = {}; Object.keys(ROLES).forEach(function(k){ NAMES[ROLES[k].id] = ROLES[k].name; });
  var user = {
    isOwner: function(){ return !!R.owner; }, canEdit: function(){ return R.lvl >= 3; }, can: function(){ return R.lvl >= 2; },
    id: function(){ return Promise.resolve(R.id); }, me: function(){ return Promise.resolve({ id: R.id, name: R.name }); },
    profiles: function(ids){ var o = {}; (ids || []).forEach(function(i){ o[i] = { id: i, name: NAMES[i] || '' }; }); return Promise.resolve(o); },
    search: function(){ return Promise.resolve([]); }
  };
  // uploads become small JPEGs kept with the test data
  function shrink(blob){
    return new Promise(function(res, rej){
      var url = URL.createObjectURL(blob); var img = new Image();
      img.onload = function(){ var w = img.naturalWidth, h = img.naturalHeight, k = Math.min(1, 1400 / Math.max(w, h)); var c = document.createElement('canvas'); c.width = Math.round(w * k); c.height = Math.round(h * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); res(c.toDataURL('image/jpeg', 0.8)); };
      img.onerror = function(){ URL.revokeObjectURL(url); rej(new Error('That file isn’t an image this browser can open.')); };
      img.src = url;
    });
  }
  var assets = { upload: function(blob){ return shrink(blob).then(function(u){ return { id: 'a' + Date.now().toString(36), url: u, sizeBytes: u.length, contentType: 'image/jpeg' }; }); } };
  window.claude = { use: function(n){ return Promise.resolve(n === 'db' ? db : n === 'user' ? user : n === 'assets' ? (R.lvl >= 2 ? assets : null) : null); } };

  function setRole(r){ try { ls && ls.setItem(RKEY, r); } catch (e) {} location.reload(); }
  function reset(){
    try { if (ls) { ls.removeItem(KEY); ls.removeItem('tentenths.v4'); Object.keys(ls).forEach(function(k){ if (k.indexOf('rs-ed-') === 0) ls.removeItem(k); }); } } catch (e) {}
    location.reload();
  }
  window.RS_DEMO = { role: role, setRole: setRole, reset: reset };

  // ---------- Test version menu ----------
  var noteEl = null;
  function paintNotice(){ if (noteEl) { noteEl.textContent = notice; noteEl.hidden = !notice; } }
  function bar(){
    var css = '.rs-test{position:fixed;left:16px;bottom:16px;z-index:9;font-family:Montserrat,system-ui,sans-serif;color:#000}' +
      '.rs-test-btn{display:inline-flex;align-items:center;gap:8px;height:38px;padding:0 16px;border:0;border-radius:999px;background:#000;color:#fff;font:700 13px/1 Montserrat,system-ui,sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.25);cursor:pointer}' +
      '.rs-test-btn span{font-weight:500;color:#C9CBD0}' +
      '.rs-test-btn:focus-visible{outline:2px solid #000;outline-offset:3px}' +
      '.rs-test-panel{position:absolute;left:0;bottom:48px;width:min(340px,calc(100vw - 32px));max-height:calc(100vh - 100px);overflow:auto;background:#fff;border-radius:16px;padding:18px 18px 16px;box-shadow:0 12px 40px rgba(0,0,0,.22),0 0 0 1px #F2F2F4}' +
      '.rs-test-panel h2{font:italic 800 20px/1.2 Montserrat,system-ui,sans-serif;margin:0 0 6px}' +
      '.rs-test-panel p{font-size:13px;line-height:19px;color:#6B6E73;margin:0 0 14px}' +
      '.rs-test-panel p.rs-test-note{color:#000;font-weight:600;background:#F2F2F4;border-radius:10px;padding:10px 12px}' +
      '.rs-test-panel fieldset{border:0;padding:0;margin:0 0 12px;min-width:0}' +
      '.rs-test-panel legend{font:700 12px/16px Montserrat,system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;margin:0 0 6px;padding:0}' +
      '.rs-test-opt{display:flex;gap:10px;align-items:flex-start;padding:8px 10px;margin:0 -10px;border-radius:10px;cursor:pointer}' +
      '.rs-test-opt:hover{background:#F2F2F4}' +
      '.rs-test-opt input{margin:3px 0 0;accent-color:#000;width:16px;height:16px;flex:none}' +
      '.rs-test-opt b{display:block;font-size:14px;line-height:20px}' +
      '.rs-test-opt span{display:block;font-size:12px;line-height:17px;color:#6B6E73}' +
      '.rs-test-reset{height:34px;padding:0 14px;border:0;border-radius:999px;background:transparent;box-shadow:inset 0 0 0 1.5px #000;font:700 13px/1 Montserrat,system-ui,sans-serif;cursor:pointer;color:#000}' +
      '.rs-test-reset:hover{background:#000;color:#fff}' +
      'body{padding-bottom:72px}' +
      '@media print{.rs-test{display:none}}';
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var w = document.createElement('div'); w.className = 'rs-test';
    var b = document.createElement('button'); b.type = 'button'; b.className = 'rs-test-btn'; b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-controls', 'rsTestPanel');
    b.appendChild(document.createTextNode('Test version')); var bs = document.createElement('span'); bs.textContent = 'Viewing as ' + R.label; b.appendChild(bs);
    var p = document.createElement('div'); p.className = 'rs-test-panel'; p.id = 'rsTestPanel'; p.hidden = true; p.setAttribute('role', 'dialog'); p.setAttribute('aria-label', 'Test version');
    var h = document.createElement('h2'); h.textContent = 'Test version'; p.appendChild(h);
    var intro = document.createElement('p'); intro.textContent = 'This copy of RoadStar runs entirely in your browser. Stories you write and scores you post are saved on this device only, and nobody else sees them.'; p.appendChild(intro);
    noteEl = document.createElement('p'); noteEl.className = 'rs-test-note'; p.appendChild(noteEl); paintNotice();
    var fs = document.createElement('fieldset'); var lg = document.createElement('legend'); lg.textContent = 'View the site as'; fs.appendChild(lg);
    Object.keys(ROLES).forEach(function(k){
      var r = ROLES[k]; var l = document.createElement('label'); l.className = 'rs-test-opt';
      var i = document.createElement('input'); i.type = 'radio'; i.name = 'rsTestRole'; i.value = k; i.checked = k === role; i.onchange = function(){ setRole(k); };
      var t = document.createElement('div'); var tb = document.createElement('b'); tb.textContent = r.label; var ts = document.createElement('span'); ts.textContent = r.about; t.appendChild(tb); t.appendChild(ts);
      l.appendChild(i); l.appendChild(t); fs.appendChild(l);
    });
    p.appendChild(fs);
    var rs = document.createElement('button'); rs.type = 'button'; rs.className = 'rs-test-reset'; rs.textContent = 'Reset test data';
    var armed = false; rs.onclick = function(){ if (!armed) { armed = true; rs.textContent = 'Click again to clear everything'; setTimeout(function(){ armed = false; rs.textContent = 'Reset test data'; }, 4000); return; } reset(); };
    p.appendChild(rs);
    var hint = document.createElement('p'); hint.style.margin = '10px 0 0'; hint.textContent = 'Reset brings back the original sample stories and clears your game progress.'; p.appendChild(hint);
    function open(v){ p.hidden = !v; b.setAttribute('aria-expanded', String(v)); if (v) { var c = p.querySelector('input:checked'); if (c) c.focus(); } }
    b.onclick = function(){ open(p.hidden); };
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && !p.hidden) { open(false); b.focus(); } });
    document.addEventListener('mousedown', function(e){ if (!p.hidden && !w.contains(e.target)) open(false); });
    w.appendChild(p); w.appendChild(b); document.body.appendChild(w);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bar); else bar();
})();
