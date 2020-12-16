module.exports = function(sequelize, DataTypes) {
  const jobs = sequelize.define("jobs", {
    title: {
      type: DataTypes.STRING,
      unique: true
    }
  });
  return jobs;
};
