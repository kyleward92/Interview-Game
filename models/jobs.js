module.exports = function(sequelize, DataTypes) {
    var jobs = sequelize.define("jobs", {
      title: DataTypes.STRING
    });
    return jobs;
  };
  