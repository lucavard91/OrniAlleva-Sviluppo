const OB_CACHE = "ornialleva-development-20261112-fresh-pages";
const OB_STATIC = [
  "./",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
  "./favicon-32.png",
  "./favicon-16.png",
  "./ob_asset_051_3aefa10cbb.jpg",
  "./ornibreed_home_banner_v2.png",
  "./OrniAlleva_Banner_Interno.png?v=20261101",
  "./ornibreed_impostazioni_v2.png?v=20261110-icons",
  "./mostra_di_uccelli_ornamentali.png?v=20261110-icons",
  "./ob_asset_051_3aefa10cbb.jpg?oa=20261028-admin-return",
  "./ornialleva_icona_guida.png?v=20261102-icons1",
  "./ornialleva_icona_moduli_stampa.png?v=20261102-icons1"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(OB_CACHE).then(cache => cache.addAll(OB_STATIC)).then(()=>self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>(k.startsWith("ornibreed-") || k.startsWith("ornialleva-development-")) && k!==OB_CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const req=event.request;
  if(req.method!=="GET") return;
  const url=new URL(req.url);

  // Never cache Supabase/API calls: user data must remain authoritative online.
  if(url.hostname.includes("supabase.co")) return;

  if(req.mode==="navigate"){
    event.respondWith((async()=>{
      try{
        const fresh=await fetch(req);
        const cache=await caches.open(OB_CACHE);
        if(url.pathname.endsWith("/") || url.pathname.endsWith("/index.html")) cache.put("./",fresh.clone()).catch(()=>{});
        return fresh;
      }catch(e){
        if(url.pathname.endsWith("/") || url.pathname.endsWith("/index.html")) return (await caches.match("./")) || Response.error();
        return Response.error();
      }
    })());
    return;
  }

  // HTML pages must always be fetched fresh, including admin.html.
  if(url.origin===self.location.origin && /\.html$/i.test(url.pathname)){
    event.respondWith(fetch(req,{cache:"no-store"}));
    return;
  }

  // Versioned static assets and CDN libraries: cache-first.
  if(url.origin===self.location.origin || url.hostname==="cdn.jsdelivr.net" || url.hostname==="cdnjs.cloudflare.com"){
    event.respondWith((async()=>{
      const cached=await caches.match(req);
      if(cached) return cached;
      const fresh=await fetch(req);
      if(fresh && (fresh.ok || fresh.type==="opaque")){
        const cache=await caches.open(OB_CACHE);
        cache.put(req,fresh.clone()).catch(()=>{});
      }
      return fresh;
    })());
  }
});
