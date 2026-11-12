# RoadStar Meets module (parked 11 Nov 2026)

> **In this repository:** the site isn't built from modules, so `build5.py` and the markers mentioned below belong to the prototype workspace. To switch Meets back on here, add `meets.css` to `css/site.css`, the nav, sheet and page HTML to `index.html`, and `meets.js` to the end of `js/site.js`, or ask Claude to do it.

Meets is taken off the live site for now but kept whole, so it can be workshopped and switched back on.

## What it is
A calendar of car meets (cars and coffee, cruises, shows, track days) posted by organizer profiles. Currently a coming-soon page:
- Example listings, clearly labelled as not real: black date tile, type pill, title, time, place, host organizer, number of drivers going.
- Filter pills: This weekend, Cars & coffee, Cruises, Shows, Track days (display only).
- "How hosting will work": make an organizer profile, post the meet, drivers RSVP and get a reminder the day before.
- Call to action for organizers: Contact us.
- Nav: a **Meets** dropdown (Upcoming meets, Host a meet) between News and Ten Tenth's; mobile menu group; footer reads "A RoadStar community".
- Routes: `#meets`, `#meets-host`.

## How to switch it back on
1. In `build5.py`, set `FEATURES = {'meets': True}`.
2. Rebuild. The build drops the module's CSS, nav, mobile-menu entry, page and script into the markers in `site_template.html` (`/*MOD:css*/`, `<!--MOD:nav-->`, `<!--MOD:sheet-->`, `<!--MOD:pages-->`) and `site.js` (`/*MOD:js*/`).
3. Optionally put Meets back in the About text in `site.js` (INFO.about).

The module registers itself with `MODULES.push({ pages, group, kind, route(hash) })`, so no other site code needs editing.

## Ideas to workshop
- Organizer profiles (clubs, crews, venues) tied to RoadStar accounts; verification badge.
- Posting form: place (map pin), date/time, type, car focus, entry fee, house rules, photo.
- RSVP + reminder the day before; "near me" and date filters; calendar export.
- Moderation queue for new organizers; report a meet.
- Meet recaps as feature stories (Feature / car show report template).

## Files (modules/meets/)

### meets.js
```js
// Meets module: a placeholder page for car meets posted by organizer profiles.
// Parked on 11 Nov 2026. Switch on in build5.py (FEATURES['meets'] = True) to bring it back.
// Uses site helpers: el, link, $, rowHead, initials, openInfo, show, current.
// ---------- meets (placeholder until organizer profiles exist) ----------
function nextDow(dow, weeks){ const d = new Date(); d.setHours(12, 0, 0, 0); const diff = ((dow - d.getDay() + 7) % 7) || 7; d.setDate(d.getDate() + diff + 7 * (weeks || 0)); return d; }
const MEET_EXAMPLES = [
  { type: 'Cars & coffee', title: 'Saturday Morning Cars & Coffee', when: '8:00–10:00 am', where: 'Market Square, north lot', host: 'Early Shift Auto Club', going: 64, day: () => nextDow(6, 0) },
  { type: 'Cruise', title: 'Lakeside Night Cruise', when: 'Rolls out at 7:30 pm', where: 'Harbor Road overlook', host: 'After Dark Drivers', going: 27, day: () => nextDow(0, 0) },
  { type: 'Show', title: 'Air-Cooled Autumn Show', when: '10:00 am–3:00 pm', where: 'County Fairgrounds, Hall B', host: 'Flat Four Society', going: 112, day: () => nextDow(6, 1) }
];
function meetItem(m){
  const li = el('li', 'mt-item'); const d = m.day();
  const tile = el('div', 'mt-date'); tile.setAttribute('aria-label', d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));
  tile.appendChild(el('span', '', d.toLocaleDateString('en-US', { weekday: 'short' }))); tile.appendChild(el('b', '', String(d.getDate()))); tile.appendChild(el('span', '', d.toLocaleDateString('en-US', { month: 'short' })));
  li.appendChild(tile);
  const t = el('div'); t.appendChild(el('span', 'rs-pill', m.type)); t.appendChild(el('h3', 'h3', m.title));
  const meta = el('div', 'mt-meta'); meta.appendChild(el('span', '', m.when)); meta.appendChild(el('span', '', m.where)); t.appendChild(meta);
  const host = el('div', 'mt-host'); host.appendChild(el('span', 'mt-av', initials(m.host))); const hn = el('span', '', m.host); hn.appendChild(el('small', '', '  Organizer')); host.appendChild(hn); t.appendChild(host);
  li.appendChild(t);
  const g = el('div', 'mt-going'); g.appendChild(el('b', '', String(m.going))); g.appendChild(document.createTextNode('drivers going')); li.appendChild(g);
  return li;
}
function renderMeets(){
  const pg = $('pg-meets'); document.title = 'Meets · RoadStar'; if (pg.childNodes.length) return;
  const c = el('div', 'n-container'); pg.appendChild(c);
  const hero = el('div', 'n-meets-hero'); hero.appendChild(el('span', 'rs-pill rs-pill--outline', 'Coming soon'));
  hero.appendChild(el('h1', 'd-xl', 'Meets'));
  hero.appendChild(el('p', 'body-l', 'Cars and coffee, cruises, shows and track days, posted by the clubs and crews that run them. See where and when, then turn up.'));
  c.appendChild(hero);
  const prev = el('section', 'n-row'); prev.style.borderTop = '1px solid var(--hair)';
  prev.appendChild(rowHead('What a listing will look like'));
  prev.appendChild(el('p', 'muted body-s', 'These are example listings, not real meets.'));
  const f = el('div', 'mt-filters'); ['This weekend', 'Cars & coffee', 'Cruises', 'Shows', 'Track days'].forEach((x, i) => f.appendChild(el('span', 'rs-pill ' + (i ? 'rs-pill--outline' : 'rs-pill--active'), x))); prev.appendChild(f);
  const ul = el('ul', 'mt-list'); MEET_EXAMPLES.map(m => Object.assign({ _d: m.day() }, m)).sort((a, b) => a._d - b._d).forEach(m => ul.appendChild(meetItem(m))); prev.appendChild(ul);
  c.appendChild(prev);
  const how = el('section', 'n-row'); how.id = 'mt-host'; how.style.borderBottom = '0';
  how.appendChild(rowHead('How hosting will work'));
  const steps = el('ol', 'mt-steps');
  [['Make an organizer profile', 'Clubs, crews and venues get a RoadStar profile with photos and a record of past meets.'],
   ['Post the meet', 'Add the place, date and time, what kind of cars to expect, and any entry fee or house rules.'],
   ['Drivers find it and RSVP', 'Meets show up by date and distance, and drivers who say they’re going get a reminder the day before.']]
    .forEach(([h, p], i) => { const li = el('li'); li.appendChild(el('span', 'num', String(i + 1))); li.appendChild(el('h3', 'h3', h)); li.appendChild(el('p', '', p)); steps.appendChild(li); });
  how.appendChild(steps);
  const cta = el('div', 'mt-cta'); cta.appendChild(el('p', 'body-l', 'Run a meet? Organizer profiles open with the RoadStar app. Until then, get in touch and we’ll list yours first.'));
  const b = el('button', 'rs-btn rs-btn--solid', 'Contact us'); b.type = 'button'; b.onclick = () => openInfo('contact'); cta.appendChild(b);
  how.appendChild(cta); c.appendChild(how);
}

MODULES.push({
  pages: ['pg-meets'], group: 'meets', kind: 'community',
  route(h){
    if (h !== 'meets' && h !== 'meets-host') return false;
    current = 'meets'; show('pg-meets', 'community'); renderMeets();
    if (h === 'meets-host') { window.scrollTo(0, 0); $('mt-host').scrollIntoView(); return 'stay'; }
    return true;
  }
});
```

### meets.css
```css
/* meets placeholder: a date-led listing, each meet anchored by a black date tile */
.n-meets-hero{padding:48px 0 36px;max-width:760px}
.n-meets-hero .d-xl{margin-top:16px}
.n-meets-hero p{margin:16px 0 0}
.mt-filters{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 16px}
.mt-list{list-style:none;margin:0;padding:0}
.mt-item{display:grid;grid-template-columns:88px minmax(0,1fr) auto;gap:24px;align-items:center;padding:20px 0;border-top:1px solid var(--hair)}
.mt-date{background:var(--ink);color:#fff;border-radius:var(--radius-md);text-align:center;padding:12px 0}
.mt-date span{display:block;font:600 12px/16px var(--font-sans);letter-spacing:.06em;text-transform:uppercase;color:var(--chrome)}
.mt-date b{display:block;font:italic 900 40px/1 var(--font-sans);letter-spacing:-.02em;margin:4px 0}
.mt-item .h3{margin:8px 0 0}
.mt-meta{display:flex;flex-wrap:wrap;gap:4px 14px;margin-top:8px;font:500 14px/20px var(--font-sans);color:var(--ink-muted)}
.mt-meta span+span{padding-left:14px;border-left:1px solid var(--hair)}
.mt-host{display:flex;align-items:center;gap:10px;margin-top:12px;font-size:14px;line-height:20px;font-weight:600}
.mt-host small{font-weight:500;color:var(--ink-muted)}
.mt-av{flex:none;width:30px;height:30px;border-radius:50%;background:var(--surface);display:grid;place-items:center;font:700 12px/1 var(--font-sans);box-shadow:inset 0 0 0 1.5px var(--chrome)}
.mt-going{text-align:right;font:500 14px/20px var(--font-sans);color:var(--ink-muted)}
.mt-going b{display:block;font:italic 900 28px/1 var(--font-sans);color:var(--ink)}
@media (max-width:640px){.mt-item{grid-template-columns:68px minmax(0,1fr);gap:16px;align-items:start}.mt-date b{font-size:32px}.mt-going{grid-column:2;text-align:left}.mt-going b{display:inline;font-size:16px;font-style:normal;font-weight:700;margin-right:4px}}
.mt-steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:28px;list-style:none;margin:0;padding:0}
.mt-steps li{border-top:2px solid var(--ink);padding-top:16px}
.mt-steps .num{display:block;font:italic 900 32px/1 var(--font-sans);margin-bottom:12px}
.mt-steps p{margin:8px 0 0;color:#2b2c2f}
@media (max-width:760px){.mt-steps{grid-template-columns:1fr}}
.mt-cta{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;background:var(--surface);border-radius:var(--radius-lg);padding:24px 28px;margin-top:40px}
.mt-cta p{margin:0;max-width:56ch}
#mt-host{scroll-margin-top:96px}
@media (max-width:640px){.mt-meta{flex-direction:column;gap:2px}.mt-meta span+span{padding-left:0;border-left:0}}
```

### nav.html
```html
      <div class="n-dd"><button type="button" aria-expanded="false" aria-controls="dd-meets" data-group="meets">Meets<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.8"/></svg></button>
        <div class="n-ddmenu" id="dd-meets" hidden>
          <a href="#meets">Upcoming meets<small>Coming soon: cars and coffee, cruises and shows</small></a>
          <a href="#meets-host">Host a meet<small>For clubs, crews and venues</small></a>
        </div></div>
```

### sheet.html
```html
    <h4 class="label muted">Meets</h4><a href="#meets">Upcoming meets (coming soon)</a><a href="#meets-host">Host a meet</a>
```

### page.html
```html
  <section class="page" id="pg-meets" hidden></section>
```
