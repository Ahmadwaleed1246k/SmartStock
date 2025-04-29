const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Company = require('./Company');
const crypto = require('crypto');

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
    type: DataTypes.BLOB,
    allowNull: false,
    set(value) {
      // Hash the password before storing
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.pbkdf2Sync(value, salt, 1000, 64, 'sha512').toString('hex');
      this.setDataValue('Password', Buffer.from(`${salt}:${hash}`));
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
  timestamps: false,
  instanceMethods: {
    validPassword: function(password) {
      const [salt, hash] = this.Password.toString().split(':');
      const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
      return hash === verifyHash;
    }
  }
});

Users.belongsTo(Company, { foreignKey: 'CompID', onDelete: 'CASCADE' });

module.exports = Users;
