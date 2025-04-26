const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Company = sequelize.define('Company', {
  CompID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  Name: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false
  },
  Address: {
    type: DataTypes.STRING(255)
  },
  Tel: {
    type: DataTypes.STRING(15),
    validate: {
      len: [10, 10]
    }
  },
  Mob: {
    type: DataTypes.STRING(15),
    validate: {
      len: [11, 11]
    }
  },
  DateOfRegistration: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'Company',
  timestamps: false
});

module.exports = Company;
