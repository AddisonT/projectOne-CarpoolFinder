var express = require('express'),
	bodyParser = require('body-parser'),
	ejs = require('ejs'),
	methodOverride = require('method-override'),
	session = require("express-session"),
	pg = require("pg"),
	app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

// Refactor connection and query code
var db = require("./models");

app.use(session({
  secret: 'supersuper secret',
  resave: false,
  saveUninitialized: true
}));

app.use(function (req, res, next) {

		//set value on session with the user's ID
	req.login = function (user) {
	    req.session.userId = user.id;
	};

	  //find the current user's session by his ID
	req.currentUser = function () {
	    return db.User.
	    find({
	        where: {
	          id: req.session.userId
	        }
	    }).
	    	then(function (user) {
	        	req.user = user;
	        	return user;
	    })
	};

	  //logs out the user out of the session
	  	req.logout = function () {
	  	  req.session.userId = null;
	    	req.user = null;
	}
  	next(); 
});

app.get('/', function(req,res){
    res.render("index");
});

app.get('/login', function(req,res){
	res.render('users/login');
});

app.get('/signup', function(req,res){
	res.render('users/signup');
});

app.post('/login', function(req,res){
	db.User.authenticate(req.body.email, req.body.password).
	then(function(user){
		req.login(user);
		res.redirect('users/profile');
	});
});

app.post('/signup', function(req,res){
	var email = req.body.email;
	var password = req.body.password;

	db.User.createSecure(email,password).
	then(function(user){
		res.redirect("/profile");
	});
});

app.delete('/logout', function(req,res){
    res.send("I'm a delete");
});

app.get('/profile', function(req,res){
	req.currentUser().then(function(dbUser){
		if (dbUser) {
			res.render('users/profile', {ejsUser: dbUser});
		} else {
			res.redirect('users/login');
		}
	});
});

app.get('/map', function(req,res){
	var location = {home:"Belmont, CA", work: "225 Bush St., San Francisco, CA"};

	res.render('maps',{street: location});
});

app.listen(3000, function(){
	console.log("I'm listening");
});