// 'use strict';
// const {
//   Model
// } = require('sequelize');
// module.exports = (sequelize, DataTypes) => {
//   class Reviews extends Model {
//     /**
//      * Helper method for defining associations.
//      * This method is not a part of Sequelize lifecycle.
//      * The `models/index` file will call this method automatically.
//      */
//     static associate(models) {
//       Reviews.belongsTo(models.Users, { foreignKey: "userId" });
//       Reviews.belongsTo(models.Spots, { foreignKey: "spotId" });
//       Reviews.hasMany(models.ReviewImages, { foreignKey: "reviewId" });
//     }
//   }
//   Reviews.init({
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
//     review: {
//       type: DataTypes.STRING,
//       allowNull: false
//     },
//     stars: {
//       type: DataTypes.FLOAT,
//       allowNull: false
//     },
//   }, {
//     sequelize,
//     modelName: 'Reviews',
//   });
//   return Reviews;
// };

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Reviews extends Model {
    static associate(models) {
      // Review belongs to a user and a spot
      Reviews.belongsTo(models.Users, { foreignKey: 'userId', onDelete: 'CASCADE' });
      Reviews.belongsTo(models.Spots, { foreignKey: 'spotId', onDelete: 'CASCADE' });
      // Review can have many images
      Reviews.hasMany(models.ReviewImages, { foreignKey: 'reviewId', onDelete: 'CASCADE' });
    }
  }

  Reviews.init({
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
    review: {
      type: DataTypes.STRING,
      allowNull: false
    },
    stars: {
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
    modelName: 'Reviews',
    tableName: 'Reviews'
  });

  return Reviews;
};
