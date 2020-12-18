"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      "premadeJobs",
      [
        {
          title: "School Teacher",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "Demolitions Expert",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "Janitor",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "Pastor",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "Historian",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "Software Developer",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "Therapist",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "President",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "MLM Recruiter",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "Knight",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "Architect",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "Salesman",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "Bartender",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "Trail Guide",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "Bee Keeper",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "Dungeon Master",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "Chemist",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "Zoo Keeper",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "Truck Driver",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "Cultist",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    );
  },
  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
