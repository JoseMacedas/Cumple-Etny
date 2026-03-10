const title = document.getElementById("title");
const subtitle = document.getElementById("subtitle");
const button = document.getElementById("surpriseBtn");
const finalMessage = document.getElementById("finalMessage");
const heartsContainer = document.querySelector(".hearts");
const confettiCanvas = document.getElementById("confetti");
const ctx = confettiCanvas.getContext("2d");

const steps = [
  {
    title: "hoy es un día muy especial 💗",
    subtitle: "porque hoy cumple años alguien demasiado importante para mí"
  },
  {
    title: "y sí… 💗",
    subtitle: "hoy cumple años uno de los amores más bonitos de mi vida 🎂"
  },
  {
    title: "gracias por existir 🎀",
    subtitle: "por tu cariño, tu luz y por hacer mi vida más bonita ✨"
  },
  {
    title: "feliz cumpleaños, preciosa 💗",
    subtitle: "mereces un día tan bonito como tú"
  }
];

let currentStep = 0;

button.addEventListener("click", () => {
  if (currentStep < steps.length) {
    title.textContent = steps[currentStep].title;
    subtitle.textContent = steps[currentStep].subtitle;
    animateText();
    currentStep++;

    if (currentStep === steps.length) {
      button.textContent = "ver mensajito final 🎀";
    }
  } else {
    finalMessage.classList.remove("hidden");
    button.classList.add("hidden");
    startConfetti();
  }
});

function animateText() {
  title.style.animation = "none";
  subtitle.style.animation = "none";

  void title.offsetWidth;
  void subtitle.offsetWidth;

  title.style.animation = "fadeIn 0.6s ease";
  subtitle.style.animation = "fadeIn 0.8s ease";
}

function createHeart() {
  const heart = document.createElement("div");
  heart.classList.add("heart");
  heart.textContent = Math.random() > 0.5 ? "💗" : "🎀";
  heart.style.left = Math.random() * 100 + "vw";
  heart.style.animationDuration = 4 + Math.random() * 4 + "s";
  heart.style.fontSize = 14 + Math.random() * 16 + "px";

  heartsContainer.appendChild(heart);

  setTimeout(() => {
    heart.remove();
  }, 8000);
}

setInterval(createHeart, 550);

function resizeCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

let confettiPieces = [];
let confettiRunning = false;

function startConfetti() {
  if (confettiRunning) return;

  confettiRunning = true;

  confettiPieces = Array.from({ length: 140 }, () => ({
    x: Math.random() * confettiCanvas.width,
    y: Math.random() * confettiCanvas.height - confettiCanvas.height,
    w: 6 + Math.random() * 6,
    h: 10 + Math.random() * 10,
    speed: 2 + Math.random() * 3,
    tilt: Math.random() * 10,
    color: ["#ff7aa2", "#ffd166", "#cdb4ff", "#ffffff", "#ffb3c6"][
      Math.floor(Math.random() * 5)
    ]
  }));

  requestAnimationFrame(updateConfetti);

  setTimeout(() => {
    confettiRunning = false;
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }, 5000);
}

function updateConfetti() {
  if (!confettiRunning) return;

  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  confettiPieces.forEach((piece) => {
    piece.y += piece.speed;
    piece.x += Math.sin(piece.y * 0.02);
    piece.tilt += 0.1;

    ctx.save();
    ctx.translate(piece.x, piece.y);
    ctx.rotate(piece.tilt);
    ctx.fillStyle = piece.color;
    ctx.fillRect(0, 0, piece.w, piece.h);
    ctx.restore();

    if (piece.y > confettiCanvas.height + 20) {
      piece.y = -20;
      piece.x = Math.random() * confettiCanvas.width;
    }
  });

  requestAnimationFrame(updateConfetti);
}
