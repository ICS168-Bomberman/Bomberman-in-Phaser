var Game = require('./game.js');
var PendingGame = require('./pending_game.js');
var GameHandle = require('./game_handle.js');
var Client = require('./client.js');

function server(io, UUID) {

	var game_id = 0;
	var games = [];
	var pending_games = [];
	var gameHandles = {};
	var clients = {};

	io.on('connection', function(socket) {

		var client = new Client(socket,UUID());

		//send the userid assigned to the client
		client.socket.emit('onconnected', {id: client.user_id});

		console.log('socket.io:: player ' + client.user_id + ' connected');


		//register event handlers
		client.socket.on('get gamelist', sendGameList.bind(client) );
		client.socket.on('host new game', handle_hostNewGameQuery.bind(client) );
		client.socket.on('join existing game', handle_joinExistingGameEvent.bind(client) );
		client.socket.on('leaving lobby', handle_leavingLobbyEvent.bind(client) );


	});

	function sendGameList() {

		var client = this;

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

	function handle_hostNewGameQuery(data) {

		var client = this;

		console.log('--------------------------------------------------');
		console.log('===> handle_hostNewGameQuery()');
		console.log('handle_hostNewGameQuery(): client ' + client.user_id + ' requesting to host game with game_id = ' + data.game_id);


		var game_handle = gameHandles[data.game_id];

		//check that the game is empty first, otherwise somebody else is already hosting it	
		if(game_handle.state != "empty")
			return;
		
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
		game_handle.notifyFollowersNewUserJoined();

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

	function handle_joinExistingGameEvent(data) {

		var client = this;

		console.log('--------------------------------------------------');
		console.log('===> handle_joinExistingGameEvent()');
		console.log('handle_joinExistingGameEvent(): client ' + client.user_id + ' requesting to join game with game_id = ' + data.game_id);


		var game_handle = gameHandles[data.game_id];

		//check that the game state is joinable
		if(game_handle.state != "joinable")
			return;
		
		//add the client to the pending game
		var spotNumber = game_handle.pending_game.addPlayer(client);

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
		game_handle.notifyFollowersNewUserJoined();

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

	function handle_leavingLobbyEvent(data) {

		var client = this;

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
		game_handle.notifyFollowerSomeUserLeft();

		//notify other players in the pending game's lobby that this player
		//has left the game
		game_handle.pending_game.notifyOtherPlayersSomeUserLeft(data.spotNumber);

		//send the game list to client since he/she is going back to the MultiplayerMenu
		sendGameList.call(client);
	};

};


module.exports = server;