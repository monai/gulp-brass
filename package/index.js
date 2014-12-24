var connect = require('connect');
var http = require('http');

var app = connect();

app.use(function (req, res) {
    res.end('Hello world\n');
});

http.createServer(app).listen(3000);
