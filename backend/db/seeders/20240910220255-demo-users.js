'use strict';

/** @type {import('sequelize-cli').Migration} */
const { Users } = require('../models');
const bcrypt = require('bcryptjs');
module.exports = {
  async up (queryInterface, Sequelize) {
   const userSeed = [
     {
       email: "demo@user.io",
       userName: "Demo-lition",
       firstName: "Demo",
       lastName: "lition",
       hashedPassword: bcrypt.hashSync("password"),
     },
     {
       email: "user1@user.io",
       userName: "FakeUser1",
       firstName: "Fake",
       lastName: "User",
       hashedPassword: bcrypt.hashSync("password2"),
     },
     {
       email: "user2@user.io",
       userName: "FakeUser2",
       firstName: "Faker",
       lastName: "User",
       hashedPassword: bcrypt.hashSync("password3"),
     },
   ];
   await Users.bulkCreate(userSeed);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
