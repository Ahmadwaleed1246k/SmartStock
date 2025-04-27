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

    if (PaymentType === 'Received') {
      // Receiving payment from customer
      if (accountType === 'Customer') {
        debitAccountID = await getLocalSaleAccountID(compID);
        creditAccountID = AcctID;
        voucherType = 'PaymentReceived';
      } else {
        return res.status(400).json({ message: 'Can only receive payments from Customers' });
      }
    } else {
      // Making payment to supplier
      if (accountType === 'Supplier') {
        debitAccountID = AcctID;
        creditAccountID = await getLocalPurchaseAccountID(compID);
        voucherType = 'PaymentMade';
      } else {
        return res.status(400).json({ message: 'Can only make payments to Suppliers' });
      }
    }

    // Start transaction
    await sequelize.transaction(async (t) => {
      // Create payment record
      await sequelize.query(
        `INSERT INTO Payments (
          CompID, AcctID, PaymentType, Amount, PaymentMethodID, 
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

// Helper functions
async function getLocalSaleAccountID(compID) {
  const [account] = await sequelize.query(
    `SELECT AcctID FROM Accounts 
     WHERE CompID = :compID AND AcctType = 'LocalSale'`,
    { replacements: { compID } }
  );
  return account[0]?.AcctID;
}

async function getLocalPurchaseAccountID(compID) {
  const [account] = await sequelize.query(
    `SELECT AcctID FROM Accounts 
     WHERE CompID = :compID AND AcctType = 'LocalPurchase'`,
    { replacements: { compID } }
  );
  return account[0]?.AcctID;
}

module.exports = {
  createPayment,
  getNextVoucherNo
};