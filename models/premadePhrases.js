module.exports = function(sequelize, DataTypes) {
    var premadephrase = sequelize.define("premadephrases", {
      content: {
      type: DataTypes.STRING,
      unique: true
    }});
    return premadephrase;
  };
  