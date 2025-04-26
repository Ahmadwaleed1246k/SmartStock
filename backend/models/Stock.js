const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Products = require('./Product');
const Company = require('./Company');

const Stock = sequelize.define('Stock', {
  StockID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  StockQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  PrdID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  CompID: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'Stock',
  timestamps: false
});

Stock.belongsTo(Products, { foreignKey: 'PrdID' });
Stock.belongsTo(Company, { foreignKey: 'CompID', onDelete: 'CASCADE' });

module.exports = Stock;
