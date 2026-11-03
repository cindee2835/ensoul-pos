// ENSOUL POS — เก็บหน้าเปิดแอปไว้ในเครื่อง เพื่อให้กดไอคอนแล้วเปิดได้ทันที และขึ้นข้อความเมื่อไม่มีอินเทอร์เน็ต
// ข้อมูลขายทั้งหมดยังส่งตรงไป Google Sheet ไม่ได้เก็บไว้ที่นี่
var CACHE = 'ensoul-shell-v1';
var SHELL = ['./', './index.html', './config.js', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png', './icons/favicon-32.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
// ไฟล์ของหน้าเปิดแอป: ดึงใหม่จากเว็บก่อน (จะได้อัปเดตเสมอ) ถ้าไม่มีเน็ตใช้ฉบับที่เก็บไว้
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(fetch(req).then(function (res) {
    if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
    return res;
  }).catch(function () {
    return caches.match(req, { ignoreSearch: true }).then(function (hit) { return hit || caches.match('./index.html'); });
  }));
});
