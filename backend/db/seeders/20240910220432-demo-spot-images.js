'use strict';


const { SpotImages } = require('../models')

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up (queryInterface, Sequelize) {

   const spotImageSeed = [
     {
       spotId: 1,
       url: "https://placehold.co/600x400/png",
       preview: true,
     },
     {
       spotId: 2,
       url: "https://placehold.co/600x400/png",
       preview: true,
     },
     {
       spotId: 3,
       url: "https://placehold.co/600x400/png",
     },
     {
       spotId: 4,
       url: "https://placehold.co/600x400/png",
     },
     {
       spotId: 5,
       url: "https://placehold.co/600x400/png",
       preview: true,
     },
   ];

    try {
      await SpotImages.bulkCreate(spotImageSeed, {validate : true});
    } catch (error) {
      console.error(error)
    }

  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'SpotImages';
    await queryInterface.bulkDelete('SpotImages', null, {});
  }
};
