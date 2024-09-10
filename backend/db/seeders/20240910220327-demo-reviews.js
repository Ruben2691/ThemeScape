'use strict';

/** @type {import('sequelize-cli').Migration} */
const { Reviews } = require('../models')
module.exports = {
  async up (queryInterface, Sequelize) {
  const reviewSeed = [
    {
      userId: 2,
      spotId: 4,
      review: "This place gives me the creeps!!",
      stars: 1.5,
    },
    {
      userId: 1,
      spotId: 5,
      review: "I really like this place!",
      stars: 5,
    },
    {
      userId: 3,
      spotId: 2,
      review: "Great place!",
      stars: 4.5,
    },
  ];
  await Reviews.bulkCreate(reviewSeed);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Reviews', null, {});
  }
};
