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
	}

};

module.exports = Game;