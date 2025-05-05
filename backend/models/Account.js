const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Company = require('./Company');

const Accounts = sequelize.define('Accounts', {
  AcctID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  AcctName: {
    type: DataTypes.STRING(100),
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
  Email: {
    type: DataTypes.STRING(100),
    unique: true,
    validate: {
      isEmail: true
    }
  },
  AcctType: {
    type: DataTypes.STRING(20),
    // validate: {
    //   isIn: [['Supplier', 'Customer']]
    // }
  },
  CompID: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'Accounts',
  timestamps: false
});

Accounts.belongsTo(Company, { foreignKey: 'CompID', onDelete: 'CASCADE' });

module.exports = Accounts;
