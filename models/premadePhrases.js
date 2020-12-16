module.exports = function(sequelize, DataTypes) {
    var premadePhrases = sequelize.define("premadePhrases", {
      content: {
      type: DataTypes.STRING,
      unique: true
    }});
    return premadePhrases;
  };
  