const http = require('http');
http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.end('[]');
}).listen(5999, () => console.log('mock listo en 5999'));
