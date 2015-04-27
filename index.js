
// set up ======================================
// get all the tools we need
var express 	= require('express');
var path 		= require('path');
var mongoose 	= require('mongoose');
var passport 	= require('passport');
var flash 		= require('connect-flash');

var bodyParser		= require('body-parser');
var session			= require('express-session');

var app 			= express();

// configuration =================================
mongoose.connect("mongodb://localhost/passport"); // connect to our database
require('./Server/config/passport')(passport); // pass passport for configuration

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
app.listen(port);
console.log('The magic happens on port ' + port);