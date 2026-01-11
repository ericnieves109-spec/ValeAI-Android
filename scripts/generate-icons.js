// Script to generate PWA icons with black background and white V
const fs = require('fs');
const path = require('path');

// SVG template for the icons
const createSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#000000"/>
  <path d="M${size * 0.25} ${size * 0.2}L${size * 0.5} ${size * 0.8}L${size * 0.75} ${size * 0.2}" 
        stroke="white" 
        stroke-width="${size * 0.08}" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        fill="none"/>
</svg>
`;

// Generate SVG files
const publicDir = path.join(__dirname, '../client/public');

// 192x192
fs.writeFileSync(
  path.join(publicDir, 'icon-192.svg'),
  createSVG(192)
);

// 512x512
fs.writeFileSync(
  path.join(publicDir, 'icon-512.svg'),
  createSVG(512)
);

// Apple touch icon
fs.writeFileSync(
  path.join(publicDir, 'apple-touch-icon.svg'),
  createSVG(180)
);

console.log('✅ Icon SVG files generated successfully!');
console.log('Note: Convert these to PNG using an image converter or online tool.');
