// A plain check that the live site is wired up: open roadstarjournal.com/api/health in a browser.
// It shows whether the database answers (and that it's Neon), whether sign-in is reachable and whether
// photo storage is connected. It never shows passwords or connection strings.
import { sql, ensureSchema, json } from './_lib/db.js';
import { authBase } from './_lib/auth.js';

export default {
  async fetch() {
    const out = { site: 'RoadStar Journal', checkedAt: new Date().toISOString(), database: {}, signIn: {}, photos: {} };
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
    let host = '';
    try { host = new URL(url).hostname; } catch (e) {}
    out.database.provider = /neon\.tech$/i.test(host) ? 'Neon' : (url ? 'Postgres (not Neon)' : 'not connected');
    out.database.region = (host.match(/\.([a-z]{2}-[a-z]+-\d)\.aws\.neon\.tech$/) || [])[1] || null;
    try {
      await ensureSchema();
      const q = sql();
      const [t] = await q`select now() as now`;
      const [c] = await q`select
        (select count(*) from rs_docs where parent = 'posts')::int as posts,
        (select count(*) from rs_docs where parent like 'desk/%/stories')::int as drafts,
        (select count(*) from rs_docs where parent = 'staff')::int as staff,
        (select count(*) from rs_roles)::int as roles`;
      out.database.connected = true;
      out.database.serverTime = t.now;
      out.database.counts = c;
    } catch (e) {
      out.database.connected = false;
      out.database.error = e.message;
    }
    const base = authBase();
    out.signIn.configured = !!base;
    if (base) {
      try {
        const r = await fetch(base + '/ok', { headers: { accept: 'application/json' } });
        out.signIn.reachable = r.ok;
      } catch (e) { out.signIn.reachable = false; out.signIn.error = e.message; }
      try { out.signIn.accounts = (await sql()`select count(*)::int as n from neon_auth."user"`)[0].n; } catch (e) { out.signIn.accounts = null; }
    }
    out.photos.configured = !!(process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN);
    out.ok = !!(out.database.connected && out.signIn.reachable && out.photos.configured);
    return json(out);
  }
};
