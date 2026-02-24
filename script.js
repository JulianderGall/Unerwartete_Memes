/**
 * Develey Meme Generator - Script
 * Fokus: Fehlerresistenz, Branding & weichgezeichnete Effekte
 */

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const snap = document.getElementById('snap');
const resetBtn = document.getElementById('reset');
const headlineInput = document.getElementById('headline');
const photo = document.getElementById('photo');
const resultContainer = document.getElementById('result-container');
const generatorBox = document.querySelector('.generator-box');

// Bildpfade deiner hochgeladenen Dateien
const LOGO_SRC = 'Develey_Logo_Ecke.png'; 
const STOERER_SRC = 'Bereit für das #unerwartete_Störer.png'; 

// 1. Kamera-Zugriff starten (Mobil-Optimiert)
const constraints = {
    video: { 
        facingMode: "user",
        // Hochformat-Anpassung für mobile Geräte
        aspectRatio: window.innerWidth < 800 ? 0.75 : 1.77 
    },
    audio: false
};

if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
        video.srcObject = stream;
        video.play();
    })
    .catch(err => {
        console.error("Kamera-Fehler: ", err);
        alert("Kamera konnte nicht geladen werden. Bitte verwende HTTPS.");
    });
}

// 2. Meme generieren (Button: "Say Develey")
snap.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    
    // Canvas-Größe an den Video-Stream anpassen
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // A) Das Live-Bild auf den Canvas zeichnen
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // B) Headline-Text zeichnen (Extra Fett & Weicher Schatten)
    const text = headlineInput.value || "Wie reagierst du?";
    context.font = "900 65px 'Montserrat', sans-serif"; // Extra Fett
    context.fillStyle = "white";
    context.textAlign = "center";
    
    // Weichgezeichneter Schatten für den Text
    context.shadowColor = "rgba(0, 0, 0, 0.6)";
    context.shadowBlur = 20; 
    context.shadowOffsetX = 4;
    context.shadowOffsetY = 4;
    
    context.fillText(text, canvas.width / 2, 100);

    // C) Branding (Logo & Störer) laden und einfügen
    const logoImg = new Image();
    const stoererImg = new Image();
    
    // CrossOrigin-Einstellung für GitHub Pages
    logoImg.crossOrigin = "anonymous";
    stoererImg.crossOrigin = "anonymous";
    
    logoImg.src = LOGO_SRC;
    stoererImg.src = STOERER_SRC;

    let loadedCount = 0;
    const finalizeImage = () => {
        loadedCount++;
        // Erst wenn beide Bilder verarbeitet wurden (geladen oder Fehler)
        if (loadedCount === 2) {
            // Schatten für Branding-Elemente deaktivieren
            context.shadowBlur = 0;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;
            
            // Logo unten links platzieren (Breite ca. 160px)
            const lWidth = 160;
            const lHeight = (logoImg.height / logoImg.width) * lWidth;
            if (logoImg.complete && logoImg.naturalWidth !== 0) {
                context.drawImage(logoImg, 30, canvas.height - lHeight - 30, lWidth, lHeight);
            }

            // Störer unten rechts platzieren (Breite ca. 280px)
            const sWidth = 280;
            const sHeight = (stoererImg.height / stoererImg.width) * sWidth;
            if (stoererImg.complete && stoererImg.naturalWidth !== 0) {
                context.drawImage(stoererImg, canvas.width - sWidth - 20, canvas.height - sHeight - 20, sWidth, sHeight);
            }

            // Canvas in JPEG umwandeln
            photo.src = canvas.toDataURL('image/jpeg', 0.9);
            
            // Interface umschalten
            generatorBox.style.display = 'none';
            resultContainer.style.display = 'block';
        }
    };

    // Event-Listener für das Laden der Bilder
    logoImg.onload = finalizeImage;
    stoererImg.onload = finalizeImage;
    
    // Fallback: Falls ein Bildpfad falsch ist, wird das Meme trotzdem erstellt
    logoImg.onerror = () => {
        console.warn("Logo konnte nicht geladen werden.");
        finalizeImage();
    };
    stoererImg.onerror = () => {
        console.warn("Störer konnte nicht geladen werden.");
        finalizeImage();
    };
});

// 3. Reset-Funktion: Alles zurück auf Anfang
resetBtn.addEventListener('click', () => {
    location.reload(); 
});
