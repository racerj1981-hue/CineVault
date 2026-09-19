import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve('public');
const extensionDir = path.resolve('public/extension');

if (!fs.existsSync(extensionDir)) {
  fs.mkdirSync(extensionDir, { recursive: true });
}

// 1. Sync icon.svg with favicon.svg
const faviconSvg = fs.readFileSync(path.join(publicDir, 'favicon.svg'), 'utf8');
fs.writeFileSync(path.join(publicDir, 'icon.svg'), faviconSvg, 'utf8');

// SVG with safe zone for maskable icon (80% scaled in center of 64x64 canvas, background #09090b)
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#09090b"/>
  <g transform="translate(6.4, 6.4) scale(0.8)">
    ${faviconSvg.replace(/<\?xml.*?\?>/, '').replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '')}
  </g>
</svg>`;

async function generate() {
  console.log('Generating high-res PNG icons from website favicon...');

  // Standard PWA icons
  await sharp(Buffer.from(faviconSvg))
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));

  await sharp(Buffer.from(faviconSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));

  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  await sharp(Buffer.from(faviconSvg))
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // Chrome Extension & standard sizes
  const sizes = [16, 32, 48, 128];
  for (const size of sizes) {
    const buf = await sharp(Buffer.from(faviconSvg))
      .resize(size, size)
      .png()
      .toBuffer();

    fs.writeFileSync(path.join(publicDir, `icon-${size}.png`), buf);
    fs.writeFileSync(path.join(extensionDir, `icon${size}.png`), buf);
  }

  console.log('All icons generated successfully!');
}

generate().catch((err) => {
  console.error('Failed to generate icons:', err);
  process.exit(1);
});
