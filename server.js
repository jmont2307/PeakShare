const http = require('http');
const fs = require('fs');
const path = require('path');

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
  // Try running webpack build
  try {
    console.log('Running webpack build...');
    require('child_process').execSync('NODE_ENV=production npx webpack --mode production', { stdio: 'inherit' });
  } catch (error) {
    console.error('Webpack build failed, serving simple page instead');
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