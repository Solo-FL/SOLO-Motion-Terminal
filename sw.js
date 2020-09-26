// Copyright: (c) 2020, SOLO motors controllers project
// GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)

self.addEventListener("install", e =>{
    console.log("SW Inatalled");
    
    e.waitUntil(
        caches.open("static").then (cache => {

            return cache.addAll(["./", "./assets/css/master.css","./assets/img/logo192.png"]);
        })
    );
});

self.addEventListener("fetch", e => {
    console.log(`Intercepting fetch request for: ${e.request.url}`);
    e.respondWith(
        caches.match(e.request).then(respone => {
            return respone || fetch(e.request);  
        })
    )
});