const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Company = require('./Company');
const ProductGroup = require('./ProductGroup');
const ProductCategory = require('./ProductCategory');

const Products = sequelize.define('Products', {
  PrdID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  PrdName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  PrdCode: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  PurchasePrice: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false
  },
  SalePrice: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false
  },
  RestockLevel: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  Description: {
    type: DataTypes.TEXT
  },
  ImageURL: {
    type: DataTypes.STRING(255)
  },
  CompID: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'Products',
  timestamps: false
});

Products.belongsTo(ProductGroup, { foreignKey: 'GroupID' });
Products.belongsTo(ProductCategory, { foreignKey: 'CategoryID' });
Products.belongsTo(Company, { foreignKey: 'CompID', onDelete: 'CASCADE' });

module.exports = Products;
