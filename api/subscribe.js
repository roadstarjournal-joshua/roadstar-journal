// POST /api/subscribe { email, lists: { newsletter, accounts, games }, source, page }
// Saves a reader's email address and the email they agreed to get, with a record of that consent.
// No account needed. Nothing is emailed yet: the list is exported later (desk, Team, Email sign-ups).
import { sql, ensureSchema, json, fail, httpError } from './_lib/db.js';
import { CONSENT_VERSION, LISTS, CONSENT_STATEMENT } from './_lib/consent.js';

const EMAIL = /^[^\s@<>()[\]\\,;:"']+@[^\s@<>()[\]\\,;:"']+\.[a-z]{2,}$/i;
const recent = new Map(); // light spam guard, per server instance

export default {
  async fetch(req) {
    try {
      if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
      const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
      const now = Date.now();
      const times = (recent.get(ip) || []).filter(t => now - t < 10 * 60 * 1000);
      if (times.length >= 8) throw httpError(429, 'Too many sign-ups from this connection. Try again in a few minutes.', 'too-many');
      times.push(now); recent.set(ip, times); if (recent.size > 5000) recent.clear();

      const b = await req.json().catch(() => ({}));
      if (b.website) return json({ ok: true }); // a hidden field only bots fill in
      const email = String(b.email || '').trim().toLowerCase();
      if (!email || email.length > 254 || !EMAIL.test(email)) throw httpError(400, 'Enter a valid email address.', 'bad-email');
      const lists = {};
      for (const k of Object.keys(LISTS)) lists[k] = !!(b.lists && b.lists[k] === true);
      if (!Object.values(lists).some(Boolean)) throw httpError(400, 'Tick at least one box to choose what we can email you about.', 'no-choice');

      const record = {
        at: new Date(now).toISOString(),
        source: ['newsletter-page', 'account-menu', 'newsletter-builder'].includes(b.source) ? b.source : 'other',
        page: String(b.page || '').slice(0, 200),
        version: CONSENT_VERSION,
        agreed: Object.keys(LISTS).filter(k => lists[k]).map(k => LISTS[k]),
        statement: CONSENT_STATEMENT,
      };
      await ensureSchema();
      await sql()`insert into rs_subscribers (email, newsletter, accounts, games, status, consents)
                  values (${email}, ${lists.newsletter}, ${lists.accounts}, ${lists.games}, 'subscribed', ${JSON.stringify([record])}::jsonb)
                  on conflict (email) do update set
                    newsletter = rs_subscribers.newsletter or excluded.newsletter,
                    accounts = rs_subscribers.accounts or excluded.accounts,
                    games = rs_subscribers.games or excluded.games,
                    status = 'subscribed', updated_at = now(),
                    consents = rs_subscribers.consents || excluded.consents`;
      return json({ ok: true, lists });
    } catch (e) {
      return fail(e);
    }
  },
};
