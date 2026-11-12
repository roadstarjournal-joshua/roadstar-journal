// Who is signed in, and their RoadStar role.
//   GET /api/me                 -> { signedIn, user, role, ownerExists }
//   GET /api/me?profiles=a,b    -> { profiles: { a: { id, name } } }  (names for the leaderboard and bylines)
import { sql, ensureSchema, json, fail } from './_lib/db.js';
import { context } from './_lib/auth.js';

export default {
  async fetch(req) {
    try {
      const u = new URL(req.url);
      const ids = (u.searchParams.get('profiles') || '').split(',').map(s => s.trim()).filter(s => /^[A-Za-z0-9_.~-]{1,120}$/.test(s)).slice(0, 500);
      if (u.searchParams.has('profiles')) return json({ profiles: await profiles(ids) });
      const ctx = await context(req);
      if (!ctx.uid) return json({ signedIn: false, user: null, role: null });
      let ownerExists = null;
      if (ctx.role !== 'owner') ownerExists = await anyOwner();
      return json({ signedIn: true, user: ctx.user, role: ctx.role, ownerExists });
    } catch (e) {
      return fail(e);
    }
  }
};

async function profiles(ids) {
  const out = {};
  if (!ids.length) return out;
  await ensureSchema();
  try {
    const rows = await sql()`select id, name from neon_auth."user" where id = any(${ids}::text[])`;
    rows.forEach(r => { out[r.id] = { id: r.id, name: r.name || '' }; });
  } catch (e) { /* login tables not there yet */ }
  const staff = await sql()`select path, data from rs_docs where path = any(${ids.map(i => 'staff/' + i)}::text[])`;
  staff.forEach(r => { const id = r.path.slice(6); if (r.data && r.data.byline) out[id] = { id, name: r.data.byline }; });
  return out;
}

async function anyOwner() {
  if ((process.env.OWNER_EMAIL || '').trim()) return true;
  try {
    const rows = await sql()`select 1 as ok from neon_auth."user" where role like '%admin%' limit 1`;
    return rows.length > 0;
  } catch (e) {
    return null;
  }
}
