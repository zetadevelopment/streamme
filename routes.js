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

router.get('/content/new', function indexHTL(req, res, next) {
  if (!!req.cookies.loggedIn && req.cookies.userId) {
    fs.readFile(ROOT + '/views/content/new.html', function(err, data) {
      if (err) {
        next(err);
        return;
      }

      res.setHeader('Content-Type', 'text/html');
      res.writeHead(200);
      res.end(data);
      next();
    });
  } else {
    res.status(401);
    res.redirect('/login', next);
  }
});

router.get('/content/list/:userID', function(req, res, next) {
  if (!!req.cookies.loggedIn && req.cookies.userId) {
    if(req.params.userID == null || req.params.userID == '') {
      res.status(301);
      res.redirect('/content/list/' + req.cookies.userId, next);
    } else {
      fs.readFile(ROOT + '/views/content/list.html', function(err, data) {
        if (err) {
          next(err);
          return;
        }

        res.setHeader('Content-Type', 'text/html');
        res.writeHead(200);
        res.end(data);
        next();
      });
    }
  } else {
    res.status(401);
    res.redirect('/login', next);
  }
});

router.post('/content/list/:userID', function(req, res, next) {
  if (!!req.cookies.loggedIn && req.cookies.userId) {
    res.setHeader('Content-Type', 'text/json');
    res.setHeader("Access-Control-Allow-Origin", "*");

    const Content = require(ROOT + '/models/content/content');

    Content.findForUser(req.params.userID)
      .then((data) => {
        res.writeHead(200);

        res.end(JSON.stringify(data)); // Array of contents for user.
        next();
      })
      .catch((err) => {
        res.writeHead(500);

        res.end(JSON.stringify({ error: err })); // send error to client.
        next();
      });
  } else {
    res.status(401);
    res.redirect('/login', next);
  }
});

router.post('/content/new', function(req, res, next) {
  if (!!req.cookies.loggedIn && req.cookies.userId) {
    const UploaderModel = require(ROOT + '/models/content/uploader');
    const uploader = new UploaderModel(req.cookies.userId,
                                      req.params.contentName,
                                      !!req.params.private,
                                      req.params.content);

    uploader.upload()
      .then(() => {
        console.log("Completed!");
        res.redirect('/content/list/' + req.cookies.userId, next);
      }).catch((err) => {
        console.log('Error', err);
        res.redirect('/content/new', next);
      });
  } else {
    res.status(401);
    res.redirect('/login', next);
  }
});

router.get('/login', function(req, res, next) {
  fs.readFile(ROOT + '/views/login.html', function(err, data) {
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

router.post('/auth', function(req, res, next) {
  const UserLogin = require(ROOT + '/models/user_login');

  UserLogin.login(req.params.username, req.params.password)
    .then((userId) => {
      //TODO: UNCOMMENT BEFORE DEPLOY
      //res.setCookie('userId', userId, { secure: true, httpOnly: true });
      res.setCookie('userId', userId);
      res.setCookie('loggedIn', true);
      res.redirect('/content/list/' + userId, next);
    })
    .catch((err) => {
      console.log('Auth error', err);
      res.redirect('/login?m=' + encodeURIComponent(err), next);
    });
});

router.post('/auth/new', function(req, res, next) {
  const UserLogin = require(ROOT + '/models/user_login');

  UserLogin.createUser(req.params.username, req.params.password, req.params.email)
    .then((userId) => {
      console.log(userId);
      //TODO: UNCOMMENT BEFORE DEPLOY
      //res.setCookie('userId', userId, { secure: true, httpOnly: true });
      res.setCookie('userId', userId);
      res.setCookie('loggedIn', true);
      res.status(200);
      res.redirect('/content/list/' + userId, next);
    })
    .catch((err) => {
      console.log('Registration error', err);
      res.status(500);
      let msg = (err.message.indexOf('duplicate key error') !== -1 ? 'Username already exists' : err.message);
      res.redirect('/login?m=' + encodeURIComponent(msg), next);
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
