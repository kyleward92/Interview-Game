// might need to require socket?

// Creating jobs and phrases 
module.exports = function (sequelize, DataTypes) {
  var phrase = sequelize.define("phrases", {
    content: {
      type: DataTypes.STRING,
      unique: true
    },
    roomNum: {
      type: DataTypes.INTEGER
    },
  });
  return phrase;
};
