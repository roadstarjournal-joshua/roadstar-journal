// Database access for RoadStar: one Neon Postgres database, connected by Vercel (DATABASE_URL).
// Every page, story, draft, profile and score is a JSON document in rs_docs, addressed by a path
// such as posts/<slug> or desk/<writer id>/stories/<story id>, the same paths the site already uses.
import './env.js';
import { neon } from '@neondatabase/serverless';
import { SEED } from './seed.js';

let client = null;
export function sql() {
  if (!client) {
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!url) throw httpError(503, 'The database isn’t connected: no DATABASE_URL setting (plain or prefixed) was found. Connect Neon to this Vercel project, then redeploy.');
    client = neon(url);
  }
  return client;
}

export const parentOf = p => p.split('/').slice(0, -1).join('/');
export const lastOf = p => p.split('/').pop();

let ready = null;
// Creates the tables on first use and loads the sample stories into an empty database once.
export function ensureSchema() {
  if (!ready) {
    ready = (async () => {
      const q = sql();
      await q`create table if not exists rs_docs (
        path text primary key,
        parent text not null,
        data jsonb not null,
        updated_at timestamptz not null default now()
      )`;
      await q`create index if not exists rs_docs_parent on rs_docs (parent)`;
      await q`create table if not exists rs_roles (
        user_id text primary key,
        role text not null,
        granted_by text,
        granted_at timestamptz not null default now()
      )`;
      const seeded = await q`select 1 as ok from rs_docs where path = 'meta/seeded'`;
      if (!seeded.length) {
        for (const op of SEED) {
          await q`insert into rs_docs (path, parent, data) values (${op.path}, ${parentOf(op.path)}, ${JSON.stringify(op.data)}::jsonb) on conflict (path) do nothing`;
        }
        await q`insert into rs_docs (path, parent, data) values ('meta/seeded', 'meta', ${JSON.stringify({ at: Date.now(), samples: SEED.length })}::jsonb) on conflict (path) do nothing`;
      }
    })().catch(e => { ready = null; throw e; });
  }
  return ready;
}

export function httpError(status, message, code) {
  const e = new Error(message);
  e.status = status;
  if (code) e.code = code;
  return e;
}

export function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: Object.assign({ 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }, headers)
  });
}

export function fail(e) {
  const status = e && e.status ? e.status : 500;
  if (status >= 500) console.error(e);
  return json({ error: (e && e.message) || 'Server error', code: e && e.code }, status);
}
