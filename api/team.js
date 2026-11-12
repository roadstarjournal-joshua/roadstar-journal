// The owner's Staff access panel.
//   GET  /api/team                                              -> { users: [{ id, name, email, emailVerified, owner, role }] }
//   POST /api/team { action: 'role', userId, role }             role: 'writer' | 'editor' | 'none'
//   POST /api/team { action: 'create', name, email, password, role }
import { sql, ensureSchema, json, fail, httpError } from './_lib/db.js';
import { context, authBase, forwardHeaders, isOwnerUser, verifiedOf } from './_lib/auth.js';

export default {
  async fetch(req) {
    try {
      await ensureSchema();
      const ctx = await context(req);
      if (ctx.role !== 'owner') throw httpError(ctx.uid ? 403 : 401, 'Only the owner can manage staff access.', 'permission-denied');
      if (req.method === 'GET') return json({ users: await listUsers() });
      if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
      const body = await req.json().catch(() => ({}));
      if (body.action === 'role') return json(await setRole(body.userId, body.role, ctx));
      if (body.action === 'create') return json(await createUser(req, body, ctx));
      throw httpError(400, 'Unknown request');
    } catch (e) {
      return fail(e);
    }
  }
};

async function listUsers() {
  let users;
  try { users = await sql()`select * from neon_auth."user"`; }
  catch (e) { throw httpError(503, 'Accounts can’t be read yet. Make sure Better Auth is turned on for this database in the Neon Console.'); }
  const roles = await sql()`select user_id, role from rs_roles`;
  const byId = Object.fromEntries(roles.map(r => [r.user_id, r.role]));
  return users.map(u => ({
    id: u.id,
    name: u.name || '',
    email: u.email || '',
    emailVerified: verifiedOf(u),
    owner: isOwnerUser(u),
    role: byId[u.id] || 'none',
    created: u.createdAt || u.created_at || null
  })).sort((a, b) => (b.owner - a.owner) || String(a.name || a.email).localeCompare(String(b.name || b.email)));
}

async function setRole(userId, role, ctx) {
  if (typeof userId !== 'string' || !/^[A-Za-z0-9_.~-]{1,120}$/.test(userId)) throw httpError(400, 'Bad account');
  if (userId === ctx.uid) throw httpError(400, 'You’re the owner; your own role can’t change here.');
  const q = sql();
  if (role === 'none') {
    await q`delete from rs_roles where user_id = ${userId}`;
  } else if (role === 'writer' || role === 'editor') {
    await q`insert into rs_roles (user_id, role, granted_by) values (${userId}, ${role}, ${ctx.uid})
      on conflict (user_id) do update set role = excluded.role, granted_by = excluded.granted_by, granted_at = now()`;
  } else throw httpError(400, 'Bad role');
  // keep the role label on their profile in step
  await q`update rs_docs set data = data || ${JSON.stringify({ role: role === 'none' ? 'reader' : role })}::jsonb where path = ${'staff/' + userId}`;
  return { ok: true };
}

async function createUser(req, body, ctx) {
  const name = String(body.name || '').trim().slice(0, 120);
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const role = body.role === 'editor' ? 'editor' : 'writer';
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) throw httpError(400, 'Add a name, a valid email and a temporary password of at least 8 characters.');
  const base = authBase();
  if (!base) throw httpError(503, 'Sign-in isn’t connected yet (NEON_AUTH_BASE_URL is missing).');
  const r = await fetch(base + '/admin/create-user', {
    method: 'POST',
    headers: forwardHeaders(req, { 'content-type': 'application/json' }),
    body: JSON.stringify({ email, password, name, role: 'user' })
  });
  const j = await r.json().catch(() => null);
  if (!r.ok) {
    const msg = (j && (j.message || j.error)) || ('status ' + r.status);
    if (r.status === 401 || r.status === 403) throw httpError(403, 'Neon didn’t allow it (' + msg + '). Check that your own account is an admin in the Neon Console (Better Auth, Users, Make admin), then sign out and in again.');
    throw httpError(r.status >= 500 ? 502 : 400, msg);
  }
  const user = (j && (j.user || j)) || {};
  if (!user.id) throw httpError(502, 'The account was created but Neon didn’t return its ID. Refresh the list and set the role there.');
  await setRole(user.id, role, ctx);
  return { ok: true, id: user.id };
}
