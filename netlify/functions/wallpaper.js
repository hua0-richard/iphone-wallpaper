const { createCanvas } = require("@napi-rs/canvas");

const WIDTH = 1179;
const HEIGHT = 2556;

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function days(year) {
  return isLeapYear(year) ? 366 : 365;
}

// Matches Python's date.today().timetuple().tm_yday (local day-of-year behavior)
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

  // ctx.paint() (Cairo default is black)
  ctx.fillStyle = "rgb(0,0,0)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // ctx.set_line_width(4) (not used for fill, but kept for parity)
  ctx.lineWidth = 4;

  for (let i = 0; i < 22; i++) {
    for (let j = 0; j < 17; j++) {
      const offsetX = j * 60;
      const offsetY = i * 60;

      const idx = j + i * 17 + 1;

      if (idx > d) {
        ctx.fillStyle = "rgb(0,0,0)";
      } else if (idx < today) {
        ctx.fillStyle = "rgb(204,204,204)"; // 0.8
      } else if (idx > today) {
        ctx.fillStyle = "rgb(51,51,51)"; // 0.2
      } else if (idx === today) {
        ctx.fillStyle = "rgb(204,0,0)"; // 0.8,0,0
      }

      ctx.beginPath();
      ctx.arc(offsetX + 80 + 20, 800 + offsetY, 20, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Text (inside the i-loop in your Python, so we keep it there)
    ctx.fillStyle = "rgb(102,102,102)"; // 0.4

    // Option B font (Linux-friendly)
    ctx.font = "bold 32px 'DejaVu Sans Mono'";
    ctx.textBaseline = "alphabetic";

    const text = `${d - today} • ${Math.round((today / d) * 100)}%`;

    const m = ctx.measureText(text);
    const width = m.width;
    const xbearing = -(m.actualBoundingBoxLeft ?? 0);

    const x = (WIDTH - width) / 2 - xbearing;
    const y = 400 + 1400 + 400;

    ctx.fillText(text, x, y);
  }

  // Return PNG bytes (instead of writing to disk)
  return canvas.toBuffer("image/png");
}

exports.handler = async (event) => {
  try {
    const year = new Date().getFullYear();
    const d = days(year);

    // Optional: allow /wallpaper?day=123 for debugging
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
        "Cache-Control": "public, max-age=3600",
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
