const START = { year: 2026, month: 4, day: 25 };
const APP_ID = "19a4e4ce-695c-44c9-a738-b080ce274927";
const STATE_FILE = ".github/state/last-notified.txt";

function chileNow() {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(new Date()).map((p) => [p.type, p.value]));
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour) % 24,
    minute: Number(parts.minute),
  };
}

function monthsTogether(now) {
  let months = (now.year - START.year) * 12 + (now.month - START.month);
  if (now.day < START.day) months--;
  return Math.max(0, months);
}

async function main() {
  const now = chileNow();
  console.log("Chile local time:", now);

  if (now.day !== START.day) {
    console.log("Hoy no es el dia de aniversario, nada que hacer.");
    return;
  }
  if (now.hour !== 12) {
    console.log(`No es mediodia en Chile todavia (hora actual: ${now.hour}), nada que hacer.`);
    return;
  }

  const months = monthsTogether(now);
  if (months <= 0) {
    console.log("Todavia no se cumple el primer mes.");
    return;
  }

  const fs = require("fs");
  const key = `${now.year}-${now.month}`;
  let last = null;
  try {
    last = fs.readFileSync(STATE_FILE, "utf8").trim();
  } catch (e) {
    /* primera vez, no hay archivo de estado */
  }

  if (last === key) {
    console.log("Ya se envio el aviso de este mes.");
    return;
  }

  const title = "👑 " + months + (months === 1 ? " mes juntos" : " meses juntos");
  const res = await fetch("https://onesignal.com/api/v1/notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Key ${process.env.ONESIGNAL_REST_API_KEY}`,
    },
    body: JSON.stringify({
      app_id: APP_ID,
      included_segments: ["Subscribed Users"],
      headings: { en: title },
      contents: { en: "Otro mes más contigo, princesa. Entra a ver el contador 💛" },
      url: "https://f3lip3munoz.github.io/Proyecto25/",
      chrome_web_icon: "https://f3lip3munoz.github.io/Proyecto25/icons/icon-192.png",
    }),
  });

  const body = await res.text();
  if (!res.ok) {
    throw new Error(`OneSignal API respondio ${res.status}: ${body}`);
  }
  console.log("Notificacion enviada:", body);

  fs.mkdirSync(".github/state", { recursive: true });
  fs.writeFileSync(STATE_FILE, key);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
