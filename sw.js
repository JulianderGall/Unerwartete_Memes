const CACHE_NAME = 'develey-meme-v4'; // WICHTIG: Version hochzählen!

// Hier listen wir ALLE Dateien auf, die offline verfügbar sein müssen
const FILES_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './Develey_Logo_Ecke.png',
    './Bereit%20für%20das%20%23unerwartete_Störer.png',
    './manifest.json',
    /* NEU: Deine heruntergeladenen Variable-Font-Dateien */
    './fonts/Montserrat-VariableFont_wght.ttf',
    './fonts/OpenSans-VariableFont_wdth,wght.ttf'
];
// Installation: Dateien herunterladen und in den Cache legen
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then((cache) => {
            console.log('Dateien werden gecacht...');
            return cache.addAll(FILES_TO_CACHE);
        })
    );
});

// Abrufen: Wenn offline, nimm die Dateien aus dem Cache
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
        .then((response) => {
            // Wenn die Datei im Cache ist, gib sie zurück. Sonst lade sie aus dem Netz.
            return response || fetch(event.request);
        })
    );
});
