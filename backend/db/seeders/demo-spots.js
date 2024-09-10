'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Spots', [
      {
        ownerId: 1,
        address: '123 Beach Ave',
        city: 'Los Angeles',
        state: 'California',
        country: 'USA',
        lat: 34.0194,
        lng: -118.4912,
        name: 'Cozy Beach House',
        description: 'A cozy house near the beach.',
        price: 200,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ownerId: 2,
        address: '456 Mountain St',
        city: 'Aspen',
        state: 'Colorado',
        country: 'USA',
        lat: 39.1911,
        lng: -106.8175,
        name: 'Mountain Cabin',
        description: 'A beautiful cabin in the mountains.',
        price: 300,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Spots', null, {});
  }
};
