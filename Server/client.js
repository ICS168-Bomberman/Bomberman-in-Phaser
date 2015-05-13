var Client = function(socket,user_id) {
	this.user_id = user_id;
	this.socket = socket;
	this.following = []; //games that the player is following (tracking) in the MultiplayerMenu
	this.currentState = "none";
	this.game_id = null;
	this.playerNumber = null;
};

Client.prototype = {

};

module.exports = Client;


