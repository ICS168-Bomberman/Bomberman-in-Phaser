module.exports = function(app, passport) {

// normal routes =========================================

	//show either the game page or the login/signup page depending
	// on whether the user is logged in or not
	app.get('/', function(req, res) {
		if(req.isAuthenticated()) {
			res.render('game.ejs', {user : req.user });
		} else {
			res.render('login_signup.ejs');
		}
	});

	// LOGOUT =========================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

// ========================================================
// AUTHENTICATION =========================================
// ========================================================

	// LOGIN =================================
	//show the login form
	app.get('/login', function(req, res) {
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

  	// process the login form
	app.post('/login', passport.authenticate('local-login', {
	   successRedirect : '/', // redirect to the homepage, which now should display the game since the user is logged in now
	   failureRedirect : '/login', // redirect back to the signup page if there is an error
	   failureFlash : true // allow flash messages
	}));

	// SIGNUP =================================
	// show the signup form
	app.get('/signup', function(req, res) {
	   res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
	   successRedirect : '/', // redirect to the secure profile section
	   failureRedirect : '/signup', // redirect back to the signup page if there is an error
	   failureFlash : true // allow flash messages
	}));


};