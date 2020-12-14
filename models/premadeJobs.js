module.exports = function(sequelize, DataTypes) {
    var premadejob = sequelize.define("premadejobs", {
      title: {
        type: DataTypes.STRING,
        unique: true
      }
    });
    return premadejob;
  };
  