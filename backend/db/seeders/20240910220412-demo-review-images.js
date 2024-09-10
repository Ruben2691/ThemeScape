'use strict';

/** @type {import('sequelize-cli').Migration} */
const {ReviewImages} = require('../models')
module.exports = {
  async up (queryInterface, Sequelize) {
    const reviewImageSeed = [
      {
        reviewId: 1,
        url: "https://placehold.co/600x400/png",
      },
      {
        reviewId: 2,
        url: "https://placehold.co/600x400/png",
      },
      {
        imageId: 8,
        reviewId: 3,
        url: "https://placehold.co/600x400/png",
      },
    ];

    await ReviewImages.bulkCreate(reviewImageSeed, {validate: true});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ReviewImages', null, {});
  }
};
