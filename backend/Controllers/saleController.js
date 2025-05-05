const { DECIMAL } = require('sequelize');
const { Sale, sequelize } = require('../model');

const createSale = async (req, res) => {
  try {
    const sales = req.body;
    if (!Array.isArray(sales) || sales.length === 0) {
      return res.status(400).json({ message: 'An array of sales is required.' });
    }

    const compID = sales[0].compid;

    // Ensure LocalSale account exists
    const response = await fetch('http://localhost:5000/api/account/ensure-local-sale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ compID })
    });
    
    const localSaleAccount = await response.json();

    // Generate VoucherNo
    const [voucherResult] = await sequelize.query('SELECT MAX(VoucherNo) AS MaxVoucherNo FROM Sales');
    const nextVoucherNo = (voucherResult[0].MaxVoucherNo || 0) + 1;
    
    // Calculate total amount for all products
    const totalAmount = sales.reduce((sum, sale) => sum + sale.totalamount, 0);
    
    // Create single sale entry and get the inserted ID
    const [saleResult] = await sequelize.query(
      `INSERT INTO Sales (VoucherNo, CompID, CustomerID, TotalAmount, Discount, SaleDate) 
       OUTPUT INSERTED.SaleID
       VALUES (:VoucherNo, :compid, :customerid, :totalAmount, :discount, :voucherDate)`,
      {
        replacements: {
          VoucherNo: nextVoucherNo,
          compid: sales[0].compid,
          customerid: sales[0].customerid,
          totalAmount: totalAmount,
          discount: sales[0].discount || 0,
          voucherDate: sales[0].voucherDate
        }
      }
    );

    const saleID = saleResult[0].SaleID;

    // Aggregate quantities for same products
    const aggregatedSales = sales.reduce((acc, curr) => {
      const existingProduct = acc.find(p => p.PrdID === curr.PrdID);
      if (existingProduct) {
        existingProduct.Quantity += curr.Quantity;
        existingProduct.totalamount += curr.totalamount;
      } else {
        acc.push({ ...curr });
      }
      return acc;
    }, []);

    // Insert sale details and inventory entries for each unique product
    for (const sale of aggregatedSales) {
      const { PrdID, Quantity, salePrice, totalamount, compid, customerid, discount = 0 } = sale;
      
      // Insert sale details with the correct SaleID
      await sequelize.query(
        'INSERT INTO SaleDetails (SaleID, PrdID, Quantity, SalePrice) VALUES (:SaleID, :PrdID, :Quantity, :SalePrice)',
        {
          replacements: {
            SaleID: saleID,
            PrdID,
            Quantity,
            SalePrice: salePrice
          }
        }
      );

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
          'UPDATE Stock SET StockQuantity = StockQuantity - :Quantity, LastUpdated = GETDATE() WHERE CompID = :CompID AND PrdID = :PrdID',
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
          (VoucherNo, VoucherType, PrdID, QtyIn, QtyOut, UnitRate, Discount, TotalAmount, CompID, EntryDate, PurchaseID, SaleID) 
         VALUES   
          (:VoucherNo, :VoucherType, :PrdID, 0, :QtyOut, :UnitRate, :Discount, :TotalAmount, :CompID, :EntryDate, NULL, :SaleID)`,
        {
          replacements: {
            VoucherNo: nextVoucherNo,
            VoucherType: 'Sale',
            PrdID: PrdID,
            QtyOut: Quantity,
            UnitRate: salePrice,
            Discount: discount,
            TotalAmount: totalamount,
            CompID: compid,
            SaleID: saleID,
            EntryDate: new Date().toISOString().slice(0, 19).replace('T', ' ')
          }
        }
      );
    }

    // Insert account details based on sale type
    if (sales[0].isWalkIn) {
      await sequelize.query(
        'INSERT INTO AccountDetails (VoucherNo, VoucherType, AcctID, Debit, Credit, CompID, PurchaseID, SaleID) VALUES (:VoucherNo, :VoucherType, :debitAccount, :totalAmount, 0, :CompID, NULL, :SaleID), (:VoucherNo, :VoucherType, :creditAccount, 0, :totalAmount, :CompID, NULL, :SaleID)',
        {
          replacements: {
            VoucherNo: nextVoucherNo,
            VoucherType: 'Sale',
            debitAccount: sales[0].paymentAccountId,
            creditAccount: localSaleAccount.AcctID,
            totalAmount: totalAmount,
            CompID: compID,
            SaleID: saleID
          }
        }
      );
    } else {
      await sequelize.query(
        'INSERT INTO AccountDetails (VoucherNo, VoucherType, AcctID, Debit, Credit, CompID, PurchaseID, SaleID) VALUES (:VoucherNo, :VoucherType, :debitAccount, :totalAmount, 0, :CompID, NULL, :SaleID), (:VoucherNo, :VoucherType, :creditAccount, 0, :totalAmount, :CompID, NULL, :SaleID)',
        {
          replacements: {
            VoucherNo: nextVoucherNo,
            VoucherType: 'Sale',
            debitAccount: sales[0].customerid,
            creditAccount: localSaleAccount.AcctID,
            totalAmount: totalAmount,
            CompID: compID,
            SaleID: saleID
          }
        }
      );
    }

    res.status(201).json({ 
      message: 'Sale created successfully', 
      VoucherNo: nextVoucherNo,
      SaleID: saleID 
    });
  } catch (error) {
    console.error('Error creating sale:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
const getNextVoucherNo = async (req, res) => {
  try {
    const [voucherResult] = await sequelize.query('SELECT ISNULL(MAX(VoucherNo), 0) AS MaxVoucherNo FROM Sales');
    const nextVoucherNo = voucherResult[0].MaxVoucherNo + 1;
    console.log('Next Voucher No:', nextVoucherNo);
    res.status(200).json({ VoucherNo: nextVoucherNo });
  } catch (error) {
    console.error('❌ Error in getNextVoucherNo:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

module.exports = {
  createSale,
  getNextVoucherNo
};
