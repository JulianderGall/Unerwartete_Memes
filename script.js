const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const snap = document.getElementById('snap');
const resetBtn = document.getElementById('reset');
const headlineInput = document.getElementById('headline');
const photo = document.getElementById('photo');

// Bildquellen aus deinem Repository
const LOGO_SRC = 'Develey_Logo_Ecke.png';
const STOERER_SRC = 'Bereit für das #unerwartete_Störer.png';

// 1. Kamera-Zugriff starten
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ 
        video: { 
            facingMode: "user",
            // Optimierung für Mobile/iPad
            aspectRatio: window.innerWidth < 800 ? 0.75 : 1.77 
        } 
    })
    .then(stream => { 
        video.srcObject = stream; 
        video.play();
    })
    .catch(err => console.error("Kamera Fehler:", err));
}

// Hilfsfunktion für den automatischen Textumbruch (Zweizeilig)
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

// 2. Foto aufnehmen & Meme generieren
snap.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Foto vom Stream auf Canvas zeichnen
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Konfiguration für Headline: Extra Fett (900) & Weicher Schatten
    const text = headlineInput.value || "Wie reagierst du?";
    context.font = "900 55px 'Montserrat', sans-serif";
    context.fillStyle = "white";
    context.textAlign = "left"; 
    context.shadowColor = "rgba(0, 0, 0, 0.6)";
    context.shadowBlur = 15;

    // Headline-Positionierung: Rechts neben dem Logo (Platz lassen für Logo links)
    // Wir starten bei x=280, um dem Logo (25% Breite) Platz zu machen.
    wrapText(context, text, 280, 85, canvas.width - 320, 60);

    // Branding-Elemente laden
    const logo = new Image();
    const stoerer = new Image();
    
    // CrossOrigin für GitHub Pages
    logo.crossOrigin = "anonymous";
    stoerer.crossOrigin = "anonymous";
    
    logo.src = LOGO_SRC;
    stoerer.src = STOERER_SRC;

    let loaded = 0;
    const drawBranding = () => {
        loaded++;
        if (loaded === 2) {
            context.shadowBlur = 0; // Schatten für Logos deaktivieren
            
            // LOGO OBEN LINKS (ca. 25% der Foto-Breite)
            const lWidth = canvas.width * 0.25;
            const lHeight = (logo.height / logo.width) * lWidth;
            context.drawImage(logo, 10, 10, lWidth, lHeight);

            // STÖRER UNTEN RECHTS
            const sWidth = 300;
            const sHeight = (stoerer.height / stoerer.width) * sWidth;
            context.drawImage(stoerer, canvas.width - sWidth - 20, canvas.height - sHeight - 20, sWidth, sHeight);

            // Ergebnis im Interface anzeigen
            photo.src = canvas.toDataURL('image/jpeg', 0.9);
            document.querySelector('.generator-box').style.display = 'none';
            document.getElementById('result-container').style.display = 'block';
        }
    };

    logo.onload = drawBranding;
    stoerer.onload = drawBranding;
    
    // Fallback: Falls ein Bildpfad falsch ist (z.B. wegen #), trotzdem Meme zeigen
    logo.onerror = drawBranding;
    stoerer.onerror = drawBranding;
});

// 3. Reset-Logik für "Neuer Versuch"
resetBtn.addEventListener('click', () => { 
    location.reload(); 
});
