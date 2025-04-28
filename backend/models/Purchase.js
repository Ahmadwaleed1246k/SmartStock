const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Account = require('./Account');
const Company = require('./Company');

const Purchase = sequelize.define('Purchase', {
    PurchaseID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    TotalAmount: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false
    },
    PurchaseDate: {
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
    SupplierID: {
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

Purchase.belongsTo(Company, { foreignKey: 'CompID', onDelete: 'CASCADE' });
Purchase.belongsTo(Account, { foreignKey: 'SupplierID' });

module.exports = Purchase;
