import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import toIco from 'sharp-ico';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SVG template for KayanLive favicon
const svgTemplate = (size: number) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="#2c2c2b"/>

  <!-- Gradient Definition -->
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7afdd6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#b8a4ff;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- K Letter - Stylized -->
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        fill="url(#grad)" font-family="Arial, sans-serif"
        font-weight="bold" font-size="${size * 0.55}">K</text>
</svg>`;

// Alternative design with geometric K
const geometricSvg = (size: number) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="#2c2c2b"/>
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7afdd6" />
      <stop offset="50%" style="stop-color:#8ff0e0" />
      <stop offset="100%" style="stop-color:#b8a4ff" />
    </linearGradient>
  </defs>
  <g fill="url(#grad)">
    <!-- K shape using paths -->
    <path d="
      M ${size * 0.25} ${size * 0.2}
      L ${size * 0.25} ${size * 0.8}
      L ${size * 0.35} ${size * 0.8}
      L ${size * 0.35} ${size * 0.55}
      L ${size * 0.65} ${size * 0.8}
      L ${size * 0.75} ${size * 0.8}
      L ${size * 0.45} ${size * 0.5}
      L ${size * 0.75} ${size * 0.2}
      L ${size * 0.65} ${size * 0.2}
      L ${size * 0.35} ${size * 0.5}
      L ${size * 0.35} ${size * 0.2}
      Z
    " />
  </g>
</svg>`;

async function generateFavicons() {
  const publicDir = path.join(__dirname, '..', 'public');

  // Sizes for different favicon variants
  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-192x192.png', size: 192 },
    { name: 'favicon-512x512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 },
  ];

  // Generate PNGs
  for (const { name, size } of sizes) {
    const svg = Buffer.from(geometricSvg(size));

    await sharp(svg)
      .resize(size, size)
      .png()
      .toFile(path.join(publicDir, name));

    console.log(`✓ Generated ${name}`);
  }

  // Generate ICO file with multiple sizes
  const ico16 = await sharp(Buffer.from(geometricSvg(16))).resize(16, 16).png().toBuffer();
  const ico32 = await sharp(Buffer.from(geometricSvg(32))).resize(32, 32).png().toBuffer();
  const ico48 = await sharp(Buffer.from(geometricSvg(48))).resize(48, 48).png().toBuffer();

  try {
    // @ts-ignore - sharp-ico import issues with module types
    const icoBuffer = await (toIco.default || toIco)([ico16, ico32, ico48]);
    fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
    console.log('✓ Generated favicon.ico');
  } catch (e) {
    // Fallback: just use the 32x32 as favicon.ico
    fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico32);
    console.log('✓ Generated favicon.ico (fallback)');
  }

  // Generate Open Graph image (larger social media preview)
  const ogSvg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#2c2c2b"/>
  <defs>
    <linearGradient id="ogGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7afdd6" />
      <stop offset="100%" style="stop-color:#b8a4ff" />
    </linearGradient>
  </defs>
  <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle"
        fill="url(#ogGrad)" font-family="Arial, sans-serif"
        font-weight="bold" font-size="180">KayanLive</text>
  <text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle"
        fill="#ffffff" font-family="Arial, sans-serif"
        font-size="36" opacity="0.8">Project Brief Questionnaire</text>
</svg>`;

  await sharp(Buffer.from(ogSvg))
    .png()
    .toFile(path.join(publicDir, 'og-image.png'));
  console.log('✓ Generated og-image.png');

  // Create site.webmanifest
  const manifest = {
    name: 'KayanLive Questionnaire',
    short_name: 'KayanLive',
    description: 'KayanLive Project Brief Questionnaire',
    theme_color: '#2c2c2b',
    background_color: '#2c2c2b',
    display: 'standalone',
    scope: '/',
    start_url: '/',
    icons: [
      {
        src: '/favicon-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/favicon-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  };

  fs.writeFileSync(
    path.join(publicDir, 'site.webmanifest'),
    JSON.stringify(manifest, null, 2)
  );
  console.log('✓ Generated site.webmanifest');

  console.log('\n✅ All favicon files generated successfully!');
}

// Run the generator
generateFavicons().catch(console.error);