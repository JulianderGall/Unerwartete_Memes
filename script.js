/**
 * script.js - Finale Version
 * Fokus: Bündiges Logo (0,0), bündiger Störer & zweizeilige Headline
 */

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const snap = document.getElementById('snap');
const resetBtn = document.getElementById('reset');
const headlineInput = document.getElementById('headline');
const photo = document.getElementById('photo');
const resultContainer = document.getElementById('result-container');
const generatorBox = document.querySelector('.generator-box');

// Bildquellen (Pfade aus deinem Repository)
const LOGO_SRC = 'Develey_Logo_Ecke.png';
// Fix: Das '#' im Dateinamen muss als '%23' maskiert werden
const STOERER_SRC = 'Bereit für das %23unerwartete_Störer.png';

// 1. Kamera-Zugriff starten (Mobil-Optimiert)
const constraints = {
    video: { 
        facingMode: "user",
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
    });
}

// Hilfsfunktion für den automatischen Textumbruch (Zweizeilig)
function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let metrics = context.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
            context.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    context.fillText(line, x, y);
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
    context.font = "900 60px 'Montserrat', sans-serif";
    context.fillStyle = "white";
    context.textAlign = "left"; 
    
    // Weichgezeichneter Schatten für den Text
    context.shadowColor = "rgba(0, 0, 0, 0.7)";
    context.shadowBlur = 20; 
    context.shadowOffsetX = 4;
    context.shadowOffsetY = 4;
    
    // Headline rückt nach rechts (x=350), um dem bündigen Logo Platz zu machen
    wrapText(context, text, 350, 95, canvas.width - 380, 65);

    // C) Branding (Logo & Störer) laden
    const logoImg = new Image();
    const stoererImg = new Image();
    
    logoImg.crossOrigin = "anonymous";
    stoererImg.crossOrigin = "anonymous";
    
    logoImg.src = LOGO_SRC;
    stoererImg.src = STOERER_SRC;

    let loadedCount = 0;
    const finalizeImage = () => {
        loadedCount++;
        if (loadedCount === 2) {
            // Schatten für Branding-Elemente (weichgezeichnet)
            context.shadowColor = "rgba(0, 0, 0, 0.4)";
            context.shadowBlur = 12;
            context.shadowOffsetX = 5;
            context.shadowOffsetY = 5;
            
            // LOGO OBEN LINKS - Absolut bündig (0, 0) und vergrößert
            const lWidth = canvas.width * 0.30; 
            const lHeight = (logoImg.height / logoImg.width) * lWidth;
            context.drawImage(logoImg, 0, 0, lWidth, lHeight);

            // STÖRER UNTEN RECHTS - Absolut bündig zum Rand
            const sWidth = 340;
            const sHeight = (stoererImg.height / stoererImg.width) * sWidth;
            context.drawImage(stoererImg, canvas.width - sWidth, canvas.height - sHeight, sWidth, sHeight);

            // Ergebnis anzeigen
            photo.src = canvas.toDataURL('image/jpeg', 0.9);
            generatorBox.style.display = 'none';
            resultContainer.style.display = 'block';
        }
    };

    logoImg.onload = finalizeImage;
    stoererImg.onload = finalizeImage;
    
    // Fallback bei Ladefehlern
    logoImg.onerror = finalizeImage;
    stoererImg.onerror = finalizeImage;
});

// 3. Reset-Funktion
resetBtn.addEventListener('click', () => {
    location.reload(); 
});
