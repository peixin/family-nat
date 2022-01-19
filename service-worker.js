const version = "0.0.2";
const cacheName = `site-cache-v${version}`;
const filesToCache = ["/"];

self.addEventListener("install", (event) => {
  console.log("[ServiceWorker] Install");
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      console.log("[ServiceWorker] Caching app shell");
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  console.log("[ServiceWorker] Fetch", event.request.url);
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      const fetchRequest = event.request.clone();
      return fetch(fetchRequest).then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(cacheName).then((cache) => {
          if (!(event.request.url.indexOf("http") === 0)) return;
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keyList) {
      return Promise.all(
        keyList.map(function (key) {
          if (cacheName.indexOf(key) === -1) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});
