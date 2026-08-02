self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : { title: "Meme AI signal", body: "A tracked token crossed your alert threshold." };
  event.waitUntil(self.registration.showNotification(data.title, { body: data.body, icon: "/favicon.svg", badge: "/favicon.svg", data: data.url || "/scanner" }));
});
self.addEventListener("notificationclick", (event) => { event.notification.close(); event.waitUntil(clients.openWindow(event.notification.data || "/")); });
