const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Account = require('./Account');
const Company = require('./Company');

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
    VoucherNo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    }
});

Sale.belongsTo(Company, { foreignKey: 'CompID', onDelete: 'CASCADE' });
Sale.belongsTo(Account, { foreignKey: 'CustomerID' });

module.exports = Sale;
