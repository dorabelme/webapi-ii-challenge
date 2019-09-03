const express = require('express');
const postRoutes = require('./posts/postRoutes');
const server = express();

server.use(express.json());
server.use('./api/posts', postRoutes);

module.exports = server;