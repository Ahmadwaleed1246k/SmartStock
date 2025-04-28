const {Account, sequelize} = require('../model');

const getSuppliersByCompany = async (req, res) => {
    try {
        const { compID } = req.body;
        console.log('Incoming request body:', compID);
        if (!compID) {
            return res.status(400).json({ message: 'CompID is required' });
        }

        const suppliers = await sequelize.query(
            'SELECT * FROM Accounts WHERE CompID = :compID AND AcctType = \'Supplier\'',
            {
                replacements: { compID },
                type: sequelize.QueryTypes.SELECT
            }
        );

        res.status(200).json(suppliers);
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


const getSuppliersByCompany2 = async (req, res) => {
  try {
    console.log('Request received with body:', req.body);
    const { compID } = req.body;

    if (!compID) {
      return res.status(400).json({ 
        message: 'compID is required',
        receivedBody: req.body 
      });
    }

    console.log('Executing stored procedure with compID:', compID);
    const suppliers = await sequelize.query(
      `EXEC GetSupplierAccountsByCompany @CompanyID = :compID`,
      {
        replacements: { compID },
        type: sequelize.QueryTypes.SELECT
      }
    );

    console.log('Suppliers retrieved:', suppliers);
    if (!suppliers || suppliers.length === 0) {
      return res.status(404).json({ 
        message: 'No suppliers found for this company',
        compID: compID
      });
    }

    res.status(200).json(suppliers);

  } catch (error) {
    console.error('❌ Detailed error in getSuppliersByCompany:', {
      message: error.message,
      stack: error.stack,
      originalError: error
    });
    res.status(500).json({ 
      message: 'Failed to fetch suppliers',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

const getCustomersByCompany = async (req, res) => {
    try {
      const { compID } = req.body;
      const customers = await sequelize.query(
        `SELECT * FROM Accounts 
         WHERE CompID = :compID 
         AND (AcctType = 'Customer' OR AcctType = 'WalkIn')`,
        { replacements: { compID }, type: sequelize.QueryTypes.SELECT }
      );
      res.status(200).json(customers);
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const addSupplier = async (req, res) => {
  try {
    console.log('Incoming supplier request body:', req.body);

    const { AccountName, Address, Tel, Mob, Email, CompID } = req.body;

    // Basic required field check
    if (!AccountName || !CompID) {
      return res.status(400).json({
        message: 'AccountName and CompID are required fields',
        receivedBody: req.body
      });
    }

    // Optional validations based on table constraints
    if (Tel && Tel.length !== 10) {
      return res.status(400).json({ message: 'Telephone number must be exactly 10 digits' });
    }

    if (Mob && Mob.length !== 11) {
      return res.status(400).json({ message: 'Mobile number must be exactly 11 digits' });
    }

    if (Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // AcctType is hardcoded as 'Supplier'
    const AcctType = 'Supplier';

    await sequelize.query(
      'EXEC InsertAccount @AccountName = :AccountName, @AccountType = :AcctType, @Address = :Address, @Tel = :Tel, @Mob = :Mob, @Email = :Email, @CompID = :CompID',
      {
        replacements: { AccountName, AcctType, Address, Tel, Mob, Email, CompID },
        type: sequelize.QueryTypes.INSERT
      }
    );

    res.status(201).json({ message: 'Supplier added successfully' });

  } catch (error) {
    console.error('❌ Error adding supplier:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


const addCustomer = async (req, res) => {
  try {
    console.log('Incoming customer request body:', req.body);

    const { AccountName, Address, Tel, Mob, Email, CompID } = req.body;

    // Basic required field check
    if (!AccountName || !CompID) {
      return res.status(400).json({
        message: 'AccountName and CompID are required fields',
        receivedBody: req.body
      });
    }

    // Optional validations based on table constraints
    if (Tel && Tel.length !== 10) {
      return res.status(400).json({ message: 'Telephone number must be exactly 10 digits' });
    }

    if (Mob && Mob.length !== 11) {
      return res.status(400).json({ message: 'Mobile number must be exactly 11 digits' });
    }

    if (Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // AcctType is hardcoded as 'Supplier'
    const AcctType = 'Customer';

    await sequelize.query(
      'EXEC InsertAccount @AccountName = :AccountName, @AccountType = :AcctType, @Address = :Address, @Tel = :Tel, @Mob = :Mob, @Email = :Email, @CompID = :CompID',
      {
        replacements: { AccountName, AcctType, Address, Tel, Mob, Email, CompID },
        type: sequelize.QueryTypes.INSERT
      }
    );

    res.status(201).json({ message: 'Customer added successfully' });

  } catch (error) {
    console.error('❌ Error adding customer:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
  const editAccountInfo = async (req, res) => {
    try {
      const { AcctID, columnName, newValue } = req.body;
  
      if (!AcctID || !columnName || !newValue) {
        return res.status(400).json({
          message: 'AcctID, columnName, and newValue are required fields'
        });
      }
  
      const allowedColumns = ['AcctName', 'Address', 'Tel', 'Mob', 'Email'];
      if (!allowedColumns.includes(columnName)) {
        return res.status(400).json({ message: 'Invalid column name' });
      }
  
      await sequelize.query(
        `EXEC EditAccountInfo @acctid = :AcctID, @columnname = :columnName, @newvalue = :newValue`,
        {
          replacements: { AcctID, columnName, newValue },
          type: sequelize.QueryTypes.UPDATE
        }
      );
  
      res.status(200).json({ message: 'Account info updated successfully' });
  
    } catch (error) {
      console.error('❌ Error updating account info:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  };
  
  const getAccountTransactionHistory = async (req, res) => {
    try {
      const { AcctID, CompID, StartDate, EndDate } = req.body;
      
      // For suppliers
      const [purchases] = await sequelize.query(
        `SELECT 
          'Purchase' AS Type,
          pur.PurchaseDate AS Date,
          pur.TotalAmount,
          p.PrdName,
          p.PrdCode,
          pur.Quantity
         FROM Purchases pur
         JOIN Products p ON pur.PrdID = p.PrdID
         WHERE pur.SupplierID = :AcctID 
           AND pur.CompID = :CompID
           AND pur.PurchaseDate BETWEEN :StartDate AND :EndDate`,
        { replacements: { AcctID, CompID, StartDate, EndDate } }
      );
      
      // For customers
      const [sales] = await sequelize.query(
        `SELECT 
          'Sale' AS Type,
          s.SaleDate AS Date,
          s.TotalAmount,
          p.PrdName,
          p.PrdCode,
          s.Quantity
         FROM Sales s
         JOIN Products p ON s.PrdID = p.PrdID
         WHERE s.CustomerID = :AcctID 
           AND s.CompID = :CompID
           AND s.SaleDate BETWEEN :StartDate AND :EndDate`,
        { replacements: { AcctID, CompID, StartDate, EndDate } }
      );
      
      const result = [...purchases, ...sales].sort((a, b) => new Date(a.Date) - new Date(b.Date));
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Account history error:', error);
      res.status(500).json({ message: 'Error generating account history' });
    }
  };

  const getSuppliersByCompID = async (req, res) => {
    try {
      const { compID } = req.body;
  
      if (!compID) {
        return res.status(400).json({ message: 'compID is required' });
      }
  
      const result = await sequelize.query(
        `SELECT AcctID, AcctName FROM Accounts 
         WHERE CompID = :compID AND AcctType = 'Supplier'`,
        {
          replacements: { compID },
          type: sequelize.QueryTypes.SELECT
        }
      );
  
      res.status(200).json(result);
  
    } catch (error) {
      console.error('Error getting suppliers by CompID:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  };


  

  // In accountController.js
  const ensureLocalPurchaseAccount = async (req, res) => {
    try {
      const { compID } = req.body;
  
      const accounts = await sequelize.query(
        `SELECT * FROM Accounts WHERE CompID = :compID AND AcctType = 'LocalPurchase'`,
        {
          replacements: { compID },
          type: sequelize.QueryTypes.SELECT
        }
      );
  
      let acctID;
  
      if (accounts.length === 0) {
        const [insertResult] = await sequelize.query(
          `INSERT INTO Accounts (AcctName, AcctType, CompID)  
           OUTPUT INSERTED.AcctID
           VALUES ('Local Purchase', 'LocalPurchase', :compID)`,
          {
            replacements: { compID },
            type: sequelize.QueryTypes.INSERT
          }
        );
        acctID = insertResult.AcctID;
        console.log('LocalPurchase account created.');
      } else {
        acctID = accounts[0].AcctID;
      }
  
      res.status(200).json({ success: true, AcctID: acctID });
  
    } catch (error) {
      console.error('Error ensuring local purchase account:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  };
  
  const ensureLocalSaleAccount = async (req, res) => {
    try {
      const { compID } = req.body;
  
      const accounts = await sequelize.query(
        `SELECT * FROM Accounts WHERE CompID = :compID AND AcctType = 'LocalSale'`,
        {
          replacements: { compID },
          type: sequelize.QueryTypes.SELECT
        }
      );
  
      let acctID;
  
      if (accounts.length === 0) {
        const [insertResult] = await sequelize.query(
          `INSERT INTO Accounts (AcctName, AcctType, CompID)  
           OUTPUT INSERTED.AcctID
           VALUES ('Local Sale', 'LocalSale', :compID)`,
          {
            replacements: { compID },
            type: sequelize.QueryTypes.INSERT
          }
        );
        acctID = insertResult.AcctID;
        console.log('LocalSale account created.');
      } else {
        acctID = accounts[0].AcctID;
      }
  
      res.status(200).json({ success: true, AcctID: acctID });
  
    } catch (error) {
      console.error('Error ensuring local sale account:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  };


  // Add these methods to your existing accountController.js

const getPaymentAccounts = async (req, res) => {
  try {
    const { compID } = req.body;
    
    const [accounts] = await sequelize.query(
      `SELECT AcctID, AcctName, AcctType FROM Accounts 
       WHERE CompID = :compID AND (AcctType = 'Supplier' OR AcctType = 'Customer')`,
      { replacements: { compID } }
    );

    res.status(200).json(accounts);
  } catch (error) {
    console.error('Error fetching payment accounts:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const getOutstandingBalance = async (req, res) => {
  try {
    const { AcctID, compID } = req.body;
    
    console.log('Received request with:', { AcctID, compID });

    // Validate inputs
    if (!AcctID || !compID) {
      return res.status(400).json({ 
        success: false,
        message: 'Both AcctID and compID are required'
      });
    }

    // 1. First verify the account exists and is Supplier/Customer
    const accountResult = await sequelize.query(
      `SELECT AcctType FROM Accounts 
       WHERE AcctID = :AcctID AND CompID = :compID 
       AND (AcctType = 'Supplier' OR AcctType = 'Customer')`,
      {
        replacements: { AcctID, compID },
        type: sequelize.QueryTypes.SELECT
      }
    );

    console.log('Account query result:', accountResult);

    if (!accountResult || accountResult.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Account not found or not a Supplier/Customer'
      });
    }

    const accountType = accountResult[0].AcctType;
    console.log('Account type:', accountType);

    // 2. Calculate the outstanding balance
    let balanceQuery;
    if (accountType === 'Supplier') {
      balanceQuery = `
        SELECT 
          (SELECT COALESCE(SUM(TotalAmount), 0) FROM Purchases 
          WHERE SupplierID = :AcctID AND CompID = :compID) -
          (SELECT COALESCE(SUM(Amount), 0) FROM Payments 
          WHERE AcctID = :AcctID AND PaymentType = 'Paid' AND CompID = :compID)
        AS balance
      `;
    } else { // Customer
      balanceQuery = `
        SELECT 
          (SELECT COALESCE(SUM(TotalAmount), 0) FROM Sales 
          WHERE CustomerID = :AcctID AND CompID = :compID) -
          (SELECT COALESCE(SUM(Amount), 0) FROM Payments 
          WHERE AcctID = :AcctID AND PaymentType = 'Received' AND CompID = :compID)
        AS balance
      `;
    }

    const [balanceResult] = await sequelize.query(balanceQuery, {
      replacements: { AcctID, compID },
      type: sequelize.QueryTypes.SELECT
    });

    const balance = parseFloat(balanceResult?.balance) || 0;
    console.log('Calculated balance:', balance);

    return res.status(200).json({ 
      success: true,
      balance: balance
    });

  } catch (error) {
    console.error('Error calculating outstanding balance:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

const deleteSupplier = async (req, res) => {
  try {
    const { AcctID } = req.body;

    if (!AcctID) {
      return res.status(400).json({ message: 'Supplier ID is required' });
    }

    await sequelize.query(
      'EXEC DeleteSupplierCompletely @AcctID = :AcctID',
      {
        replacements: { AcctID },
        type: sequelize.QueryTypes.DELETE
      }
    );

    res.status(200).json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting supplier:', error);
    res.status(500).json({ 
      message: 'Failed to delete supplier',
      error: error.message
    });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const { AcctID } = req.body;
    console.log('Deleting customer with ID:', AcctID);
    if (!AcctID) {
      return res.status(400).json({ message: 'Customer ID is required' });
    }

   

    await sequelize.query(
      'EXEC DeleteCustomerCompletely @AcctID = :AcctID',
      {
        replacements: { AcctID },
        type: sequelize.QueryTypes.DELETE
      }
    );

    res.status(200).json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting customer:', error);
    res.status(500).json({ 
      message: 'Failed to delete customer',
      error: error.message
    });
  }
};

const getAllAccountsByCompany = async (req, res) => {
  try {
    const { compID } = req.body;

    if (!compID) {
      return res.status(400).json({ message: 'compID is required' });
    }

    const accounts = await sequelize.query(
      `SELECT 
        AcctID,
        AcctName,
        AcctType,
        Address,
        Tel,
        Mob,
        Email
       FROM Accounts
       WHERE CompID = :compID
       ORDER BY AcctType, AcctName`,
      {
        replacements: { compID },
        type: sequelize.QueryTypes.SELECT
      }
    );

    res.status(200).json(accounts);
  } catch (error) {
    console.error('❌ Error fetching accounts:', error);
    res.status(500).json({ 
      message: 'Failed to fetch accounts',
      error: error.message
    });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const { AcctID } = req.body;

    if (!AcctID) {
      return res.status(400).json({ message: 'Account ID is required' });
    }

    const [customer] = await sequelize.query(
      `SELECT 
        AcctID,
        AcctName,
        Address,
        Tel,
        Mob,
        Email
       FROM Accounts
       WHERE AcctID = :AcctID
       AND AcctType = 'Customer'`,
      {
        replacements: { AcctID },
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.status(200).json(customer);
  } catch (error) {
    console.error('❌ Error fetching customer:', error);
    res.status(500).json({ 
      message: 'Failed to fetch customer',
      error: error.message
    });
  }
};

const addCustomer2 = async (req, res) => {
  try {
      console.log('Session data:', req.session);
      console.log('Request body:', req.body);

      const { AccountName, Address, Tel, Mob, Email } = req.body;
      const CompID = req.session.CompID; // Get from session only

      // Validate required fields
      if (!AccountName) {
          return res.status(400).json({ 
              message: 'AccountName is required',
              receivedData: { body: req.body, session: req.session }
          });
      }

      if (!CompID) {
          return res.status(400).json({ 
              message: 'Company ID not found in session',
              sessionData: req.session
          });
      }

      // Validate phone numbers if provided
      if (Tel && Tel.length !== 10) {
          return res.status(400).json({ message: 'Telephone must be 10 digits' });
      }
      if (Mob && Mob.length !== 11) {
          return res.status(400).json({ message: 'Mobile must be 11 digits' });
      }
      if (Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Email)) {
          return res.status(400).json({ message: 'Invalid email format' });
      }

      // Execute stored procedure
      const [result] = await sequelize.query(
          'EXEC AddCustomer2 @AccountName = :AccountName, @Address = :Address, ' +
          '@Tel = :Tel, @Mob = :Mob, @Email = :Email, @CompID = :CompID',
          {
              replacements: {
                  AccountName,
                  Address: Address || null,
                  Tel: Tel || null,
                  Mob: Mob || null,
                  Email: Email || null,
                  CompID
              },
              type: sequelize.QueryTypes.INSERT
          }
      );

      res.status(201).json({ 
          message: 'Customer added successfully',
          customerId: result
      });

  } catch (error) {
      console.error('Error adding customer:', {
          message: error.message,
          stack: error.stack,
          original: error
      });
      res.status(500).json({ 
          message: 'Failed to add customer',
          error: error.message,
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
  }
};


// Ensure Cash and Bank accounts exist
const ensureCashBankAccounts = async (req, res) => {
  try {
    const { compID } = req.body;
    
    // Ensure Cash Account
    let [cash] = await sequelize.query(
      `IF NOT EXISTS (SELECT * FROM Accounts WHERE CompID = :compID AND AcctType = 'Cash')
       INSERT INTO Accounts (AcctName, AcctType, CompID) VALUES ('Cash', 'Cash', :compID)`,
      { replacements: { compID } }
    );

    // Ensure Bank Account
    let [bank] = await sequelize.query(
      `IF NOT EXISTS (SELECT * FROM Accounts WHERE CompID = :compID AND AcctType = 'Bank')
       INSERT INTO Accounts (AcctName, AcctType, CompID) VALUES ('Bank', 'Bank', :compID)`,
      { replacements: { compID } }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error ensuring cash/bank:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get Cash/Bank accounts
const getCashBankAccounts = async (req, res) => {
  try {
    const { compID } = req.body;
    const accounts = await sequelize.query(
      `SELECT AcctID, AcctName FROM Accounts 
       WHERE CompID = :compID AND AcctType IN ('Cash', 'Bank')`,
      { replacements: { compID }, type: sequelize.QueryTypes.SELECT }
    );
    res.status(200).json(accounts);
  } catch (error) {
    console.error('Error fetching cash/bank:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Ensure Walk-in Customer exists
const ensureWalkInCustomer = async (req, res) => {
  try {
    const { compID } = req.body;
    const [customer] = await sequelize.query(
      `IF NOT EXISTS (SELECT * FROM Accounts WHERE CompID = :compID AND AcctType = 'WalkIn')
       INSERT INTO Accounts (AcctName, AcctType, CompID) 
       VALUES ('Walk-in Customer', 'WalkIn', :compID)`,
      { replacements: { compID } }
    );
    res.status(200).json(customer);
  } catch (error) {
    console.error('Error ensuring walk-in customer:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

  
  module.exports = {
    addCustomer,
    addSupplier,
    editAccountInfo,
    getCustomersByCompany,
    getSuppliersByCompany,
    getAccountTransactionHistory,
    getSuppliersByCompID,
    ensureLocalPurchaseAccount,
    ensureLocalSaleAccount,
    getPaymentAccounts,
    getOutstandingBalance,
    deleteSupplier,
    deleteCustomer,
    getAllAccountsByCompany,
    getCustomerById,
    addCustomer2,
    getSuppliersByCompany2,
    ensureCashBankAccounts,
    getCashBankAccounts,
    ensureWalkInCustomer
  };
