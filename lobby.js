module.exports = function(io, game, players, rooms) {
	var mathjs = require('mathjs');

	var EVENTS = {
		connection : 'connection',
		disconnect : 'disconnect',
		playerReady : 'playerReady',
		gameWaiting : 'gameWaiting',
		gameReady : 'gameReady',
		countdownFinished : 'countdownFinished',
		question : 'question',
		answer : 'answer',
		wrongAnswer: 'wrongAnswer',
		rightAnswer: 'rightAnswer',
		finalScore: 'finalScore'
	};

	
	var playerIndex = 1;
	game = io
		.of('/game')
		.on('connection', function (socket) {
			
			initPlayer(socket.id);

			socket.on(EVENTS.playerReady, function() {
				var room = findAvailableRoom(socket.id);
				if (room) {
					joinRoom(socket, room);
					emitGameReady(room);
					emitQuestion(room);
				}
				else {
					room = createRoom(socket.id);
					joinRoom(socket, room);
				}
			});

			socket.on(EVENTS.answer, function(answer) {
				var playerId = socket.id;
				var roomId = players[playerId].room;
				var question = getCurrentQuestion(roomId);
				if (validateAnswer(question, answer)) {
					setWinner(roomId, playerId);
					emitRightAnswer(playerId);
					if (wasLastRound(roomId)) {
					 	emitFinalScore(roomId);
					}
					else {
					 	emitQuestion(roomId);
					}
				}
				else { emitWrongAnswer(playerId); }
			});

			socket.on(EVENTS.disconnect, function () {
			    for (var key in players) {
				  if (players.hasOwnProperty(key)) {
				  	if (key === socket.id) { delete players[key]; return; }
				  }
				}
		  	});
	});

	function emitGameReady(roomId) {
		var p = [];
		p.push(players[rooms[roomId].players[0]]);
		p.push(players[rooms[roomId].players[1]]);
		game.to(roomId).emit(EVENTS.gameReady, p);
	}

	function wasLastRound(roomId) {
		return rooms[roomId].currentRound === 3;
	}

	function emitFinalScore(roomId) {
		var score = compileFinalScore(roomId);
		game.to(roomId).emit(EVENTS.finalScore, score);
	}

	function compileFinalScore(roomId) {
		var winners = [];
		for (var i=0; i<rooms[roomId].rounds.length; i++) {
			winners.push(rooms[roomId].rounds[i].winner);
		}
		return winners;
	}

	function findAvailableRoom(player) {
		for (var key in rooms) {
		  if (rooms.hasOwnProperty(key)) {
		  	if (rooms[key].players.length < 2) {
		  	  if (rooms[key].players[0] !== player && rooms[key].players[1] !== player) {
		  	  	return key;
		  	  }
		  	}
		  }
		}
		return null;
	}

	function joinRoom(socket, room) {
		players[socket.id].room = room;
		rooms[room].players.push(socket.id);
		socket.join(room);
	}

	function createRoom(id) {
		var roomId = 'r_' + id;
		rooms[roomId] = new Room();
		return roomId;
	}

	function emitQuestion(roomId) {
		var room = rooms[roomId];
		var question = room.rounds[room.currentRound].question;
		game.to(roomId).emit(EVENTS.question, question);
	}

	function validateAnswer(question, answer) {
		return mathjs.eval(question) == answer;
	}

	function getCurrentQuestion(roomId) {
		var question = rooms[roomId].rounds[rooms[roomId].currentRound].question;
		return question;
	}

	function setWinner(roomId, playerId) {
		rooms[roomId].rounds[rooms[roomId].currentRound].winner = playerId;
		rooms[roomId].currentRound += 1;
	}

	function emitWrongAnswer(roomId) {
		game.to(roomId).emit(EVENTS.wrongAnswer);
	}

	function emitRightAnswer(roomId) {
		game.to(roomId).emit(EVENTS.rightAnswer);
	}

	function findSocket(id) {
		for (var i=0; i<game.sockets.length; i++) {
			if (game.sockets[i].id === id) { return game.sockets[i]; }
		}
	}

	function easy() {
		return '2+2';
	}

	function medium() {
		return "209-114";
	}

	function hard() {
		return "27*8";
	}

	function initPlayer(id) {
		players[id] =  {
			socketId: id,
			username: "Player" + playerIndex,
			room: null
		};
		playerIndex++;
	}

	function Room() {
		return {
			rounds: Rounds(),
			currentRound: 0,
			players: []
		}
	}

	function Rounds() {
		return [
			new Round(easy()),
			new Round(medium()),
			new Round(hard())
		];
	}

	function Round(question) {
		return {
			question : question,
			winner : null
		}
	}
}



