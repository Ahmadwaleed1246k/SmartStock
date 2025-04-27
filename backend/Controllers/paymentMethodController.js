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

const getPaymentMethodsByCompID = async (req, res) => {
  try {
    const { compID } = req.body;

    if (!compID) {
      return res.status(400).json({ message: 'Company ID is required' });
    }

    const paymentMethods = await sequelize.query(
      `SELECT PaymentID, PaymentMethod FROM PaymentMethods WHERE CompID = :compID`,
      {
        replacements: { compID },
        type: sequelize.QueryTypes.SELECT
      }
    );

    res.status(200).json({ paymentMethods });

  } catch (error) {
    console.error('❌ Error in getPaymentMethodsByCompID:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Add this method to your existing paymentMethodController.js

const getPaymentMethodsByCompany = async (req, res) => {
  try {
    const { compID } = req.body;

    if (!compID) {
      return res.status(400).json({ message: 'Company ID is required' });
    }

    const paymentMethods = await sequelize.query(
      `SELECT PaymentID, PaymentMethod FROM PaymentMethods WHERE CompID = :compID`,
      { replacements: { compID } }
    );

    res.status(200).json(paymentMethods[0]);

  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


module.exports = {
    addPaymentMethod,
    getPaymentMethodsByCompID,
    getPaymentMethodsByCompany
};