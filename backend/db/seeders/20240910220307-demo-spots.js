'use strict';
const { Spots } = require('../models');
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const spotSeed = [
      {
        ownerId: 1,
        address: "123 Disney Lane",
        city: "San Francisco",
        state: "California",
        country: "United States of America",
        lat: 37.7645358,
        lng: -122.4730327,
        name: "App Academy",
        description: "Place where web developers are created",
        price: 123,
      },
      {
        ownerId: 1,
        address: "129 Disney Lane",
        city: "San Francisco",
        state: "California",
        country: "United States of America",
        lat: 43.7645358,
        lng: -132.4730327,
        name: "App Academy admission office",
        description: "Place where web developers are accepted",
        price: 129,
      },
      {
        ownerId: 1,
        address: "135 Disney Lane",
        city: "San Francisco",
        state: "California",
        country: "United States of America",
        lat: 50.7645358,
        lng: -145.4730327,
        name: "App Academy",
        description: "help office",
        price: 145,
      },
      {
        ownerId: 3,
        address: "485 Development Way",
        city: "San Francisco",
        state: "California",
        country: "United States of America",
        lat: 37.7645358,
        lng: -122.4730327,
        name: "Shutter Island",
        description: "Nice comfy cot",
        price: 123,
      },
      {
        ownerId: 3,
        address: "9245 Main Street N",
        city: "Paris",
        state: "Texas",
        country: "United States of America",
        lat: 48.1234576,
        lng: -129.4793338,
        name: "Residence Inn",
        description:
          "Three bedroom suite with kitchenette and kitchen with island",
        price: 285,
      },
    ];
    await Spots.bulkCreate(spotSeed);
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Spots';
    await queryInterface.bulkDelete('Spots', null, {});
  }
};
