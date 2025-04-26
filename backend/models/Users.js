const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Company = require('./Company');

const Users = sequelize.define('Users', {
  UserID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  Username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50]
    }
  },
  Password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [5, 255],
      isValidPassword(value) {
        if (!/[!@#$%^&*()_|-]/.test(value)) {
          throw new Error('Password must contain at least one special character');
        }
      }
    }
  },
 
  UserRole: {
    type: DataTypes.STRING(20),
    validate: {
      isIn: [['Admin', 'Employee']]
    }
  },
  CompID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Company,
      key: 'CompID'
    }
  }
}, {
  tableName: 'Users',
  timestamps: false
});

Users.belongsTo(Company, { foreignKey: 'CompID', onDelete: 'CASCADE' });

module.exports = Users;
