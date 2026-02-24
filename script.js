/**
 * script.js - Develey Meme Generator
 * Anpassungen: Logo-Größe, Text-Shadow, Headline-Position & Störer-Fix
 */

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const snap = document.getElementById('snap');
const resetBtn = document.getElementById('reset');
const headlineInput = document.getElementById('headline');
const photo = document.getElementById('photo');
const resultContainer = document.getElementById('result-container');
const generatorBox = document.querySelector('.generator-box');

// Bildpfade
const LOGO_SRC = 'Develey_Logo_Ecke.png';
// Fix für Sonderzeichen: Das '#' muss für URLs mit %23 maskiert werden
const STOERER_SRC = 'Bereit für das %23unerwartete_Störer.png';

// Kamera-Zugriff
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ 
        video: { 
            facingMode: "user",
            aspectRatio: window.innerWidth < 800 ? 0.75 : 1.77 
        } 
    })
    .then(stream => { 
        video.srcObject = stream; 
        video.play();
    })
    .catch(err => console.error("Kamera Fehler:", err));
}

// Hilfsfunktion für den automatischen Textumbruch
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

// Meme generieren
snap.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // 1. Das Foto zeichnen
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 2. Headline-Konfiguration
    const text = headlineInput.value || "Wie reagierst du?";
    context.font = "900 60px 'Montserrat', sans-serif";
    context.fillStyle = "white";
    context.textAlign = "left"; 
    
    // Weichgezeichneter Schlagschatten für den Text
    context.shadowColor = "rgba(0, 0, 0, 0.7)";
    context.shadowBlur = 15;
    context.shadowOffsetX = 4;
    context.shadowOffsetY = 4;

    // Positionierung der Headline: 
    // Wir rücken den Text weiter nach rechts (x=320), damit das vergrößerte Logo links Platz hat
    wrapText(context, text, 320, 90, canvas.width - 350, 65);

    // 3. Branding-Bilder laden
    const logo = new Image();
    const stoerer = new Image();
    
    logo.crossOrigin = "anonymous";
    stoerer.crossOrigin = "anonymous";
    
    logo.src = LOGO_SRC;
    stoerer.src = STOERER_SRC;

    let loaded = 0;
    const drawBranding = () => {
        loaded++;
        if (loaded === 2) {
            // Schatten-Konfiguration für das Logo
            context.shadowColor = "rgba(0, 0, 0, 0.4)";
            context.shadowBlur = 12;
            context.shadowOffsetX = 5;
            context.shadowOffsetY = 5;
            
            // LOGO OBEN LINKS (ca. 28% der Breite)
            const lWidth = canvas.width * 0.28;
            const lHeight = (logo.height / logo.width) * lWidth;
            context.drawImage(logo, 20, 20, lWidth, lHeight);

            // STÖRER UNTEN RECHTS
            // Schatten für Störer (etwas dezenter)
            context.shadowBlur = 8;
            const sWidth = 320;
            const sHeight = (stoerer.height / stoerer.width) * sWidth;
            context.drawImage(stoerer, canvas.width - sWidth - 25, canvas.height - sHeight - 25, sWidth, sHeight);

            // UI umschalten
            photo.src = canvas.toDataURL('image/jpeg', 0.9);
            generatorBox.style.display = 'none';
            resultContainer.style.display = 'block';
        }
    };

    logo.onload = drawBranding;
    stoerer.onload = drawBranding;
    
    // Fallback, falls der Störer-Dateiname trotzdem hakt
    logo.onerror = drawBranding;
    stoerer.onerror = drawBranding;
});

resetBtn.addEventListener('click', () => { location.reload(); });
