var pty = require('pty.js');
var term = pty.spawn('bash', [], {
  name: 'xterm-color',
  cols: 80,
  rows: 30,
  cwd: process.env.HOME,
  env: process.env
})

console.log('start');

term.on('data', function(data) {
  console.log(data);
});

var message = '1 + 1';
term.write('cd Desktop' + '\r');
term.write('echo \'var i = 1 + 1;\nconsole.log(i);\' > hoge.js' + '\r');
term.write('node ' + 'hoge.js'  + ' \r');
