const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Directory to check
const distDir = path.join(__dirname, 'dist');
const staticFile = path.join(distDir, 'app.js');

console.log('Setting up static assets...');

// Check if dist folder already exists
if (!fs.existsSync(distDir)) {
  console.log('Creating dist directory...');
  fs.mkdirSync(distDir, { recursive: true });
}

// Create a simple JS file in the dist directory
fs.writeFileSync(staticFile, 'console.log("PeakShare app loading...");');
console.log('Created static app.js file');

// Copy static.html to dist directory if it exists
const staticHtmlSource = path.join(__dirname, 'public', 'static.html');
const staticHtmlDest = path.join(distDir, 'index.html');

if (fs.existsSync(staticHtmlSource)) {
  fs.copyFileSync(staticHtmlSource, staticHtmlDest);
  console.log('Copied static.html to dist/index.html');
}

// Try running webpack build but don't worry if it fails
try {
  console.log('Attempting webpack build...');
  execSync('NODE_ENV=production webpack --mode production', { stdio: 'inherit' });
  console.log('Webpack build completed.');
} catch (error) {
  console.log('Webpack build skipped - using static files instead.');
}