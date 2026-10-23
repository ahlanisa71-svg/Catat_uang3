const CACHE='catatuang-v3';
const SHELL=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
const FONT_HOSTS=['fonts.googleapis.com','fonts.gstatic.com'];
self.addEventListener('install',e=>{
  /* simpan satu per satu; kalau ada file yang gagal, yang lain tetap tersimpan */
  e.waitUntil(caches.open(CACHE).then(c=>Promise.all(SHELL.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET')return;
  /* font Google: pakai cache dulu, perbarui di belakang */
  if(FONT_HOSTS.includes(u.hostname)){
    e.respondWith(caches.open(CACHE).then(c=>c.match(r).then(m=>{
      const f=fetch(r).then(res=>{c.put(r,res.clone());return res}).catch(()=>m);
      return m||f})));
    return;
  }
  if(u.origin!==location.origin)return; /* Supabase dll. tidak lewat cache */
  e.respondWith(fetch(r).then(res=>{
    if(res&&res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}
    return res;
  }).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match('./index.html')||caches.match('./'))));
});
