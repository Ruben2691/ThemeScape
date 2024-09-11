'use strict';


const { Bookings } = require('../models')

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    const bookingSeed = [
      {
        spotId: 1,
        userId: 1,
        startDate: new Date("2024-09-15"),
        endDate: new Date("2024-09-16"),
      },
      {
        spotId: 2,
        userId: 1,
        startDate: new Date("2024-09-24"),
        endDate: new Date("2024-09-25"),
      },
      {
        spotId: 5,
        userId: 3,
        startDate: new Date("2024-10-31"),
        endDate: new Date("2024-11-01"),
      },
    ];
    await Bookings.bulkCreate(bookingSeed);
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Bookings';
    await queryInterface.bulkDelete('Bookings', null, {});
  }
};
