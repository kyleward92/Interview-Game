module.exports = function(sequelize, DataTypes) {
  const premadePhrases = sequelize.define("premadePhrases", {
    content: {
      type: DataTypes.STRING,
      unique: true
    }
  });
  return premadePhrases;
};
