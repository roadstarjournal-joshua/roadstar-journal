// Sign-in runs on Neon Auth (Managed Better Auth). The browser talks to it through /api/auth on
// this site, so the sign-in cookie belongs to roadstarjournal.com. The server checks that cookie with
// Neon Auth on every request that needs it, then looks up the person's RoadStar role.
//   owner  = the account made admin in the Neon Console (Better Auth, Users, Make admin), or OWNER_EMAIL
//   editor / writer = set by the owner in Writer's desk, Team (stored in rs_roles)
//   reader = any other signed-in account
// Accounts whose email isn't confirmed get no staff access.
import './env.js';
import { sql, ensureSchema } from './db.js';

export function authBase() {
  return (process.env.NEON_AUTH_BASE_URL || process.env.NEON_AUTH_URL || process.env.VITE_NEON_AUTH_URL || '').replace(/\/+$/, '');
}

export function siteOrigin(req) {
  const o = req.headers.get('origin');
  if (o) return o;
  const u = new URL(req.url);
  return u.protocol + '//' + u.host;
}

const hasSessionCookie = req => /session/i.test(req.headers.get('cookie') || '');

// Headers for a server-to-server call to Neon Auth on behalf of the person making this request.
export function forwardHeaders(req, extra) {
  const h = { accept: 'application/json', origin: siteOrigin(req) };
  const ck = req.headers.get('cookie'); if (ck) h.cookie = ck;
  const ua = req.headers.get('user-agent'); if (ua) h['user-agent'] = ua;
  return Object.assign(h, extra || {});
}

export async function getSession(req) {
  const base = authBase();
  if (!base || !hasSessionCookie(req)) return null;
  try {
    const r = await fetch(base + '/get-session', { headers: forwardHeaders(req) });
    if (!r.ok) return null;
    const j = await r.json().catch(() => null);
    return j && j.user ? j : null;
  } catch (e) {
    console.error('get-session failed', e);
    return null;
  }
}

export const isAdmin = u => String((u && u.role) || '').split(',').map(x => x.trim()).includes('admin');
const ownerEmail = () => (process.env.OWNER_EMAIL || '').trim().toLowerCase();
export const isOwnerUser = u => isAdmin(u) || (!!ownerEmail() && String((u && u.email) || '').toLowerCase() === ownerEmail());
export const verifiedOf = u => !!(u && (u.emailVerified ?? u.email_verified));

// { uid, role, user } for the person making the request. role is null when signed out.
export async function context(req) {
  const s = await getSession(req);
  if (!s) return { uid: null, role: null, user: null };
  const u = s.user;
  const verified = verifiedOf(u);
  let role = 'reader';
  if (verified) {
    if (isOwnerUser(u)) role = 'owner';
    else {
      await ensureSchema();
      const rows = await sql()`select role from rs_roles where user_id = ${u.id}`;
      if (rows[0] && (rows[0].role === 'writer' || rows[0].role === 'editor')) role = rows[0].role;
    }
  }
  return { uid: u.id, role, user: { id: u.id, name: u.name || '', email: u.email || '', emailVerified: verified } };
}
