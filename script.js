const screens = {
  intro: document.getElementById("screen-intro"),
  cake: document.getElementById("screen-cake"),
  letter: document.getElementById("screen-letter")
};

const startBtn = document.getElementById("startBtn");
const enableMicBtn = document.getElementById("enableMicBtn");
const manualBlowBtn = document.getElementById("manualBlowBtn");
const replayBtn = document.getElementById("replayBtn");
const micStatus = document.getElementById("micStatus");
const blowIndicator = document.getElementById("blowIndicator");

const candles = [...document.querySelectorAll(".candle")];

const heartsContainer = document.querySelector(".hearts");

const confettiCanvas = document.getElementById("confetti");
const ctx = confettiCanvas.getContext("2d");

let audioContext = null;
let analyser = null;
let microphoneSource = null;
let micStream = null;
let detectInterval = null;
let alreadyBlown = false;

function showScreen(targetKey) {
  Object.values(screens).forEach((screen) => screen.classList.remove("active"));
  screens[targetKey].classList.add("active");
}

startBtn.addEventListener("click", () => {
  showScreen("cake");
});

manualBlowBtn.addEventListener("click", () => {
  handleBlowSuccess();
});

replayBtn.addEventListener("click", async () => {
  resetExperience();
  showScreen("intro");
});

enableMicBtn.addEventListener("click", async () => {
  micStatus.textContent = "solicitando permiso del micrófono...";
  try {
    micStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false
    });

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    microphoneSource = audioContext.createMediaStreamSource(micStream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;

    microphoneSource.connect(analyser);

    micStatus.textContent = "micrófono activado. ahora sopla fuerte hacia tu celular ✨";
    startBlowDetection();
  } catch (error) {
    micStatus.textContent =
      "no se pudo usar el micrófono. puedes apagar las velas manualmente con el botón de abajo 🎀";
  }
});

function startBlowDetection() {
  if (!analyser || alreadyBlown) return;

  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  clearInterval(detectInterval);
  detectInterval = setInterval(() => {
    analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }

    const average = sum / dataArray.length;

    if (average > 42) {
      handleBlowSuccess();
    }
  }, 140);
}

function handleBlowSuccess() {
  if (alreadyBlown) return;
  alreadyBlown = true;

  clearInterval(detectInterval);

  blowIndicator.classList.remove("hidden");
  micStatus.textContent = "velitas apagadas ✨";

  candles.forEach((candle, index) => {
    setTimeout(() => {
      candle.classList.add("off");
    }, index * 180);
  });

  startConfetti();

  setTimeout(() => {
    showScreen("letter");
    stopMicrophone();
  }, 2200);
}

function stopMicrophone() {
  if (detectInterval) {
    clearInterval(detectInterval);
    detectInterval = null;
  }

  if (micStream) {
    micStream.getTracks().forEach((track) => track.stop());
    micStream = null;
  }

  if (audioContext && audioContext.state !== "closed") {
    audioContext.close();
  }

  audioContext = null;
  analyser = null;
  microphoneSource = null;
}

function resetExperience() {
  alreadyBlown = false;
  blowIndicator.classList.add("hidden");
  micStatus.textContent = "listo para comenzar 🎀";

  candles.forEach((candle) => {
    candle.classList.remove("off");
  });

  stopMicrophone();
}

/* corazones flotantes */
function createHeart() {
  const heart = document.createElement("div");
  heart.classList.add("heart");

  const items = ["💗", "🎀", "✨"];
  heart.textContent = items[Math.floor(Math.random() * items.length)];
  heart.style.left = Math.random() * 100 + "vw";
  heart.style.animationDuration = 5 + Math.random() * 5 + "s";
  heart.style.fontSize = 14 + Math.random() * 14 + "px";

  heartsContainer.appendChild(heart);

  setTimeout(() => {
    heart.remove();
  }, 9000);
}

setInterval(createHeart, 700);

/* confetti */
function resizeCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

let confettiPieces = [];
let confettiRunning = false;

function startConfetti() {
  confettiRunning = true;

  confettiPieces = Array.from({ length: 160 }, () => ({
    x: Math.random() * confettiCanvas.width,
    y: Math.random() * confettiCanvas.height - confettiCanvas.height,
    w: 6 + Math.random() * 7,
    h: 8 + Math.random() * 12,
    speed: 2 + Math.random() * 3.4,
    sway: Math.random() * 2,
    rotation: Math.random() * Math.PI,
    rotationSpeed: 0.02 + Math.random() * 0.05,
    color: ["#ff77a8", "#ffd166", "#ffffff", "#f7b6d2", "#cdb4ff"][
      Math.floor(Math.random() * 5)
    ]
  }));

  requestAnimationFrame(updateConfetti);

  setTimeout(() => {
    confettiRunning = false;
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }, 2600);
}

function updateConfetti() {
  if (!confettiRunning) return;

  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  confettiPieces.forEach((piece) => {
    piece.y += piece.speed;
    piece.x += Math.sin(piece.y * 0.02) * (1.2 + piece.sway);
    piece.rotation += piece.rotationSpeed;

    ctx.save();
    ctx.translate(piece.x, piece.y);
    ctx.rotate(piece.rotation);
    ctx.fillStyle = piece.color;
    ctx.fillRect(-piece.w / 2, -piece.h / 2, piece.w, piece.h);
    ctx.restore();

    if (piece.y > confettiCanvas.height + 20) {
      piece.y = -20;
      piece.x = Math.random() * confettiCanvas.width;
    }
  });

  requestAnimationFrame(updateConfetti);
}
