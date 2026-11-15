// RoadStar live data layer. The site reads and saves through window.claude.use('db' | 'user' | 'assets');
// on roadstarjournal.com those calls go to the server functions in /api, which use Neon (stories,
// profiles, scores), Neon Auth (staff sign-in) and Vercel Blob (photos). Nothing is kept in the browser.
(function () {
  'use strict';
  window.RS_LIVE = true;
  var API = '/api';
  var LEVEL = { reader: 1, writer: 2, editor: 3, owner: 3 };
  var state = null;

  function fetchJSON(url, opts) {
    var o = Object.assign({ credentials: 'same-origin' }, opts || {});
    o.headers = Object.assign({ accept: 'application/json' }, (opts && opts.headers) || {});
    return fetch(url, o).then(function (r) {
      return r.text().then(function (t) {
        var j = null; try { j = t ? JSON.parse(t) : null; } catch (e) {}
        if (!r.ok) {
          var e = new Error((j && (j.error || j.message)) || ('Request failed (' + r.status + ')'));
          e.status = r.status; e.code = j && j.code; e.body = j; throw e;
        }
        return j;
      });
    });
  }
  function post(url, body) { return fetchJSON(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body || {}) }); }

  var statePromise = fetchJSON(API + '/me').catch(function () { return { signedIn: false, user: null, role: null }; });
  statePromise.then(function (s) { state = s; });
  function level() { return state && state.role ? LEVEL[state.role] || 0 : 0; }
  function signedIn() { return !!(state && state.signedIn); }
  // signed-in requests skip the shared edge cache, so staff always see their latest changes
  function fresh() { return signedIn() ? '&fresh=' + Date.now() : ''; }
  function permErr(e) { if (e && (e.status === 401 || e.status === 403)) { var x = new Error('permission-denied'); x.code = 'permission-denied'; return x; } return e; }

  // ---------- db ----------
  var subs = [];
  function snapOf(docs) {
    var ds = (docs || []).map(function (d) { return { id: d.id, exists: true, data: function () { return d.data; } }; });
    return { docs: ds, size: ds.length, empty: !ds.length };
  }
  function list(coll, ord, lim) {
    return statePromise.then(function () {
      var q = 'op=list&coll=' + encodeURIComponent(coll) + (ord ? '&order=' + encodeURIComponent(ord[0]) + '&dir=' + (ord[1] === 'desc' ? 'desc' : 'asc') : '') + (lim ? '&limit=' + lim : '');
      return fetchJSON(API + '/db?' + q + fresh());
    }).then(function (j) { return snapOf(j && j.docs); });
  }
  function refreshSub(s) {
    return list(s.coll, s.ord, s.lim).then(function (snap) {
      var key = JSON.stringify(snap.docs.map(function (d) { return [d.id, d.data()]; }));
      if (key !== s.last) { s.last = key; s.next(snap); }
    }).catch(function (e) { if (s.err && !s.failed) { s.failed = true; s.err(permErr(e)); } });
  }
  function touched(path) {
    var parent = path.split('/').slice(0, -1).join('/');
    subs.forEach(function (s) { if (s.coll === parent) refreshSub(s); });
  }
  function collection(path) {
    var ord = null, lim = null;
    var q = {
      orderBy: function (f, d) { ord = [f, d || 'asc']; return q; },
      limit: function (n) { lim = n; return q; },
      where: function () { return q; },
      doc: function (id) { return doc(path + '/' + id); },
      get: function () { return list(path, ord, lim).catch(function (e) { throw permErr(e); }); },
      onSnapshot: function (next, err) {
        var s = { coll: path, ord: ord, lim: lim, next: next, err: err, last: null };
        subs.push(s); refreshSub(s);
        return function () { var i = subs.indexOf(s); if (i >= 0) subs.splice(i, 1); };
      }
    };
    return q;
  }
  function write(op, path, data) {
    return statePromise.then(function () { return post(API + '/db', { op: op, path: path, data: data }); })
      .then(function () { touched(path); })
      .catch(function (e) { throw permErr(e); });
  }
  function doc(path) {
    var id = path.split('/').pop();
    return {
      id: id, path: path,
      get: function () {
        return statePromise.then(function () { return fetchJSON(API + '/db?op=get&path=' + encodeURIComponent(path) + fresh()); })
          .then(function (j) { return { id: id, exists: !!(j && j.exists), data: function () { return j && j.exists ? j.data : undefined; } }; })
          .catch(function (e) { throw permErr(e); });
      },
      set: function (d) { return write('set', path, d); },
      update: function (d) { return write('update', path, d); },
      delete: function () { return write('delete', path); }
    };
  }
  // staff see changes from colleagues every 30 seconds; readers get fresh stories each time they come back to the page
  setInterval(function () { if (!document.hidden && level() >= 2) subs.forEach(refreshSub); }, 30000);
  var hiddenAt = 0;
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) hiddenAt = Date.now();
    else if (hiddenAt && Date.now() - hiddenAt > 5 * 60000) subs.forEach(refreshSub);
  });
  var db = { collection: collection, doc: doc };

  // ---------- user ----------
  var user = {
    isOwner: function () { return statePromise.then(function () { return !!state && state.role === 'owner'; }); },
    canEdit: function () { return statePromise.then(function () { return level() >= 3; }); },
    can: function () { return statePromise.then(function () { return level() >= 2; }); },
    id: function () { return statePromise.then(function () { return signedIn() && state.user ? state.user.id : null; }); },
    me: function () { return statePromise.then(function () { return state && state.user ? { id: state.user.id, name: state.user.name || state.user.email } : null; }); },
    profiles: function (ids) {
      if (!ids || !ids.length) return Promise.resolve({});
      return fetchJSON(API + '/me?profiles=' + encodeURIComponent(ids.join(','))).then(function (j) { return (j && j.profiles) || {}; });
    },
    search: function () { return Promise.resolve([]); }
  };

  // ---------- photo uploads ----------
  function shrink(file) {
    return new Promise(function (res, rej) {
      if (/^image\/gif$/i.test(file.type)) { res(file); return; }
      var url = URL.createObjectURL(file); var img = new Image();
      img.onload = function () {
        var w = img.naturalWidth, h = img.naturalHeight, k = Math.min(1, 2000 / Math.max(w, h));
        var c = document.createElement('canvas'); c.width = Math.round(w * k); c.height = Math.round(h * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
        c.toBlob(function (b) { if (b) res(b); else rej(new Error('That photo couldn’t be prepared for upload.')); }, 'image/jpeg', 0.86);
      };
      img.onerror = function () { URL.revokeObjectURL(url); rej(new Error('That file isn’t an image this browser can open.')); };
      img.src = url;
    });
  }
  var assets = {
    upload: function (file) {
      return shrink(file).then(function (b) {
        return fetchJSON(API + '/upload', { method: 'POST', headers: { 'content-type': b.type || 'image/jpeg', 'x-filename': encodeURIComponent(file.name || 'photo') }, body: b });
      });
    }
  };

  window.claude = {
    use: function (n) {
      return statePromise.then(function () { return n === 'db' ? db : n === 'user' ? user : n === 'assets' ? (level() >= 2 ? assets : null) : null; });
    }
  };

  // ---------- sign-in (used by the staff page) ----------
  function auth(path, body) { return post(API + '/auth?p=' + encodeURIComponent(path), body); }
  // Email sign-up (newsletter and reader-account news): saves the address and the reader's choices.
  window.RS_SUBSCRIBE = function (d) { return post(API + '/subscribe', d); };
  window.RS_AUTH = {
    now: function () { return state; },
    state: function () { return statePromise; },
    refresh: function () { return fetchJSON(API + '/me').then(function (s) { state = s; return s; }); },
    signIn: function (email, password) { return auth('sign-in/email', { email: email, password: password, rememberMe: true }); },
    signUp: function (name, email, password) { return auth('sign-up/email', { name: name, email: email, password: password }); },
    sendCode: function (email, type) { return auth('email-otp/send-verification-otp', { email: email, type: type || 'email-verification' }); },
    verify: function (email, otp) { return auth('email-otp/verify-email', { email: email, otp: otp }); },
    resetPassword: function (email, otp, password) { return auth('email-otp/reset-password', { email: email, otp: otp, password: password }); },
    signOut: function () { return auth('sign-out', {}); },
    signups: {
      list: function () { return fetchJSON(API + '/subscribers?fresh=' + Date.now()); },
      csvUrl: API + '/subscribers?format=csv',
      unsubscribe: function (email) { return post(API + '/subscribers', { action: 'unsubscribe', email: email }); },
      remove: function (email) { return post(API + '/subscribers', { action: 'delete', email: email }); }
    },
    team: {
      list: function () { return fetchJSON(API + '/team?fresh=' + Date.now()); },
      setRole: function (userId, role) { return post(API + '/team', { action: 'role', userId: userId, role: role }); },
      create: function (d) { return post(API + '/team', Object.assign({ action: 'create' }, d)); }
    }
  };
})();
