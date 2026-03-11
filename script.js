/**
 * script.js - Develey Meme Generator
 * Features: High-Res Export (15:10), dynamische Textgröße (Open Sans), Smart Camera, Optionale Texteingabe, Zufalls-Generator
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

// NEU: Der Zufalls-Button (Würfel)
const randomTextBtn = document.getElementById('random-text');

// Bildquellen (Pfade aus dem Repository)
const LOGO_SRC = 'Develey_Logo_Ecke.png';
const STOERER_SRC = 'Bereit für das %23unerwartete_Störer.png';

let currentFacingMode = "user"; // Startet standardmäßig mit der Selfie-/Frontkamera

// 1. Geräteprüfung: "Kamera drehen" Button nur anzeigen, wenn >= 2 Kameras da sind
async function checkCamerasAndShowButton() {
    if (!switchCamBtn) return; 

    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputDevices = devices.filter(device => device.kind === 'videoinput');

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
            aspectRatio: 1.5 
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

// --- Hilfsfunktion: Berechnet die Zeilenumbrüche ---
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

// 3. Foto aufnehmen & Meme generieren
snap.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    
    // HOCHAUFLÖSENDES FORMAT ERZWINGEN (2400 x 1600 = exakt 15:10)
    canvas.width = 2400;
    canvas.height = 1600;

    // A) Kamera-Bild zeichnen (mit Center-Crop)
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

    // B) Dynamische Größenanpassung des Headline-Textes (NUR WENN TEXT EINGEGEBEN WURDE)
    const text = headlineInput.value.trim(); 
    
    if (text !== "") {
        const maxFontSize = 130; 
        const minFontSize = 60;  
        const textX = 760;       
        const textYStart = 200;  
        const maxWidth = canvas.width - 850; 
        const maxLines = 3;      

        context.fillStyle = "white";
        context.textAlign = "left"; 
        context.shadowColor = "rgba(0, 0, 0, 0.7)";
        context.shadowBlur = 30;
        context.shadowOffsetX = 8;
        context.shadowOffsetY = 8;

        let fontSize = maxFontSize;
        let lines = [];
        let textFits = false;

        // Iterative Verkleinerung der Schriftgröße
        while (fontSize >= minFontSize && !textFits) {
            context.font = `800 ${fontSize}px 'Open Sans', sans-serif`;
            lines = getWrappedLines(context, text, maxWidth);
            
            let verticalFits = lines.length <= maxLines;
            let horizontalFits = true;
            
            for (let i = 0; i < lines.length; i++) {
                if (context.measureText(lines[i]).width > maxWidth) {
                    horizontalFits = false;
                    break;
                }
            }

            if (verticalFits && horizontalFits) {
                textFits = true;
            } else {
                fontSize -= 10; 
            }
        }

        // Fallback bei extrem langen Wörtern
        if (!textFits) {
            fontSize = minFontSize;
            context.font = `800 ${fontSize}px 'Open Sans', sans-serif`;
            lines = getWrappedLines(context, text, maxWidth).slice(0, maxLines); 
        }

        const lineHeight = fontSize * 1.15; 

        // Zeichnen des finalen Textes
        lines.forEach((line, index) => {
            context.fillText(line, textX, textYStart + (index * lineHeight));
        });
    }

    // C) Branding hochauflösend hinzufügen (Passiert immer, egal ob mit oder ohne Text)
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
            context.shadowBlur = 0;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;
            
            const lWidth = canvas.width * 0.30; 
            const lHeight = (logoImg.height / logoImg.width) * lWidth;
            context.drawImage(logoImg, 0, 0, lWidth, lHeight);

            const sWidth = 750; 
            const sHeight = (stoererImg.height / stoererImg.width) * sWidth;
            context.drawImage(stoererImg, canvas.width - sWidth, canvas.height - sHeight, sWidth, sHeight);

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

// 4. Download Logik
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

// 6. NEU: Zufalls-Sprüche Generator
const memePhrases = [
    "Wenn das Ketchup leer ist",
    "Wenn ich einen Ausbildungsplatz bei Develey bekomme",
    "Wenn es dein Lieblingsessen in der Kantine gibt",
    "Wenn der Saucenvorrat leer geht",
    "Wenn die Aufgabe „einfach“ sein soll…",
    "Wenn die Süss-Sauer Sauce leer ist",
    "Wenn die Kantine plötzlich geschlossen ist",
    "Wenn alles schief geht, aber du trotzdem lächelst",
    "Wenn dein Lieblingskollege wieder zurück ist",
    "Heute wird ein guter Tag. Bestimmt.",
    "Wenn du #unerwartet deinen Traumjob findest",
    "#Unerwartet gut drauf",
    "Wenn du merkst, dass Ausbildung nicht nur Kaffee holen bedeutet.",
    "Wenn der Lehrer sagt: Freiwillige?",
    "Wenn du sagst: „Ich lerne… gleich“",
    "Pause schon wieder vorbei?",
    "Wenn du die letzte Seite in der Schulaufgabe übersehen hast",
    "Wenn die letzten zwei Stunden entfallen",
    "Wenn dein Akku 1% hat",
    "Wenn du in der Schule abgefragt wirst",
    "Wenn du merkst, dass die Pommes ohne Ketchup sind",
    "Grillsaison steht wieder an",
    "Wenn der Wecker klingelt",
    "Wenn der Gong den Unterricht beendet"
];

randomTextBtn.addEventListener('click', () => {
    // Zufällige Zahl basierend auf der Länge der Liste generieren
    const randomIndex = Math.floor(Math.random() * memePhrases.length);
    // Den ausgewählten Spruch in das Textfeld eintragen
    headlineInput.value = memePhrases[randomIndex];
});
