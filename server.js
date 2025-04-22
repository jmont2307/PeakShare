const http = require('http');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const PORT = process.env.PORT || 3002;

// Ensure dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

const server = http.createServer((req, res) => {
  // Health check endpoints
  if (req.url === '/health' || req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    }));
  }
  
  // For all static files, try to serve from dist directory first
  let filePath;
  let reqPath = req.url.split('?')[0]; // Remove query parameters
  
  if (reqPath === '/') {
    // Serve index.html for root path
    filePath = path.join(distDir, 'index.html');
  } else {
    // Try to find the file in dist
    filePath = path.join(distDir, reqPath);
  }
  
  // Get file extension
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
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'font/otf'
  };
  
  const contentType = contentTypes[extname] || 'text/plain';
  
  // Read file and serve it
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // For SPA client-side routing, serve index.html for routes that don't have file extensions
        if (!extname && !reqPath.includes('.')) {
          fs.readFile(path.join(distDir, 'index.html'), (err, indexContent) => {
            if (err) {
              res.writeHead(500);
              console.error('Error reading index.html:', err);
              return res.end('Error reading index.html');
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            return res.end(indexContent, 'utf-8');
          });
        } else {
          // Actual 404 for missing static files with extensions
          res.writeHead(404);
          res.end('Not found: ' + reqPath);
        }
      } else {
        // Server error
        console.error('Server error:', error);
        res.writeHead(500);
        res.end('Server error: ' + error.code);
      }
    } else {
      // Success - serve the file
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});