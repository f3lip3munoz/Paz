/* ---------- fechas importantes ---------- */
const importantDates = [
  { label: "Cumpleaños Paz", month: 4, day: 18 },
  { label: "Cumpleaños Felipe", month: 11, day: 18 },
  { label: "Primera cita", month: 12, day: 19 },
];

function daysUntilNext(month, day, from) {
  const today = new Date(from);
  today.setHours(0, 0, 0, 0);

  let target = new Date(today.getFullYear(), month - 1, day);
  target.setHours(0, 0, 0, 0);
  if (target < today) {
    target = new Date(today.getFullYear() + 1, month - 1, day);
  }

  return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

function updateNextDate() {
  const daysEl = document.getElementById("next-date-days");
  const labelEl = document.getElementById("next-date-label");
  if (!daysEl || !labelEl) return;

  const now = new Date();
  let nearest = null;
  importantDates.forEach((d) => {
    const days = daysUntilNext(d.month, d.day, now);
    if (!nearest || days < nearest.days) {
      nearest = { days, label: d.label };
    }
  });

  if (nearest.days === 0) {
    daysEl.textContent = "🎉";
    labelEl.textContent = `¡Hoy es ${nearest.label}!`;
  } else {
    daysEl.textContent = nearest.days;
    labelEl.textContent = `día${nearest.days === 1 ? "" : "s"} para: ${nearest.label}`;
  }
}

updateNextDate();
setInterval(updateNextDate, 60 * 60 * 1000);

/* ---------- mapa de viajes ---------- */
const travelPlaces = [
  { name: "Viña del Mar", detail: "Av. España 650", lat: -33.0279195, lng: -71.5769004, photos: 2 },
  { name: "Terminal Sur", detail: "Santiago", lat: -33.4542593, lng: -70.6881311, photos: 1 },
  { name: "Joaquín Prieto 416", detail: "Bulnes", lat: -36.7404503, lng: -72.3026511, photos: 4 },
  { name: "Bulnes", detail: "", lat: -36.7422507, lng: -72.2987216, photos: 9 },
  { name: "Plaza de Armas", detail: "Bulnes", lat: -36.7424212, lng: -72.298399, photos: 1 },
  { name: "Villa Baviera", detail: "Bulnes", lat: -36.3839317, lng: -71.5907005, photos: 6 },
  { name: "Vivero Santa Rosa", detail: "Bulnes (ubicación aproximada)", lat: -36.7415, lng: -72.301, photos: 5 },
  { name: "Parque Mahuida", detail: "Santiago", lat: -33.4572407, lng: -70.5185126, photos: 1 },
];

const mapContainer = document.getElementById("travel-map");
if (mapContainer && window.L) {
  const map = L.map("travel-map", {
    scrollWheelZoom: false,
    minZoom: 4,
  }).setView([-35.5, -71.5], 5);

  L.tileLayer(
    "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    {
      attribution: "Tiles &copy; Esri",
      maxZoom: 16,
    }
  ).addTo(map);

  const crownIcon = L.divIcon({
    className: "map-pin",
    html: "👑",
    iconSize: [28, 28],
    iconAnchor: [14, 26],
    popupAnchor: [0, -24],
  });

  travelPlaces.forEach((place) => {
    const detailLine = place.detail ? `${place.detail}<br>` : "";
    L.marker([place.lat, place.lng], { icon: crownIcon })
      .addTo(map)
      .bindPopup(
        `<strong>${place.name}</strong><br>${detailLine}${place.photos} foto${place.photos === 1 ? "" : "s"}`
      );
  });

  if (travelPlaces.length > 1) {
    map.fitBounds(
      L.latLngBounds(travelPlaces.map((p) => [p.lat, p.lng])),
      { padding: [30, 30] }
    );
  }
}

/* ---------- musica de fondo ---------- */
const bgMusic = document.getElementById("bg-music");
const musicToggle = document.getElementById("music-toggle");
const MUSIC_KEY = "paz-felipe-music-on";

function setMusicButtonState(playing) {
  if (!musicToggle) return;
  musicToggle.textContent = playing ? "🔊" : "🎵";
  musicToggle.classList.toggle("playing", playing);
  musicToggle.setAttribute("aria-label", playing ? "Pausar musica" : "Reproducir musica");
}

if (bgMusic && musicToggle) {
  bgMusic.volume = 0.35;

  if (localStorage.getItem(MUSIC_KEY) === "on") {
    bgMusic
      .play()
      .then(() => setMusicButtonState(true))
      .catch(() => setMusicButtonState(false));
  }

  musicToggle.addEventListener("click", () => {
    if (bgMusic.paused) {
      bgMusic
        .play()
        .then(() => {
          setMusicButtonState(true);
          localStorage.setItem(MUSIC_KEY, "on");
        })
        .catch(() => {});
    } else {
      bgMusic.pause();
      setMusicButtonState(false);
      localStorage.setItem(MUSIC_KEY, "off");
    }
  });
}

/* ---------- service worker (PWA) ---------- */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register("sw.js");
      if ("periodicSync" in reg) {
        try {
          const status = await navigator.permissions.query({ name: "periodic-background-sync" });
          if (status.state === "granted") {
            await reg.periodicSync.register("month-anniversary-check", {
              minInterval: 12 * 60 * 60 * 1000,
            });
          }
        } catch (e) {
          /* periodic background sync no disponible en este navegador */
        }
      }
    } catch (e) {
      /* sin service worker no hay problema, el sitio sigue funcionando normal */
    }
  });
}

/* ---------- contador ---------- */
const startDate = new Date("2026-04-25T14:00:00");

function monthsTogether(start, now) {
  let months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const reachedAnniversaryPoint =
    now.getDate() > start.getDate() || (now.getDate() === start.getDate() && nowMinutes >= startMinutes);
  if (!reachedAnniversaryPoint) months--;
  return Math.max(0, months);
}

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

  const monthsEl = document.getElementById("months");
  if (monthsEl) monthsEl.textContent = monthsTogether(startDate, now);
}

updateCounter();
setInterval(updateCounter, 1000);

/* ---------- notificacion de mes cumplido ---------- */
const NOTIFY_KEY = "paz-felipe-last-month-notified";
const notifyBtn = document.getElementById("notify-btn");

window.OneSignalDeferred = window.OneSignalDeferred || [];
window.OneSignalDeferred.push(function (OneSignal) {
  window.__oneSignal = OneSignal;
  updateNotifyButton();
});

function updateNotifyButton() {
  if (!notifyBtn || !("Notification" in window)) return;
  const OneSignal = window.__oneSignal;

  if (Notification.permission === "denied") {
    notifyBtn.textContent = "🔕 Notificaciones bloqueadas";
    notifyBtn.disabled = true;
  } else if (OneSignal && OneSignal.User.PushSubscription.optedIn) {
    notifyBtn.textContent = "🔔 Notificaciones activadas";
    notifyBtn.disabled = true;
  } else {
    notifyBtn.textContent = "🔔 Avisarme cada mes cumplido";
    notifyBtn.disabled = false;
  }
}

async function checkMonthAnniversaryNotification() {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  const now = new Date();
  if (now.getDate() !== startDate.getDate() || now.getHours() < 12) return;

  const months = monthsTogether(startDate, now);
  if (months <= 0) return;
  if (localStorage.getItem(NOTIFY_KEY) === String(months)) return;

  const title = "👑 " + months + (months === 1 ? " mes juntos" : " meses juntos");
  const options = {
    body: "Otro mes más contigo, princesa. Entra a ver el contador 💛",
    icon: "icons/icon-192.png",
    badge: "icons/icon-192.png",
  };

  if (navigator.serviceWorker && navigator.serviceWorker.ready) {
    const reg = await navigator.serviceWorker.ready;
    reg.showNotification(title, options);
  } else {
    new Notification(title, options);
  }

  localStorage.setItem(NOTIFY_KEY, String(months));
}

if (notifyBtn) {
  updateNotifyButton();
  notifyBtn.addEventListener("click", async () => {
    if (!("Notification" in window)) {
      alert("Tu navegador no soporta notificaciones.");
      return;
    }
    const OneSignal = window.__oneSignal;
    if (OneSignal) {
      await OneSignal.Notifications.requestPermission();
    } else {
      await Notification.requestPermission();
    }
    updateNotifyButton();
    checkMonthAnniversaryNotification();
  });
}

checkMonthAnniversaryNotification();
setInterval(checkMonthAnniversaryNotification, 15 * 60 * 1000);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") checkMonthAnniversaryNotification();
});

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

/* ---------- galerias de fotos ---------- */
const photoManifest = {
  viajes: [
    "20260411_170220.jpg", "20260713_180853.jpg", "20260713_210930.jpg", "20260713_234236.jpg",
    "20260714_142559.jpg", "20260714_142620.jpg", "20260715_200240.jpg", "20260718_152338.jpg",
    "20260719_135217.jpg", "20260719_151118.jpg", "20260720_145942.jpg", "20260720_154455.jpg",
    "20260720_155120.jpg", "20260720_155301.jpg", "20260720_155321.jpg", "20260720_172513.jpg",
    "20260720_172517.jpg", "20260720_173439.jpg", "20260720_173608.jpg", "20260720_173611.jpg",
    "20260720_173615.jpg", "20260721_153729.jpg", "IMG-20260411-WA0039.jpg", "IMG-20260518-WA0002.jpg",
    "IMG-20260719-WA0028.jpg", "IMG-20260719-WA0037.jpg", "IMG-20260719-WA0048.jpg", "IMG-20260719-WA0062.jpg",
    "IMG-20260719-WA0063.jpg", "IMG-20260719-WA0066.jpg", "IMG_20260718_152705_693.webp", "IMG_20260720_143046_886.webp",
  ],
  momentos: [
    "20260501_153652.jpg", "20260509_145757.jpg", "20260517_185847.jpg", "20260529_180350.jpg",
    "20260605_210812.jpg", "20260605_210814.jpg", "20260725_112526.jpg", "20260725_112541.jpg",
    "20260731_151230.jpg", "20260816_162735.jpg", "20260816_170138.jpg", "20260906_202049.jpg",
    "IMG-20260416-WA0097.jpg", "IMG-20260501-WA0002.jpg", "IMG-20260503-WA0007.jpg", "IMG-20260509-WA0053.jpg",
    "IMG-20260626-WA0037.jpg", "IMG-20260719-WA0020.jpg", "IMG-20260719-WA0021.jpg", "IMG_20260704_232413_479.jpg",
    "IMG_20260730_222604_556.jpg", "IMG_20260920_000645_870.jpg", "IMG_20260920_000648_018.jpg", "IMG_20260920_000657_055.jpg",
  ],
  comedia: [
    "20260429_083635.jpg", "20260518_133323.jpg", "20260609_183344.jpg", "20260625_084241.jpg",
    "20260625_172346.jpg", "20260625_180247.jpg", "20260625_191815.jpg", "20260702_112634.jpg",
    "20260706_195938.jpg", "20260708_094911.jpg", "20260709_132739.jpg", "20260713_183443.jpg",
    "20260713_221733.jpg", "20260721_162633.jpg", "20260721_162655.jpg", "20260721_162705.jpg",
    "616ad5ff95f45a726ebdd98bcaafb2ed_0.jpg", "IMG_20260914_080623_418.jpg",
  ],
};

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxClose = document.getElementById("lightbox-close");
const lightboxPrev = document.getElementById("lightbox-prev");
const lightboxNext = document.getElementById("lightbox-next");
const lightboxCounter = document.getElementById("lightbox-counter");

let currentCategory = null;
let currentIndex = 0;

function renderLightboxPhoto() {
  if (!currentCategory) return;
  const files = photoManifest[currentCategory];
  const file = files[currentIndex];
  lightboxImg.src = `images/${currentCategory}/${file}`;
  lightboxImg.alt = `Recuerdo de ${currentCategory}`;
  if (lightboxCounter) lightboxCounter.textContent = `${currentIndex + 1} / ${files.length}`;
}

function openLightbox(category, index) {
  if (!lightbox || !lightboxImg) return;
  currentCategory = category;
  currentIndex = index;
  renderLightboxPhoto();
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  currentCategory = null;
}

function stepLightbox(delta) {
  if (!currentCategory) return;
  const files = photoManifest[currentCategory];
  currentIndex = (currentIndex + delta + files.length) % files.length;
  renderLightboxPhoto();
}

if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
if (lightboxPrev) lightboxPrev.addEventListener("click", () => stepLightbox(-1));
if (lightboxNext) lightboxNext.addEventListener("click", () => stepLightbox(1));
if (lightbox) {
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
}
document.addEventListener("keydown", (e) => {
  if (!lightbox || !lightbox.classList.contains("open")) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") stepLightbox(-1);
  if (e.key === "ArrowRight") stepLightbox(1);
});

Object.entries(photoManifest).forEach(([category, files]) => {
  const gallery = document.getElementById(`gallery-${category}`);
  if (!gallery || files.length === 0) return;

  const cover = document.createElement("div");
  cover.className = "gallery-cover";

  const tab = document.createElement("div");
  tab.className = "folder-tab";

  const body = document.createElement("div");
  body.className = "folder-body";

  const img = document.createElement("img");
  img.src = `images/${category}/${files[0]}`;
  img.alt = `Recuerdos de ${category}`;
  img.loading = "lazy";

  const badge = document.createElement("span");
  badge.className = "gallery-badge";
  badge.textContent = `${files.length} fotos`;

  body.appendChild(img);
  body.appendChild(badge);
  cover.appendChild(tab);
  cover.appendChild(body);
  cover.addEventListener("click", () => openLightbox(category, 0));
  gallery.appendChild(cover);
});
