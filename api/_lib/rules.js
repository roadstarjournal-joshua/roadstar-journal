// Who can read and change what. These run on the server for every request, whatever the page does.
//   posts/<slug>                      published stories: everyone reads (once their time has come); editors and the owner write
//   desk/<uid>/stories/<id>[/versions/<v>]  drafts: the writer who owns the folder, editors and the owner
//   staff/<uid>                       profiles: everyone reads; the owner, or the staff member for their own profile
//   scores/<uid>                      game scores: everyone reads; each signed-in player writes their own
//   meta/...                          site records: editors and the owner read; only the server writes
export const LEVEL = { reader: 1, writer: 2, editor: 3, owner: 3 };
export const level = ctx => (ctx && ctx.role ? LEVEL[ctx.role] || 0 : 0);

const SEG = /^[A-Za-z0-9_.~-]{1,120}$/;
export function validPath(p, kind) {
  if (typeof p !== 'string' || p.length > 600) return false;
  const s = p.split('/');
  if (!s.every(x => SEG.test(x) && x !== '.' && x !== '..')) return false;
  if (kind === 'doc') return s.length % 2 === 0;
  if (kind === 'coll') return s.length % 2 === 1;
  return true;
}

export function canRead(path, ctx) {
  const s = path.split('/'); const lv = level(ctx);
  if (s[0] === 'desk' || s[0] === 'drafts') return lv >= 3 || (lv >= 2 && !!ctx.uid && s[1] === ctx.uid);
  if (s[0] === 'meta') return lv >= 3;
  return ['posts', 'staff', 'scores'].includes(s[0]);
}

export function canWrite(path, ctx) {
  const s = path.split('/'); const lv = level(ctx); const self = !!ctx.uid && s[1] === ctx.uid;
  if (s[0] === 'posts' || s[0] === 'drafts') return lv >= 3;
  if (s[0] === 'desk') return lv >= 3 || (lv >= 2 && self);
  if (s[0] === 'staff') return ctx.role === 'owner' || (lv >= 2 && self);
  if (s[0] === 'scores') return !!ctx.uid && self && s.length === 2;
  return false;
}

// A published story stays hidden from readers until its publish time.
export const visible = d => !d || d.published == null || Number(d.published) <= Date.now();
