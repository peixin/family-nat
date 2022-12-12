if (('standalone' in navigator) && (!navigator.standalone)) {
  import('https://unpkg.com/pwacompat');
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register('./service-worker.js')
    .then(() => console.log('Service Worker Registered'))
    .catch((err) => console.log('ServiceWorker registration failed:', err));
}