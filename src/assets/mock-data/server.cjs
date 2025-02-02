const jsonServer = require('json-server');
const server = jsonServer.create();
const path = require('path');
const router = jsonServer.router(path.join(__dirname, 'mock-data.json'));
const middlewares = jsonServer.defaults();

// Enable CORS and write operations
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

server.use(middlewares);
server.use(jsonServer.bodyParser);
server.use(router);

server.listen(3000, () => {
  console.log('JSON Server is running on port 3000');
});
