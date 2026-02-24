const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const snap = document.getElementById('snap');
const headlineInput = document.getElementById('headline');
const photo = document.getElementById('photo');
const resultContainer = document.getElementById('result-container');

// 1. Kamera starten
navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false })
    .then(stream => { video.srcObject = stream; })
    .catch(err => alert("Kamera-Zugriff verweigert oder nicht unterstützt."));

// 2. Meme generieren
snap.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Foto vom Video-Stream auf Canvas zeichnen
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Headline hinzufügen
    context.font = "bold 40px Arial";
    context.fillStyle = "white";
    context.textAlign = "center";
    context.shadowColor = "black";
    context.shadowBlur = 7;
    context.fillText(headlineInput.value.toUpperCase(), canvas.width / 2, 60);

    // Logo hinzufügen (Beispielpfad)
    const logo = new Image();
    logo.src = 'logo.png'; // Hier dein Develey Logo Pfad
    logo.onload = () => {
        context.drawImage(logo, 20, canvas.height - 100, 150, 80); // Position unten links
        
        // Störer hinzufügen
        const stoerer = new Image();
        stoerer.src = 'stoerer.png'; // Hier dein Störer Pfad
        stoerer.onload = () => {
            context.drawImage(stoerer, canvas.width - 170, canvas.height - 170, 150, 150); // Unten rechts
            
            // Fertiges Bild anzeigen
            photo.src = canvas.toDataURL('image/jpeg');
            video.style.display = 'none';
            document.querySelector('.controls').style.display = 'none';
            resultContainer.style.display = 'block';
        };
    };
});
