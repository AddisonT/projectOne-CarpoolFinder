"use strict";
module.exports = function(sequelize, DataTypes) {
  var Address = sequelize.define("Address", {
    type: DataTypes.STRING,
    address: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    zip: DataTypes.INTEGER,
    UserId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    fullAdd: DataTypes.STRING,
    lat: DataTypes.FLOAT,
    lng: DataTypes.FLOAT
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        this.belongsTo(models.User);
      }
    }
  });
  return Address;
};