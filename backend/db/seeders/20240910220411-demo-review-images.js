'use strict';


const {ReviewImages} = require('../models')

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}
/** @type {import('sequelize-cli').Migration} */
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
try {
  await ReviewImages.bulkCreate(reviewImageSeed, {validate : true});
} catch (error) {
  console.error(error)
}

  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'ReviewImages';
    await queryInterface.bulkDelete('ReviewImages', null, {});
  }
};
