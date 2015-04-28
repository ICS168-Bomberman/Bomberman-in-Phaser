function server(io) {
	io.on('connection', function(socket) {
		socket.on('message', function(msg) {
			console.log("Messaged received from client: "+msg);
		});
		io.emit('message', 'Hello client!');
	});
};


module.exports = server;