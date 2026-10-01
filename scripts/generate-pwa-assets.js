import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Crisp Luxury Emblem SVG
const getEmblemSvg = (width, height, isMaskable = false) => {
  const padding = isMaskable ? 0.2 : 0.08;
  const contentWidth = width * (1 - padding * 2);
  const contentHeight = height * (1 - padding * 2);
  const offsetX = width * padding;
  const offsetY = height * padding;

  return `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1c1917" />
        <stop offset="50%" stop-color="#0c0a09" />
        <stop offset="100%" stop-color="#0c0a09" />
      </linearGradient>
      <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fef08a" />
        <stop offset="50%" stop-color="#f59e0b" />
        <stop offset="100%" stop-color="#b45309" />
      </linearGradient>
      <linearGradient id="sparkle" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#fbbf24" />
      </linearGradient>
    </defs>

    <!-- Background -->
    <rect width="${width}" height="${height}" rx="${isMaskable ? 0 : width * 0.18}" fill="url(#bg)" />
    
    <!-- Outer gold accent ring -->
    <circle cx="${width / 2}" cy="${height / 2}" r="${width * 0.42}" fill="none" stroke="url(#gold)" stroke-width="${width * 0.015}" opacity="0.35" />
    <circle cx="${width / 2}" cy="${height / 2}" r="${width * 0.38}" fill="none" stroke="url(#gold)" stroke-width="${width * 0.008}" stroke-dasharray="8,6" opacity="0.5" />

    <!-- Centered Content -->
    <g transform="translate(${offsetX}, ${offsetY})">
      <!-- Luxury Hanger / Crown Graphic -->
      <path d="M ${contentWidth * 0.5} ${contentHeight * 0.28}
               C ${contentWidth * 0.45} ${contentHeight * 0.22}, ${contentWidth * 0.55} ${contentHeight * 0.20}, ${contentWidth * 0.53} ${contentHeight * 0.14}
               C ${contentWidth * 0.51} ${contentHeight * 0.08}, ${contentWidth * 0.43} ${contentHeight * 0.10}, ${contentWidth * 0.45} ${contentHeight * 0.18}"
            fill="none" stroke="url(#gold)" stroke-width="${contentWidth * 0.04}" stroke-linecap="round" />

      <!-- Main Triangle Hanger Body -->
      <path d="M ${contentWidth * 0.5} ${contentHeight * 0.28}
               L ${contentWidth * 0.15} ${contentHeight * 0.48}
               C ${contentWidth * 0.12} ${contentHeight * 0.50}, ${contentWidth * 0.14} ${contentHeight * 0.55}, ${contentWidth * 0.20} ${contentHeight * 0.55}
               L ${contentWidth * 0.80} ${contentHeight * 0.55}
               C ${contentWidth * 0.86} ${contentHeight * 0.55}, ${contentWidth * 0.88} ${contentHeight * 0.50}, ${contentWidth * 0.85} ${contentHeight * 0.48}
               Z"
            fill="none" stroke="url(#gold)" stroke-width="${contentWidth * 0.04}" stroke-linejoin="round" />

      <!-- Mirror / Dress Drape Silhouette -->
      <path d="M ${contentWidth * 0.32} ${contentHeight * 0.55}
               Q ${contentWidth * 0.28} ${contentHeight * 0.72} ${contentWidth * 0.22} ${contentHeight * 0.86}
               L ${contentWidth * 0.78} ${contentHeight * 0.86}
               Q ${contentWidth * 0.72} ${contentHeight * 0.72} ${contentWidth * 0.68} ${contentHeight * 0.55}
               Z"
            fill="url(#gold)" opacity="0.18" stroke="url(#gold)" stroke-width="${contentWidth * 0.025}" stroke-linejoin="round" />

      <!-- Sparkles -->
      <!-- Left Sparkle -->
      <path d="M ${contentWidth * 0.22} ${contentHeight * 0.34} L ${contentWidth * 0.24} ${contentHeight * 0.36} L ${contentWidth * 0.22} ${contentHeight * 0.38} L ${contentWidth * 0.20} ${contentHeight * 0.36} Z"
            fill="url(#sparkle)" transform="scale(1.8) translate(-${contentWidth * 0.08}, -${contentHeight * 0.12})" />
      <!-- Right Sparkle -->
      <path d="M ${contentWidth * 0.75} ${contentHeight * 0.30} L ${contentWidth * 0.78} ${contentHeight * 0.33} L ${contentWidth * 0.75} ${contentHeight * 0.36} L ${contentWidth * 0.72} ${contentHeight * 0.33} Z"
            fill="url(#sparkle)" transform="scale(2) translate(-${contentWidth * 0.36}, -${contentHeight * 0.14})" />
    </g>
  </svg>
  `;
};

// Screenshot Generator
const getScreenshotSvg = (width, height, isMobile) => {
  return `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="#0c0a09" />
    <!-- Header bar -->
    <rect width="${width}" height="${height * 0.1}" fill="#1c1917" />
    <circle cx="${width * 0.08}" cy="${height * 0.05}" r="${height * 0.025}" fill="#f59e0b" />
    <rect x="${width * 0.14}" y="${height * 0.035}" width="${width * 0.35}" height="${height * 0.03}" rx="4" fill="#fbbf24" opacity="0.8" />
    
    <!-- Hero / Main mirror panel -->
    <rect x="${width * 0.06}" y="${height * 0.14}" width="${width * 0.88}" height="${height * 0.65}" rx="16" fill="#1c1917" stroke="#b45309" stroke-width="4" />
    <circle cx="${width * 0.5}" cy="${height * 0.35}" r="${height * 0.12}" fill="#292524" />
    <path d="M ${width * 0.35} ${height * 0.62} Q ${width * 0.5} ${height * 0.48} ${width * 0.65} ${height * 0.62} L ${width * 0.7} ${height * 0.75} L ${width * 0.3} ${height * 0.75} Z" fill="#b45309" opacity="0.7" />
    
    <!-- Action buttons -->
    <rect x="${width * 0.12}" y="${height * 0.83}" width="${width * 0.76}" height="${height * 0.08}" rx="12" fill="#d97706" />
    <text x="${width * 0.5}" y="${height * 0.88}" fill="#ffffff" font-family="sans-serif" font-size="${height * 0.035}" font-weight="bold" text-anchor="middle">VIRTUAL TRIAL ROOM</text>
  </svg>
  `;
};

async function generate() {
  console.log('Generating PWA Icons & Screenshots...');

  // 1. 192x192 PNG
  await sharp(Buffer.from(getEmblemSvg(192, 192, false)))
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('✓ pwa-192x192.png created');

  // 2. 512x512 PNG
  await sharp(Buffer.from(getEmblemSvg(512, 512, false)))
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('✓ pwa-512x512.png created');

  // 3. Maskable 512x512 PNG (with safe-zone margin)
  await sharp(Buffer.from(getEmblemSvg(512, 512, true)))
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('✓ pwa-maskable-512x512.png created');

  // 4. Apple Touch Icon 180x180 PNG
  await sharp(Buffer.from(getEmblemSvg(180, 180, false)))
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ apple-touch-icon.png created');

  // 5. Favicon PNG
  await sharp(Buffer.from(getEmblemSvg(64, 64, false)))
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('✓ favicon.png created');

  // 6. Mobile Screenshot (750x1334)
  await sharp(Buffer.from(getScreenshotSvg(750, 1334, true)))
    .png()
    .toFile(path.join(publicDir, 'screenshot-mobile.png'));
  console.log('✓ screenshot-mobile.png created');

  // 7. Desktop Screenshot (1280x720)
  await sharp(Buffer.from(getScreenshotSvg(1280, 720, false)))
    .png()
    .toFile(path.join(publicDir, 'screenshot-desktop.png'));
  console.log('✓ screenshot-desktop.png created');

  console.log('All PWA assets successfully generated!');
}

generate().catch(console.error);
