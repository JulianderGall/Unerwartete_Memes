const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const snap = document.getElementById('snap');
const resetBtn = document.getElementById('reset');
const headlineInput = document.getElementById('headline');
const photo = document.getElementById('photo');

const LOGO_IMG = 'Develey_Logo_Ecke.png';
const STOERER_IMG = 'Bereit für das #unerwartete_Störer.png';

// 1. Kamera im Hochformat für Mobile anfordern
const constraints = {
    video: {
        facingMode: "user",
        aspectRatio: window.innerWidth < 800 ? 0.75 : 1.77 // Hochformat für Mobile
    }
};

navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => { video.srcObject = stream; })
    .catch(err => console.error("Kamera-Fehler:", err));

// 2. Foto & Meme Erstellung
snap.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Foto zeichnen
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Headline (Extra Fett, weicher Schatten)
    const text = headlineInput.value || "Moment des Unerwarteten";
    context.font = "900 65px Montserrat";
    context.fillStyle = "white";
    context.textAlign = "center";
    context.shadowColor = "rgba(0,0,0,0.6)";
    context.shadowBlur = 20;
    context.fillText(text, canvas.width / 2, 100);

    // Bilder laden
    const logo = new Image();
    const stoerer = new Image();
    logo.src = LOGO_IMG;
    stoerer.src = STOERER_IMG;

    let loadedCount = 0;
    const drawElements = () => {
        loadedCount++;
        if (loadedCount === 2) {
            context.shadowBlur = 0; // Schatten für Logos aus
            
            // Logo klein unten links
            context.drawImage(logo, 30, canvas.height - 85, 160, 60);

            // Störer unten rechts
            const sWidth = 280;
            const sHeight = (stoerer.height / stoerer.width) * sWidth;
            context.drawImage(stoerer, canvas.width - sWidth - 20, canvas.height - sHeight - 20, sWidth, sHeight);

            photo.src = canvas.toDataURL('image/jpeg', 0.9);
            document.querySelector('.generator-box').style.display = 'none';
            document.getElementById('result-container').style.display = 'block';
        }
    };

    logo.onload = drawElements;
    stoerer.onload = drawElements;
    // Fallback falls Datei nicht gefunden
    logo.onerror = drawElements;
    stoerer.onerror = drawElements;
});

resetBtn.addEventListener('click', () => { location.reload(); });
