var Utils = require('./Utils.js');

var Game = function(id) {
	this.id = id;
	this.players = [null,null,null,null];
	this.map = {}; 
	this.bombs = {};
	this.defaultBombRange = 1;
};

Game.prototype = {

	createBoard: function(width,height) {
		this.map.board = Utils.create_2D_array(width,height);
	},

	getNumPlayers: function() {
		var count = 0;
		for(var i = 0; i < 4; ++i) {
			if(this.players[i] != null)
				count++;
		}
		return count;
	}

};

module.exports = Game;