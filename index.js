var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var Server = require("http").Server(app);
var io = require('socket.io')(Server);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({   // to support URL-encoded bodies
    extended: true
}));
app.use(express.static(__dirname + '/public'));
app.set('port', (process.env.PORT || 8080));

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/public/index.html');
});

var game;
var rooms = {};
var players = {};
// CHAT
require('./chat.js')(io);

// LOBBY
require('./lobby.js')(io, game, players, rooms);

Server.listen(app.get('port'), function () {
	console.log("Neg Nancy is running at localhost:" + app.get('port'));
});