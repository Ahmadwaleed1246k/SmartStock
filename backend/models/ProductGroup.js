const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Company = require('./Company');

const ProductGroup = sequelize.define('ProductGroup', {
  GroupID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  GroupName: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false
  },
  CompID: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'ProductGroup',
  timestamps: false
});


ProductGroup.belongsTo(Company, { foreignKey: 'CompID', onDelete: 'CASCADE' });
module.exports = ProductGroup;
