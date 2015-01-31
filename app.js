var express = require('express'),
    http = require('http'),
    app = express();

var server = http.createServer(app),
    io = require('socket.io').listen(server),
    term = require('term.js');
    //terminal = require('../');

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
