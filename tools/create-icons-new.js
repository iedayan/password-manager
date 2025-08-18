// Generate PNG icons from SVG for Chrome extension
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

const svgIcon = `
<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#06b6d4;stop-opacity:1" />
      <stop offset="30%" style="stop-color:#0891b2;stop-opacity:1" />
      <stop offset="70%" style="stop-color:#0e7490;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#164e63;stop-opacity:1" />
    </linearGradient>
    <filter id="iconGlow">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge> 
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Outer Glow -->
  <circle cx="64" cy="64" r="60" fill="rgba(6, 182, 212, 0.1)" filter="url(#iconGlow)"/>
  
  <!-- Main Shield -->
  <path d="M64 8C64 8 40 4 24 4C8 4 0 8 0 8V56C0 84 16 104 32 112C48 120 64 112 80 112C96 104 112 84 112 56V8S104 4 88 4C72 4 64 8 64 8Z" 
        fill="url(#iconGradient)" 
        stroke="rgba(255, 255, 255, 0.2)" 
        stroke-width="2"/>
  
  <!-- Inner Shield Highlight -->
  <path d="M64 16C64 16 44 12 32 12C20 12 8 16 8 16V56C8 76 20 92 32 100C44 108 64 100 76 100C88 92 100 76 100 56V16S88 12 76 12C64 12 64 16 64 16Z" 
        fill="rgba(255, 255, 255, 0.1)" 
        stroke="rgba(255, 255, 255, 0.15)" 
        stroke-width="1"/>
  
  <!-- Lock Body -->
  <rect x="40" y="64" width="32" height="24" rx="4" 
        fill="white" 
        stroke="rgba(6, 182, 212, 0.3)" 
        stroke-width="1"/>
  
  <!-- Lock Shackle -->
  <path d="M48 64V52C48 45.4 53.4 40 60 40H68C74.6 40 80 45.4 80 52V64" 
        stroke="white" 
        stroke-width="5" 
        fill="none" 
        stroke-linecap="round"/>
  
  <!-- Lock Keyhole -->
  <circle cx="56" cy="76" r="4" fill="#06b6d4"/>
  <rect x="54" y="76" width="4" height="6" fill="#06b6d4"/>
  
  <!-- Security Pattern -->
  <circle cx="84" cy="36" r="2" fill="rgba(255, 255, 255, 0.4)"/>
  <circle cx="92" cy="44" r="1.6" fill="rgba(255, 255, 255, 0.3)"/>
  <circle cx="76" cy="28" r="2.4" fill="rgba(255, 255, 255, 0.5)"/>
</svg>
`;

// Convert SVG to different sizes
const sizes = [16, 32, 48, 128];

async function generateIcons() {
  for (const size of sizes) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Create a simple programmatic icon since we can't easily convert SVG
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#06b6d4');
    gradient.addColorStop(0.3, '#0891b2');
    gradient.addColorStop(0.7, '#0e7490');
    gradient.addColorStop(1, '#164e63');
    
    // Shield shape
    ctx.fillStyle = gradient;
    ctx.beginPath();
    const centerX = size / 2;
    const centerY = size / 2;
    
    // Draw shield path
    ctx.moveTo(centerX, size * 0.1);
    ctx.lineTo(size * 0.9, size * 0.2);
    ctx.lineTo(size * 0.9, size * 0.6);
    ctx.quadraticCurveTo(size * 0.9, size * 0.9, centerX, size * 0.95);
    ctx.quadraticCurveTo(size * 0.1, size * 0.9, size * 0.1, size * 0.6);
    ctx.lineTo(size * 0.1, size * 0.2);
    ctx.closePath();
    ctx.fill();
    
    // Lock
    ctx.fillStyle = 'white';
    const lockSize = size * 0.3;
    const lockX = centerX - lockSize / 2;
    const lockY = centerY - lockSize / 4;
    
    // Lock body
    ctx.fillRect(lockX, lockY, lockSize, lockSize * 0.6);
    
    // Lock shackle
    ctx.strokeStyle = 'white';
    ctx.lineWidth = size * 0.04;
    ctx.beginPath();
    ctx.arc(centerX, lockY, lockSize * 0.3, Math.PI, 0, false);
    ctx.stroke();
    
    // Keyhole
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(centerX, lockY + lockSize * 0.2, size * 0.02, 0, Math.PI * 2);
    ctx.fill();
    
    // Save as PNG
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`icon${size}.png`, buffer);
    console.log(`Generated icon${size}.png`);
  }
}

// Run if canvas is available, otherwise provide manual instructions
try {
  generateIcons();
} catch (error) {
  console.log('Canvas not available. Please manually create PNG icons from the SVG design.');
  console.log('Sizes needed: 16x16, 32x32, 48x48, 128x128');
}