module.exports = function(sequelize, DataTypes) {
    var premadePhrases = sequelize.define("premadePhrases", {
      content: DataTypes.STRING
    });
    return premadePhrases;
  };
  