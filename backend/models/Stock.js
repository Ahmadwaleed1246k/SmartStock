const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Products = require('./Product');
const Company = require('./Company');

const Stock = sequelize.define('Stock', {
  CompID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: Company,
      key: 'CompID'
    }
  },
  PrdID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: Products,
      key: 'PrdID'
    }
  },
  StockQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  LastUpdated: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('GETDATE()')
  }
}, {
  tableName: 'Stock',
  timestamps: false
});

Stock.belongsTo(Products, { foreignKey: 'PrdID' });
Stock.belongsTo(Company, { foreignKey: 'CompID', onDelete: 'CASCADE' });

module.exports = Stock;
