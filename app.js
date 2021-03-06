var express = require('express'),
	bodyParser = require('body-parser'),
	ejs = require('ejs'),
	methodOverride = require('method-override'),
	session = require("express-session"),
	pg = require("pg"),
	app = express();

//mapbox api key
var env = process.env;
var api_key = env.MAP_BOX_KEY;
var async = require('async');
var request = require('request');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname+'/css'));
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

//site index
app.get('/', function(req,res){
    res.render("index");
});

//route to login user
app.get('/login', function(req,res){
	res.render('users/login');
});

//route to signup a user
app.get('/signup', function(req,res){
	res.render('users/signup');
});

//login the current user and store session
app.post('/login', function(req,res){
	db.User.authenticate(req.body.email, req.body.password).
	then(function(user){
		req.login(user);
		res.redirect('/profile');
	});
});

//create a new user and redirect him to the new profile page
app.post('/signup', function(req,res){
	var email = req.body.email;
	var password = req.body.password;

	db.User.createSecure(email,password).
	then(function(user){

		//api call to google geocoder to get coordinate data from home address
		//then creates a new Address entry in the database
		var fn1 = function(cb) {
			var homeAdd = "" +  req.body.addressH + ", "
				+  req.body.cityH + ", " +  req.body.stateH
				+ " " +  req.body.zipH;
			var homeURL = homeAdd.replace(/\s/g,"");
			var url = "https://maps.googleapis.com/maps/api/geocode/json?address="+homeURL;
			console.log(homeURL);
			request(url,function(err, resp, bdy){
				if(!err && resp.statusCode === 200){
					var body = JSON.parse(bdy);
					console.log(body);
					var log = body.results[0].geometry.location.lng;
					var lat = body.results[0].geometry.location.lat;
					db.Address.create({type: "home", address: req.body.addressH
					, name: req.body.nameH, UserId: user.id, city: req.body.cityH
					, state: req.body.stateH, zip: req.body.zipH, fullAdd: homeAdd, lat: lat, lng: log})
					  .then(function(){
					  	cb(null, 'done');
					  });
				}
			});
		};
		//api call to google geocoder to get coordinate data from work address
		//then creates a new Address entry in the database
		var fn2 = function(cb) {
			var workAdd = "" +  req.body.addressW + ", "
				+  req.body.cityW + ", " +  req.body.stateW
				+ " " +  req.body.zipW;
			var workURL = workAdd.replace(/\s/g,"");
			var url = "https://maps.googleapis.com/maps/api/geocode/json?address="+workURL;

			request(url, function(err, resp, bdy){
				if(!err && resp.statusCode === 200){
					var body = JSON.parse(bdy);
					console.log(body);
					var log = body.results[0].geometry.location.lng;
					var lat = body.results[0].geometry.location.lat;

					db.Address.create({type: "work", address: req.body.addressW
					, name: req.body.nameW, UserId: user.id, city: req.body.cityW
					, state: req.body.stateW, zip: req.body.zipW, fullAdd: workAdd, lat: lat, lng: log})
					  .then(function(){
				  		cb(null, 'done');
				      });
				}
			});
		};
		//runs the two api calls for coordinates and address creation asynchronously
		async.parallel([fn1,fn2], function(err,results){
			res.redirect('/login');
		});
	});
});

//renders the current user's profile
app.get('/profile', function(req,res){
	req.currentUser().then(function(dbUser){
		if (dbUser) {
			db.Address.findAll({where: {UserId: dbUser.id}})
			.then(function(addresses){
				console.log(addresses);
				var i, j;
				if(addresses[0].type==='home'){
					i = 0;
					j = 1;
				}else{
					i = 1;
					j = 0;
				}
				res.render('users/profile',{user: dbUser, home: addresses[i], work: addresses[j]});
			});
		} else {
			res.redirect('/login');
		}
	});
});

//edit page to edit a user's profile information
app.get('/profile/edit', function(req,res){
	req.currentUser().then(function(user){
		db.Address.findAll({where: {UserId: user.id}})
		.then(function(addresses){
			var i, j;
			if(addresses[0].type==='home'){
				i = 0;
				j = 1;
			}else{
				i = 1;
				j = 0;
			}
			res.render('users/edit',{user: user, home: addresses[i], work: addresses[j]});
		});
	});
});

//edits the existing addresses of a user in the database
app.post('/profile/edit', function(req, res){
	req.currentUser().then(function(user){
		var userId = user.id;
		var isHome, isWork;
		db.Address.findAll({where: {UserId: user.id}})
		.then(function(addresses){
			if(addresses[0].type==='home'){
				isHome = 0;
				isWork = 1;
			}else{
				isWork = 0;
				isHome = 1;
			}
			//api call to google geocoder to get coordinate data from edited home address
			//then updates the adress entry in the database
			var fn1 = function(cb){
				var homeAdd = "" +  req.body.addressH + ", "
					+  req.body.cityH + ", " +  req.body.stateH
					+ " " +  req.body.zipH;
				var homeURL = homeAdd.replace(/\s/g,"");
				var url = "https://maps.googleapis.com/maps/api/geocode/json?address="+homeURL;

				request(url,function(err, resp, bdy){
					if(!err && resp.statusCode === 200){
						var body = JSON.parse(bdy);
						var log = body.results[0].geometry.location.lng;
						var lat = body.results[0].geometry.location.lat;

						addresses[isHome].updateAttributes({
							type: "home", address: req.body.addressH
							, name: req.body.nameH, UserId: userId, city: req.body.cityH
							, state: req.body.stateH, zip: req.body.zipH, fullAdd: homeAdd, lat: lat, lng: log})
							.then(function(){
								cb(null,'done');
							});
					}
				});
			};

			//api call to google geocoder to get coordinate data from edited work address
			//then updates the adress entry in the database
			var fn2 = function(cb){
				var workAdd = "" +  req.body.addressW + ", "
					+  req.body.cityW + ", " +  req.body.stateW
					+ " " +  req.body.zipW;
				var workURL = workAdd.replace(/\s/g,"");
				var url = "https://maps.googleapis.com/maps/api/geocode/json?address="+workURL;	
				request(url, function(err, resp, bdy){
					if(!err && resp.statusCode === 200){
						var body = JSON.parse(bdy);
						var log = body.results[0].geometry.location.lng;
						var lat = body.results[0].geometry.location.lat;
						addresses[isWork].updateAttributes({
							type: "work", address: req.body.addressW
							, name: req.body.nameW, UserId: userId, city: req.body.cityW
							, state: req.body.stateW, zip: req.body.zipW, fullAdd: workAdd, lat: lat, lng: log})
							.then(function(){
								cb(null,'done');
							})
					}
				});
			}
			//runs the two api calls for coordinates and address update asynchronously
			async.parallel([fn1,fn2], function(err,results){
				res.redirect('/profile');
			});
		});
	});
});

//renders the map for the current user's location and queries the Addresses for a list addresses 
//that are within a square radius around the user's home and work location
app.get('/map', function(req,res){
	req.currentUser().then(function(user){
		db.Address.findAll({where: {UserId: user.id}})
		.then(function(addresses){
			var latUH, latLH, lngUH, lngLH;
			var latUW, latLW, lngUW, lngLW;
			var isHome, isWork;

			//bounds for finding users within a square radius of the current user's locations
			if(addresses[0].type==='home'){
				isHome = 0;
				isWork = 1;
				latUH = addresses[0].lat+0.01;
				latLH = addresses[0].lat-0.01;
				lngUH = addresses[0].lng+0.01;
				lngLH = addresses[0].lng-0.01;

				latUW = addresses[1].lat+0.01;
				latLW = addresses[1].lat-0.01;
				lngUW = addresses[1].lng+0.01;
				lngLW = addresses[1].lng-0.01;
			}else{
				isHome = 1;
				isWork = 0;
				latUH = addresses[1].lat+0.01;
				latLH = addresses[1].lat-0.01;
				lngUH = addresses[1].lng+0.01;
				lngLH = addresses[1].lng-0.01;

				latUW = addresses[0].lat+0.01;
				latLW = addresses[0].lat-0.01;
				lngUW = addresses[0].lng+0.01;
				lngLW = addresses[0].lng-0.01;
			}
			//query Address table for home entries that are around the current user	
			db.sequelize.query("select * from \"Addresses\" where lat < "+latUH+
				" AND "+latLH+" < lat AND lng < "+lngUH+" AND "+lngLH+
				" < lng AND type=\'home\' AND NOT \"UserId\"="+user.id+";")
			.then(function(homeAddresses){
				//query Address table for work entries that are around the current user
				db.sequelize.query("select * from \"Addresses\" where lat < "+latUW+
					" AND "+latLW+" < lat AND lng < "+lngUW+" AND "+lngLW+
					" < lng AND type=\'work\' AND NOT \"UserId\"="+user.id+";")
					.then(function(workAddresses){
						var homeList =[];
						var workList =[];
						//stores the home and work addresses into an array if the home and work addresses found
						//belong to the same person
						for(var i=0;i<homeAddresses[0].length;i++){
							for(var j=0;j<workAddresses[0].length;j++){
								if(homeAddresses[0][i].UserId===workAddresses[0][j].UserId){
									homeList.push(homeAddresses[0][i]);
									workList.push(workAddresses[0][i]);
								}
							}
						}
						console.log(homeList);
						res.render('maps',{home: addresses[isHome], work: addresses[isWork]
							, homeL: homeList, workL: workList});
					});				
			});
		});
	});
});

//route to pass the query data for map rendering to the map.js file
app.get('/address.json', function(req,res){
	req.currentUser().then(function(user){
		db.Address.findAll({where: {UserId: user.id}})
		  .then(function(addresses){

		  	var latUH, latLH, lngUH, lngLH;
			var latUW, latLW, lngUW, lngLW;
			var isHome, isWork;

			//bounds for finding users within a square radius of the current user's locations
			if(addresses[0].type==='home'){
				isHome = 0;
				isWork = 1;
				latUH = addresses[0].lat+0.01;
				latLH = addresses[0].lat-0.01;
				lngUH = addresses[0].lng+0.01;
				lngLH = addresses[0].lng-0.01;

				latUW = addresses[1].lat+0.01;
				latLW = addresses[1].lat-0.01;
				lngUW = addresses[1].lng+0.01;
				lngLW = addresses[1].lng-0.01;
			}else{
				isHome = 1;
				isWork = 0;
				latUH = addresses[1].lat+0.01;
				latLH = addresses[1].lat-0.01;
				lngUH = addresses[1].lng+0.01;
				lngLH = addresses[1].lng-0.01;

				latUW = addresses[0].lat+0.01;
				latLW = addresses[0].lat-0.01;
				lngUW = addresses[0].lng+0.01;
				lngLW = addresses[0].lng-0.01;
			}	
			db.sequelize.query("select * from \"Addresses\" where lat < "+latUH+
				" AND "+latLH+" < lat AND lng < "+lngUH+" AND "+lngLH+
				" < lng AND type=\'home\' AND NOT \"UserId\"="+user.id+";")
			.then(function(homeAddresses){
				db.sequelize.query("select * from \"Addresses\" where lat < "+latUW+
					" AND "+latLW+" < lat AND lng < "+lngUW+" AND "+lngLW+
					" < lng AND type=\'work\' AND NOT \"UserId\"="+user.id+";")
					.then(function(workAddresses){
						//create an object to store all the data that I need to pass to the map.js file
						//to render the maps with Address markers
						var dataHash = {data: [], hList: [], wList: []};
						for(var i=0;i<homeAddresses[0].length;i++){
							for(var j=0;j<workAddresses[0].length;j++){
								if(homeAddresses[0][i].UserId===workAddresses[0][j].UserId){
									dataHash.hList.push(homeAddresses[0][i]);
									dataHash.wList.push(workAddresses[0][i]);
								}
							}
						}
						dataHash.data.push(addresses[isHome]);
						dataHash.data.push(addresses[isWork]);
						console.log(dataHash);
						res.send(dataHash);
					});				
			});
		  });
	});
});

//route to render the contact page of selected user to inquire about carpooling
app.get('/find/:id',function(req,res){
	var personId = req.params.id;
	req.currentUser().then(function(user){
		db.Address.find({where: {id: personId}})
		.then(function(add){
			db.User.find(add.UserId).then(function(foundU){
				res.render('users/meet', {person: foundU, add: add});
			});
		});
	});
});

//logs out the current user
app.get('/logout', function(req,res){
	req.logout();
    res.redirect('/login');
});

app.listen(process.env.PORT || 3000, function(){
	console.log("I'm listening");
});