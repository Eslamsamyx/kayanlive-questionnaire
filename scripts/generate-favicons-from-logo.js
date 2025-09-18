import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateFaviconsFromOfficialLogo() {
  const publicDir = path.join(__dirname, '..', 'public');
  const logoPath = path.join(publicDir, 'kayan-logo-official.png');

  // Check if logo exists
  if (!fs.existsSync(logoPath)) {
    console.error('❌ Official logo not found at:', logoPath);
    return;
  }

  console.log('🎨 Using official KayanLive logo from moi-content-creation-hub');

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

  // Load the original logo
  const logoBuffer = fs.readFileSync(logoPath);

  // Generate PNGs with dark background for better visibility
  for (const { name, size } of sizes) {
    // Create a dark background with rounded corners
    const background = Buffer.from(`
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="#2c2c2b"/>
      </svg>
    `);

    // Create background layer
    const bgImage = sharp(background).resize(size, size).png();

    // Process logo - resize to fit within the icon with padding
    const padding = Math.floor(size * 0.15);
    const logoSize = size - (padding * 2);

    const processedLogo = await sharp(logoBuffer)
      .resize(logoSize, logoSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toBuffer();

    // Composite logo over background
    await sharp(background)
      .resize(size, size)
      .composite([
        {
          input: processedLogo,
          top: padding,
          left: padding,
        }
      ])
      .png()
      .toFile(path.join(publicDir, name));

    console.log(`✓ Generated ${name}`);
  }

  // Generate ICO file with multiple sizes
  const ico16Buffer = await sharp(logoBuffer)
    .resize(16, 16, { fit: 'contain', background: '#2c2c2b' })
    .png()
    .toBuffer();

  const ico32Buffer = await sharp(logoBuffer)
    .resize(32, 32, { fit: 'contain', background: '#2c2c2b' })
    .png()
    .toBuffer();

  const ico48Buffer = await sharp(logoBuffer)
    .resize(48, 48, { fit: 'contain', background: '#2c2c2b' })
    .png()
    .toBuffer();

  // Use the 32x32 as the main favicon.ico
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico32Buffer);
  console.log('✓ Generated favicon.ico');

  // Generate Open Graph image with the official logo
  const ogBackground = Buffer.from(`
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="630" fill="#2c2c2b"/>
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#7afdd6;stop-opacity:0.1" />
          <stop offset="100%" style="stop-color:#b8a4ff;stop-opacity:0.1" />
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#grad)"/>
      <text x="50%" y="75%" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="32" opacity="0.8">
        Project Brief Questionnaire
      </text>
    </svg>
  `);

  // Process logo for OG image - larger and centered
  const ogLogo = await sharp(logoBuffer)
    .resize(400, 200, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer();

  // Create OG image
  await sharp(ogBackground)
    .composite([
      {
        input: ogLogo,
        top: 190,
        left: 400,
      }
    ])
    .png()
    .toFile(path.join(publicDir, 'og-image.png'));

  console.log('✓ Generated og-image.png');

  // Update site.webmanifest with correct icon paths
  const manifest = {
    name: 'KayanLive Questionnaire',
    short_name: 'KayanLive',
    description: 'KayanLive Project Brief Questionnaire - Submit your booth and exhibition requirements',
    theme_color: '#2c2c2b',
    background_color: '#2c2c2b',
    display: 'standalone',
    scope: '/',
    start_url: '/',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/favicon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/favicon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/kayan-logo-official.png',
        sizes: '1024x1024',
        type: 'image/png',
        purpose: 'any'
      }
    ]
  };

  fs.writeFileSync(
    path.join(publicDir, 'site.webmanifest'),
    JSON.stringify(manifest, null, 2)
  );
  console.log('✓ Updated site.webmanifest');

  console.log('\n✅ All favicons generated from official KayanLive logo!');
}

// Run the generator
generateFaviconsFromOfficialLogo().catch(console.error);