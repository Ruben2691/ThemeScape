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
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        spotId: 2,
        userId: 4,
        startDate: new Date("2024-09-24"),
        endDate: new Date("2024-09-25"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        spotId: 5,
        userId: 3,
        startDate: new Date("2024-10-31"),
        endDate: new Date("2024-11-01"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    try {
      await Bookings.bulkCreate( bookingSeed , {validate : true});
    } catch (error) {
      console.error(error);
    }

  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Bookings';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      userId: { [Op.in]: [1, 4, 3] }
    }, {});
  }

};
