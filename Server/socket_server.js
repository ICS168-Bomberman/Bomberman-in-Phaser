var Game = require('./game.js');
var PendingGame = require('./pending_game.js');
var GameHandle = require('./game_handle.js');
var Client = require('./client.js');
var Utils = require('./Utils.js');
var GameLoop = require('node-gameloop');
 



function server(io, UUID) {

	var game_id = 0;
	var games = [];
	var pending_games = [];
	var gameHandles = {};
	var clients = {};

	var frameRate = 30; //frames per second

	//Terrain Enum
	var TerrainType = Object.freeze({
	  ROCK : 1,
	  GRASS : 2,
	  EMPTY: 3
	});


	io.on('connection', function(socket) {

		var client = new Client(socket,UUID());
		clients[client.user_id] = client;

		//send the userid assigned to the client
		client.socket.emit('onconnected', {id: client.user_id});
		console.log('socket.io:: player ' + client.user_id + ' connected');

		//register event handlers
		client.socket.on('get gamelist', sendGameList.bind(client));
		client.socket.on('host new game', handle_hostNewGameQuery.bind(client));
		client.socket.on('join existing game', handle_joinExistingGameEvent.bind(client));
		client.socket.on('leaving lobby', handle_leavingLobbyEvent.bind(client));
		client.socket.on('I want to start the game', handle_wantStartGame.bind(client));
		client.socket.on('disconnect', handle_disconnect.bind(client));
		client.socket.on('my coordinates and such', handle_coordinatesReceived.bind(client));
		client.socket.on('dropped a bomb', handle_droppedBombEvent.bind(client));
	});

	//the client is requeting the game list because he/she is entering the 
	//MultiplayerMenu state
	function sendGameList() {

		var client = this;

		client.currentState = "MultiplayerMenu";

		console.log('--------------------------------------------------');
		console.log('===> sendGameList()');
		console.log('sendGameList(): client ' + client.user_id + ' requesting game list');

		var data = {};
		var count = 0;

		//collect as many partially filled pending games as possible
		for(var i = 0; i < pending_games.length; ++i) {

			if(count == 8) break;

			var num_of_players = pending_games[i].getNumPlayers();

			if(num_of_players >= 1 && num_of_players <= 3) {

				var id = pending_games[i].id;

				data[id] = {
					num_players: num_of_players, 
					state: "joinable"
				};

				client.following[id] = gameHandles[id];
				gameHandles[id].followers[client.user_id] = client;

				count++;
			}
		}


		//collect now as many empty pending games as possible
		for(var i = 0; i < pending_games.length; ++i) {

			if(count == 8) break;

			var num_of_players = pending_games[i].getNumPlayers();

			if(num_of_players == 0) {

				var id = pending_games[i].id;


				data[id] = {
					num_players: num_of_players, 
					state: "empty"
				};

				client.following[id] = gameHandles[id];
				gameHandles[id].followers[client.user_id] = client;

				count++;
			}
		}


		//create new empty pending games to fill the remainder
		var remainder = 8 - count;
		if(remainder > 0) {

			for(var i = 0; i < remainder; ++i) {

				data[game_id] = {
					num_players: 0,
					state: "empty"
				};

				
				var gameHandle = new GameHandle(game_id);
				gameHandles[game_id] = gameHandle;

				pending_games.push(gameHandle.pending_game);

				//add the client to the followers set of every gameHandle
				//because the client is "following" the state of these games
				//from the MultiplayerMenu, so we have to keep him/her updated.
				gameHandles[game_id].followers[client.user_id] = client;


				client.following[game_id] = gameHandles[game_id];

				game_id++;
			}
		}

		console.log("sendGameList(): we are going to send the following data");
		console.log(data);

		client.socket.emit('gamelist', data);
	};

	//the client is trying to become the host of a game. If the client succeeds, tne he/she will
	//enter the lobby state
	function handle_hostNewGameQuery(data) {

		var client = this;
		client.game_id = data.game_id;

		console.log('--------------------------------------------------');
		console.log('===> handle_hostNewGameQuery()');
		console.log('handle_hostNewGameQuery(): client ' + client.user_id + ' requesting to host game with game_id = ' + data.game_id);


		var game_handle = gameHandles[data.game_id];

		//check that the game is empty first, otherwise somebody else is already hosting it	
		if(game_handle.state != "empty")
			return;

		//set the client current state
		client.currentState = "lobby";
		client.playerNumber = 0;
		
		//add the client to the pending game
		game_handle.pending_game.addPlayer(client);

		//set the game's host to this client
		game_handle.pending_game.host = client;

		//update state to joinable, because now there is 1 player (the host)
		game_handle.state = "joinable";

		//remove the client from the followers set of the games
		//he/she is following, because the client has left the MultiplayerMenu
		//and now he/she is in the lobby state		
		for(var game_id in client.following) {
			if (!client.following.hasOwnProperty(game_id))
        		continue;
        	delete client.following[game_id].followers[client.user_id];
		}

		//notify followers that new user has joined this game
		game_handle.notifyFollowersGameStateChanged();

		//notify client that he can start to host the game
		var data = {
			game_id: data.game_id,
			lobbyData: {
				playerIndices: [0]
			},
			playerNumber: 0
		};
		client.socket.emit('feel free to host', data);
	};

	//the client is trying to join a game. If the client succeeds, tne he/she will
	//enter the lobby state
	function handle_joinExistingGameEvent(data) {

		var client = this;
		client.game_id = data.game_id;

		console.log('--------------------------------------------------');
		console.log('===> handle_joinExistingGameEvent()');
		console.log('handle_joinExistingGameEvent(): client ' + client.user_id + ' requesting to join game with game_id = ' + data.game_id);


		var game_handle = gameHandles[data.game_id];

		//check that the game state is joinable
		if(game_handle.state != "joinable")
			return;

		//set the client's current state
		client.currentState = "lobby";
		
		//add the client to the pending game
		var spotNumber = game_handle.pending_game.addPlayer(client);

		//set the client's playerNumber
		client.playerNumber = spotNumber;

		//update state of the game handle according the number of players
		var num_players = game_handle.pending_game.getNumPlayers();			
		game_handle.state = (num_players == 4) ? "full" : "joinable";

		//remove the client from the followers set of the games
		//he/she is following, because the client has left the MultiplayerMenu
		//and now he/she is in the lobby state now
		for(var game_id in client.following) {
			if (!client.following.hasOwnProperty(game_id))
        		continue;
        	delete client.following[game_id].followers[client.user_id];
		}

		//notify followers that new user has joined this game
		game_handle.notifyFollowersGameStateChanged();

		//notify client that he can join the game
		var playerIndices = [];
		for(var i = 0; i < 4; ++i) {
			if(game_handle.pending_game.spots[i].available === false)
				playerIndices.push(i);
		}
		var data = {
			game_id: data.game_id,
			lobbyData: {
				playerIndices: playerIndices
			},
			playerNumber: spotNumber
		};
		client.socket.emit('feel free to join', data);

		//notify other players in the pending game's lobby that this player
		//has joined the game
		game_handle.pending_game.notifyOtherPlayersNewUserJoined(spotNumber);
	};

	//the client is leaving the lobby, there he/she will be back into the MultiplayerMenu state
	function handle_leavingLobbyEvent(data) {

		var client = this;

		client.currentState = "MultiplayerMenu";

		console.log('--------------------------------------------------');
		console.log('===> handle_leavingLobbyEvent()');
		console.log('handle_leavingLobbyEvent(): client ' + client.user_id + ' leaving lobby of game = ' + data.game_id);


		var game_handle = gameHandles[data.game_id];

		//check that the client is indeed in the game
		if(!game_handle.pending_game.isInTheGame(client)) {
			console.log("WARNING: client "+client.user_id+" was not found in the game "+data.game_id);
			return;
		}
		
		//remove client from the pending game
		game_handle.pending_game.removePlayer(data.spotNumber);

		//update state of the game handle according the number of players
		var num_players = game_handle.pending_game.getNumPlayers();			
		game_handle.state = (num_players == 0) ? "empty" : "joinable";
		
		//notify followers that new user has left this game
		game_handle.notifyFollowersGameStateChanged();

		//notify other players in the pending game's lobby that this player
		//has left the game
		game_handle.pending_game.notifyOtherPlayersSomeUserLeft(data.spotNumber);

		//send the game list to client since he/she is going back to the MultiplayerMenu
		sendGameList.call(client);
	};

	function handle_wantStartGame(data) {

		var client = this;

		console.log('--------------------------------------------------');
		console.log('===> handle_wantStartGame()');
		console.log('handle_wantStartGame(): client ' + client.user_id + ' want to start the game = ' + data.game_id);

		
		var game_handle = gameHandles[data.game_id];

		//check that the number of players is in fact at least 2
		if(game_handle.pending_game.getNumPlayers() < 2)
			return;

		//set the state of the game to "running"
		game_handle.state = "running";


		//object to wrap the data to send to the clients
		var data = {};

		var game = game_handle.game;
		var map = game.map;

		//pour non-null players from pending game to game
		for(var i = 0; i < 4; ++i) {
			if(game_handle.pending_game.spots[i].available)
				continue;
			game.players[i] = game_handle.pending_game.players[i];
		}


		//==============================
		// generate map randomly
		//==============================

		//map.width = 3 + 2*n
		var width = (Math.floor(Math.random() * 5) + 1) * 2 + 3
		var height = (Math.floor(Math.random() * 5) + 1) * 2 + 3
		game.createBoard(width,height);

		map.width = width;
		map.height = height;

		var grassblocks = [];

		for(var i = 0; i < map.width; ++i) {
			for(var j = 0; j <  map.height; ++j) {
				x = map.offsetX + i*map.terrainBlockSize;
				y = map.offsetY + j*map.terrainBlockSize;
				if(i == 0 || i == map.width -1 || j ==0 || j == map.height -1
				  || (i%2 == 0 && j%2 == 0)) {

					map.board[i][j].terrain = TerrainType.ROCK;

				} else if(!Utils.isInRangeOfSomePlayer(x,y, game.defaultBombRange, game.players)) {
					
					map.board[i][j].terrain = TerrainType.GRASS;
					grassblocks.push(map.board[i][j]);

				} else {

					map.board[i][j].terrain = TerrainType.EMPTY;
				}
			}
		}

		//choose block of grass where we are going to place the door randomly
		var chosenGrassBlock  = grassblocks[Math.floor(Math.random()*grassblocks.length)];
		data.doorCoordinates = {x: chosenGrassBlock.x, y: chosenGrassBlock.y};

		//save map dimensions		
		data.mapWidth = width;
		data.mapHeight = height;

		//==================================
		// notify stuff to guys
		//==================================

		//tell all the players in the game that they can start the game
		//and send them the map data
		for(var i = 0; i < 4; ++i) {
			if(game.players[i] == null)
				continue;
			game.players[i].socket.emit('feel free to start the game', data);
			game.players[i].state = "MultiplayerGame";
			game.players[i].hasReceivedData = false;
		}

		//notify the clients following the state of this game in the MultiplayerMenu
		//that the game is running now
		game_handle.notifyFollowersGameStateChanged();

		//start the game loop for this game
		game_handle.game.gameloopID = 
			GameLoop.setGameLoop(broadcastCoordinates.bind(game_handle.game), 1000 / frameRate );

	};

	function handle_disconnect() {
		var client = this;

		//remove client from the clients map
		delete clients[client.user_id];

		//check the state of the client and perform
		//actions accordingly		
		if(client.currentState == "lobby") {			
			handle_leavingLobbyEvent.call(client, 
				{game_id: client.game_id,
				spotNumber: client.playerNumber} );
		}
	};
	
	//we receive the coords, vel and orientation from the client
	function handle_coordinatesReceived(data) {
		var client = this;

		//if((framecount % 100) < 3) 
		//console.log("receiving data from the client "+ client.user_id);
		//console.log(data);

		client.character.worldX = data.x;
		client.character.worldY = data.y;
		client.character.velX = data.velX;
		client.character.velY = data.velY;
		client.character.orientation = data.orientation;
		client.character.alive = data.alive;
		client.character.score = data.score;
		client.hasReceivedData = true;

	}

	//this function is called every time in the game loop to
	//broadcast the coordinates from all to all
	//var framecount = 0;
	function broadcastCoordinates() {

		//console.log("from gameloop: framecount = "+ framecount++);

		var game = this;	
		var client;

		//collect all the coordinates and other physical variables into a single package
		var data = [];
		for(var i = 0; i < 4; ++i) {

			client = game.players[i];
			if(client == null  || client.hasReceivedData == false) continue;			

			client.hasReceivedData = false;

			data.push(
				{	
					playerNum: i, 
					x: client.character.worldX,
					y: client.character.worldY,
					velX: client.character.velX,
					velY: client.character.velY,
					orientation: client.character.orientation,
					alive: client.character.alive,
					score: client.character.score
				});
		}

		//console.log("broadcasting the following data");
		//console.log(data);

		//broadcast data to all the players in the game now
		if(data.length > 0) {

			for(var i = 0; i < 4; ++i) {
				client = game.players[i];
				if(client == null) continue;			

				client.socket.emit('receive game loop update data', data);
			}			
		}

	}

	function handle_droppedBombEvent(data) {
		var client = this;
		var game = gameHandles[client.game_id].game;
		var players = game.players;
		for(var i = 0; i < players.length; ++i) {
			if(players[i] == null || players[i] == client)
				continue;
			players[i].socket.emit("bomb dropped", data);
		}

	}
	

};


module.exports = server;