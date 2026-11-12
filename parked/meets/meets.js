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
