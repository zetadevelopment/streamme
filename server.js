const routes = require('./routes');
const restify = require('restify');
const socketio = require('socket.io');

let server = restify.createServer();
let io = socketio.listen(server.server);

const ROOT = __dirname;

// TODO: find a way to move this.
// Routes depending on global elements, like socket.io object.
server.get('/rooms', function (req, res, next) {
  res.setHeader('Content-Type', 'text/json');
  res.writeHead(200);
  res.end(JSON.stringify(io.sockets.adapter.rooms));
  next();
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
