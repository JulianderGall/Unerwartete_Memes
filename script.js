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

if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }, 
        audio: false 
    })
    .then(stream => {
        video.srcObject = stream;
        video.play();
    })
    .catch(err => {
        console.error("Kamera-Fehler: ", err);
    });
}

snap.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Meme-Text: Extra Fett & größer
    const headline = headlineInput.value || "Der Moment des Unerwarteten";
    context.font = "900 65px 'Montserrat', sans-serif"; // Extra Fett (900) & größer
    context.fillStyle = "white";
    context.textAlign = "center";
    
    // Weichgezeichneter Schatten für den Text
    context.shadowColor = "rgba(0, 0, 0, 0.6)";
    context.shadowBlur = 20; 
    context.shadowOffsetX = 4;
    context.shadowOffsetY = 4;
    
    context.fillText(headline, canvas.width / 2, 100);

    // Bilder laden
    const logoImg = new Image();
    const stoererImg = new Image();
    logoImg.src = LOGO_SRC;
    stoererImg.src = STOERER_SRC;

    let imagesLoaded = 0;
    const totalImages = 2;

    const finalize = () => {
        imagesLoaded++;
        if (imagesLoaded === totalImages) {
            // Schatten für die Bilder deaktivieren
            context.shadowBlur = 0;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;
            
            // Logo unten links
            const lWidth = 200;
            const lHeight = (logoImg.height / logoImg.width) * lWidth;
            context.drawImage(logoImg, 40, canvas.height - lHeight - 40, lWidth, lHeight);

            // Störer unten rechts
            const sWidth = 280;
            const sHeight = (stoererImg.height / stoererImg.width) * sWidth;
            context.drawImage(stoererImg, canvas.width - sWidth - 20, canvas.height - sHeight - 20, sWidth, sHeight);

            photo.src = canvas.toDataURL('image/jpeg', 0.9);
            generatorBox.style.display = 'none';
            resultContainer.style.display = 'block';
        }
    };

    logoImg.onload = finalize;
    stoererImg.onload = finalize;
    
    // Fallback falls Bilder fehlen
    logoImg.onerror = finalize;
    stoererImg.onerror = finalize;
});

resetBtn.addEventListener('click', () => {
    resultContainer.style.display = 'none';
    generatorBox.style.display = 'block';
    headlineInput.value = "";
});
