import { createCanvas } from "canvas";

function dayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff =
    date - start +
    (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function drawWallpaper(day) {
  const width = 1024;
  const height = 1024;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // background
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, width, height);

  // text
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 96px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillText(`Day ${day}`, width / 2, height / 2);

  return canvas.toBuffer("image/png");
}

export async function handler() {
  try {
    const today = dayOfYear();
    const imageBuffer = drawWallpaper(today);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600",
      },
      body: imageBuffer.toString("base64"),
      isBase64Encoded: true,
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
