var Bomberman = Bomberman || {};

Bomberman.Lobby = function(){};

Bomberman.Lobby.prototype = {

	create: function() {  	

		console.log("--------------------------------");
		console.log("===> Lobby.create()");


		this.numPlayers = lobbyReceivedData.playerIndices.length;

		//offsets
		this.startBtnOffsetX = 100;
		this.startBtnOffsetY = 390;
		this.leaveBtnOffsetX = 100;
		this.leaveBtnOffsetY = 430;
		this.characterSquaresOffsets = [
			{offsetX: 100, offsetY: 120}, 
			{offsetX: 205, offsetY: 120},
			{offsetX: 100, offsetY: 220},
			{offsetX: 205, offsetY: 220}
		];
		this.hostMessageOffsetX = 50;
		this.hostMessageOffsetY = 20;
		this.minPlayerMessageOffsetX = 100;
		this.minPlayerMessageOffsetY = 320;
		this.characterOffsetX = 3;
		this.characterOffsetY = 3;

		this.characterColors = ["blue", "black", "red", "white"];	
		this.characterHeadFrames = [
			"bomberman_head_blue.png", "bomberman_head_black.png", 
			"bomberman_head_red.png", "bomberman_head_white.png"
		];	

		//message telling us that we are the host
		this.youAreHostMessage = this.game.add.text(
			this.hostMessageOffsetX,
			this.hostMessageOffsetY, 
			"You are the Host"
		);
		this.youAreHostMessage.font = "Carter One";
		this.youAreHostMessage.fill = "black";
		this.youAreHostMessage.fontSize = 17;	

		//draw character squares
		this.characterSquares = this.drawCharacterSquares(playerNumber);

		//draw character heads of the players already in the lobby
		this.characterHeads = this.drawCharacterHeads();
		console.log("printing this.characterHeads on create()");
		console.log(this.characterHeads);

		//start button
		this.startGameButton = this.game.add.button(
			this.startBtnOffsetX, 
			this.startBtnOffsetY,
			"global_spritesheet", 
			null, this, 
			"button_start_game_locked.png",  
			"button_start_game_locked.png"
		);		

		//leave button
		this.leaveGameButton = this.game.add.button(
			this.leaveBtnOffsetX, 
			this.leaveBtnOffsetY, 
			"global_spritesheet",
			this.leaveGame,
			this,
			"button_leave_over.png",
			"button_leave_out.png");

		//minimum number of players message
		this.minPlayersMessage = this.game.add.text(
			this.minPlayerMessageOffsetX, 
			this.minPlayerMessageOffsetY, 
			"Cannot start the game without\nat least 2 players."
		);
		this.minPlayersMessage.font = "Carter One";
		this.minPlayersMessage.fill = "red";
		this.minPlayersMessage.fontSize = 17;

		//set visibilities of 3 elements based on whether we are the host or not
		this.youAreHostMessage.visible = IamHost;
		this.startGameButton.visible = IamHost;
		this.minPlayersMessage.visible = IamHost;

		//register callback functions
		socket.on("new user has joined the lobby", this.handle_newUserJoined.bind(this));
		socket.on("a user has left the lobby", this.handle_someUserHasLeft.bind(this));
		socket.on("gamelist", this.goBackToMultiplayerMenu);
		socket.on("you are the new host", this.enableHostMode.bind(this));
		socket.on("feel free to start the game", this.runGame.bind(this));

	},

	drawCharacterSquares: function(playerNumber) {
		var characterSquares = [];

		for(var i = 0; i < 4; i++) {

			characterSquares.push(
				this.game.add.sprite(
					this.characterSquaresOffsets[i].offsetX,
					this.characterSquaresOffsets[i].offsetY,
					"global_spritesheet",
					"character_square_darkgray.png")
			);

		}

		characterSquares[playerNumber].frameName = "character_square_lightgray.png";

		return characterSquares;
	},

	drawCharacterHeads: function() {
		var characterHeads = [];
		for(var i = 0; i < 4; ++i) {
			var image = this.game.add.image(
				this.characterSquares[i].position.x + this.characterOffsetX,
				this.characterSquares[i].position.y + this.characterOffsetY,
				"global_spritesheet", this.characterHeadFrames[i]);
			image.visible = false;
			characterHeads.push(image);
		}
		var indices = lobbyReceivedData.playerIndices;
		for(var i = 0; i < indices.length; ++i) {
			var index = indices[i];
			characterHeads[index].visible = true;
		}
		return characterHeads;
	},

	handle_someUserHasLeft: function(data) {
		console.log("-----------------------------");
		console.log("===> handle_someUserHasLeft()");
		var spotNumber = data.spotNumber;
		this.characterHeads[spotNumber].visible = false;
		this.numPlayers--;

		if(IamHost) {
			this.checkIfCanStartGame();
		}

	},

	handle_newUserJoined: function(data) {
		console.log("-----------------------------");
		console.log("===> handle_newUserJoined()");
		var spotNumber = data.spotNumber;
		this.characterHeads[spotNumber].visible = true;
		this.numPlayers++;
		if(IamHost) {
			this.checkIfCanStartGame();
		}
	},

	leaveGame: function() {
		var audio = new Audio('Client/assets/music/select.wav');
		audio.play();

		socket.emit('leaving lobby', {game_id: gameID, spotNumber: playerNumber});
	},

	goBackToMultiplayerMenu: function(data) {
		gamelist = data;
		socket.removeAllListeners();
		Bomberman.game.state.start("MultiplayerMenu");
	},

	enableHostMode: function() {
		IamHost = true;
		this.youAreHostMessage.visible = IamHost;
		this.startGameButton.visible = IamHost;
		this.minPlayersMessage.visible = IamHost;
		this.checkIfCanStartGame();
	},

	checkIfCanStartGame: function() {

		if(this.numPlayers >= 2) {

			//update min players message
			this.minPlayersMessage.text = "There are enough players to\nstart the game now !!";			
			this.minPlayersMessage.fill = "green";

			//recreate the start button and make it clickable
			this.startGameButton.destroy();
			this.startGameButton = this.game.add.button(
				this.startBtnOffsetX, 
				this.startBtnOffsetY,
				"global_spritesheet", 
				this.startGameBtnClicked, this, 
				"button_start_game_over.png",  
				"button_start_game_out.png"
			);	

		} else {

			//update min players message
			this.minPlayersMessage.text = "Cannot start the game without\nat least 2 players."
			this.minPlayersMessage.fill = "red";

			//recreate the start button and make it unclickable
			this.startGameButton.destroy();
			this.startGameButton = this.game.add.button(
				this.startBtnOffsetX, 
				this.startBtnOffsetY,
				"global_spritesheet", 
				null, this, 
				"button_start_game_locked.png",  
				"button_start_game_locked.png"
			);			
		}
	},

	startGameBtnClicked: function() {
		var audio = new Audio('Client/assets/music/select.wav');
		audio.play();
		socket.emit('I want to start the game', {game_id: gameID});
	},


	//we read from data and initialize some variables that are going to be used
	//in the MultiplayerGame state
	runGame: function(data) {

		//mpg stands for multi player game, it is used as sort of namespace
		//for variables we will be using in the MultiplayerGame state

		//mpg.doorCoordinates = data.doorCoordinates;
		mpg.map.width = data.mapWidth;
		mpg.map.height = data.mapHeight;

		//initialize players
		mpg.players = [null,null,null,null];		
		for(var i = 0; i < 4; ++i) {
			if(this.characterHeads[i].visible) {
				mpg.players[i] = new Player();
			}
		}

		//we remember who we are
		mpg.myPlayerNumber = playerNumber;
		mpg.myPlayer = mpg.players[playerNumber];

		//remove listeners
		socket.removeAllListeners();	

		//switch to the MultiplayerGame state
		this.game.state.start('MultiplayerGame');
	}


};
