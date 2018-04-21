const fs = require('fs');
const Router = require('restify-router').Router;

const router = new Router();
const ROOT = __dirname;

// Live
router.get('/', function indexHTL(req, res, next) {
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

// Any js file in assets/javascripts
router.get('/js/:file', function indexHTL(req, res, next) {
  fs.readFile(ROOT + '/assets/javascripts/' + req.params.file, function(err, data) {
    if (err) {
      next(err);
      return;
    }

    res.setHeader('Content-Type', 'text/javascript');
    res.writeHead(200);
    res.end(data);
    next();
  });
});

// Watch a streaming. If user goes to /watch, then it will ask for room Id.
router.get('/watch', function indexHTL(req, res, next) {
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

router.get('/watch/:RoomId', function indexHTL(req, res, next) {
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

// Load live streaming page.
router.get('/live', function indexHTL(req, res, next) {
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

// List available rooms.
router.get('/list', function indexHTL(req, res, next) {
  fs.readFile(ROOT + '/views/list.html', function(err, data) {
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

module.exports = router;
