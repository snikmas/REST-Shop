// the code in this file will spin up on node.js server
// server set up

const http = require('http');
const app = require('./app'); // automatically grasps .js files 

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

server.listen(PORT)