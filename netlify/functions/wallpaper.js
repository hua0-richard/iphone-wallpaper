const { createCanvas } = require("@napi-rs/canvas");

const WIDTH = 1179;
const HEIGHT = 2556;

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function days(year) {
  return isLeapYear(year) ? 366 : 365;
}

function day_of_year_local() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff =
    now - start +
    (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function draw_wallpaper(today, year) {
  const d = days(year);

  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  // Equivalent to Cairo ctx.paint() with default black source
  ctx.fillStyle = "rgb(0,0,0)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.lineWidth = 4;

  for (let i = 0; i < 22; i++) {
    for (let j = 0; j < 17; j++) {
      const offsetX = j * 60;
      const offsetY = i * 60;
      const idx = j + i * 17 + 1;

      if (idx > d) ctx.fillStyle = "rgb(0,0,0)";
      else if (idx < today) ctx.fillStyle = "rgb(204,204,204)"; // 0.8
      else if (idx > today) ctx.fillStyle = "rgb(51,51,51)";     // 0.2
      else ctx.fillStyle = "rgb(204,0,0)";                       // 0.8,0,0

      ctx.beginPath();
      ctx.arc(offsetX + 100, 800 + offsetY, 20, 0, 2 * Math.PI);
      ctx.fill();
    }

    // --- Text block (kept inside i-loop like your Python) ---
    // Font stack for Linux robustness
    ctx.font = "bold 32px 'DejaVu Sans Mono','Liberation Mono',monospace";
    ctx.textBaseline = "alphabetic";

    // Same text content as Python
    const text = `${d - today} • ${Math.round((today / d) * 100)}%`;

    // Centering with xbearing equivalent
    const m = ctx.measureText(text);
    const width = m.width;
    const xbearing = -(m.actualBoundingBoxLeft ?? 0);

    const x = (WIDTH - width) / 2 - xbearing;
    const y = 400 + 1400 + 400;

    // Make it visible on all displays: stroke behind + fill on top
    // (If you want strict parity later, remove strokeText + use rgb(102,102,102) only.)
    ctx.lineWidth = 6;
    ctx.strokeStyle = "rgb(0,0,0)";
    ctx.strokeText(text, x, y);

    // Slightly brighter than 0.4 so you can actually see it on Netlify output
    // If you insist on exact 0.4 parity: change back to rgb(102,102,102)
    ctx.fillStyle = "rgb(180,180,180)";
    ctx.fillText(text, x, y);
  }

  return canvas.toBuffer("image/png");
}

exports.handler = async (event) => {
  try {
    const year = new Date().getFullYear();
    const d = days(year);

    const qs = event.queryStringParameters || {};
    let today = qs.day ? parseInt(qs.day, 10) : day_of_year_local();
    if (!Number.isFinite(today)) today = day_of_year_local();
    if (today < 1) today = 1;
    if (today > d) today = d;

    const png = draw_wallpaper(today, year);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store", // helpful while debugging
      },
      body: png.toString("base64"),
      isBase64Encoded: true,
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: String(err?.message || err) }),
    };
  }
};
