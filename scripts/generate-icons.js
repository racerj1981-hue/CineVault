import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { execSync } from 'child_process';

const publicDir = path.resolve('public');
const extensionDir = path.resolve('public/extension');

if (!fs.existsSync(extensionDir)) {
  fs.mkdirSync(extensionDir, { recursive: true });
}

const inputPath = fs.existsSync(path.resolve('public/website-icon.jpg'))
  ? path.resolve('public/website-icon.jpg')
  : '/tmp/downloaded_icon.jpg';

async function generate() {
  console.log('Generating high-quality icons from provided website icon...');

  const inputBuffer = fs.readFileSync(inputPath);

  // 1. Save standard favicon.png (32x32 and high-res versions)
  await sharp(inputBuffer)
    .resize(32, 32, { fit: 'cover' })
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));

  // 2. Standard sizes for browsers, extensions and PWA
  const sizes = [16, 32, 48, 128, 192, 512];
  for (const size of sizes) {
    const buf = await sharp(inputBuffer)
      .resize(size, size, { fit: 'cover' })
      .png()
      .toBuffer();

    if ([16, 32, 48, 128].includes(size)) {
      fs.writeFileSync(path.join(publicDir, `icon-${size}.png`), buf);
      fs.writeFileSync(path.join(extensionDir, `icon${size}.png`), buf);
    }

    if (size === 192) {
      fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), buf);
    }
    if (size === 512) {
      fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), buf);
      fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), buf);
    }
  }

  // 3. Apple Touch Icon (180x180)
  await sharp(inputBuffer)
    .resize(180, 180, { fit: 'cover' })
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // 4. Multi-res favicon.ico using ImageMagick
  try {
    execSync(
      `convert ${path.join(publicDir, 'icon-16.png')} ${path.join(publicDir, 'icon-32.png')} ${path.join(publicDir, 'icon-48.png')} ${path.join(publicDir, 'favicon.ico')}`
    );
    console.log('favicon.ico successfully created');
  } catch (err) {
    console.error('convert command failed:', err);
  }

  // 5. SVG icon embedding data URI
  const iconBase64 = fs.readFileSync(path.join(publicDir, 'icon-48.png')).toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <image href="data:image/png;base64,${iconBase64}" width="48" height="48"/>
</svg>\n`;
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf8');

  // Copy raw image as website-icon.jpg if not already there
  const destWebsiteIcon = path.join(publicDir, 'website-icon.jpg');
  if (inputPath !== destWebsiteIcon) {
    fs.copyFileSync(inputPath, destWebsiteIcon);
  }

  console.log('All website icons successfully generated!');
}

generate().catch((err) => {
  console.error('Failed to generate icons:', err);
  process.exit(1);
});
