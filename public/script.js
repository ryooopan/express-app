
$(function() {
  var socket = new SockJS('http://localhost:3000/echo');
  socket.onopen = function() {
    console.log('open');
  };
  socket.onmessage = function(e) {
    $('#output').append(e.data);
  };
  socket.onclose = function() {
    console.log('close');
  };

  $('#my-form').submit(function() {
    command = $("input[name='command']").val();
    socket.send(command);
    $("input[name='command']").val('');
  });
});
  
/*
(function() {
  window.onload = function() {
    var socket = io.connect();
    socket.on('connect', function() {
      var term = new Terminal({
	cols: 80,
	rows: 24,
	screenKeys: true
      });

      term.on('data', function(data) {
	socket.emit('data', data);
      });

      term.on('title', function(title) {
	document.title = title;
      });

      term.open(document.body);

      term.write('\x1b[31mWelcome to term.js!\x1b[m\r\n');

      socket.on('data', function(data) {
	term.write(data);
      });

      socket.on('disconnect', function() {
	term.destroy();
      });
    });
  };
}).call(this);
*/
