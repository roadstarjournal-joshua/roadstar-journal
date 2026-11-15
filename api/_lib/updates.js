// One-time content updates for a database that was filled before a change.
// db.js runs each update once, in order, and records it at meta/update-<id>.
// Every step is also safe to repeat, in case two servers start at the same moment.
import { WELCOME_OLD_LINE, WELCOME_NEW_LINE, NEWS } from './content-2026-11-14.js';

export const UPDATES = [
  {
    id: '2026-11-14-launch',
    async run(q) {
      // 1. No story is labelled "Sample post" any more.
      await q`update rs_docs set data = jsonb_set(data, '{sample}', 'false'::jsonb), updated_at = now()
              where data->>'sample' = 'true'`;
      // 2. The Welcome story stops calling the site a draft (left alone if someone has edited that line).
      await q`update rs_docs
              set data = jsonb_set(data, '{body}', to_jsonb(replace(data->>'body', ${WELCOME_OLD_LINE}::text, ${WELCOME_NEW_LINE}::text))), updated_at = now()
              where path = 'posts/welcome-to-roadstar' and strpos(coalesce(data->>'body', ''), ${WELCOME_OLD_LINE}::text) > 0`;
      // 3. This week's five news stories, published as of now, newest first, half an hour apart.
      const now = Date.now();
      for (let i = 0; i < NEWS.length; i++) {
        const t = now - i * 30 * 60 * 1000;
        const data = Object.assign({}, NEWS[i].data, { published: t, updated: t });
        await q`insert into rs_docs (path, parent, data) values (${NEWS[i].path}, 'posts', ${JSON.stringify(data)}::jsonb)
                on conflict (path) do nothing`;
      }
    },
  },
];
