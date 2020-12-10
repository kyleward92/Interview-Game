module.exports = function(sequelize, DataTypes) {
    var job = sequelize.define("jobs", {
      title: DataTypes.STRING
    });
    return job;
  };
  