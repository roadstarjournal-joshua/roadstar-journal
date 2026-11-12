// Vercel adds these settings when Neon and Blob are connected to the project. If a prefix was typed
// when connecting (RoadStar's Neon connection used RSJ_), every name starts with it: RSJ_DATABASE_URL
// instead of DATABASE_URL. This file finds each setting under either name and copies it to the plain
// name, so the rest of the code (and the Blob library) can use the standard names.
// It only ever reports variable NAMES (for /api/health), never their values.

const WANTED = [
  // name the code uses      other names it may arrive under                 check on the value
  ['DATABASE_URL',          ['DATABASE_URL', 'POSTGRES_URL'],                 v => /^postgres(ql)?:\/\//i.test(v)],
  ['NEON_AUTH_BASE_URL',    ['NEON_AUTH_BASE_URL', 'NEON_AUTH_URL', 'VITE_NEON_AUTH_URL'], v => /^https?:\/\//i.test(v)],
  ['BLOB_READ_WRITE_TOKEN', ['BLOB_READ_WRITE_TOKEN', 'READ_WRITE_TOKEN'],    v => /^vercel_blob_rw_/i.test(v)],
  ['BLOB_STORE_ID',         ['BLOB_STORE_ID', 'STORE_ID'],                    v => /^(store_)?[a-z0-9]+$/i.test(v)],
];

export const found = {};

function pick(names, ok) {
  // 1. the plain name, exactly as the docs give it
  for (const n of names) { const v = process.env[n]; if (v && ok(v)) return n; }
  // 2. the same name with a prefix in front (RSJ_DATABASE_URL); shortest name wins
  const keys = Object.keys(process.env).sort((a, b) => a.length - b.length);
  for (const n of names) {
    const k = keys.find(k => k.endsWith('_' + n) && process.env[k] && ok(process.env[k]));
    if (k) return k;
  }
  return null;
}

for (const [target, names, ok] of WANTED) {
  const key = pick(names, ok);
  found[target] = key;
  if (key && key !== target) process.env[target] = process.env[key];
}

// Names (never values) of every setting that looks like it came from Neon or Blob, for the health check.
export function relatedNames() {
  return Object.keys(process.env)
    .filter(k => /(DATABASE|POSTGRES|PG(HOST|USER|DATABASE|PASSWORD)|NEON|BLOB|STORE_ID|READ_WRITE_TOKEN)/i.test(k))
    .sort();
}
