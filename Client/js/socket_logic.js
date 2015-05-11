var socket = io();

var user_id;

socket.on('onconnected', function(data) {
	user_id = data.id;
	console.log('user_id = ' + user_id);
});
