/**
 * script.js - Finale Version mit automatischer Größenanpassung
 * Fokus: Bündiges Logo, bündiger Störer, 15:10 Format & dynamischer Text (max 3 Zeilen)
 */

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const snap = document.getElementById('snap');
const resetBtn = document.getElementById('reset');
const downloadBtn = document.getElementById('download'); 
const headlineInput = document.getElementById('headline');
const photo = document.getElementById('photo');
const resultContainer = document.getElementById('result-container');
const generatorBox = document.querySelector('.generator-box');

// Bildquellen (Pfade aus deinem Repository)
const LOGO_SRC = 'Develey_Logo_Ecke.png';
// Fix: Das '#' im Dateinamen muss als '%23' maskiert werden
const STOERER_SRC = 'Bereit für das %23unerwartete_Störer.png';

// 1. Kamera-Zugriff starten (Mobil-Optimiert, exaktes 15:10 Format angefordert)
const constraints = {
    video: { 
        facingMode: "user",
        aspectRatio: 1.5 // 15:10 = 3:2 = 1.5
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

// --- Hilfsfunktion: Berechnet die umgebrochenen Zeilen OHNE sie zu zeichnen ---
function getWrappedLines(context, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    if (words.length === 1) {
        return [text];
    }

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = context.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}

// 2. Foto aufnehmen & Meme generieren (Button: "Say Develey")
snap.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    
    // HOCHAUFLÖSENDES FORMAT ERZWINGEN (2400 x 1600 = 15:10 Format)
    canvas.width = 2400;
    canvas.height = 1600;

    // A) Das Live-Bild auf den Canvas zeichnen (mit Crop auf 15:10)
    // Berechnung für Center-Crop, damit die Kamera das Format perfekt ausfüllt
    const videoRatio = video.videoWidth / video.videoHeight;
    const canvasRatio = canvas.width / canvas.height;
    
    let drawWidth = video.videoWidth;
    let drawHeight = video.videoHeight;
    let offsetX = 0;
    let offsetY = 0;

    if (videoRatio > canvasRatio) {
        // Video ist breiter als 15:10 -> links & rechts abschneiden
        drawWidth = video.videoHeight * canvasRatio;
        offsetX = (video.videoWidth - drawWidth) / 2;
    } else {
        // Video ist höher als 15:10 -> oben & unten abschneiden
        drawHeight = video.videoWidth / canvasRatio;
        offsetY = (video.videoHeight - drawHeight) / 2;
    }

    // Kamera-Bild hochauflösend in den Canvas rendern
    context.drawImage(video, offsetX, offsetY, drawWidth, drawHeight, 0, 0, canvas.width, canvas.height);

    // B) Dynamische Größenanpassung des Headline-Textes
    const text = headlineInput.value || "Wie reagierst du?";
    
    // Konfiguration für die Größenanpassung
    const maxFontSize = 130; // Startgröße (ursprünglich)
    const minFontSize = 60;  // Minimale lesbare Größe
    const textX = 760;
    const textYStart = 200; // y-Position der ersten Zeile
    const maxWidth = canvas.width - 850;
    const maxLines = 3; // Maximale Zeilenanzahl

    // Canvas-Kontext für Text-Setup (Schatten etc.)
    context.fillStyle = "white";
    context.textAlign = "left"; 
    context.shadowColor = "rgba(0, 0, 0, 0.7)";
    context.shadowBlur = 30;
    context.shadowOffsetX = 8;
    context.shadowOffsetY = 8;

    let fontSize = maxFontSize;
    let lines = [];
    let textFits = false;

    // Iterative Verkleinerung der Schriftgröße, bis der Text in <= 3 Zeilen passt
    while (fontSize >= minFontSize && !textFits) {
        context.font = `900 ${fontSize}px 'Montserrat', sans-serif`;
        lines = getWrappedLines(context, text, maxWidth);
        
        if (lines.length <= maxLines) {
            textFits = true;
        } else {
            fontSize -= 10; // Schriftgröße schrittweise verringern
        }
    }

    // Falls der Text immer noch zu lang ist (trotz minFontSize), nimm nur die ersten 3 Zeilen
    if (!textFits) {
        fontSize = minFontSize;
        context.font = `900 ${fontSize}px 'Montserrat', sans-serif`;
        lines = getWrappedLines(context, text, maxWidth).slice(0, maxLines); // Überschüssige Zeilen abschneiden
    }

    // Zeilenhöhe proportional zur gefundenen Schriftgröße berechnen
    const lineHeight = fontSize * 1.15; 

    // Zeichnen des finalen, angepassten Textes
    lines.forEach((line, index) => {
        context.fillText(line, textX, textYStart + (index * lineHeight));
    });

    // C) Branding (Logo & Störer) hochauflösend hinzufügen
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
            const sWidth = 750; 
            const sHeight = (stoererImg.height / stoererImg.width) * sWidth;
            context.drawImage(stoererImg, canvas.width - sWidth, canvas.height - sHeight, sWidth, sHeight);

            // Hochauflösendes JPEG generieren (Quality 0.95 für Top-Qualität)
            photo.src = canvas.toDataURL('image/jpeg', 0.95);
            generatorBox.style.display = 'none';
            resultContainer.style.display = 'block';
        }
    };

    logoImg.onload = finalizeImage;
    stoererImg.onload = finalizeImage;
    
    // Fallback bei Ladefehlern, damit das Meme trotzdem generiert wird
    logoImg.onerror = finalizeImage;
    stoererImg.onerror = finalizeImage;
});

// 3. Download Logik
downloadBtn.addEventListener('click', () => {
    // Erstellt einen unsichtbaren Link, der das hochauflösende Bild herunterlädt
    const link = document.createElement('a');
    link.download = 'develey_meme_unerwartet.jpg'; // Dateiname
    link.href = photo.src; // URL des hochauflösenden Bildes
    link.click();
});

// 4. Reset-Funktion für "Neuer Versuch"
resetBtn.addEventListener('click', () => {
    location.reload(); 
});
