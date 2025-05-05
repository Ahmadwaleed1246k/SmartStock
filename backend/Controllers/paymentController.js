const { sequelize } = require('../model');

const createPayment = async (req, res) => {
  try {
    const {
      compID,
      AcctID,
      PaymentType,
      Amount,
      PaymentMethodID,
      VoucherNo,
      Reference,
      TransactionReference,
      VoucherDate
    } = req.body;

    if (!compID || !AcctID || !PaymentType || !Amount || !PaymentMethodID) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get account type
    const [account] = await sequelize.query(
      'SELECT AcctType FROM Accounts WHERE AcctID = :AcctID AND CompID = :compID',
      { replacements: { AcctID, compID } }
    );

    if (!account || account.length === 0) {
      return res.status(404).json({ message: 'Account not found' });
    }

    const accountType = account[0].AcctType;

    // Determine the correct accounting entries based on payment type and account type
    let debitAccountID, creditAccountID;
    let voucherType = 'Payment';

    // Corrected payment accounting logic
    if (PaymentType === 'Received') {
        // Receiving payment from customer
        if (accountType === 'Customer') {
        debitAccountID = PaymentMethodID; // Cash/Bank account
        creditAccountID = AcctID; // Customer account
        voucherType = 'Received';
        } else {
        return res.status(400).json({ message: 'Can only receive payments from Customers' });
        }
    } else {
        // Making payment to supplier
        if (accountType === 'Supplier') {
        debitAccountID = AcctID; // Supplier account
        creditAccountID = PaymentMethodID; // Cash/Bank account
        voucherType = 'Paid';
        } else {
        return res.status(400).json({ message: 'Can only make payments to Suppliers' });
        }
    }

    // Start transaction
    await sequelize.transaction(async (t) => {
      // Create payment record
      await sequelize.query(
        `INSERT INTO Payments (
          CompID, AcctID, PaymentType, Amount, CashBankAcctID, 
          VoucherNo, Reference, TransactionReference, PaymentDate
        ) VALUES (
          :compID, :AcctID, :PaymentType, :Amount, :PaymentMethodID, 
          :VoucherNo, :Reference, :TransactionReference, :VoucherDate
        )`,
        {
          replacements: {
            compID,
            AcctID,
            PaymentType,
            Amount,
            PaymentMethodID,
            VoucherNo,
            Reference,
            TransactionReference,
            VoucherDate
          },
          transaction: t
        }
      );

      // Create accounting entries
      await sequelize.query(
        `INSERT INTO AccountDetails (
          VoucherNo, VoucherType, AcctID, Debit, Credit, CompID, EntryDate
        ) VALUES (
          :VoucherNo, :VoucherType, :debitAccountID, :Amount, 0, :compID, GETDATE()
        )`,
        {
          replacements: { VoucherNo, VoucherType: voucherType, debitAccountID, Amount, compID },
          transaction: t
        }
      );

      await sequelize.query(
        `INSERT INTO AccountDetails (
          VoucherNo, VoucherType, AcctID, Debit, Credit, CompID, EntryDate
        ) VALUES (
          :VoucherNo, :VoucherType, :creditAccountID, 0, :Amount, :compID, GETDATE()
        )`,
        {
          replacements: { VoucherNo, VoucherType: voucherType, creditAccountID, Amount, compID },
          transaction: t
        }
      );
    });

    res.status(201).json({ 
      message: 'Payment recorded successfully',
      VoucherNo
    });

  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message
    });
  }
};



const getNextVoucherNo = async (req, res) => {
  try {
    const { compID } = req.body;
    const [voucherResult] = await sequelize.query(
      'SELECT ISNULL(MAX(VoucherNo), 0) + 1 AS nextVoucherNo FROM Payments WHERE CompID = :compID',
      { replacements: { compID } }
    );
    res.status(200).json({ nextVoucherNo: voucherResult[0].nextVoucherNo });
  } catch (error) {
    console.error('Error getting next voucher number:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const getPaymentDueNotifications = async (req, res) => {
  try {
    const { CompID } = req.body;
    
    // Get transactions that are more than 7 days old and not fully paid
    const results = await sequelize.query(`
      -- Overdue payments to suppliers (purchases)
     SELECT 
    'Purchase' AS Type,
    a.AcctName AS AccountName,
    p.PurchaseDate AS TransactionDate,
    p.TotalAmount,
    DATEDIFF(day, p.PurchaseDate, GETDATE()) AS DaysOverdue,
    p.VoucherNo
FROM Purchases p
JOIN Accounts a ON p.SupplierID = a.AcctID
WHERE p.CompID = :CompID
    AND DATEDIFF(day, p.PurchaseDate, GETDATE()) > 7
    AND p.TotalAmount > (
        SELECT ISNULL(SUM(ad.Debit - ad.Credit), 0)
        FROM AccountDetails ad
        WHERE ad.AcctID = p.SupplierID
            AND ad.VoucherType = 'Payment'
            AND ad.CompID = :CompID
            AND ad.EntryDate >= p.PurchaseDate
    )

UNION ALL

-- Overdue Sales
SELECT 
    'Sale' AS Type,
    a.AcctName AS AccountName,
    s.SaleDate AS TransactionDate,
    s.TotalAmount,
    DATEDIFF(day, s.SaleDate, GETDATE()) AS DaysOverdue,
    s.VoucherNo
FROM Sales s
JOIN Accounts a ON s.CustomerID = a.AcctID
WHERE s.CompID = :CompID
    AND DATEDIFF(day, s.SaleDate, GETDATE()) > 7
    AND s.TotalAmount > (
        SELECT ISNULL(SUM(ad.Credit - ad.Debit), 0)
        FROM AccountDetails ad
        WHERE ad.AcctID = s.CustomerID
            AND ad.VoucherType = 'Payment'
            AND ad.CompID = :CompID
            AND ad.EntryDate >= s.SaleDate
    )
ORDER BY DaysOverdue DESC;

    `, {
      replacements: { CompID },
      type: sequelize.QueryTypes.SELECT
    });
    const notifications = Array.isArray(results) ? results : [];
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching payment due notifications:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message
    });
  }
};
module.exports = {
  createPayment,
  getNextVoucherNo,
  getPaymentDueNotifications
};
