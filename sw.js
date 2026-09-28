/* Mersi Dashboard — เก็บหน้าแอปไว้ในเครื่อง ให้เปิดเร็วและเปิดได้ตอนเน็ตไม่ดี (ข้อมูลตัวเลขเก็บแยกในแอป) */
const CACHE = 'mersi-app-v19';
const SHELL = ['./', 'index.html', 'config.js?v=9', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'logo.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || /script\.google/.test(u.host)) return;          // API ไม่ผ่าน cache
  if (u.origin === location.origin) {                                                 // หน้าแอป: เปิดจากของในเครื่องทันที แล้วอัปเดตเบื้องหลัง (เวอร์ชันใหม่ขึ้นในการเปิดครั้งถัดไป)
    const net = fetch(e.request, { cache: 'no-cache' }).then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); } return r; });
    e.waitUntil(net.catch(() => {}));
    e.respondWith(caches.match(e.request, { ignoreSearch: u.pathname.endsWith('/') || u.pathname.endsWith('index.html') })
      .then(r => r || net.catch(() => caches.match('index.html'))));
  } else if (/cdnjs|fonts\.(googleapis|gstatic)/.test(u.host)) {                      // ไลบรารีกราฟ/ฟอนต์: ใช้ของในเครื่องก่อน
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => { const c = res.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); return res; })));
  }
});
