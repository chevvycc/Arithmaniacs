$(document).ready(function() {


	// GLOBALS ------------------------------

	var host = location.hostname + ':' + location.port;


	// CHAT ------------------------------

	var chatio = io.connect(host + '/chat');

	chatio.on('chatMsg', function(msg) {
		var sender = "";
		if (msg.sender == chatio.id){ sender = "<span class='sender'>You</span>"; }
		else { sender = "<span class='sender'>Someone</span>"; }
		$('#chat ul').append('<li>' + sender + ': ' + msg.msg + '</li>');
	});

	chatio.on('playerConnected', function(msg) {
		var sender = "";
		if (msg.sender == chatio.id){ playerConnectedMessage = "You are now connected"; }
		else { playerConnectedMessage = "A player has connected" }
		$('#chat ul').append('<li>' + playerConnectedMessage + '</li>');
	});

	$("#chat input").keypress(function(event) {
	    if (event.which == 13) {
	        event.preventDefault();
	        var message = $(this).val();
	        chatio.emit('chatMsg', message);
	        $(this).val('');
	    }
	});


	// STATES ------------------------------

	// var state = {
	// 	IDLE : 0,
	// 	READY : 1,
	// 	IN_GAME : 2
	// };

	// var gameState = state.IDLE;
	

	// GAME ------------------------------
	var opponent = null;
	var player = null;
	var gameio = io.connect(host + '/game');

	$(document).ready(function() {
		clearGameScreen();
		displayElement($('#rules'));
		displayElement($('#btn-play'));
	});

	$('#btn-play').click(function(event) {
		event.preventDefault();
		$('#btn-play').hide();
		displayElement($('#waiting'));
		gameio.emit('playerReady');
	});

	gameio.on('gameWaiting', function(player) {
		console.log("game waiting for: " + player.username);
	});

	gameio.on('gameReady', function(players) {
		if (players[0].socketId === gameio.id) { opponent = players[0]; player = players[1];}
		else { opponent = players[1]; player = players[0];}
		console.log(player);
		console.log(opponent);
		$('#player').text(player.username);
		$('#opponent').text(opponent.username);
		clearGameScreen();
	});

	gameio.on('question', function(question) {
		clearGameScreen();
		$('#question').show();
		$('#question').text(question);
	});

	gameio.on('wrongAnswer', function() {
		shakeForm();
	});

	gameio.on('rightAnswer', function() {
		$('#points-player').append('<li></li>');
	});

	gameio.on('finalScore', function(score) {
		clearGameScreen();
		displayFinalScore(score);
	});

	$("#input-answer").keypress(function(event) {
	    if (event.which == 13) {
	        event.preventDefault();
	        var answer = $(this).val();
	        gameio.emit('answer', answer);
	        $(this).val('');
	    }
	});

	function displayElement(el) {
		el.show();
	}

	function displayFinalScore(score) {
		player.wins = 0;
		opponent.wins = 0;
		console.log(gameio.id);
		console.log(score);
		for (var i=0; i<score.length; i++) {
			if (score[i] === gameio.id) {
				player.wins++;
			}
			else { opponent.wins++; }
		}
		if (player.wins > opponent.wins) { $('#final-score').text('You win!'); }
		else { $('#final-score').text('LOL you lose!'); }
		$('#final-score').show();
	}

	function clearGameScreen() {
		$('#chalkboard > *').hide();
		displayElement($('#points'));
		displayElement($('#players'));
	}


function shakeForm() {
	var l = 20;  
	for( var i = 0; i < 10; i++ )   
	$( "#chalkboard" ).animate( { 'margin-left': "+=" + ( l = -l ) + 'px' }, 50);  
}

	// function countdown() {
	// 	$('#countdown').show();
	// 	var counter = 0;
	// 	var tick = function(){
	// 		if(counter > 0) {
	// 			counter--;
	// 			var text = '';
	// 			if (counter > 0) { text = counter; }
	// 			else { text = 'Start !'; }
	// 			$('#countdown').text(text);
				
	// 		} else {
	// 			clearInterval(countdownInterval);
	// 			clearGameScreen();
	// 			emitCountdownFinished();
	// 		}
	// 	};
	// 	var countdownInterval = setInterval(tick, 1000);
	// }

	// function emitCountdownFinished() {
	// 	gameio.emit('countdownFinished');
	// }
});
