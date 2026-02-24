const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const snap = document.getElementById('snap');
const resetBtn = document.getElementById('reset'); // Neuer Reset-Button
const headlineInput = document.getElementById('headline');
const photo = document.getElementById('photo');
const resultContainer = document.getElementById('result-container');
const generatorBox = document.querySelector('.generator-box');

const LOGO_SRC = 'logo.png'; 

// 1. Kamera-Zugriff starten
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
        alert("Kamera konnte nicht geladen werden.");
    });
}

// 2. Foto aufnehmen & Meme generieren
snap.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Foto zeichnen
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Headline (Montserrat/Open Sans Stil aus develeyBrand.css)
    const headline = headlineInput.value.toUpperCase() || "DER MOMENT DES UNERWARTETEN";
    context.font = "bold 45px 'Open Sans', sans-serif";
    context.fillStyle = "white";
    context.textAlign = "center";
    context.shadowColor = "rgba(0, 0, 0, 0.8)";
    context.shadowBlur = 10;
    context.fillText(headline, canvas.width / 2, 80);

    // Branding hinzufügen
    const logoImg = new Image();
    logoImg.src = LOGO_SRC;

    const finalize = () => {
        photo.src = canvas.toDataURL('image/jpeg', 0.9);
        generatorBox.style.display = 'none';
        resultContainer.style.display = 'block';
    };

    logoImg.onload = () => {
        const logoWidth = 180;
        const logoHeight = (logoImg.height / logoImg.width) * logoWidth;
        context.drawImage(logoImg, 30, canvas.height - logoHeight - 30, logoWidth, logoHeight);
        finalize();
    };
    logoImg.onerror = () => finalize();
});

// 3. Reset-Logik: Zurück zur Kamera
resetBtn.addEventListener('click', () => {
    // UI zurücksetzen
    resultContainer.style.display = 'none';
    generatorBox.style.display = 'block';
    
    // Input-Feld leeren für den nächsten User
    headlineInput.value = "";
    
    console.log("Frame zurückgesetzt für neues Foto.");
});

