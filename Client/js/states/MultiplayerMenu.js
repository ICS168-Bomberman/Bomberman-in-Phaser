var Bomberman = Bomberman || {};

var GameSlotState = {
	SETTINGUP: "settingup",
	JOINABLE: "joinable",
	FULL: "full",
	EMPTY: "empty"
};

var gameID;
var IamHost;
var lobbyReceivedData;
var playerNumber;

Bomberman.MultiplayerMenu = function(){};

Bomberman.MultiplayerMenu.prototype = {

	create: function() {  	

		console.log("--------------------------------");
		console.log("===> MultiplayerMenu.create()");
		console.log(gamelist);

		this.gameStateSettings = {
			empty: {
				outFrame: "button_game_slot_blue.png",
				overFrame: "button_game_slot_lightblue.png",
				text: "Host Game", 
				callback: this.button_host_game_clicked
			},
			joinable: {
				outFrame: "button_game_slot_darkgreen.png",
				overFrame: "button_game_slot_bluegreen.png",
				text: "Join Game ",
				callback: this.button_join_game_clicked
			},
			settingup: {
				outFrame: "button_game_slot_gray.png",
				overFrame: "button_game_slot_gray.png",
				text: "Game is being set up... ",
				callback: null
			},
			full: {
				outFrame: "button_game_slot_gray.png",
				overFrame: "button_game_slot_gray.png",
				text: "Game Full ",
				callback: null
			},
			running: {
				outFrame: "button_game_slot_gray.png",
				overFrame: "button_game_slot_gray.png",
				text: "Running",
				callback: null
			}
		};

		this.stage.disableVisibilityChange = true;

		IamHost = false;

		this.game_slots = {};

		console.log(gamelist);

		var i = 0;

		for (var key in gamelist) {

		    if (!gamelist.hasOwnProperty(key))
		        continue;

			var game_slot = {};
			game_slot.num_players = gamelist[key].num_players;
			game_slot.state = gamelist[key].state;

			game_slot.offsetX = 50;
			game_slot.offsetY = 20 + 50 * i;


			var settings = this.gameStateSettings[game_slot.state];

			var button = this.game.add.button(
				game_slot.offsetX, //offset x
				game_slot.offsetY, 	//offset y
				"global_spritesheet",  //spritesheet
				settings.callback, //callback function
				game_slot, //callback context (the "this" when the function is called)
				settings.overFrame, //frame used when the mouse is over the button
				settings.outFrame); //frame used when the mouse is out of the button

			var text = this.game.add.text(game_slot.offsetX + 20, game_slot.offsetY + 10,  settings.text);
			text.font = "Carter One";
			text.fill = "white";
			text.fontSize = 18;

			game_slot.button = button;
			game_slot.text = text;
			game_slot.game_id = key;

			//store the slot information using the game_id as a key
			//for immediate access
			this.game_slots[key] = game_slot;
			i++;


		}

		//==============================================
		//register event callbacks
		//==============================================

		var self = this;

		socket.on('game state changed', function(data) {			

			console.log('-------------------------------');
			console.log('==> On "game state changed" event');
			console.log('the data received is:');
			console.log(data);

			var game_slot = self.game_slots[data.game_id];
			game_slot.state = data.state;
			game_slot.num_players = data.num_players;

			self.updateGameSlot(game_slot);

		});

		socket.on('feel free to host', function(data) {
			gameID = data.game_id;
			lobbyReceivedData = data.lobbyData;
			playerNumber = data.playerNumber;
			socket.removeAllListeners();
			IamHost = true;
			self.game.state.start('Lobby');
		});

		socket.on('feel free to join', function(data) {
			gameID = data.game_id;
			lobbyReceivedData = data.lobbyData;
			playerNumber = data.playerNumber;
			socket.removeAllListeners();
			IamHost = false;
			self.game.state.start('Lobby');
		});

	},

	button_join_game_clicked: function() {
		var audio = new Audio('Client/assets/music/select.wav');
		audio.play();
		
		console.log("-----------------------------------------");
		console.log("SENDING 'join existing game' message to server");
		console.log("where game_id = " + this.game_id);
		socket.emit("join existing game", {game_id: this.game_id});

	},

	//the function context (this) is assumed to 
	//point to the slot object that contains the button
	button_host_game_clicked: function() {
		var audio = new Audio('Client/assets/music/select.wav');
		audio.play();

		console.log("-----------------------------------------");
		console.log("SENDING 'host new game' message to server");
		console.log("where game_id = " + this.game_id);
		socket.emit("host new game", { game_id: this.game_id });
	},

	updateGameSlot: function(game_slot) {

		//destroy the previous button and text
		game_slot.button.destroy();
		game_slot.text.destroy();

		//retrieve the settings according to the new state of the game slot
		var settings = this.gameStateSettings[game_slot.state];

		//add a new button to replace the old one
		game_slot.button = this.game.add.button(
			game_slot.offsetX, 
			game_slot.offsetY, 
			"global_spritesheet", 
			settings.callback, 
			game_slot, 
			settings.overFrame,
			settings.outFrame);


		var text = this.game.add.text(game_slot.offsetX + 20, game_slot.offsetY + 10,  settings.text);
			text.font = "Carter One";
			text.fill = "white";
			text.fontSize = 18;			

	}

};