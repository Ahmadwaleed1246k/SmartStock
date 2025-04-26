const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Sale = require('./Sale');
const Product = require('./Product');

const SaleDetail = sequelize.define('SaleDetail', {
  SaleDetailID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  SaleID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Sale,
      key: 'SaleID'
    }
  },
  PrdID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Product,
      key: 'PrdID'
    }
  },
  Quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  SalePrice: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false
  }
}, {
  tableName: 'SaleDetails',
  timestamps: false
});

SaleDetail.belongsTo(Sale, { foreignKey: 'SaleID' });
SaleDetail.belongsTo(Product, { foreignKey: 'PrdID' });

module.exports = SaleDetail;
