var colorIndices = {
	"blue": 0,
	"black": 1,
	"red": 2,
	"white": 3
}

var PendingGame = function(id) {
	this.id = id;
	this.players = [null,null,null,null];
	this.spots = [
		{colorName: "blue", available: true}, 
		{colorName: "black", available: true},
		{colorName: "red", available: true},
		{colorName: "white", available: true}
	];
	this.numPlayers = 0;
	this.host = null;
};

PendingGame.prototype = {

	getNumPlayers: function() {
		return this.numPlayers;
	},

	removePlayer: function(spotNumber) {
		console.log("-------------------");
		console.log("===> PendingGame.removePlayer()");
		if(this.spots[spotNumber].available == false) {
			this.spots[spotNumber].available = true;
			this.numPlayers--;
		} else {
			console.log("WARNING: cannot remove player from spotNumber "+ spotNumber+", because there is nobody there");
		}
	},

	addPlayer: function(client) {
		var spotNumber = this.claimFirstSpotAvailable();
		this.players[spotNumber] = client;
		this.numPlayers++;
		return spotNumber;
	},

	claimFirstSpotAvailable: function() {
		for(var i = 0; i < this.spots.length; i++) {
			var spot = this.spots[i];
			if(spot.available) {
				spot.available = false;
				return i;
			}
		}
	},

	notifyOtherPlayersNewUserJoined: function(spotNumber) {
		for(var i = 0; i < 4; ++i) {
			if(i == spotNumber) continue;
			if(this.spots[i].available) continue;
			this.players[i].socket.emit('new user has joined the lobby', {spotNumber: spotNumber});
		}
	},


	notifyOtherPlayersSomeUserLeft: function(spotNumber) {
		
		//notify about the user gone
		for(var i = 0; i < 4; ++i) {
			if(i == spotNumber) continue;
			if(this.spots[i].available) continue;
			this.players[i].socket.emit('a user has left the lobby', {spotNumber: spotNumber});
		}

		//check if the user/client/player is the host, in which case
		//choose the first player left in the game (if any) to become
		//the new host and notify him/her about it
		var clientGone = this.players[spotNumber];
		if(clientGone == this.host) {
			var newHost = null;
			for(var i = 0; i < 4; ++i) {
				if(this.spots[i].available) continue;
				newHost = this.players[i];
				break;
			}
			if(newHost != null) {
				this.host = newHost;
				newHost.socket.emit('you are the new host');
			}
		}

	},

	isInTheGame: function(client) {
		for(var i = 0; i < 4; ++i) {
			if(this.spots[i].available)
				continue;
			if(this.players[i] == client)
				return true;
		}
		return false;
	}

};

module.exports = PendingGame;