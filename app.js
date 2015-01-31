
var http = require('http')
, express = require('express')
, io = require('socket.io')
, pty = require('pty.js')
, terminal = require('term.js');

/**
 * term.js
 */

process.title = 'term.js';

/**
 * Dump
 */

var stream;
if (process.argv[2] === '--dump') {
  stream = require('fs').createWriteStream(__dirname + '/dump.log');
}

/**
 * Open Terminal
 */

var buff = []
, socket
, term;

term = pty.fork(process.env.SHELL || 'sh', [], {
  name: require('fs').existsSync('/usr/share/terminfo/x/xterm-256color')
    ? 'xterm-256color'
    : 'xterm',
  cols: 80,
  rows: 24,
  cwd: process.env.HOME
});

term.on('data', function(data) {
  if (stream) stream.write('OUT: ' + data + '\n-\n');
  return !socket
    ? buff.push(data)
    : socket.emit('data', data);
});

console.log(''
	    + 'Created shell with pty master/slave'
	    + ' pair (master: %d, pid: %d)',
	    term.fd, term.pid);

/**
 * App & Server
 */

var app = express()
, server = http.createServer(app);

app.use(function(req, res, next) {
  var setHeader = res.setHeader;
  res.setHeader = function(name) {
    switch (name) {
    case 'Cache-Control':
    case 'Last-Modified':
    case 'ETag':
      return;
    }
    return setHeader.apply(res, arguments);
  };
  next();
});

/*
app.use(express.basicAuth(function(user, pass, next) {
  if (user !== 'foo' || pass !== 'bar') {
    return next(true);
  }
  return next(null, user);
}));
*/

app.use(express.static(__dirname + '/public'));
// app.use(express.static(__dirname));
app.use(terminal.middleware());

if (!~process.argv.indexOf('-n')) {
  server.on('connection', function(socket) {
    var address = socket.remoteAddress;
    if (address !== '127.0.0.1' && address !== '::1') {
      try {
	socket.destroy();
      } catch (e) {
	;
      }
      console.log('Attempted connection from %s. Refused.', address);
    }
  });
}

server.listen(3000);

/**
 * Sockets
 */

io = io.listen(server, {
  log: false
});

io.sockets.on('connection', function(sock) {
  socket = sock;

  socket.on('data', function(data) {
    if (stream) stream.write('IN: ' + data + '\n-\n');
    //console.log(JSON.stringify(data));
    term.write(data);
  });

  socket.on('disconnect', function() {
    socket = null;
  });

  while (buff.length) {
    socket.emit('data', buff.shift());
  }
});

/*
var express = require('express'),
    http = require('http'),
    app = express();

var server = http.createServer(app),
    io = require('socket.io').listen(server),
    pty = require('pty.js'),
    term = require('term.js');

term = pty.fork(process.env.SHELL || 'sh', [], {
  name: require('fs').existsSync('/usr/share/terminfo/x/xterm-256color')
    ? 'xterm-256color'
    : 'xterm',
  cols: 80,
  rows: 24,
  cwd: process.env.HOME
});

term.on('data', function(data) {
  if (stream) stream.write('OUT: ' + data + '\n-\n');
  return !socket
    ? buff.push(data)
    : socket.emit('data', data);
});

console.log('Created shell with pty master/slave' 
	    + ' pair (master: %d, pid: %d)',
	    term.fd, term.pid);



app.set('port', process.env.PORT || 3000);
app.use(express.static(__dirname + '/public'));
app.use(term.middleware());

server.listen(app.get('port'), function(){
  console.log("server listening on port " + app.get('port'));
});

app.get('/', function(req, res) {
  res.send('hello world');
});
app.get('/about', function(req, res) {
  res.send('about');
});
app.get('/users/:name', function(req, res) {
  var name = req.params.name;
  res.send('hello ' + name);
});
*/
