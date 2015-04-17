module.exports = function(io) {
	var EVENTS = {
		chatMsg : 'chatMsg',
		playerConnected : 'playerConnected'
	};

	var chat = io
	.of('/chat')
	.on('connection', function (socket) {
	  	socket.on(EVENTS.chatMsg, function(msg) {
	  		chat.emit(EVENTS.chatMsg, {'sender': socket.id, 'msg': msg});
	  	});

	    chat.emit(EVENTS.playerConnected, {'sender': socket.id});
	});

}