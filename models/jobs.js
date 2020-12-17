module.exports = function (sequelize, DataTypes) {
  var jobs = sequelize.define("jobs", {
    title: {
      type: DataTypes.STRING,
      unique: true
    },
    roomNum: {
      type: DataTypes.INTEGER
    },
  });
  return jobs;
};
