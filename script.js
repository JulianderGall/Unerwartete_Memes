/**
 * Develey Meme Generator - Script
 * Fokus: Mobiloptimierung, Hochformat & Branding-Integration
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

// 1. Kamera-Zugriff mit Fokus auf Hochformat bei Mobilgeräten
const isMobile = window.innerWidth < 800;
const constraints = {
    video: {
        facingMode: "user",
        // Auf dem Handy erzwingen wir ein Hochformat (z.B. 3:4)
        aspectRatio: isMobile ? 0.75 : 1.77 
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
        alert("Kamera konnte nicht geladen werden. Bitte stelle sicher, dass du HTTPS nutzt.");
    });
}

// 2. Meme generieren beim Klick auf den Button
snap.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    
    // Canvas-Größe an den Video-Stream anpassen
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // A) Das Live-Bild vom Video auf den Canvas zeichnen
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // B) Headline-Text zeichnen
    // Text aus dem Input holen oder Standard-Text setzen
    const text = headlineInput.value || "Moment des Unerwarteten";
    
    // Styling: Extra Fett (900) & groß
    context.font = "900 65px 'Montserrat', sans-serif";
    context.fillStyle = "white";
    context.textAlign = "center";
    
    // Weichgezeichneter, tiefer Schatten für bessere Lesbarkeit
    context.shadowColor = "rgba(0, 0, 0, 0.6)";
    context.shadowBlur = 20; 
    context.shadowOffsetX = 4;
    context.shadowOffsetY = 4;
    
    // Text oben zentriert positionieren
    context.fillText(text, canvas.width / 2, 100);

    // C) Branding (Logo & Störer) hinzufügen
    const logoImg = new Image();
    const stoererImg = new Image();
    
    // Wichtig für lokale Tests und GitHub Pages
    logoImg.crossOrigin = "anonymous";
    stoererImg.crossOrigin = "anonymous";
    
    logoImg.src = LOGO_SRC;
    stoererImg.src = STOERER_SRC;

    let loadedCount = 0;
    const finalizeImage = () => {
        loadedCount++;
        // Erst wenn beide Bilder geladen sind, wird das Meme fertiggestellt
        if (loadedCount === 2) {
            // Schatten für die Logos deaktivieren
            context.shadowBlur = 0;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;
            
            // Logo unten links platzieren (ca. 160px breit)
            const lWidth = 160;
            const lHeight = (logoImg.height / logoImg.width) * lWidth;
            context.drawImage(logoImg, 30, canvas.height - lHeight - 30, lWidth, lHeight);

            // Störer unten rechts platzieren (ca. 280px breit)
            const sWidth = 280;
            const sHeight = (stoererImg.height / stoererImg.width) * sWidth;
            context.drawImage(stoererImg, canvas.width - sWidth - 20, canvas.height - sHeight - 20, sWidth, sHeight);

            // Canvas in Bild umwandeln und anzeigen
            photo.src = canvas.toDataURL('image/jpeg', 0.9);
            
            // Interface umschalten
            generatorBox.style.display = 'none';
            resultContainer.style.display = 'block';
        }
    };

    logoImg.onload = finalizeImage;
    stoererImg.onload = finalizeImage;
    
    // Fallback: Falls ein Bild nicht geladen werden kann, trotzdem das Foto zeigen
    logoImg.onerror = finalizeImage;
    stoererImg.onerror = finalizeImage;
});

// 3. Reset-Funktion: Alles zurück auf Anfang
resetBtn.addEventListener('click', () => {
    // Einfachster Weg für einen sauberen Neustart der Kamera und Felder
    location.reload(); 
});
