const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const snap = document.getElementById('snap');
const resetBtn = document.getElementById('reset');
const downloadBtn = document.getElementById('download'); // Download Button referenziert
const headlineInput = document.getElementById('headline');
const photo = document.getElementById('photo');
const resultContainer = document.getElementById('result-container');
const generatorBox = document.querySelector('.generator-box');

const LOGO_SRC = 'Develey_Logo_Ecke.png';
const STOERER_SRC = 'Bereit für das %23unerwartete_Störer.png';

// Kamera Setup
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", aspectRatio: 1.5 } 
    })
    .then(stream => { video.srcObject = stream; video.play(); })
    .catch(err => console.error("Kamera Fehler:", err));
}

// Text-Umbruch Logik
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

// Foto aufnehmen
snap.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    
    // HOCHAUFLÖSENDES FORMAT ERZWINGEN (2400 x 1600 = 15:10 Format)
    canvas.width = 2400;
    canvas.height = 1600;

    // Crop-Logik, damit die Kamera das 15:10 Format perfekt ausfüllt
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

    // Kamera-Bild hochauflösend in den Canvas rendern
    context.drawImage(video, offsetX, offsetY, drawWidth, drawHeight, 0, 0, canvas.width, canvas.height);

    // Text formatieren (Größen für 2400x1600 angepasst)
    const text = headlineInput.value || "Wie reagierst du?";
    context.font = "900 130px 'Montserrat', sans-serif";
    context.fillStyle = "white";
    context.textAlign = "left"; 
    context.shadowColor = "rgba(0, 0, 0, 0.7)";
    context.shadowBlur = 30;
    context.shadowOffsetX = 8;
    context.shadowOffsetY = 8;

    // Headline rückt weit nach rechts, um dem großen Logo Platz zu machen
    wrapText(context, text, 760, 200, canvas.width - 850, 150);

    // Bilder laden
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
            
            // LOGO OBEN LINKS (30% der Bildbreite = 720px)
            const lWidth = canvas.width * 0.30; 
            const lHeight = (logo.height / logo.width) * lWidth;
            context.drawImage(logo, 0, 0, lWidth, lHeight);

            // STÖRER UNTEN RECHTS
            const sWidth = 750; 
            const sHeight = (stoerer.height / stoerer.width) * sWidth;
            context.drawImage(stoerer, canvas.width - sWidth, canvas.height - sHeight, sWidth, sHeight);

            // Hochauflösendes JPEG generieren (Quality 0.95 für sehr gute Druck/Display-Qualität)
            photo.src = canvas.toDataURL('image/jpeg', 0.95);
            generatorBox.style.display = 'none';
            resultContainer.style.display = 'block';
        }
    };

    logo.onload = drawBranding;
    stoerer.onload = drawBranding;
    logo.onerror = drawBranding;
    stoerer.onerror = drawBranding;
});

// Download Logik
downloadBtn.addEventListener('click', () => {
    // Erstellt einen unsichtbaren Link, der das hochauflösende Bild auslöst
    const link = document.createElement('a');
    link.download = 'develey_meme_unerwartet.jpg'; // Dateiname
    link.href = photo.src; // Nimmt die URL des hochauflösenden Bildes
    link.click();
});

// Reset Logik
resetBtn.addEventListener('click', () => { location.reload(); });
