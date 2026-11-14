'use strict';

const cacheName = 'ondas-shell-v1';
const offlinePage = new URL('./', self.registration.scope).href;

self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.add(offlinePage)));
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  if (event.request.mode !== 'navigate' || event.request.url !== offlinePage) return;
  event.respondWith(fetch(event.request).catch(async () => {
    const cachedPage = await caches.match(offlinePage, {cacheName});
    return cachedPage || new Response('Conecte-se à internet para abrir o Ondas de Fortaleza.', {
      status: 503,
      headers: {'Content-Type': 'text/plain; charset=utf-8'}
    });
  }));
});
