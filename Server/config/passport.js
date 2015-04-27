// load all the things we need
var LocalStrategy = require('passport-local').Strategy;

// load up the user model
var User 		= require('../models/user');

module.exports = function(passport) {

	// ==============================
	// passport session setup =======
	// ==============================
	// required for persistent login sessions
	// passport needs ability to serialize and unserialize users out of session

	// used to serialize the user for the session
	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	// used to deserialize the user
	passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user) {
			done(err, user);
		});
	});

	// =============================================
	// LOCAL LOGIN =================================
	// =============================================
	passport.use('local-login', new LocalStrategy({
		passReqToCallback	: true //  allows us to pass in the req from our route (lets us check if a user is logged in or not)
	},
	function(req, username, password, done) {
		// asynchronous
		process.nextTick(function() {
			User.findOne({ 'username' :  username }, function(err, user) {
				// if there are any errors, return the error
				//req.flash('loginMessage', 'aldfjdlsafjs');
				if (err) 
					return done(err);     

				// if no user is found, return the message
				if (!user) 
					return done(null, false, req.flash('loginMessage', 'No user found.'));

				if (!user.validPassword(password))
					return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

				// all is well, return user
				else 
					return done(null, user);
         	});
		});
	}));

	// =============================================
	// LOCAL SIGNUP ================================
	// =============================================
	passport.use('local-signup', new LocalStrategy({
		passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
	},
	function(req, username, password, done) {
		// asynchronous
		process.nextTick(function() {
			// if the user is not already logged in:
         if (!req.user) {
             User.findOne({ 'username' :  username }, function(err, user) {
                 // if there are any errors, return the error
                 if (err)
                     return done(err);

                 // check to see if theres already a user with that email
                 if (user) {
                     return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
                 } else {

                     // create the user
                     var newUser            = new User();

                     newUser.username  = username;
                     newUser.password = newUser.generateHash(password);

                     newUser.save(function(err) {
                         if (err)
                             return done(err);

                         return done(null, newUser);
                     });
                 }

             });
         } else {
             // user is logged already in their local account. Ignore signup. (You should log out before trying to create a new account, user!)
             return done(null, req.user);
         }

     });
	}));

}