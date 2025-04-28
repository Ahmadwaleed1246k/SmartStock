const { Purchase, sequelize } = require('../model');
const { ensureLocalPurchaseAccount } = require('./accountController');
// In purchaseController.js
const createPurchase = async (req, res) => {
  try {
    const purchases = req.body;
    if (!Array.isArray(purchases) || purchases.length === 0) {
      return res.status(400).json({ message: 'An array of purchases is required.' });
    }

    const compID = purchases[0].compid;

    // Ensure LocalPurchase account exists
    const response = await fetch('http://localhost:5000/api/account/ensure-local-purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ compID })
    });
    
    const localPurchaseAccount = await response.json(); 

    // Generate VoucherNo
    const [voucherResult] = await sequelize.query('SELECT MAX(VoucherNo) AS MaxVoucherNo FROM Purchases');
    const nextVoucherNo = (voucherResult[0].MaxVoucherNo || 0) + 1;
    let totalAmount = 0;
    for (const purchase of purchases) {
      const { compid, supplierid, totalamount, PrdID, Quantity, purchasePrice, voucherDate } = purchase;
      totalAmount += totalamount;
      // Create Purchase
      await sequelize.query(
        'EXEC CreatePurchase @VoucherNo = :VoucherNo, @compid = :compid, @supplierid = :supplierid, @totalamount = :totalamount, @PrdID = :PrdID, @Quantity = :Quantity, @PurchaseDate = :voucherDate',
        { replacements: { VoucherNo: nextVoucherNo, compid, supplierid, totalamount, PrdID, Quantity, voucherDate } }
      );

      await sequelize.query(
        `INSERT INTO Inventory
          (VoucherNo, VoucherType, PrdID, QtyIn, QtyOut, AcctID, UnitRate, Discount, TotalAmount, CompID, EntryDate) 
         VALUES   
          (:VoucherNo, :VoucherType, :PrdID, :QtyIn, 0, :SupplierID, :UnitRate, 0, :TotalAmount, :CompID, :EntryDate)`,
        {
          replacements: {
            VoucherNo: nextVoucherNo,
            VoucherType: 'Purchase',
            PrdID: PrdID,
            QtyIn: Quantity,
            SupplierID: supplierid,
            UnitRate: purchasePrice,
            TotalAmount: totalamount,
            CompID: compid,
            EntryDate: new Date().toISOString().slice(0, 19).replace('T', ' ')

          }
        }
      );

      
    }

    await sequelize.query(
      'Insert into AccountDetails (VoucherNo, VoucherType, AcctID, Debit, Credit, CompID) VALUES (:VoucherNo, :VoucherType, :AcctID, :totalAmount, 0, :CompID), (:VoucherNo, :VoucherType, :selectedSupplier, 0, :totalAmount, :CompID)',
      {
        replacements: {
          VoucherNo: nextVoucherNo,
          VoucherType: 'Purchase',
          AcctID: localPurchaseAccount.AcctID,
          selectedSupplier: purchases[0].supplierid,
          totalAmount: totalAmount,
          CompID: compID
        }
      }
    );
      

    res.status(201).json({ message: 'Purchase created successfully', VoucherNo: nextVoucherNo });
  } catch (error) {
    console.error('Error creating purchase:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const getAllPurchases = async (req, res) => {
  try {
    const [results] = await sequelize.query('SELECT * FROM Purchases');
    res.status(200).json(results);
  } catch (error) {
    console.error('❌ Error fetching purchases:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// In purchaseController.js
const getNextVoucherNo = async (req, res) => {
  try {
    const { compID } = req.body;
    const [voucherResult] = await sequelize.query(
      'SELECT ISNULL(MAX(VoucherNo), 0) + 1 AS nextVoucherNo FROM Purchases WHERE CompID = :compID',
      { replacements: { compID } }
    );
    res.status(200).json({ nextVoucherNo: voucherResult[0].nextVoucherNo });
  } catch (error) {
    console.error('Error getting next voucher number:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = { createPurchase, getAllPurchases, getNextVoucherNo };
