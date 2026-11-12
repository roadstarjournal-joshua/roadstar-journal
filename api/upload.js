// Photo uploads from the writer's desk go into the public Vercel Blob store.
//   POST /api/upload  (body: the image; headers: content-type, x-filename)  -> { id, url, sizeBytes, contentType }
import { put } from '@vercel/blob';
import { json, fail, httpError } from './_lib/db.js';
import { context } from './_lib/auth.js';
import { level } from './_lib/rules.js';

export default {
  async fetch(req) {
    try {
      if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
      const ctx = await context(req);
      if (level(ctx) < 2) throw httpError(ctx.uid ? 403 : 401, 'Only staff can upload photos.', 'permission-denied');
      const type = (req.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
      if (!/^image\/(jpeg|png|webp|gif)$/.test(type)) throw httpError(415, 'Upload a JPEG, PNG, WebP or GIF image.');
      const body = Buffer.from(await req.arrayBuffer());
      if (!body.length) throw httpError(400, 'The file was empty.');
      if (body.length > 4 * 1024 * 1024) throw httpError(413, 'That photo is over 4 MB. Try a smaller copy.');
      let name = 'photo';
      try { name = decodeURIComponent(req.headers.get('x-filename') || 'photo'); } catch (e) {}
      name = name.toLowerCase().replace(/\.[a-z0-9]+$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'photo';
      const ext = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' }[type];
      let blob;
      try {
        blob = await put('photos/' + name + '.' + ext, body, { access: 'public', contentType: type, addRandomSuffix: true });
      } catch (e) {
        console.error('blob put failed', e);
        throw httpError(503, 'Photo storage isn’t connected: in Vercel, open Storage, create a public Blob store, connect it to this project, then redeploy. (' + (e.message || 'upload failed') + ')');
      }
      return json({ id: blob.pathname, url: blob.url, sizeBytes: body.length, contentType: type });
    } catch (e) {
      return fail(e);
    }
  }
};
