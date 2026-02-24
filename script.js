const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const snap = document.getElementById('snap');
const resetBtn = document.getElementById('reset');
const headlineInput = document.getElementById('headline');
const photo = document.getElementById('photo');

// Pfade - Achte darauf, dass die Dateien exakt so in GitHub heißen!
const LOGO_PATH = 'Develey_Logo_Ecke.png';
const STOERER_PATH = 'Bereit für das #unerwartete_Störer.png'; 

if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
    .then(stream => { video.srcObject = stream; video.play(); });
}

snap.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // 1. Das Foto
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 2. Die Headline (Extrafett, Weichgezeichneter Schatten)
    const text = headlineInput.value || "Moment des Unerwarteten";
    context.font = "900 60px Montserrat";
    context.fillStyle = "white";
    context.textAlign = "center";
    context.shadowColor = "rgba(0, 0, 0, 0.5)";
    context.shadowBlur = 15;
    context.fillText(text, canvas.width / 2, 80);

    // 3. Branding & Störer laden
    const logoImg = new Image();
    const stoererImg = new Image();
    logoImg.src = LOGO_PATH;
    stoererImg.src = STOERER_PATH;

    let loaded = 0;
    const checkLoaded = () => {
        loaded++;
        if (loaded === 2) {
            // Schatten für Bilder aus
            context.shadowBlur = 0;

            // Logo klein unten links ins Foto
            context.drawImage(logoImg, 20, canvas.height - 80, 120, 50);

            // Störer unten rechts ins Foto
            const sWidth = 250; 
            const sHeight = (stoererImg.height / stoererImg.width) * sWidth;
            context.drawImage(stoererImg, canvas.width - sWidth - 10, canvas.height - sHeight - 10, sWidth, sHeight);

            photo.src = canvas.toDataURL('image/jpeg');
            document.querySelector('.generator-box').style.display = 'none';
            document.getElementById('result-container').style.display = 'block';
        }
    };

    logoImg.onload = checkLoaded;
    stoererImg.onload = checkLoaded;
    // Falls ein Bild fehlt, trotzdem anzeigen
    logoImg.onerror = checkLoaded;
    stoererImg.onerror = checkLoaded;
});

resetBtn.addEventListener('click', () => {
    location.reload(); // Einfachste Methode für sauberen Reset am Kiosk
});
// ... (Kamera-Setup bleibt gleich)

snap.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // 1. Das Foto zeichnen
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 2. Headline (Extra Fett, gemischte Schreibweise)
    const text = headlineInput.value || "Moment des Unerwarteten";
    context.font = "900 70px Montserrat"; // Extra Fett
    context.fillStyle = "white";
    context.textAlign = "center";
    context.shadowColor = "rgba(0, 0, 0, 0.6)";
    context.shadowBlur = 20; // Weicher Schatten
    context.fillText(text, canvas.width / 2, 100);

    // 3. Branding-Elemente laden
    const logoImg = new Image();
    const stoererImg = new Image();
    logoImg.src = 'Develey_Logo_Ecke.png';
    stoererImg.src = 'Bereit für das #unerwartete_Störer.png';

    let loaded = 0;
    const drawBranding = () => {
        loaded++;
        if (loaded === 2) {
            context.shadowBlur = 0; // Schatten für Logos aus
            
            // Kleines Logo unten links ins Foto
            context.drawImage(logoImg, 20, canvas.height - 90, 150, 60);

            // Störer unten rechts ins Foto
            const sWidth = 300;
            const sHeight = (stoererImg.height / stoererImg.width) * sWidth;
            context.drawImage(stoererImg, canvas.width - sWidth - 20, canvas.height - sHeight - 20, sWidth, sHeight);

            // Ergebnis anzeigen
            photo.src = canvas.toDataURL('image/jpeg', 0.9);
            document.querySelector('.generator-box').style.display = 'none';
            document.getElementById('result-container').style.display = 'block';
        }
    };

    logoImg.onload = drawBranding;
    stoererImg.onload = drawBranding;
});
