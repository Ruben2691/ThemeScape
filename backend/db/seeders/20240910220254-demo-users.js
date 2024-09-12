'use strict';

const { Users } = require('../models');
const bcrypt = require('bcryptjs');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   const userSeed = [
     {
       firstName: "Demo",
       lastName: "lition",
       email: "demo@user.io",
       username: "Demo-lition",
       hashedPassword: bcrypt.hashSync("password"),
     },
     {
       firstName: "Fake",
       lastName: "User",
       email: "user1@user.io",
       username: "FakeUser1",
       hashedPassword: bcrypt.hashSync("password2"),
     },
     {
      firstName: "Faker",
      lastName: "User",
      email: "user2@user.io",
      username: "FakeUser2",
      hashedPassword: bcrypt.hashSync("password3"),
     },
   ];
   try{await Users.bulkCreate(userSeed,{validate:true});
   }catch(err){
    console.error(err);
   }

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
