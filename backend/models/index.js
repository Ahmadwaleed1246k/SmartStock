const sequelize = require('../config/database');
const Company = require('./Company');
const Purchase = require('./Purchase');
const PurchaseDetail = require('./PurchaseDetail');
const Sale = require('./Sale');
const SaleDetail = require('./SaleDetail');
const Product = require('./Product');
const Users = require('./Users');

const syncModels = async () => {
  try {
    await sequelize.sync();
    console.log('✅ Database models synced');
  } catch (error) {
    console.error('❌ Error syncing models:', error);
  }
};

module.exports = {
  sequelize,
  Company,
  Users,
  Purchase,
  PurchaseDetail,
  Sale,
  SaleDetail,
  Product,
  syncModels
};
