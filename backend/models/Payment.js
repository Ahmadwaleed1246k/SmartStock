const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Account = require('./Account');
const Company = require('./Company');
const PaymentMethod = require('./PaymentMethod');
const Purchase = require('./Purchase');
const Sale = require('./Sale');

const Payment = sequelize.define('Payment', {
    PaymentID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    PaymentType: {
        type: DataTypes.ENUM('Received', 'Paid'),
        allowNull: false,
        validate: {
            isIn: [['Received', 'Paid']]
        }
    },
    Amount: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false,
        validate: {
            min: 0.01
        }
    },
    PaymentDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    VoucherNo: {
        type: DataTypes.INTEGER
    },
    Reference: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    TransactionReference: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    CompID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Company,
            key: 'CompID'
        }
    },
    AcctID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Account,
            key: 'AcctID'
        }
    },
    CashBankAcctID: {
        type: DataTypes.INTEGER,
        references: {
            model: Account,
            key: 'AcctID'
        }
    },
    PurchaseID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Purchase,
            key: 'PurchaseID'
        }
    },
    SaleID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Sale,
            key: 'SaleID'
        }
    }
}, {
    tableName: 'Payments',
    timestamps: false,
    validate: {
        checkPaymentLink() {
            if (this.PurchaseID && this.SaleID) {
                throw new Error('Payment cannot be linked to both a purchase and sale simultaneously');
            }
        }
    }
});

// Define associations
Payment.belongsTo(Company, { foreignKey: 'CompID', onDelete: 'CASCADE' });
Payment.belongsTo(Account, { foreignKey: 'AcctID' });
Payment.belongsTo(Account, { foreignKey: 'AcctID' });
Payment.belongsTo(Purchase, { foreignKey: 'PurchaseID' });
Payment.belongsTo(Sale, { foreignKey: 'SaleID' });

module.exports = Payment;
