/* Service worker do Hub de Consórcios AMG.
   Estratégia: rede primeiro (para você sempre ver a versão mais nova do hub),
   com o cache servindo apenas como reserva quando não há conexão. */
const CACHE = "hub-amg-v1";
const ESSENCIAIS = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ESSENCIAIS)).catch(() => null)
  );
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys().then((chaves) =>
      Promise.all(chaves.filter((c) => c !== CACHE).map((c) => caches.delete(c)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (evento) => {
  const requisicao = evento.request;
  if (requisicao.method !== "GET") return;

  evento.respondWith(
    fetch(requisicao)
      .then((resposta) => {
        const copia = resposta.clone();
        caches.open(CACHE).then((cache) => cache.put(requisicao, copia)).catch(() => null);
        return resposta;
      })
      .catch(() =>
        caches.match(requisicao).then((cacheada) => cacheada || caches.match("./index.html"))
      )
  );
});
