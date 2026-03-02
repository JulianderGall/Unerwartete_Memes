/**
 * script.js - Develey Meme Generator
 * Features: High-Res Export (15:10), dynamische Textgröße (max 3 Zeilen), Smart Camera Detection
 */

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const snap = document.getElementById('snap');
const resetBtn = document.getElementById('reset');
const downloadBtn = document.getElementById('download'); 
const switchCamBtn = document.getElementById('switch-cam'); 
const headlineInput = document.getElementById('headline');
const photo = document.getElementById('photo');
const resultContainer = document.getElementById('result-container');
const generatorBox = document.querySelector('.generator-box');

// Bildquellen (Pfade aus dem Repository)
const LOGO_SRC = 'Develey_Logo_Ecke.png';
// Fix: Das '#' im Dateinamen muss in der URL als '%23' maskiert werden
const STOERER_SRC = 'Bereit für das %23unerwartete_Störer.png';

let currentFacingMode = "user"; // Startet standardmäßig mit der Selfie-/Frontkamera

// 1. Geräteprüfung: "Kamera drehen" Button nur anzeigen, wenn >= 2 Kameras da sind
async function checkCamerasAndShowButton() {
    if (!switchCamBtn) return; 

    try {
        // Fragt alle verfügbaren Medien-Geräte ab
        const devices = await navigator.mediaDevices.enumerateDevices();
        
        // Filtert nur die Videokameras heraus
        const videoInputDevices = devices.filter(device => device.kind === 'videoinput');

        // Wenn das iPad/Gerät mehr als eine Kamera hat -> Button einblenden
        if (videoInputDevices.length > 1) {
            switchCamBtn.style.display = 'inline-block'; 
        } else {
            switchCamBtn.style.display = 'none';
        }
    } catch (error) {
        console.error('Fehler beim Abrufen der Kamerainformationen:', error);
        switchCamBtn.style.display = 'none';
    }
}

// 2. Kamera-Stream starten (und alte Streams vorher sauber beenden)
function startCamera(facingMode) {
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
    }

    const constraints = {
        video: { 
            facingMode: facingMode,
            aspectRatio: 1.5 // Erzwingt bei unterstützten Geräten direkt das 15:10 Format
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
}

// Initialisierung bei Seitenaufruf
window.addEventListener('DOMContentLoaded', () => {
    checkCamerasAndShowButton();
    startCamera(currentFacingMode);
});

// Kamera Umschalt-Event ("Kamera drehen" Button)
switchCamBtn.addEventListener('click', () => {
    currentFacingMode = currentFacingMode === "user" ? "environment" : "user";
    startCamera(currentFacingMode);
});

// --- Hilfsfunktion: Berechnet die Zeilenumbrüche OHNE sie direkt zu zeichnen ---
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

// 3. Foto aufnehmen & Meme generieren (Button: "Say Develey")
snap.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    
    // HOCHAUFLÖSENDES FORMAT ERZWINGEN (2400 x 1600 = exakt 15:10)
    canvas.width = 2400;
    canvas.height = 1600;

    // A) Kamera-Bild zeichnen (mit Center-Crop, um Verzerrungen zu vermeiden)
    const videoRatio = video.videoWidth / video.videoHeight;
    const canvasRatio = canvas.width / canvas.height;
    
    let drawWidth = video.videoWidth;
    let drawHeight = video.videoHeight;
    let offsetX = 0;
    let offsetY = 0;

    if (videoRatio > canvasRatio) {
        drawWidth = video.videoHeight * canvasRatio;
        offsetX = (video.videoWidth - drawWidth) / 2;
    } else {
        drawHeight = video.videoWidth / canvasRatio;
        offsetY = (video.videoHeight - drawHeight) / 2;
    }
    context.drawImage(video, offsetX, offsetY, drawWidth, drawHeight, 0, 0, canvas.width, canvas.height);

    // B) Dynamische Größenanpassung des Headline-Textes
    const text = headlineInput.value || "Wie reagierst du?";
    
    const maxFontSize = 130; // Maximale Startgröße
    const minFontSize = 60;  // Minimale noch lesbare Größe
    const textX = 760;       // Abstand von links (Platz für Logo)
    const textYStart = 200;  // Y-Position der ersten Zeile
    const maxWidth = canvas.width - 850; // Platz nach rechts
    const maxLines = 3;      // Harte Grenze: Maximal 3 Zeilen

    // Styling für den Text
    context.fillStyle = "white";
    context.textAlign = "left"; 
    context.shadowColor = "rgba(0, 0, 0, 0.7)";
    context.shadowBlur = 30;
    context.shadowOffsetX = 8;
    context.shadowOffsetY = 8;

    let fontSize = maxFontSize;
    let lines = [];
    let textFits = false;

    // Iterative Verkleinerung der Schriftgröße, bis der Text perfekt passt
    while (fontSize >= minFontSize && !textFits) {
        context.font = `900 ${fontSize}px 'Montserrat', sans-serif`;
        lines = getWrappedLines(context, text, maxWidth);
        
        // Bedingung 1: Passt es vertikal? (Maximal 3 Zeilen)
        let verticalFits = lines.length <= maxLines;

        // Bedingung 2: Passt jede einzelne Zeile horizontal? (Verhindert abgeschnittene lange Wörter)
        let horizontalFits = true;
        for (let i = 0; i < lines.length; i++) {
            if (context.measureText(lines[i]).width > maxWidth) {
                horizontalFits = false;
                break;
            }
        }

        // Der Text passt nur, wenn BEIDE Kriterien erfüllt sind
        if (verticalFits && horizontalFits) {
            textFits = true;
        } else {
            fontSize -= 10; // Schriftgröße verringern und erneut testen
        }
    }

    // Fallback: Falls ein Wort extrem lang ist, auf minFontSize setzen und nach 3 Zeilen kappen
    if (!textFits) {
        fontSize = minFontSize;
        context.font = `900 ${fontSize}px 'Montserrat', sans-serif`;
        lines = getWrappedLines(context, text, maxWidth).slice(0, maxLines); 
    }

    const lineHeight = fontSize * 1.15; // Dynamischer Zeilenabstand

    // Zeichnen des finalen Textes
    lines.forEach((line, index) => {
        context.fillText(line, textX, textYStart + (index * lineHeight));
    });

    // C) Branding hochauflösend hinzufügen
    const logoImg = new Image();
    const stoererImg = new Image();
    logoImg.crossOrigin = "anonymous";
    stoererImg.crossOrigin = "anonymous";
    logoImg.src = LOGO_SRC;
    stoererImg.src = STOERER_SRC;

    let loadedCount = 0;
    const finalizeImage = () => {
        loadedCount++;
        // Erst wenn Logo UND Störer geladen sind, wird gezeichnet
        if (loadedCount === 2) {
            // Schatten für die Bilder deaktivieren
            context.shadowBlur = 0;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;
            
            // LOGO OBEN LINKS - Absolut bündig
            const lWidth = canvas.width * 0.30; 
            const lHeight = (logoImg.height / logoImg.width) * lWidth;
            context.drawImage(logoImg, 0, 0, lWidth, lHeight);

            // STÖRER UNTEN RECHTS - Absolut bündig zum Rand
            const sWidth = 750; 
            const sHeight = (stoererImg.height / stoererImg.width) * sWidth;
            context.drawImage(stoererImg, canvas.width - sWidth, canvas.height - sHeight, sWidth, sHeight);

            // JPEG für den Output generieren (0.95 = Top-Qualität für Druck)
            photo.src = canvas.toDataURL('image/jpeg', 0.95);
            generatorBox.style.display = 'none';
            resultContainer.style.display = 'block';
        }
    };

    logoImg.onload = finalizeImage;
    stoererImg.onload = finalizeImage;
    logoImg.onerror = finalizeImage;
    stoererImg.onerror = finalizeImage;
});

// 4. Download Logik (Lokal ausführen, ohne Server)
downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'develey_meme_unerwartet.jpg'; 
    link.href = photo.src; 
    link.click();
});

// 5. Reset-Funktion
resetBtn.addEventListener('click', () => {
    location.reload(); 
});
