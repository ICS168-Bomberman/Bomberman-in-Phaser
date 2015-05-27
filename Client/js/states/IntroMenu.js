var Bomberman = Bomberman || {};

//title screen
Bomberman.IntroMenu = function(){};

var gamelist;

Bomberman.IntroMenu.prototype = {

	create: function() {  	

		var singlePlayerBtn  = this.game.add.button(15, 200, 'global_spritesheet', this.launchSinglePlayerState, this,
				  'button_singleplayer.png',
				  'button_singleplayer.png', 
				  'button_singleplayer.png', 
				  'button_singleplayer.png');

		var multiPlayerBtn  = this.game.add.button(15, 300, 'global_spritesheet', this.launchMultiPlayerState, this,
				  'button_multiplayer.png',
				  'button_multiplayer.png',
				  'button_multiplayer.png',
				  'button_multiplayer.png');

		//when we receive the gamelist, now we can switch to the MultiplayerMenu state
		socket.on('gamelist', function(data) {

			console.log('------------------------------------');
			console.log('==> On "gamelist" event');
			console.log(data);

			gamelist = data;
			socket.removeAllListeners();
			Bomberman.game.state.start("MultiplayerMenu");

		});
	},

	launchSinglePlayerState: function() {
		socket.removeAllListeners();
		this.game.state.start("SinglePlayerGame");
	},

	launchMultiPlayerState: function() {
		//we delay the switch to the MultiplayerMenu
		//until we receive the answer with the gamelist from the server
		socket.emit("get gamelist");
		console.log("---------------------------------");
		console.log("SENDING 'get gamelist' to server");
	}

};