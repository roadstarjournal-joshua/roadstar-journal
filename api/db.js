// Reads and saves the site's documents in Neon.
//   GET  /api/db?op=list&coll=posts&order=published&dir=desc&limit=400
//   GET  /api/db?op=get&path=posts/<slug>
//   POST /api/db  { op: 'set' | 'update' | 'delete', path, data }
import { sql, ensureSchema, parentOf, lastOf, json, fail, httpError } from './_lib/db.js';
import { context } from './_lib/auth.js';
import { canRead, canWrite, validPath, visible, level } from './_lib/rules.js';

const PUBLIC_COLLS = ['posts', 'staff', 'scores'];

export default {
  async fetch(req) {
    try {
      await ensureSchema();
      const ctx = await context(req);
      if (req.method === 'GET') return await read(req, ctx);
      if (req.method === 'POST') return await write(req, ctx);
      return json({ error: 'Method not allowed' }, 405);
    } catch (e) {
      return fail(e);
    }
  }
};

async function read(req, ctx) {
  const u = new URL(req.url);
  const op = u.searchParams.get('op');
  const q = sql();
  // Readers who aren't signed in share one cached copy at Vercel's edge for 30 seconds,
  // so a busy front page doesn't keep the database awake.
  // Browsers always ask again; only Vercel's edge keeps the shared copy.
  const cache = !ctx.uid ? { 'cache-control': 'public, max-age=0, must-revalidate', 'vercel-cdn-cache-control': 'max-age=30, stale-while-revalidate=300' } : {};
  if (op === 'list') {
    const coll = u.searchParams.get('coll') || '';
    if (!validPath(coll, 'coll')) throw httpError(400, 'Bad collection');
    if (!canRead(coll + '/x', ctx)) throw httpError(ctx.uid ? 403 : 401, 'permission-denied', 'permission-denied');
    const order = u.searchParams.get('order');
    const desc = u.searchParams.get('dir') === 'desc';
    const limit = Math.max(1, Math.min(1000, parseInt(u.searchParams.get('limit') || '500', 10) || 500));
    let rows;
    if (order && /^[A-Za-z0-9_]{1,40}$/.test(order)) {
      rows = desc
        ? await q`select path, data from rs_docs where parent = ${coll} order by data -> ${order}::text desc nulls last, path limit ${limit}::int`
        : await q`select path, data from rs_docs where parent = ${coll} order by data -> ${order}::text asc nulls last, path limit ${limit}::int`;
    } else {
      rows = await q`select path, data from rs_docs where parent = ${coll} order by path limit ${limit}::int`;
    }
    if (coll === 'posts' && level(ctx) < 3) rows = rows.filter(r => visible(r.data));
    const isPublic = PUBLIC_COLLS.includes(coll.split('/')[0]);
    return json({ docs: rows.map(r => ({ id: lastOf(r.path), data: r.data })) }, 200, isPublic ? cache : {});
  }
  if (op === 'get') {
    const path = u.searchParams.get('path') || '';
    if (!validPath(path, 'doc')) throw httpError(400, 'Bad path');
    if (!canRead(path, ctx)) throw httpError(ctx.uid ? 403 : 401, 'permission-denied', 'permission-denied');
    const rows = await q`select data from rs_docs where path = ${path}`;
    let row = rows[0] || null;
    if (row && path.startsWith('posts/') && level(ctx) < 3 && !visible(row.data)) row = null;
    return json(row ? { exists: true, data: row.data } : { exists: false }, 200, PUBLIC_COLLS.includes(path.split('/')[0]) ? cache : {});
  }
  throw httpError(400, 'Unknown request');
}

async function write(req, ctx) {
  if (!ctx.uid) throw httpError(401, 'permission-denied', 'permission-denied');
  const raw = await req.text();
  if (raw.length > 900000) throw httpError(413, 'That’s too much to save at once. Large photos belong in uploads, not in the story text.');
  let body;
  try { body = JSON.parse(raw); } catch (e) { throw httpError(400, 'Bad request'); }
  const { op, path } = body || {};
  if (!validPath(path, 'doc')) throw httpError(400, 'Bad path');
  if (!canWrite(path, ctx)) throw httpError(403, 'permission-denied', 'permission-denied');
  const q = sql();
  if (op === 'delete') {
    await q`delete from rs_docs where path = ${path}`;
    return json({ ok: true });
  }
  let data = body.data;
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw httpError(400, 'Bad data');
  data = await protectStaffRole(path, data, ctx);
  if (op === 'set') {
    await q`insert into rs_docs (path, parent, data, updated_at) values (${path}, ${parentOf(path)}, ${JSON.stringify(data)}::jsonb, now())
      on conflict (path) do update set data = excluded.data, updated_at = now()`;
    return json({ ok: true });
  }
  if (op === 'update') {
    const rows = await q`update rs_docs set data = data || ${JSON.stringify(data)}::jsonb, updated_at = now() where path = ${path} returning path`;
    if (!rows.length) throw httpError(404, 'not-found', 'not-found');
    return json({ ok: true });
  }
  throw httpError(400, 'Unknown request');
}

// The role shown on a staff profile always comes from the server, never from what the page sends.
async function protectStaffRole(path, data, ctx) {
  if (!path.startsWith('staff/')) return data;
  const d = Object.assign({}, data);
  const uid = path.split('/')[1];
  if (uid === ctx.uid) { d.role = ctx.role; return d; }
  delete d.role;
  const rows = await sql()`select role from rs_roles where user_id = ${uid}`;
  if (rows[0]) d.role = rows[0].role;
  return d;
}
