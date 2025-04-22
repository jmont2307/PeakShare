const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load environment variables from .env file in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const PORT = process.env.PORT || 3002;

// Ensure the dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Check if index.html exists in dist directory
if (!fs.existsSync(path.join(distDir, 'index.html'))) {
  console.log('No index.html found in dist directory');
  
  // Copy static.html from public directory if it exists
  const staticHtmlPath = path.join(__dirname, 'public', 'static.html');
  if (fs.existsSync(staticHtmlPath)) {
    console.log('Copying static.html to dist/index.html');
    fs.copyFileSync(staticHtmlPath, path.join(distDir, 'index.html'));
  } else {
    // Create a basic index.html
    console.log('Creating basic index.html');
    const basicHtml = `<!DOCTYPE html>
<html>
<head>
  <title>PeakShare</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: sans-serif; margin: 0; padding: 20px; text-align: center; }
    h1 { color: #0066cc; }
    .container { max-width: 800px; margin: 40px auto; padding: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>PeakShare</h1>
    <p>Connect with ski enthusiasts worldwide</p>
    <p>The application is running. API status can be checked at <a href="/api/health">/api/health</a></p>
  </div>
  <div id="root"></div>
</body>
</html>`;
    fs.writeFileSync(path.join(distDir, 'index.html'), basicHtml);
  }
}

const server = http.createServer((req, res) => {
  // Health check endpoints
  if (req.url === '/health' || req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    }));
  }
  
  // Determine the file path based on the URL
  let filePath;
  if (req.url === '/') {
    filePath = path.join(distDir, 'index.html');
  } else {
    filePath = path.join(distDir, req.url);
  }
  
  // Get the file extension
  const extname = String(path.extname(filePath)).toLowerCase();
  
  // Content type mapping
  const contentTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };

  // Set content type header
  const contentType = contentTypes[extname] || 'text/plain';
  
  // Read file
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if(error.code === 'ENOENT') {
        // Client-side routing - serve index.html for paths that don't exist but look like routes
        if (!extname && !req.url.includes('.')) {
          fs.readFile(path.join(distDir, 'index.html'), (err, content) => {
            if (err) {
              res.writeHead(500);
              res.end('Server Error: Could not load index.html');
              return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content, 'utf-8');
          });
          return;
        }
        
        // File not found - 404
        res.writeHead(404);
        res.end('404 Not Found: ' + req.url);
      } else {
        // Server error
        console.error(`Server Error: ${error.code}`);
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      // Success
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});