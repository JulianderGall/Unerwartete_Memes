/**
 * script.js - Finale Version mit fixem 15x10 (1.5) Format
 */

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const snap = document.getElementById('snap');
const resetBtn = document.getElementById('reset');
const headlineInput = document.getElementById('headline');
const photo = document.getElementById('photo');
const resultContainer = document.getElementById('result-container');
const generatorBox = document.querySelector('.generator-box');

const LOGO_SRC = 'Develey_Logo_Ecke.png';
const STOERER_SRC = 'Bereit für das %23unerwartete_Störer.png';

// Kamera: Wir fordern bevorzugt ein 1.5 (15:10) Format an
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", aspectRatio: 1.5 } 
    })
    .then(stream => { video.srcObject = stream; video.play(); })
    .catch(err => console.error("Kamera Fehler:", err));
}

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

snap.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    
    // WIR ERZWINGEN EXAKT 1500x1000 (15:10 FORMAT)
    canvas.width = 1500;
    canvas.height = 1000;

    // Berechnung für Center-Crop (schneidet Ränder ab, verhindert Verzerrung)
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

    // Gecropptes Foto auf das fixe 15x10 Canvas zeichnen
    context.drawImage(video, offsetX, offsetY, drawWidth, drawHeight, 0, 0, canvas.width, canvas.height);

    // Text formatieren (angepasst an die neue feste Auflösung)
    const text = headlineInput.value || "Wie reagierst du?";
    context.font = "900 85px 'Montserrat', sans-serif";
    context.fillStyle = "white";
    context.textAlign = "left"; 
    context.shadowColor = "rgba(0, 0, 0, 0.7)";
    context.shadowBlur = 20;
    context.shadowOffsetX = 5;
    context.shadowOffsetY = 5;

    // Headline rückt nach rechts
    wrapText(context, text, 480, 130, canvas.width - 520, 95);

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
            context.shadowBlur = 0;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;
            
            // LOGO OBEN LINKS - Bündig an die fixe Auflösung angepasst
            const lWidth = canvas.width * 0.30; 
            const lHeight = (logo.height / logo.width) * lWidth;
            context.drawImage(logo, 0, 0, lWidth, lHeight);

            // STÖRER UNTEN RECHTS - Bündig
            const sWidth = 450; 
            const sHeight = (stoerer.height / stoerer.width) * sWidth;
            context.drawImage(stoerer, canvas.width - sWidth, canvas.height - sHeight, sWidth, sHeight);

            photo.src = canvas.toDataURL('image/jpeg', 0.9);
            generatorBox.style.display = 'none';
            resultContainer.style.display = 'block';
        }
    };

    logo.onload = drawBranding;
    stoerer.onload = drawBranding;
    logo.onerror = drawBranding;
    stoerer.onerror = drawBranding;
});

resetBtn.addEventListener('click', () => { location.reload(); });
