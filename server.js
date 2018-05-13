const routes = require('./routes');
const restify = require('restify');
const socketio = require('socket.io');
const redisAdapter = require('socket.io-redis');

const ROOT = __dirname;

// Create restify server with socket.io support.
let server = restify.createServer();
let io = socketio.listen(server.server);

// Redis Config
// TODO: Make this value more dynamic.
const pub = require('redis').createClient(process.env.REDIS_PORT || 6379,
                                          process.env.REDIS_HOST || 'localhost');

const sub = require('redis').createClient(process.env.REDIS_PORT || 6379,
                                          process.env.REDIS_HOST || 'localhost');

// Connect to redis
pub.auth(process.env.REDIS_KEY || null);
sub.auth(process.env.REDIS_KEY || null);

pub.on('error', function(err) {
  console.log('Error connecting to redis pubclient', err);
});

sub.on('error', function(err) {
  console.log('Error connecting to redis sublclient', err);
});

// TODO: find a way to move this.
// Routes depending on global elements, like socket.io object.
server.get('/rooms', function (req, res, next) {
  res.setHeader('Content-Type', 'text/json');
  res.writeHead(200);

  // More idiomatic way to retrieve connected clients that are doing live streaming.
  io.in('whoislive').clients((err, clients) => {
    res.end(JSON.stringify(clients)); // Array of socket ids.
    next(); // End process.
  });
});

routes.applyRoutes(server);

io.sockets.on('connection', (socket) => {
  console.log('new connection with id', socket.id);

  socket.on('disconnect', (_) => {
    console.log('disconnected', socket.id);
  });

  socket.on('transmission', (_) => {
    console.log('create new room with socket id', socket.id);
    // A new connection automatically joins a user to a room, so other users can join to the socket ID of
    // the user going live, which will be stored in a new room called 'whoislive'.
    socket.join('whoislive');
  });

  socket.on('endTransmission', (_) => {
    console.log('Transmission ended by socket id', socket.id);
    socket.leave('whoislive');
  });

  socket.on('joinRoom', (data) => {
    socket.join(data.name);
  });

  socket.on('video', (data) => {
    socket.to(socket.id).volatile.emit('live', data);
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log('Server listening on port', process.env.PORT || 3000);
});
