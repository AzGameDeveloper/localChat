var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var name = [];
var online = {}
var users = 0;
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
io.on('connection', function(socket) {
	var username;
  var log;
  io.emit('log', {})
	users++;
	socket.on('disconnect', function() {
		users--;
		var index = name.indexOf(username);
		name.splice(index, 1);
		for (var i = 0; i <= name.length - 1; i++) {
      io.emit('users', {users: name[i], number: i, online: false});
    }	})
  socket.on('log', function(data) {
    for (var i = 0; i <= data.length; i++) {
      socket.broadcast.emit('msg', {text: '<span class="name">' + username + '</span>' + ": " + data[i]})
      socket.emit('msg', {text: '<span id="client">' + username + '</span>' + ": " + data[i]})
    }
  })
  socket.on('message', function(data) {
   	socket.broadcast.emit('msg', {text: '<span class="name">' + username + '</span>' + ": " + data})
   	socket.emit('msg', {text: '<span id="client">' + username + '</span>' + ": " + data})
    var msg = '<span class="read">' + username + '</span>' + ": " + data + '|/'
    fs.appendFile('log.txt', msg, function (err) {
      if (err) throw err;
    });
  })
  socket.on('name', function(data) {
   	username = data;
   	name.push(data);
   	for (var i = 0; i <= name.length - 1; i++) {
   		io.emit('users', {users: name[i], number: i, online: true});
   	}
  })
  socket.on('delName', function(data) {
   	var x = name.indexOf(data)
   	name.splice(x, 1);
  })
  socket.on('delLog', function() {
    fs.writeFile('log.txt', '', (err) => {
      if (err) throw err;
    })
  })
  fs.readFile('log.txt', 'utf8', (err, data) => {
    if (err) throw err;
    var log = data.split('|/');
    for (var i = 0; i <= log.length - 2; i++) {
      socket.emit('msg', {text: log[i]})
    }
  });
});
http.listen(3000, function(){});