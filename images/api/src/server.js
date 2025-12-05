const http = require('http');
const express = require('express');
const { createServer } = require('http');
const { join } = require('node:path');
const path = require('path');

const { Server } = require('socket.io');

const cors = require("cors")

const user_routes = require('./routes/users')
const artwork_routes = require('./routes/artworks')
const medium_routes = require('./routes/mediums')
const rental_routes = require('./routes/rentals')

const { init } = require('./socket');

const app = express();

const server = createServer(app);

app.use(cors());
app.use(express.json());

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/users', user_routes);
app.use('/artworks', artwork_routes);
app.use('/mediums', medium_routes);
app.use('/rentals', rental_routes);

app.get('/', (req, res) => {
  res.send("running")
})



init(server)





module.exports = server;