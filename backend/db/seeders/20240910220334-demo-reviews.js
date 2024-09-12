'use strict';


const { Reviews } = require('../models')

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
  const reviewSeed = [
    {

      spotId: 4,
      userId: 2,
      review: "This place gives me the creeps!!",
      stars: 1.5,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {

      spotId: 5,
      userId: 1,
      review: "I really like this place!",
      stars: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {

      spotId: 2,
      userId: 3,
      review: "Great place!",
      stars: 4.5,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
try {
  await Reviews.bulkCreate(reviewSeed, {validate : true});

} catch (error) {
 console.error(error);
}

  },

  async down(queryInterface, Sequelize) {
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      review: { [Op.in]: ['Great place!', 'Would visit again', 'Not recommended'] }
    }, {});
  }
};
