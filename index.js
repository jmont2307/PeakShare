// Entry point for the application

const { createServer } = require('http');
const { parse } = require('url');
// next.js not required
const path = require('path');
const fs = require('fs');

// Validate if we're in production mode
const dev = process.env.NODE_ENV !== 'production';

// Check if we have a dist directory and index.html
const distDir = path.join(__dirname, 'dist');
const indexHtml = path.join(distDir, 'index.html');

// If dist directory doesn't exist, create it
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// If index.html doesn't exist, copy from fallback or create basic one
if (!fs.existsSync(indexHtml)) {
  const fallbackPath = path.join(__dirname, 'public', 'fallback.html');
  if (fs.existsSync(fallbackPath)) {
    fs.copyFileSync(fallbackPath, indexHtml);
  } else {
    // Create basic index.html
    const basicHtml = `<!DOCTYPE html>
<html>
<head>
  <title>PeakShare</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: sans-serif; margin: 0; padding: 20px; }
    h1 { color: #333; }
  </style>
</head>
<body>
  <h1>Welcome to PeakShare</h1>
  <p>The app is loading...</p>
  <div id="root"></div>
</body>
</html>`;
    fs.writeFileSync(indexHtml, basicHtml);
  }
}

// Just use the regular server.js file
require('./server.js');