// GET /sitemap.xml (vercel.json sends it here): the list of public pages search engines should read.
// Built from the database each time, so new stories appear without any extra step.
// Only published stories are listed; drafts, scheduled stories and staff pages never are.
import { sql, ensureSchema } from './_lib/db.js';

const PAGES = ['/', '/news', '/reviews', '/opinion', '/features', '/ten-tenths', '/crossword',
  '/about', '/contact', '/terms', '/privacy', '/credits'];
const xmlEsc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const day = ms => new Date(ms).toISOString().slice(0, 10);

export default {
  async fetch(req) {
    try {
      await ensureSchema();
      const origin = new URL(req.url).origin;
      const rows = await sql()`select path, data from rs_docs where parent = 'posts'`;
      const now = Date.now();
      const stories = rows
        .map(r => ({ id: String(r.path).split('/').pop(), d: r.data || {} }))
        .filter(p => typeof p.d.published === 'number' && p.d.published <= now)
        .sort((a, b) => b.d.published - a.d.published);
      const urls = PAGES.map(p => '  <url><loc>' + xmlEsc(origin + p) + '</loc></url>');
      for (const p of stories) {
        urls.push('  <url><loc>' + xmlEsc(origin + '/story/' + encodeURIComponent(p.id)) + '</loc><lastmod>' +
          day(Math.max(p.d.updated || 0, p.d.published)) + '</lastmod></url>');
      }
      const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.join('\n') + '\n</urlset>\n';
      return new Response(xml, { headers: {
        'content-type': 'application/xml; charset=utf-8',
        'cache-control': 'public, max-age=0, must-revalidate',
        'vercel-cdn-cache-control': 'max-age=600, stale-while-revalidate=3600',
      } });
    } catch (e) {
      return new Response('Sitemap unavailable', { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8' } });
    }
  },
};
