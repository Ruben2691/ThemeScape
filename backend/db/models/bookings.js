// 'use strict';
// const { Model } = require('sequelize');
// module.exports = (sequelize, DataTypes) => {
//   class Bookings extends Model {
//     /**
//      * Helper method for defining associations.
//      * This method is not a part of Sequelize lifecycle.
//      * The `models/index` file will call this method automatically.
//      */
//     static associate(models) {
//       Bookings.belongsTo(models.Users, { foreignKey: "userId" , onDelete: 'CASCADE' });
//       Bookings.belongsTo(models.Spots, { foreignKey: "spotId" , onDelete: 'CASCADE' });
//     }
//   }
//   Bookings.init({
//     spotId: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: {
//         model: "Spots",
//         key: "id"
//       },
//       onDelete: 'CASCADE'
//     },
//     userId: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: {
//         model: "Users",
//         key: "id"
//       },
//       onDelete: 'CASCADE'
//     },
//     startDate: {
//       type: DataTypes.DATE,
//       allowNull: false
//     },
//     endDate: {
//       type: DataTypes.DATE,
//       allowNull: false
//     }
//   }, {
//     sequelize,
//     modelName: 'Bookings',
//   });
//   return Bookings;
// };
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Bookings extends Model {
    static associate(models) {
      // Booking belongs to a user and a spot
      Bookings.belongsTo(models.Users, { foreignKey: 'userId', onDelete: 'CASCADE' });
      Bookings.belongsTo(models.Spots, { foreignKey: 'spotId', onDelete: 'CASCADE' });
    }
  }

  Bookings.init({
    spotId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references:{
        model: "Spots", key: "id",
        tableName: "Spots"
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references:{
        model: "Users", key: "id",
        tableName: "Users"
      }
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
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
    modelName: 'Bookings',
    tableName: 'Bookings'
  });

  return Bookings;
};
