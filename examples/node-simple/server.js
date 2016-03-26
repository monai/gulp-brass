/* jshint esversion: 6 */

var http    = require('http');
var connect = require('connect');

var app = connect();

app.use(function (req, res) {
  res.end('Hello world\n');
});

http.createServer(app).listen(3000, () => {
  console.log('Listening at http://localhost:3000/');
});
