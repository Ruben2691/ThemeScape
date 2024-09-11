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
       preview: true,
       url: "https://placehold.co/600x400/png",
     },
     {
       spotId: 2,
       preview: true,
       url: "https://placehold.co/600x400/png",
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
       preview: true,
       url: "https://placehold.co/600x400/png",
     },
   ];
   await SpotImages.bulkCreate(spotImageSeed, {validate: true});
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'SpotImages';
    await queryInterface.bulkDelete('SpotImages', null, {});
  }
};
