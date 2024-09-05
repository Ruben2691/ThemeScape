'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Users.init({
    firstName: {
     type: DataTypes.STRING,
     allowNull: false,
    },
    lastName: {
     type: DataTypes.STRING,
     allowNull: false,
    },
    userName: {
     type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    hashedPassword: {
     type: DataTypes.STRING.BINARY,
     allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  }, {
    sequelize,
    modelName: 'Users',
  });
  return Users;
};
