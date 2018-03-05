let fs = require('fs');
let restify = require('restify');
let socketio = require('socket.io');

let server = restify.createServer();
let io = socketio.listen(server.server);

const ROOT = __dirname;

server.get('/', function indexHTL(req, res, next) {
  fs.readFile(ROOT + '/views/index.html', function(err, data) {
    if (err) {
      next(err);
      return;
    }

    res.setHeader('Content-Type', 'text/html');
    res.writeHead(200);
    res.end(data);
    next();
  });
});

server.get('/js/:file', function indexHTL(req, res, next) {
  fs.readFile(ROOT + '/assets/javascripts/' + req.params.file, function(err, data) {
    if (err) {
      next(err);
      return;
    }

    res.setHeader('Content-Type', 'application/javascript');
    res.writeHead(200);
    res.end(data);
    next();
  });
});

server.get('/watch', function indexHTL(req, res, next) {
  fs.readFile(ROOT + '/views/watch.html', function(err, data) {
    if (err) {
      next(err);
      return;
    }

    res.setHeader('Content-Type', 'text/html');
    res.writeHead(200);
    res.end(data);
    next();
  });
});

server.get('/live', function indexHTL(req, res, next) {
  fs.readFile(ROOT + '/views/live.html', function(err, data) {
    if (err) {
      next(err);
      return;
    }

    res.setHeader('Content-Type', 'text/html');
    res.writeHead(200);
    res.end(data);
    next();
  });
});

io.sockets.on('connection', function (socket) {
  socket.join('webrtc');

  socket.on('video', function(data) {
    socket.broadcast.volatile.emit('live', data);
  });
});

server.listen(process.env.PORT || 3000);
