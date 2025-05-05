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
    
    // Calculate total amount for all products
    const totalAmount = purchases.reduce((sum, purchase) => sum + purchase.totalamount, 0);
    
    // Create single purchase entry and get the inserted ID
    const [purchaseResult] = await sequelize.query(
      `INSERT INTO Purchases (VoucherNo, CompID, SupplierID, TotalAmount, PurchaseDate) 
       OUTPUT INSERTED.PurchaseID
       VALUES (:VoucherNo, :compid, :supplierid, :totalAmount, :voucherDate)`,
      {
        replacements: {
          VoucherNo: nextVoucherNo,
          compid: purchases[0].compid,
          supplierid: purchases[0].supplierid,
          totalAmount: totalAmount,
          voucherDate: purchases[0].voucherDate
        }
      }
    );

    const purchaseID = purchaseResult[0].PurchaseID;

    // Aggregate quantities for same products
    const aggregatedPurchases = purchases.reduce((acc, curr) => {
      const existingProduct = acc.find(p => p.PrdID === curr.PrdID);
      if (existingProduct) {
        existingProduct.Quantity += curr.Quantity;
        existingProduct.totalamount += curr.totalamount;
      } else {
        acc.push({ ...curr });
      }
      return acc;
    }, []);

    // Insert purchase details and inventory entries for each unique product
    for (const purchase of aggregatedPurchases) {
      const { PrdID, Quantity, purchasePrice, totalamount, compid, supplierid } = purchase;
      
      // Insert purchase details with the correct PurchaseID
      await sequelize.query(
        'INSERT INTO PurchaseDetails (PurchaseID, PrdID, Quantity, PurchasePrice) VALUES (:PurchaseID, :PrdID, :Quantity, :PurchasePrice)',
        {
          replacements: {
            PurchaseID: purchaseID,
            PrdID,
            Quantity,
            PurchasePrice: purchasePrice
          }
        }
      );

      // Check if stock exists for this product
      const [stockResult] = await sequelize.query(
        'SELECT StockQuantity FROM Stock WHERE CompID = :CompID AND PrdID = :PrdID',
        {
          replacements: {
            CompID: compid,
            PrdID: PrdID
          }
        }
      );

      if (stockResult.length > 0) {
        // Update existing stock
        await sequelize.query(
          'UPDATE Stock SET StockQuantity = StockQuantity + :Quantity, LastUpdated = GETDATE() WHERE CompID = :CompID AND PrdID = :PrdID',
          {
            replacements: {
              CompID: compid,
              PrdID: PrdID,
              Quantity: Quantity
            }
          }
        );
      } else {
        // Insert new stock record
        await sequelize.query(
          'INSERT INTO Stock (CompID, PrdID, StockQuantity, LastUpdated) VALUES (:CompID, :PrdID, :Quantity, GETDATE())',
          {
            replacements: {
              CompID: compid,
              PrdID: PrdID,
              Quantity: Quantity
            }
          }
        );
      }

      // Insert inventory entry
      await sequelize.query(
        `INSERT INTO Inventory
          (VoucherNo, VoucherType, PrdID, QtyIn, QtyOut, UnitRate, Discount, TotalAmount, EntryDate, CompID, PurchaseID, SaleID) 
         VALUES   
          (:VoucherNo, :VoucherType, :PrdID, :QtyIn, :QtyOut, :UnitRate, :Discount, :TotalAmount, GETDATE(), :CompID, :PurchaseID, NULL)`,
        {
          replacements: {
            VoucherNo: nextVoucherNo,
            VoucherType: 'Purchase',
            PrdID: PrdID,
            QtyIn: Quantity,
            QtyOut: 0,
            UnitRate: purchasePrice,
            Discount: 0,
            TotalAmount: totalamount,
            PurchaseID: purchaseID,
            CompID: compID
          }
        }
      );
    }

    // Insert account details
    await sequelize.query(
      'Insert into AccountDetails (VoucherNo, VoucherType, AcctID, Debit, Credit, CompID, PurchaseID, SaleID) VALUES (:VoucherNo, :VoucherType, :AcctID, :totalAmount, 0, :CompID, :PurchaseID, NULL), (:VoucherNo, :VoucherType, :selectedSupplier, 0, :totalAmount, :CompID, :PurchaseID, NULL)',
      {
        replacements: {
          VoucherNo: nextVoucherNo,
          VoucherType: 'Purchase',
          AcctID: localPurchaseAccount.AcctID,
          selectedSupplier: purchases[0].supplierid,
          totalAmount: totalAmount,
          CompID: compID,
          PurchaseID: purchaseID
        }
      }
    );

    res.status(201).json({ 
      message: 'Purchase created successfully', 
      VoucherNo: nextVoucherNo,
      PurchaseID: purchaseID 
    });
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
