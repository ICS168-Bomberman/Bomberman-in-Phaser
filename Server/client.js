var Client = function(socket,user_id) {
	this.user_id = user_id;
	this.socket = socket;
	this.following = []; //games that the player is following (tracking) in the MultiplayerMenu
	this.currentState = "default";
	this.game_id = null;
	this.playerNumber = null;	
	this.character = {}; //here we are going to store information about the client's character when running the game
	this.hasReceivedData = false;
};

Client.prototype = {

};

module.exports = Client;


