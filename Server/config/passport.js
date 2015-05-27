// load all the things we need
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt-nodejs');

// load up the user model
//var User 		= require('../models/user');
var db = require('../database.js');

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

		console.log("--------------------------");
		console.log("deserializeUser called");

		db.get('SELECT id, username, score FROM userInfo WHERE id = ?', id, function(err, row) {
			done(err,row);
			/*if (!row) return done(null, false);
			return done(null, row);*/
		});	

		/*User.findById(id, function(err, user) {
			done(err, user);
		});*/

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

			/*
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
			*/


			db.get('SELECT * FROM userInfo WHERE username = ?', username, function(err, row) {
				// if there are any errors, return the error
				if (err) 
					return done(err);  
				// if no user is found, return the message
			    if (!row) 
			    	return done(null, false, req.flash('loginMessage', 'No user found.'));

			    if(! bcrypt.compareSync(password, row.password))
			    	return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

			    // all is well, return user
				else 
					return done(null, row);

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


         	/*

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
			*/


			db.get('SELECT * FROM userInfo WHERE username = ?', username, function(err, row) {
				// if there are any errors, return the error
				if (err)
				     return done(err);
				//chekc to see if there's already a user with that email
				 if (row) {
				     return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
				 } else {
				 	// create the user
				 	var stmt = db.prepare("INSERT INTO userInfo (username, password, score) VALUES(?,?,?)");
				 	var hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);				 	
				 	
					stmt.run(username, hashedPassword,0);
					stmt.finalize();
					var newUser = {};

					db.get('SELECT * FROM  userInfo WHERE username = ?', username, function(err, row) {
						if(err) 
							return done(err);
						newUser.id = row.id;
						newUser.username = row.username;
						newUser.password = row.password;
						newUser.score    = row.score;
						console.log("printing new user");
						console.log(newUser);
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
