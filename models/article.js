"use strict";
module.exports = function(sequelize, DataTypes) {
  var Article = sequelize.define("Article", {
    title: DataTypes.STRING,
    content: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function(models) {
        this.belongsTo(models.Author);
      }
    }
  });
  return Article;
};