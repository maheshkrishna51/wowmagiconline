import { drawBarcode } from './barcode128';

const STICKER_WIDTH = 420;
const PADDING = 20;
const IMAGE_SIZE = 100;
const BORDER_RADIUS = 12;
const BARCODE_HEIGHT = 32;

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function truncateLine(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (truncated.length > 0 && ctx.measureText(truncated + '...').width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return truncated.trimEnd() + '...';
}

function drawTitleTwoLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(' ');
  let line1 = '';
  let remaining = '';
  let splitIndex = words.length;

  for (let i = 0; i < words.length; i++) {
    const testLine = line1 + words[i] + ' ';
    if (ctx.measureText(testLine).width > maxWidth && i > 0) {
      splitIndex = i;
      break;
    }
    line1 = testLine;
  }

  line1 = line1.trim();
  remaining = words.slice(splitIndex).join(' ');

  ctx.fillText(line1, x, y);

  if (remaining) {
    const line2 = truncateLine(ctx, remaining, maxWidth);
    ctx.fillText(line2, x, y + lineHeight);
    return y + lineHeight * 2;
  }

  return y + lineHeight;
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const proxyResponse = await fetch(`${supabaseUrl}/functions/v1/image-proxy`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: src }),
  });

  if (!proxyResponse.ok) {
    throw new Error('Failed to fetch image via proxy');
  }

  const { data: dataUrl } = await proxyResponse.json();

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}

export async function generateSticker(product: {
  name: string;
  price: number;
  sku: string;
  image: string;
}): Promise<void> {
  const LINE_HEIGHT = 22;
  const TITLE_MAX_LINES = 2;
  const BARCODE_LABEL_HEIGHT = 12;
  const stickerHeight = PADDING + IMAGE_SIZE + PADDING;

  const canvas = document.createElement('canvas');
  canvas.width = STICKER_WIDTH;
  canvas.height = stickerHeight;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  roundRect(ctx, 0, 0, STICKER_WIDTH, stickerHeight, BORDER_RADIUS);
  ctx.fill();

  ctx.strokeStyle = '#d4a574';
  ctx.lineWidth = 2.5;
  roundRect(ctx, 3, 3, STICKER_WIDTH - 6, stickerHeight - 6, BORDER_RADIUS - 1);
  ctx.stroke();

  const imageX = STICKER_WIDTH - PADDING - IMAGE_SIZE;
  const imageY = PADDING;

  ctx.save();
  roundRect(ctx, imageX, imageY, IMAGE_SIZE, IMAGE_SIZE, 10);
  ctx.clip();

  try {
    const img = await loadImage(product.image);
    const aspectRatio = img.width / img.height;
    let drawW = IMAGE_SIZE;
    let drawH = IMAGE_SIZE;
    let drawX = imageX;
    let drawY = imageY;

    if (aspectRatio > 1) {
      drawH = IMAGE_SIZE / aspectRatio;
      drawY = imageY + (IMAGE_SIZE - drawH) / 2;
    } else {
      drawW = IMAGE_SIZE * aspectRatio;
      drawX = imageX + (IMAGE_SIZE - drawW) / 2;
    }

    ctx.fillStyle = '#faf7f4';
    ctx.fillRect(imageX, imageY, IMAGE_SIZE, IMAGE_SIZE);
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  } catch {
    ctx.fillStyle = '#faf7f4';
    ctx.fillRect(imageX, imageY, IMAGE_SIZE, IMAGE_SIZE);
    ctx.fillStyle = '#c4a882';
    ctx.font = '600 12px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('No Image', imageX + IMAGE_SIZE / 2, imageY + IMAGE_SIZE / 2);
  }

  ctx.restore();

  const textLeftX = PADDING + 4;
  const textMaxWidth = STICKER_WIDTH - PADDING * 2 - IMAGE_SIZE - 24;
  const titleHeight = TITLE_MAX_LINES * LINE_HEIGHT;
  const priceHeight = 28;
  const barcodeBlockHeight = BARCODE_HEIGHT + BARCODE_LABEL_HEIGHT;
  const gap = 6;
  const totalTextHeight = titleHeight + gap + priceHeight + gap + barcodeBlockHeight;
  const textStartY = PADDING + (IMAGE_SIZE - totalTextHeight) / 2;

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  ctx.fillStyle = '#1a1a1a';
  ctx.font = '700 17px system-ui, -apple-system, sans-serif';
  drawTitleTwoLines(ctx, product.name, textLeftX, textStartY, textMaxWidth, LINE_HEIGHT);

  let currentY = textStartY + titleHeight + gap;

  ctx.font = '800 24px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#78350f';
  ctx.fillText(`\u20B9${product.price.toFixed(2)}`, textLeftX, currentY);

  currentY += priceHeight + gap;
  drawBarcode(ctx, product.sku, textLeftX, currentY, textMaxWidth, BARCODE_HEIGHT);

  const link = document.createElement('a');
  link.download = `sticker-${product.sku || 'product'}.png`;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
