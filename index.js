// set up ======================================
// get all the tools we need
var express 	= require('express');
var path 		= require('path');
//var mongoose 	= require('mongoose');
var passport 	= require('passport');
var flash 		= require('connect-flash');

var bodyParser		= require('body-parser');
var session			= require('express-session');

var app 			= express();

var http_server		= require('http').Server(app);
var io  			= require('socket.io')(http_server);

var UUID 			= require('node-uuid');

// configuration =================================
//mongoose.connect("mongodb://localhost/passport"); // connect to our database
require('./Server/config/passport')(passport); // pass passport for configuration

//set up our socket.io server
require('./Server/socket_server')(io, UUID);

// set up our express application
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.static(__dirname));

// set up ejs for views templating
app.set('views', path.join(__dirname,'/Server/views'));
app.set('view engine', 'ejs'); // set up ejs for templating

//required for passport
app.use(session({secret: 'ilovescotchscotchyscotchscotch'}));
app.use(passport.initialize());
app.use(passport.session()); //persistent login sessions
app.use(flash());	// use connect-flash for flash messages stored in session

// routes ==============================================
require('./Server/routes.js')(app, passport); //load our routes and pass in our app and fully configured passport

// launch =============================================

var port = 8000;

http_server.listen(port);
console.log('The magic happens on port ' + port);

// Routing
app.use(express.static(__dirname + '/public'));

// Chatroom

// usernames which are currently connected to the chat
var usernames = {};
var numUsers = 0;

io.on('connection', function (socket) {
  var addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    // we store the username in the socket session for this client
    socket.username = username;
    // add the client's username to the global list
    usernames[username] = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    // remove the username from global usernames list
    if (addedUser) {
      delete usernames[socket.username];
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});