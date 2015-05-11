var colorIndices = {
	"blue": 0,
	"black": 1,
	"red": 2,
	"white": 3
}


var PendingGame = function(id) {
	this.id = id;
	this.players = {};
	this.colors = [
		{colorName: "blue", available: true}, 
		{colorName: "black", available: true},
		{colorName: "red", available: true},
		{colorName: "white", available: true}
	];
};

PendingGame.prototype = {

	getPlayerIds: function() {
		return Object.keys(this.players);
	},

	getNumPlayers: function() {
		return Object.keys(this.players).length;
	},

	removePlayer: function(id) {
		this.colors[colorIndices[this.players[id].color]].available = true;
		delete this.players[id];
	},

	addPlayer: function(id) {
		this.players[id] = {color: this.claimFirstAvailableColor()};
	},

	claimFirstAvailableColor: function() {
		for(var i = 0; i < this.colors.length; i++) {
			var color = this.colors[i];
			if(color.available) {
				color.available = false;
				return color.colorName;
			}
		}
	}
};

module.exports = PendingGame;