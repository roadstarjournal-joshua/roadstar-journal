// The owner's list of email sign-ups.
//   GET  /api/subscribers                     -> { total, newsletter, accounts, games, unsubscribed, people: [...] }
//   GET  /api/subscribers?format=csv          -> CSV of everyone still subscribed, ready to import into Mailchimp
//   POST /api/subscribers { action: 'unsubscribe', email }   stop emailing them (keeps the record)
//   POST /api/subscribers { action: 'delete', email }        remove the address completely (deletion request)
import { sql, ensureSchema, json, fail, httpError } from './_lib/db.js';
import { context } from './_lib/auth.js';

const iso = d => d ? new Date(d).toISOString().replace('T', ' ').slice(0, 16) : '';
const cell = v => { let s = String(v == null ? '' : v); if (/^[=+\-@]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };

export default {
  async fetch(req) {
    try {
      await ensureSchema();
      const ctx = await context(req);
      if (ctx.role !== 'owner') throw httpError(ctx.uid ? 403 : 401, 'Only the owner can see the email list.', 'permission-denied');
      const url = new URL(req.url);
      if (req.method === 'GET') {
        const rows = await sql()`select email, newsletter, accounts, games, status, first_at, updated_at, consents from rs_subscribers order by first_at desc`;
        if (url.searchParams.get('format') === 'csv') {
          const head = ['Email Address', 'RoadStar updates', 'Account news', 'Games and stories', 'Signed up (UTC)', 'Last updated (UTC)', 'Signed up from', 'Consent version', 'Agreed to'];
          const lines = [head.map(cell).join(',')];
          for (const r of rows.filter(r => r.status === 'subscribed')) {
            const last = (r.consents || [])[(r.consents || []).length - 1] || {};
            const agreed = [...new Set((r.consents || []).flatMap(c => c.agreed || []))];
            lines.push([r.email, r.newsletter ? 'Yes' : 'No', r.accounts ? 'Yes' : 'No', r.games ? 'Yes' : 'No', iso(r.first_at), iso(r.updated_at),
              last.page || last.source || '', last.version || '', agreed.join('; ')].map(cell).join(','));
          }
          return new Response('﻿' + lines.join('\r\n') + '\r\n', { headers: {
            'content-type': 'text/csv; charset=utf-8', 'cache-control': 'no-store',
            'content-disposition': 'attachment; filename="roadstar-email-signups-' + new Date().toISOString().slice(0, 10) + '.csv"' } });
        }
        const subscribed = rows.filter(r => r.status === 'subscribed');
        return json({
          total: subscribed.length,
          newsletter: subscribed.filter(r => r.newsletter).length,
          accounts: subscribed.filter(r => r.accounts).length,
          games: subscribed.filter(r => r.games).length,
          unsubscribed: rows.length - subscribed.length,
          people: rows.slice(0, 500).map(r => ({ email: r.email, newsletter: r.newsletter, accounts: r.accounts, games: r.games, status: r.status, first: r.first_at, updated: r.updated_at })),
        });
      }
      if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
      const b = await req.json().catch(() => ({}));
      const email = String(b.email || '').trim().toLowerCase();
      if (!email) throw httpError(400, 'Which email address?');
      if (b.action === 'unsubscribe') {
        const note = JSON.stringify([{ at: new Date().toISOString(), unsubscribed: true, by: 'owner' }]);
        await sql()`update rs_subscribers set status = 'unsubscribed', newsletter = false, accounts = false, games = false, updated_at = now(), consents = consents || ${note}::jsonb where email = ${email}`;
        return json({ ok: true });
      }
      if (b.action === 'delete') {
        await sql()`delete from rs_subscribers where email = ${email}`;
        return json({ ok: true });
      }
      throw httpError(400, 'Unknown request');
    } catch (e) {
      return fail(e);
    }
  },
};
