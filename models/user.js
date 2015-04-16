var bcrypt = require("bcrypt");
var salt = bcrypt.genSaltSync(10);

"use strict";
module.exports = function (sequelize, DataTypes){
	var User = sequelize.define('User', {
		email: { 
			type: DataTypes.STRING, 
			unique: true, 
			validate: {
				len: [6, 30],
			}
		},
		password: {
			type:DataTypes.STRING,
			validate: {
				notEmpty: true
			}
		}
	},

	{
		instanceMethods: {
			checkPassword: function(passwordD) {
				return bcrypt.compareSync(passwordD, this.password);
			}
		},
		classMethods: {
			associate: function(models){
				this.hasMany(models.Address);
			},
			encryptPassword: function(passwordD) {
				var hash = bcrypt.hashSync(passwordD, salt);
				return hash;
			},
			// createSecure: function(email, passwordD) {
			// 	if(passwordD.length < 6) {
			// 		throw new Error("Password too short");
			// 	}
			// 	return this.create({
			// 		email: email,
			// 		password: this.encryptPassword(passwordD)
			// 	});

			// },
			createSecure: function(email, passwordD) {
	        // console.log("hi " + (typeof this.findAndCountAll( { where: { email: email } })));
	        // If password is too short, throw error
	        if(passwordD.length < 6) {
		          throw new Error("Password too short");
		        } else {
		          // Else, check if user already exists in db
		          // Create variable for nested object User
		        var _this = this
		          // Return User db count where email is the same as email passed through function/entered into form
		        return this.count( {where: { email: email } } )
		            // Then run this function on userCount
		            .then( function(userCount) {
		              // Log count # in console
		              console.log("count returned " + JSON.stringify(userCount));
		              // Check if userCount is greater than 1 (aka check if email in db already)
		              if (userCount >= 1) {
		                // If true, throw error
		                throw new Error("Email already exists");
		              } else {
		                // Else, instantiate new User! (Hooray!)
		                console.log("WERE GETTING HERE\n\n\n\n\n");
		                return _this.create({
		                  email: email,
		                  password: _this.encryptPassword(password)});
		              }
		            });
		        }
		      },
			authenticate: function(email, passwordD) {
				// find a user in the DB
				return this.find({
					where: {
						email: email
					}
				}) 
				.then(function(user){
					if (user === null){
						throw new Error("Username does not exist");
					}
					 else if (user.checkPassword(passwordD) === true){
						return user;
					}
				});
			}

		} // close classMethods
	}); // close define user
	return User;
}; // close User function