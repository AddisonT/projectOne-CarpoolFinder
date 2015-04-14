"use strict";
module.exports = {
  up: function(migration, DataTypes, done) {
    migration.createTable("Addresses", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      type: {
        type: DataTypes.STRING
      },
      address: {
        type: DataTypes.STRING
      },
      city: {
        type: DataTypes.STRING
      },
      state: {
        type: DataTypes.STRING
      },
      zip: {
        type: DataTypes.INTEGER
      },
      UserId: {
        type: DataTypes.INTEGER
      },
      name: {
        type: DataTypes.STRING
      },
      fullAdd: {
        type: DataTypes.STRING
      },
      lat: {
        type: DataTypes.FLOAT
      },
      lng: {
        type: DataTypes.FLOAT
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    }).done(done);
  },
  down: function(migration, DataTypes, done) {
    migration.dropTable("Addresses").done(done);
  }
};