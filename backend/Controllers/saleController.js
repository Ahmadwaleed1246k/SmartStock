const { DECIMAL } = require('sequelize');
const { Sale, sequelize } = require('../model');

const createSale = async (req, res) => {
  try {
    const sales = req.body;
    if (!Array.isArray(sales)) {
      return res.status(400).json({ message: 'Request body must be an array of sales' });
    }

    if (sales.length === 0) {
      return res.status(400).json({ message: 'At least one sale is required' });
    }

    const compID = sales[0].compid;

    // Ensure LocalSale account exists
    const response = await fetch('http://localhost:5000/api/account/ensure-local-sale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ compID })
    });
    
    const localSaleAccount = await response.json();
    let TotalAmount = 0;
    // Generate VoucherNo
    const [voucherResult] = await sequelize.query('SELECT MAX(VoucherNo) AS MaxVoucherNo FROM Sales');
    const nextVoucherNo = (voucherResult[0].MaxVoucherNo || 0) + 1;
    console.log('nextVoucherNo', nextVoucherNo);
    for (const sale of sales) {
      const { compid, customerid, totalamount, salePrice, discount = 0, PrdID, Quantity, voucherDate } = sale;
      TotalAmount += sale.totalamount;
      // Create Sale
      await sequelize.query(
        'EXEC CreateSales @VoucherNo = :VoucherNo, @compid = :compid, @customerid = :customerid, ' +
        '@totalamount = :totalamount, @discount = :discount, @PrdID = :PrdID, @Quantity = :Quantity, ' +
        '@VoucherDate = :voucherDate',
        { 
          replacements: { 
            VoucherNo: nextVoucherNo, 
            compid, 
            customerid, 
            totalamount, 
            discount, 
            PrdID, 
            Quantity, 
            voucherDate 
          } 
        }
      );

      // Update Inventory (reduce stock)
      await sequelize.query(
        `INSERT INTO Inventory
          (VoucherNo, VoucherType, PrdID, QtyIn, QtyOut, AcctID, UnitRate, Discount, TotalAmount, CompID, EntryDate) 
         VALUES   
          (:VoucherNo, :VoucherType, :PrdID, 0, :QtyOut, :CustomerID, :UnitRate, :Discount, :TotalAmount, :CompID, :EntryDate)`,
        {
          replacements: {
            VoucherNo: nextVoucherNo,
            VoucherType: 'Sale',
            PrdID: PrdID,
            QtyOut: Quantity,
            CustomerID: customerid,
            UnitRate: salePrice,
            Discount: discount,
            TotalAmount: totalamount,
            CompID: compid,
            EntryDate: new Date().toISOString().slice(0, 19).replace('T', ' ')
          }
        }
      );

      
    }
    
    if (sales[0].isWalkIn) {
      // Debit Cash/Bank, Credit LocalSale
      try {
        await sequelize.query(
          `INSERT INTO AccountDetails (VoucherNo, VoucherType, AcctID, Debit, Credit, CompID)
          VALUES (:voucherNo, 'Sale', :debitAccount, :totalAmount, 0, :compID),
                  (:voucherNo, 'Sale', :creditAccount, 0, :totalAmount, :compID)`,
          {
            replacements: {
              voucherNo: nextVoucherNo,
              debitAccount: sales[0].paymentAccountId, //Cash/Bank
              creditAccount: localSaleAccount.AcctID,
              totalAmount: TotalAmount,
              compID: compID
            }
          }
        );
        } catch (error) {
          console.error('❌ Error in createSale:', error);
        }
      
    } else {
      // Debit Customer, Credit LocalSale
      await sequelize.query(
        `INSERT INTO AccountDetails (VoucherNo, VoucherType, AcctID, Debit, Credit, CompID)
         VALUES (:voucherNo, 'Sale', :debitAccount, :totalAmount, 0, :compID),
                (:voucherNo, 'Sale', :creditAccount, 0, :totalAmount, :compID)`,
        {
          replacements: {
            voucherNo: nextVoucherNo,
            debitAccount: sales[0].customerid,
            creditAccount: localSaleAccount.AcctID,
            totalAmount: TotalAmount,
            compID: compID
          }
        }
      );
    }

    res.status(201).json({ 
      message: `${sales.length} sales recorded successfully`, 
      VoucherNo: nextVoucherNo 
    });

  } catch (error) {
    console.error('❌ Error in createSale:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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
