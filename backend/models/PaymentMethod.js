const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Company = require('../model/Company')

const PaymentMethods = sequelize.define('PaymentMethods', {
  PaymentID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  PaymentMethod: {
    type: DataTypes.STRING(20),
    validate: {
      isIn: [['Cash', 'Bank', 'CreditCard', 'Online']]
    }
  },
  CompID: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'PaymentMethods',
  timestamps: false
});

PaymentMethods.belongsTo(Company, { foreignKey: 'CompID', onDelete: 'CASCADE' });
module.exports = PaymentMethods;