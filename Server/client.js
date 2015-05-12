var Client = function(socket,user_id) {
	this.user_id = user_id;
	this.socket = socket;
	this.following = []; //games that the player is following (tracking) in the MultiplayerMenu
};

Client.prototype = {

};

module.exports = Client;