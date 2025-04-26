const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Account = require('./Account');
const Company = require('./Company');
const PaymentMethod = require('./PaymentMethod');

const Sale = sequelize.define('Sale', {
    SaleID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    TotalAmount: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false
    },
    Discount: {
        type: DataTypes.DECIMAL(18, 2)
    },
    SaleDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    CompID: {
        type: DataTypes.INTEGER,
        references: {
            model: Company,
            key: 'CompID'
        }
    },
    CustomerID: {
        type: DataTypes.INTEGER,
        references: {
            model: Account,
            key: 'AcctID'
        }
    },
    PaymentMethodID: {
        type: DataTypes.INTEGER,
        references: {
            model: PaymentMethod,
            key: 'PaymentID'
        }
    }
});

Sale.belongsTo(Company, { foreignKey: 'CompID', onDelete: 'CASCADE' });
Sale.belongsTo(Account, { foreignKey: 'CustomerID' });
Sale.belongsTo(PaymentMethod, { foreignKey: 'PaymentMethodID' });

module.exports = Sale;
