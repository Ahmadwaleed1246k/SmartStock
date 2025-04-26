const { Sale, sequelize } = require('../model');

const createSale = async (req, res) => {
  try {
    const { compid, customerid, totalamount, discount, paymentmethodid, PrdID, Quantity } = req.body;

    // Validate input
    if (!compid || !customerid || !totalamount || discount == null || !paymentmethodid || !PrdID || !Quantity) {
      return res.status(400).json({ message: 'All fields are required: compid, customerid, totalamount, discount, paymentmethodid, PrdID, Quantity' });
    }

    // Call the stored procedure
    await sequelize.query(
      `EXEC CreateSales 
        @compid = :compid, 
        @customerid = :customerid, 
        @totalamount = :totalamount, 
        @discount = :discount, 
        @paymentmethodid = :paymentmethodid, 
        @PrdID = :PrdID, 
        @Quantity = :Quantity`,
      {
        replacements: { compid, customerid, totalamount, discount, paymentmethodid, PrdID, Quantity }
      }
    );

    res.status(201).json({ message: 'Sale recorded successfully' });

  } catch (error) {
    console.error('❌ Error in createSale:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = {
  createSale
};
