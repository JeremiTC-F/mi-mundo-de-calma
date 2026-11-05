var VERSION = 'mmc-v9';
var NUCLEO = ['./', 'index.html', 'styles.css', 'script.js', 'supabase-config.js'];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(VERSION).then(function(c){ return c.addAll(NUCLEO); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){ return k !== VERSION; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});

function porRango(req, res){
  var m = /bytes=(\d+)-(\d*)/.exec(req.headers.get('range') || '');
  if (!m) return Promise.resolve(res);
  return res.clone().arrayBuffer().then(function(b){
    var ini = +m[1], fin = m[2] ? Math.min(+m[2], b.byteLength - 1) : b.byteLength - 1;
    return new Response(b.slice(ini, fin + 1), { status: 206, headers: {
      'Content-Type': res.headers.get('Content-Type') || 'audio/mpeg',
      'Content-Range': 'bytes ' + ini + '-' + fin + '/' + b.byteLength, 'Content-Length': String(fin - ini + 1) } });
  });
}

self.addEventListener('fetch', function(e){
  var r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  if (u.pathname.indexOf('/assets/') !== -1) {
    e.respondWith(caches.open(VERSION).then(function(c){
      return c.match(u.pathname).then(function(hit){
        if (hit) return porRango(r, hit);
        return fetch(u.pathname).then(function(res){
          if (res.ok && res.status === 200) c.put(u.pathname, res.clone());
          return porRango(r, res);
        });
      });
    }).catch(function(){ return fetch(r); }));
    return;
  }
  e.respondWith(fetch(r).then(function(res){
    if (res.ok && res.type === 'basic') { var cp = res.clone(); caches.open(VERSION).then(function(c){ c.put(r, cp); }); }
    return res;
  }).catch(function(){ return caches.match(r, { ignoreSearch: true }).then(function(h){ return h || caches.match('index.html'); }); }));
});
