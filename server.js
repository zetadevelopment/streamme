const routes = require('./routes');
const os = require('os');
const restify = require('restify');
const CookieParser = require('restify-cookies');
const socketio = require('socket.io');
const redisAdapter = require('socket.io-redis');

const ROOT = __dirname;

// Create restify server with socket.io support.
let server = restify.createServer();
let io = socketio.listen(server.server);

// Cookie parser restify.
server.use(CookieParser.parse);

// Body parser to allow/process uploads
server.use(restify.plugins.bodyParser({
  maxBodySize: 10000,
  mapParams: true,
  mapFiles: true,
  overrideParams: false,
  keepExtensions: true,
  uploadDir: os.tmpdir(),
  multiples: true,
  hash: 'sha1',
  rejectUnknown: true,
  requestBodyOnGet: false,
  reviver: undefined,
  maxFieldsSize: 2 * 1024 * 1024
}));


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
  res.setHeader("Access-Control-Allow-Origin", "*");
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
    io.to(socket.id).emit('liveEnd', true); // Tell viewers that transmission has ended.
    socket.leave('whoislive');
  });

  // We have a new watch.
  socket.on('joinRoom', (data) => {
    socket.join(data.name);
    socket.to(data.name).emit('newViewer', true); //Viewer count.
  });

  // When a video blob is received, emit it to all viewers.
  socket.on('video', (data) => {
    socket.to(socket.id).volatile.emit('live', data);
  });

  // When a viewer leaves, reduce the viewer counter.
  socket.on('disconnectViewer', (data) => {
    socket.to(data.name).emit('lessViewer', true);
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log('Server listening on port', process.env.PORT || 3000);
});
