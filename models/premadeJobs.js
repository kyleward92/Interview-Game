module.exports = function(sequelize, DataTypes) {
    var premadeJobs = sequelize.define("premadeJobs", {
      title: {
        type: DataTypes.STRING,
        unique: true
      }
    });
    return premadeJobs;
  };
  