const http = require('http');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const PORT = process.env.PORT || 3002;

// Load our build script if needed
if (!fs.existsSync(path.join(__dirname, 'dist', 'index.html'))) {
  console.log('No index.html found, running build script...');
  require('./build');
}

const server = http.createServer((req, res) => {
  // Health check endpoints for Render
  if (req.url === '/health' || req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      memory: process.memoryUsage(),
      uptime: process.uptime()
    }));
  }
  
  // Default to static.html for the root path
  let filePath;
  if (req.url === '/') {
    filePath = path.join(__dirname, 'public', 'static.html');
  } else {
    filePath = path.join(__dirname, 'dist', req.url);
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
  };

  // Set content type header
  const contentType = contentTypes[extname] || 'text/plain';
  
  // Read file
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if(error.code === 'ENOENT') {
        // Always serve the static HTML for any route not found
        fs.readFile(path.join(__dirname, 'public', 'static.html'), (err, content) => {
          if (err) {
            res.writeHead(500);
            res.end('Server Error: Could not load static HTML');
            return;
          }
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content, 'utf-8');
        });
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