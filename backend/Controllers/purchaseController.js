const { Purchase, sequelize } = require('../model');

const createPurchase = async (req, res) => {
  try {
    const { compid, supplierid, totalamount, paymentmethodid, PrdID, Quantity } = req.body;

    // Validate input
    if (!compid || !supplierid || !totalamount || !paymentmethodid || !PrdID || !Quantity) {
      return res.status(400).json({ message: 'All fields are required: compid, supplierid, totalamount, paymentmethodid, PrdID, Quantity' });
    }

    // Call the stored procedure
    await sequelize.query(
      'EXEC CreatePurchase @compid = :compid, @supplierid = :supplierid, @totalamount = :totalamount, @paymentmethodid = :paymentmethodid, @PrdID = :PrdID, @Quantity = :Quantity',
      {
        replacements: { compid, supplierid, totalamount, paymentmethodid, PrdID, Quantity }
      }
    );

    res.status(201).json({ message: 'Purchase created successfully' });

  } catch (error) {
    console.error('❌ Error in createPurchase:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = {
  createPurchase
};
