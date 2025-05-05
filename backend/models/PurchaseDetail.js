const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Purchase = require('./Purchase');
const Product = require('./Product');

const PurchaseDetail = sequelize.define('PurchaseDetail', {
  PurchaseID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: Purchase,
      key: 'PurchaseID'
    }
  },
  PrdID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: Product,
      key: 'PrdID'
    }
  },
  Quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  PurchasePrice: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false
  }
}, {
  tableName: 'PurchaseDetails',
  timestamps: false
});

PurchaseDetail.belongsTo(Purchase, { 
  foreignKey: 'PurchaseID',
  onDelete: 'CASCADE'
});
PurchaseDetail.belongsTo(Product, { 
  foreignKey: 'PrdID'
});

module.exports = PurchaseDetail;
