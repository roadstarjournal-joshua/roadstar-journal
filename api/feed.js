// GET /feed.xml (vercel.json sends it here): RoadStar's latest published stories as an RSS feed, with each
// story's full text. Feed readers use it, and so can AI assistants that can't run the site's JavaScript,
// which is why the newsletter builder's prompt points them here first.
import { sql, ensureSchema } from './_lib/db.js';

const SECTIONS = { news: 'News', reviews: 'Reviews', opinion: 'Opinion', features: 'Features' };
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function mdToBlocks(text) {
  const out = [];
  String(text || '').replace(/\r/g, '').split(/\n\s*\n/).forEach(chunk => {
    const b = chunk.trim(); if (!b) return;
    if (b.startsWith('### ')) out.push({ t: 'h3', x: b.slice(4) });
    else if (b.startsWith('## ')) out.push({ t: 'h2', x: b.slice(3) });
    else if (b.startsWith('> ')) out.push({ t: 'quote', x: b.replace(/^>\s?/gm, '').replace(/\n/g, ' ') });
    else if (/^- /.test(b)) out.push({ t: 'ul', items: b.split('\n').filter(l => /^- /.test(l)).map(l => l.slice(2)) });
    else out.push({ t: 'p', x: b.replace(/\n/g, ' ') });
  });
  return out;
}

function toHtml(p, origin) {
  const abs = u => !u ? '' : /^https?:\/\//.test(u) ? u : origin + '/' + String(u).replace(/^\/+/, '');
  const route = h => { h = h.replace(/^#/, ''); for (const pre of ['story', 'author', 'tag']) if (h.indexOf(pre + '-') === 0) return origin + '/' + pre + '/' + h.slice(pre.length + 1); return origin + '/' + h; };
  const inline = s => esc(s || '')
    .replace(/\[([^\]]+)\]\(((?:https?:\/\/|mailto:)[^\s)]+|#[a-z0-9-]+)\)/g, (m, t, u) => '<a href="' + (u[0] === '#' ? route(u) : u) + '">' + t + '</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
  const credit = c => c && (c.a || c.l) ? ' (' + esc(['Photo: ' + (c.a || ''), c.l].filter(Boolean).join(', ')) + ')' : '';
  const blocks = Array.isArray(p.blocks) ? p.blocks : mdToBlocks(p.body);
  const parts = [];
  if (p.image && p.image.src) parts.push('<p><img src="' + esc(abs(p.image.src)) + '" alt="' + esc(p.image.alt || '') + '"></p>');
  for (const b of blocks) {
    switch (b.t) {
      case 'h2': case 'h3': parts.push('<' + b.t + '>' + inline(b.x) + '</' + b.t + '>'); break;
      case 'quote': parts.push('<blockquote>' + inline(b.x) + '</blockquote>'); break;
      case 'ul': case 'ol': parts.push('<' + b.t + '>' + (b.items || []).map(x => '<li>' + inline(x) + '</li>').join('') + '</' + b.t + '>'); break;
      case 'hr': parts.push('<hr>'); break;
      case 'img': if (b.src) parts.push('<p><img src="' + esc(abs(b.src)) + '" alt="' + esc(b.alt || '') + '"><br>' + esc(b.cap || '') + credit(b.credit) + '</p>'); break;
      case 'gallery': (b.imgs || []).forEach(x => parts.push('<p><img src="' + esc(abs(x.src)) + '" alt="' + esc(x.alt || '') + '"></p>')); break;
      case 'specs': parts.push('<h3>' + esc(b.title || 'Specifications') + '</h3><ul>' + (b.rows || []).filter(r => r[0] || r[1]).map(r => '<li>' + esc(r[0]) + ': ' + esc(r[1]) + '</li>').join('') + '</ul>'); break;
      case 'verdict': parts.push('<h3>The verdict' + (b.score ? ': ' + esc(b.score) + ' out of 10' : '') + '</h3><p>' + esc(b.line || '') + '</p>'
        + ((b.pros || []).filter(Boolean).length ? '<p>What we like:</p><ul>' + b.pros.filter(Boolean).map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>' : '')
        + ((b.cons || []).filter(Boolean).length ? '<p>What we don’t:</p><ul>' + b.cons.filter(Boolean).map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>' : '')); break;
      case 'note': parts.push('<p><strong>' + esc(b.kind || 'Update') + ':</strong> ' + esc(b.x || '') + '</p>'); break;
      default: if (b.x) parts.push('<p>' + inline(b.x) + '</p>');
    }
  }
  return parts.join('\n');
}

export default {
  async fetch(req) {
    try {
      await ensureSchema();
      const origin = new URL(req.url).origin;
      const now = Date.now();
      const rows = await sql()`select path, data from rs_docs where parent = 'posts'`;
      const posts = rows.map(r => Object.assign({ id: String(r.path).split('/').pop() }, r.data || {}))
        .filter(p => typeof p.published === 'number' && p.published <= now)
        .sort((a, b) => b.published - a.published).slice(0, 30);
      const items = posts.map(p => {
        const url = origin + '/story/' + encodeURIComponent(p.id);
        const html = toHtml(p, origin).replace(/]]>/g, ']]&gt;');
        return '  <item>\n'
          + '    <title>' + esc(p.title) + '</title>\n'
          + '    <link>' + esc(url) + '</link>\n'
          + '    <guid isPermaLink="true">' + esc(url) + '</guid>\n'
          + '    <pubDate>' + new Date(p.published).toUTCString() + '</pubDate>\n'
          + '    <dc:creator>' + esc(p.author || 'RoadStar staff') + '</dc:creator>\n'
          + '    <category>' + esc(SECTIONS[p.section] || p.section || 'News') + '</category>\n'
          + (p.tags || []).map(t => '    <category>' + esc(t) + '</category>\n').join('')
          + '    <description>' + esc(p.dek || '') + '</description>\n'
          + '    <content:encoded><![CDATA[' + html + ']]></content:encoded>\n'
          + '  </item>';
      });
      const xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
        + '<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">\n'
        + '<channel>\n'
        + '  <title>RoadStar Journal</title>\n'
        + '  <link>' + esc(origin) + '</link>\n'
        + '  <atom:link href="' + esc(origin + '/feed.xml') + '" rel="self" type="application/rss+xml"/>\n'
        + '  <description>Car news, reviews, opinion and features for drivers, from RoadStar.</description>\n'
        + '  <language>en-us</language>\n'
        + (posts[0] ? '  <lastBuildDate>' + new Date(posts[0].updated || posts[0].published).toUTCString() + '</lastBuildDate>\n' : '')
        + items.join('\n') + '\n</channel>\n</rss>\n';
      return new Response(xml, { headers: {
        'content-type': 'application/rss+xml; charset=utf-8',
        'cache-control': 'public, max-age=0, must-revalidate',
        'vercel-cdn-cache-control': 'max-age=300, stale-while-revalidate=3600',
      } });
    } catch (e) {
      return new Response('Feed unavailable', { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8' } });
    }
  },
};
