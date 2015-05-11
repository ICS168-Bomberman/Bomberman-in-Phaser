var Game = require('./game.js');
var PendingGame = require('./pending_game.js');

var GameState = {
	BEING_SETUP: "settingup",
	JOINABLE: "joinable",
	FULL: "full",
	EMPTY: "empty"
}

var GameHandle = function(id) {
	this.pending_game = new PendingGame(id);
	this.game = new Game(id);
	this.state = GameState.EMPTY;
	this.followers = {};	
	this.id = id;
}

GameHandle.prototype = {

	//we send information to all the followers of this game (all the users who are displaying
	//a game slot for this game in the MultiplayerMenu) so that they can update the
	notifyFollowersNewUserJoined: function() {

		console.log('--------------------------------------------------');
		console.log('===> GameHandle.notifyFollowersNewUserJoined()');

		var data = {
			game_id: this.id,
			num_players: this.pending_game.getNumPlayers(),
			state: this.state
		};

		console.log("data to send:");
		console.log(data);
		console.log("our followers are:");
		console.log(this.followers);


		for (var user_id in this.followers) {

		    if (!this.followers.hasOwnProperty(user_id))
		        continue;

		    this.followers[user_id].socket.emit("new user joined", data);

		}
	}

};

module.exports = GameHandle;