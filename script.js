/* ---------- contador ---------- */
const startDate = new Date("2026-04-25T14:00:00");

function updateCounter() {
  const daysEl = document.getElementById("days");
  if (!daysEl) return;

  const now = new Date();
  let diff = now - startDate;
  if (diff < 0) diff = 0;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  daysEl.textContent = String(days).padStart(4, "0");
  document.getElementById("hours").textContent = String(hours).padStart(2, "0");
  document.getElementById("minutes").textContent = String(minutes).padStart(2, "0");
  document.getElementById("seconds").textContent = String(seconds).padStart(2, "0");
}

updateCounter();
setInterval(updateCounter, 1000);

/* ---------- fondo de estrellas ---------- */
const canvas = document.getElementById("stars-bg");
if (canvas) {
  const ctx = canvas.getContext("2d");
  let stars = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const count = Math.floor((canvas.width * canvas.height) / 9000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.3,
      baseAlpha: Math.random() * 0.6 + 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.02 + 0.01,
    }));
  }

  function drawStars(t) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of stars) {
      const twinkle = Math.sin(t * s.speed + s.phase) * 0.4 + 0.6;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${s.baseAlpha * twinkle})`;
      ctx.fill();
    }
    requestAnimationFrame(drawStars);
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
  requestAnimationFrame(drawStars);
}

/* ---------- flores cayendo ---------- */
const petalsContainer = document.getElementById("petals");
if (petalsContainer) {
  const flowers = ["🌸", "🌺", "🌷", "✨", "👑"];
  const petalCount = window.innerWidth < 600 ? 10 : 18;

  for (let i = 0; i < petalCount; i++) {
    const petal = document.createElement("span");
    petal.className = "petal";
    petal.textContent = flowers[Math.floor(Math.random() * flowers.length)];
    petal.style.left = Math.random() * 100 + "vw";
    petal.style.animationDuration = 10 + Math.random() * 12 + "s";
    petal.style.animationDelay = Math.random() * 10 + "s";
    petal.style.fontSize = 1 + Math.random() * 1.2 + "rem";
    petalsContainer.appendChild(petal);
  }
}

/* ---------- estela de destellos con el mouse ---------- */
let lastSparkle = 0;
document.addEventListener("mousemove", (e) => {
  const now = Date.now();
  if (now - lastSparkle < 60) return;
  lastSparkle = now;

  const sparkle = document.createElement("span");
  sparkle.className = "sparkle";
  sparkle.textContent = Math.random() > 0.5 ? "✨" : "★";
  sparkle.style.left = e.clientX + "px";
  sparkle.style.top = e.clientY + "px";
  sparkle.style.color = Math.random() > 0.5 ? "#7cf7ff" : "#ffd76f";
  document.body.appendChild(sparkle);
  setTimeout(() => sparkle.remove(), 800);
});

/* ---------- corazon con estallido ---------- */
const heartBtn = document.getElementById("heart-btn");
if (heartBtn) {
  heartBtn.addEventListener("click", () => {
    const rect = heartBtn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    for (let i = 0; i < 12; i++) {
      const h = document.createElement("span");
      h.className = "burst-heart";
      h.textContent = "❤";
      const angle = (Math.PI * 2 * i) / 12;
      const dist = 60 + Math.random() * 40;
      h.style.setProperty("--dx", Math.cos(angle) * dist + "px");
      h.style.setProperty("--dy", Math.sin(angle) * dist + "px");
      h.style.left = cx + "px";
      h.style.top = cy + "px";
      document.body.appendChild(h);
      setTimeout(() => h.remove(), 1000);
    }
  });
}

/* ---------- boton mensaje sorpresa ---------- */
const surpriseBtn = document.getElementById("surprise-btn");
const surpriseMessage = document.getElementById("surprise-message");
const messages = [
  "Eres mi persona favorita en cualquier universo 🌌",
  "Contigo hasta las cosas aburridas son mi parte favorita del día 💫",
  "Cada recuerdo contigo merece su propio lugar aquí ✨",
  "Gracias por elegirme, todos los días 💛",
  "Sigues siendo mi comediante favorita 😂❤️",
  "Cuento las horas literalmente, mira el contador ⬆️",
  "Para mí siempre serás mi princesa 👑",
  "Ninguna corona te queda tan bien como tu sonrisa 👑✨",
  "Eres la princesa de este reino y de mi vida 💗",
];

if (surpriseBtn && surpriseMessage) {
  surpriseBtn.addEventListener("click", () => {
    const random = messages[Math.floor(Math.random() * messages.length)];
    surpriseMessage.textContent = random;
  });
}

/* ---------- tarjetas de recuerdos (flip) ---------- */
document.querySelectorAll(".flip-card").forEach((card) => {
  card.addEventListener("click", () => {
    card.classList.toggle("flipped");
  });
});
