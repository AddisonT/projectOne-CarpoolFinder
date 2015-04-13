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
			createSecure: function(email, passwordD) {
				if(passwordD.length < 6) {
					throw new Error("Password too short");
				}
				return this.create({
					email: email,
					password: this.encryptPassword(passwordD)
				});

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