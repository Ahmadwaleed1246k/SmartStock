const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const ProductGroup = require('./ProductGroup');
const Company = require('./Company');

const ProductCategory = sequelize.define('ProductCategory', {
  CategoryID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  CategoryName: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false
  },
  CompID: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'ProductCategory',
  timestamps: false
});

ProductCategory.belongsTo(ProductGroup, { foreignKey: 'GroupID' });
ProductCategory.belongsTo(Company, { foreignKey: 'CompID', onDelete: 'CASCADE' });
module.exports = ProductCategory;
