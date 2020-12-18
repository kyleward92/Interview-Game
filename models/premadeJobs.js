module.exports = function(sequelize, DataTypes) {
  const premadeJobs = sequelize.define("premadeJobs", {
    title: {
      type: DataTypes.STRING,
      unique: true
    }
  });
  return premadeJobs;
};
