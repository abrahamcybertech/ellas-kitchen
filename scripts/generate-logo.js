const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const svgLogo = `
<svg width="400" height="120" viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F3E2B4" />
      <stop offset="50%" stop-color="#C9972C" />
      <stop offset="100%" stop-color="#875E17" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  
  <!-- Emblem Badge -->
  <g transform="translate(15, 15)">
    <rect x="0" y="0" width="90" height="90" rx="16" fill="#1A0E08" stroke="url(#goldGrad)" stroke-width="2.5" />
    <circle cx="45" cy="45" r="34" fill="none" stroke="#C9972C" stroke-dasharray="3,3" stroke-width="1.2" />
    <path d="M30 45 Q45 25 60 45 Q45 65 30 45 Z" fill="url(#goldGrad)" opacity="0.3" />
    <text x="45" y="54" font-family="Georgia, serif" font-size="34" font-weight="bold" fill="url(#goldGrad)" text-anchor="middle">E</text>
  </g>

  <!-- Wordmark Text -->
  <g transform="translate(122, 25)">
    <text x="0" y="38" font-family="'Plus Jakarta Sans', Georgia, serif" font-size="30" font-weight="800" letter-spacing="3" fill="url(#goldGrad)">ELLA'S</text>
    <text x="0" y="65" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="14" font-weight="600" letter-spacing="7" fill="#E1BC5F">KITCHEN</text>
    <text x="0" y="80" font-family="Arial, sans-serif" font-size="9" font-weight="400" letter-spacing="2.5" fill="#A58B79">NIGERIAN CUISINE &amp; CATERING</text>
  </g>
</svg>
`;

async function main() {
  const dest = path.join(__dirname, '../public/ella.png');
  await sharp(Buffer.from(svgLogo))
    .png()
    .toFile(dest);
  console.log('Created placeholder /public/ella.png');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
