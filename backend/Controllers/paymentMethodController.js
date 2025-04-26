const {PaymentMethod, sequelize } = require('../model');

const addPaymentMethod = async (req, res) => {
  try {
    const { PaymentMethod, AcctName, AcctType, TransactionID, CompID } = req.body;

    // Validate inputs
    if (!PaymentMethod || !AcctName || !AcctType || !TransactionID || !CompID) {
      return res.status(400).json({ message: 'All fields (PaymentMethod, AcctName, AcctType, TransactionID, CompID) are required.' });
    }

    const validMethods = ['Cash', 'Bank', 'CreditCard', 'Online'];
    if (!validMethods.includes(PaymentMethod)) {
      return res.status(400).json({ message: 'Invalid payment method. Must be one of Cash, Bank, CreditCard, Online' });
    }

    // Call stored procedure (you should update the stored procedure to accept CompID as a parameter)
    await sequelize.query(
      `INSERT INTO PaymentMethods (PaymentMethod, AcctName, AcctType, TransactionID, CompID)
       VALUES (:PaymentMethod, :AcctName, :AcctType, :TransactionID, :CompID)`,
      {
        replacements: { PaymentMethod, AcctName, AcctType, TransactionID, CompID }
      }
    );

    res.status(201).json({ message: 'Payment method added successfully' });

  } catch (error) {
    console.error('❌ Error in addPaymentMethod:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = {
    addPaymentMethod
};