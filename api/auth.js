// Passes sign-in requests from the browser to Neon Auth and hands its cookies back as this site's own,
// so staff stay signed in on roadstarjournal.com. Called as /api/auth?p=sign-in/email and so on.
import { authBase, forwardHeaders, signupOpen } from './_lib/auth.js';
import { json } from './_lib/db.js';

// The account and session endpoints the site uses. Admin endpoints are only called from the server (api/team.js).
const ALLOWED = /^(sign-in\/email|sign-up\/email|sign-out|get-session|email-otp\/(send-verification-otp|verify-email|reset-password)|change-password|update-user|ok)$/;
// Email codes the site sends: confirming an email, and resetting a password. (Not "sign in with a code",
// which would let a code alone create an account.)
const CODE_TYPES = ['email-verification', 'forget-password'];

export default {
  async fetch(req) {
    const base = authBase();
    if (!base) return json({ error: 'Sign-in isn’t connected yet: turn on Better Auth for this database in the Neon Console, then redeploy the site on Vercel so it picks up NEON_AUTH_BASE_URL.' }, 503);
    const p = (new URL(req.url).searchParams.get('p') || '').replace(/^\/+/, '');
    if (!ALLOWED.test(p)) return json({ error: 'Not found' }, 404);
    if (p === 'sign-up/email' && !signupOpen()) return json({ message: 'Sign up is not enabled. Ask the RoadStar owner to create your account.', code: 'SIGN_UP_DISABLED' }, 403);
    const headers = forwardHeaders(req);
    const ct = req.headers.get('content-type'); if (ct) headers['content-type'] = ct;
    const init = { method: req.method, headers, redirect: 'manual' };
    if (req.method !== 'GET' && req.method !== 'HEAD') init.body = await req.arrayBuffer();
    if (p === 'email-otp/send-verification-otp') {
      let type = null;
      try { type = JSON.parse(new TextDecoder().decode(init.body)).type; } catch (e) {}
      if (!CODE_TYPES.includes(type)) return json({ message: 'That kind of code isn’t used on this site.', code: 'BAD_CODE_TYPE' }, 400);
    }
    let r;
    try { r = await fetch(base + '/' + p, init); }
    catch (e) { console.error('auth proxy', e); return json({ error: 'The sign-in service can’t be reached right now. Try again in a minute.' }, 502); }
    const out = new Headers({ 'content-type': r.headers.get('content-type') || 'application/json', 'cache-control': 'no-store' });
    const cookies = typeof r.headers.getSetCookie === 'function' ? r.headers.getSetCookie() : (r.headers.get('set-cookie') ? [r.headers.get('set-cookie')] : []);
    for (const c of cookies) out.append('set-cookie', ownCookie(c));
    return new Response(await r.arrayBuffer(), { status: r.status, headers: out });
  }
};

// Make Neon Auth's cookie belong to this site: drop its Domain and send it with every page.
export function ownCookie(c) {
  return c.split(';').map(s => s.trim()).filter(s => s && !/^domain=/i.test(s)).map(s => (/^path=/i.test(s) ? 'Path=/' : s)).join('; ');
}
