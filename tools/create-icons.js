// Quick icon generator for Chrome extension
function createIcon(size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    
    // Draw rounded rectangle
    const radius = size * 0.2;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, radius);
    ctx.fill();
    
    // Draw "L" letter
    ctx.fillStyle = 'white';
    ctx.font = `bold ${size * 0.6}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('L', size/2, size/2);
    
    return canvas.toDataURL();
}

// Generate and download icons
const sizes = [16, 32, 48, 128];
sizes.forEach(size => {
    const dataUrl = createIcon(size);
    const link = document.createElement('a');
    link.download = `icon${size}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

console.log('Icons generated! Check your downloads folder.');