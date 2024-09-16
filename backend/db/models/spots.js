// 'use strict';
// const { Model } = require('sequelize');
// module.exports = (sequelize, DataTypes) => {
//   class Spots extends Model {
//     /**
//      * Helper method for defining associations.
//      * This method is not a part of Sequelize lifecycle.
//      * The `models/index` file will call this method automatically.
//      */
//     static associate(models) {
//       Spots.belongsTo(models.Users, { foreignKey: "ownerId", as: "Owner", onDelete: 'CASCADE' });
//       Spots.hasMany(models.Bookings, { foreignKey: "spotId" });
//       Spots.hasMany(models.Reviews, { foreignKey: "spotId" });
//       Spots.hasMany(models.SpotImages, { foreignKey: "spotId" });
//     }
//   }
//   Spots.init({
//     ownerId: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: {
//         model: "Users",
//         key: "id"
//       },
//       onDelete: 'CASCADE'
//     },
//     address: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     city: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     state: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     country: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     lat: {
//       type: DataTypes.FLOAT,
//       allowNull: false
//     },
//     lng: {
//       type: DataTypes.FLOAT,
//       allowNull: false
//     },
//     name: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     description: {
//       type: DataTypes.STRING,
//     },
//     price: {
//       type: DataTypes.FLOAT,
//       allowNull: false
//     },
//     createdAt: {
//       type: DataTypes.DATE,
//       defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
//     },
//     updatedAt: {
//       type: DataTypes.DATE,
//       defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
//     }

//   }, {
//     sequelize,
//     modelName: 'Spots',
//   });
//   return Spots;
// };
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Spots extends Model {
    static associate(models) {
      // Spot belongs to a user (owner)
      Spots.belongsTo(models.Users, { foreignKey: 'ownerId',  onDelete: 'CASCADE' });
      // Spot can have many reviews, bookings, and spot images
      Spots.hasMany(models.Reviews, { foreignKey: 'spotId', onDelete: 'CASCADE' });
      Spots.hasMany(models.Bookings, { foreignKey: 'spotId', onDelete: 'CASCADE' });
      Spots.hasMany(models.SpotImages, { foreignKey: 'spotId', onDelete: 'CASCADE' });
    }
  }

  Spots.init({
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references:{
        model: "Users", key: "id" , as: "Owner"
      }
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lat: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    lng: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Spots',
  });

  return Spots;
};
