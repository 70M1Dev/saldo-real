// Saldo Real: deja la app disponible sin conexión.
const CACHE="saldo-real-v1";
const BASE=["./","manifest.webmanifest","icon-180.png","icon-192.png","icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(BASE)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;
  // La página: primero la red (para recibir actualizaciones), sin conexión la copia guardada.
  if(r.mode==="navigate"){
    e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put("./",cp));return res}).catch(()=>caches.match("./")));
    return;
  }
  // Íconos y tipografías: la copia guardada, y se refresca de fondo.
  e.respondWith(caches.match(r).then(hit=>{
    const red=fetch(r).then(res=>{if(res&&(res.ok||res.type==="opaque")){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res}).catch(()=>hit);
    return hit||red;
  }));
});
