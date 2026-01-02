import { join } from 'path';
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';

const fontPath = join(process.cwd(), 'fonts', 'JetBrainsMono.ttf');
try {
  GlobalFonts.registerFromPath(fontPath, 'JetBrains Mono');
} catch (e) {
  console.warn('Failed to register font:', e);
}

const WIDTH = 1179;
const HEIGHT = 2556;

const THEMES = {
  default: {
    bg: 'rgb(17, 17, 17)',       
    past: 'rgb(68, 68, 68)',     
    future: 'rgb(34, 34, 34)',  
    accent: 'rgb(200, 125, 35)', 
    textStroke: 'rgb(51, 51, 51)',
    textFill: 'rgb(200, 125, 35)'
  },
  cyberpunk: {
    bg: 'rgb(10, 10, 20)',       
    past: 'rgb(50, 20, 50)',    
    future: 'rgb(20, 20, 40)',  
    accent: 'rgb(0, 255, 255)', 
    textStroke: 'rgb(255, 0, 255)',
    textFill: 'rgb(0, 255, 255)'
  },
    apple_silver: {
    bg: 'rgb(245, 245, 247)',
    past: 'rgb(220, 220, 225)',
    future: 'rgb(255, 255, 255)',
    accent: 'rgb(0, 122, 255)',
    textStroke: 'rgb(180, 180, 185)',
    textFill: 'rgb(30, 30, 30)'
  },

  apple_space_gray: {
    bg: 'rgb(28, 28, 30)',
    past: 'rgb(45, 45, 50)',
    future: 'rgb(20, 20, 22)',
    accent: 'rgb(10, 132, 255)',
    textStroke: 'rgb(90, 90, 95)',
    textFill: 'rgb(235, 235, 240)'
  },

  google_light: {
    bg: 'rgb(255, 255, 255)',
    past: 'rgb(240, 240, 240)',
    future: 'rgb(250, 250, 250)',
    accent: 'rgb(66, 133, 244)',
    textStroke: 'rgb(219, 68, 55)',
    textFill: 'rgb(32, 33, 36)'
  },

  google_dark: {
    bg: 'rgb(32, 33, 36)',
    past: 'rgb(48, 49, 52)',
    future: 'rgb(24, 25, 28)',
    accent: 'rgb(138, 180, 248)',
    textStroke: 'rgb(251, 188, 5)',
    textFill: 'rgb(232, 234, 237)'
  },

  neo_minimal: {
    bg: 'rgb(250, 250, 250)',
    past: 'rgb(235, 235, 235)',
    future: 'rgb(255, 255, 255)',
    accent: 'rgb(0, 0, 0)',
    textStroke: 'rgb(200, 200, 200)',
    textFill: 'rgb(15, 15, 15)'
  },

  brutalist: {
    bg: 'rgb(18, 18, 18)',
    past: 'rgb(60, 60, 60)',
    future: 'rgb(10, 10, 10)',
    accent: 'rgb(255, 255, 0)',
    textStroke: 'rgb(255, 255, 255)',
    textFill: 'rgb(255, 255, 255)'
  },

  synthwave: {
    bg: 'rgb(18, 10, 32)',
    past: 'rgb(80, 20, 90)',
    future: 'rgb(30, 10, 50)',
    accent: 'rgb(255, 0, 200)',
    textStroke: 'rgb(0, 255, 255)',
    textFill: 'rgb(255, 120, 255)'
  },

  solarized_dark: {
    bg: 'rgb(0, 43, 54)',
    past: 'rgb(7, 54, 66)',
    future: 'rgb(0, 33, 44)',
    accent: 'rgb(38, 139, 210)',
    textStroke: 'rgb(181, 137, 0)',
    textFill: 'rgb(238, 232, 213)'
  },

  nord: {
    bg: 'rgb(46, 52, 64)',
    past: 'rgb(59, 66, 82)',
    future: 'rgb(36, 41, 53)',
    accent: 'rgb(136, 192, 208)',
    textStroke: 'rgb(143, 188, 187)',
    textFill: 'rgb(236, 239, 244)'
  },

  midnight_forest: {
    bg: 'rgb(12, 18, 14)',
    past: 'rgb(24, 40, 30)',
    future: 'rgb(8, 12, 10)',
    accent: 'rgb(80, 200, 120)',
    textStroke: 'rgb(40, 120, 80)',
    textFill: 'rgb(220, 240, 230)'
  }
};

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function days(year) {
  return isLeapYear(year) ? 366 : 365;
}

function day_of_year_local() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff =
    now -
    start +
    (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function draw_wallpaper(today, year, theme) {
  const d = days(year);

  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  ctx.font = '64px "JetBrains Mono"';
  ctx.fillText('HELLO', WIDTH / 2, 2200);

  // Apply Theme
  const { bg, past, future, accent, textStroke, textFill } = theme;

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.lineWidth = 4;

  for (let i = 0; i < 22; i++) {
    for (let j = 0; j < 17; j++) {
      const offsetX = j * 60;
      const offsetY = i * 60;
      const idx = j + i * 17 + 1;

      if (idx > d) ctx.fillStyle = bg;
      else if (idx < today) ctx.fillStyle = past;
      else if (idx > today) ctx.fillStyle = future;
      else ctx.fillStyle = accent;

      ctx.beginPath();
      ctx.arc(offsetX + 100, 800 + offsetY, 20, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  ctx.font = 'bold 32px "JetBrains Mono"';
  ctx.textBaseline = 'alphabetic';
  const text = `${d - today} • ${Math.round((today / d) * 100)}%`;
  const m = ctx.measureText(text);
  const width = m.width;
  const xbearing = -(m.actualBoundingBoxLeft ?? 0);
  const x = (WIDTH - width) / 2 - xbearing;
  const y = 400 + 1400 + 400;
  ctx.lineWidth = 6;
  ctx.strokeStyle = textStroke;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = textFill;
  ctx.fillText(text, x, y);
  return canvas.toBuffer('image/png');
}

export async function handler(event) {
  try {
    const year = new Date().getFullYear();
    const d = days(year);

    const qs = event.queryStringParameters || {};

    // Day logic
    let today = qs.day ? parseInt(qs.day, 10) : day_of_year_local();
    if (!Number.isFinite(today)) today = day_of_year_local();
    if (today < 1) today = 1;
    if (today > d) today = d;

    // Theme logic
    const themeName = (qs.theme || 'default').toLowerCase();
    const theme = THEMES[themeName] || THEMES.default;

    const png = draw_wallpaper(today, year, theme);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store',
      },
      body: png.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: String(err?.message || err) }),
    };
  }
}
