const {Account, sequelize} = require('../model');
const { editCompanyInfo } = require('./companyController');

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

  const getSuppliersByCompany = async (req, res) => {
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

const addSuppliers = async (req, res) => {
  try {
    console.log('Session:', req.session); // Debug session
    console.log('Request body:', req.body);

    const { AccountName, Address, Tel, Mob, Email } = req.body;
    const CompID = req.session.CompID || req.body.CompID; // Try both session and body

    if (!AccountName) {
      return res.status(400).json({ 
        message: 'AccountName is required',
        receivedData: { body: req.body, session: req.session }
      });
    }

    if (!CompID) {
      return res.status(400).json({ 
        message: 'Company ID is required (either from session or request body)',
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

    // Validate email if provided
    if (Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const [result] = await sequelize.query(
      `INSERT INTO Accounts 
       (AcctName, Address, Tel, Mob, Email, CompID, AcctType) 
       VALUES (:AccountName, :Address, :Tel, :Mob, :Email, :CompID, 'Supplier')`,
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
      message: 'Supplier added successfully',
      supplierId: result
    });

  } catch (error) {
    console.error('❌ Error adding supplier:', {
      message: error.message,
      stack: error.stack,
      original: error
    });
    res.status(500).json({ 
      message: 'Failed to add supplier',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
      'DELETE FROM Accounts WHERE AcctID = :AcctID AND AcctType = :AcctType',
      {
        replacements: { AcctID, AcctType: 'Supplier' },
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


const getCustomersByCompany = async (req, res) => {
  try {
    console.log('Request received with body:', req.body);
    const { compID } = req.body;

    if (!compID) {
      return res.status(400).json({ 
        message: 'compID is required',
        receivedBody: req.body 
      });
    }

    console.log('Executing query with compID:', compID);
    const customers = await sequelize.query(
      `SELECT 
        AcctID,
        AcctName,
        Address,
        Tel,
        Mob,
        Email
       FROM Accounts
       WHERE CompID = :compID 
       AND AcctType = 'Customer'
       ORDER BY AcctName`,
      {
        replacements: { compID },
        type: sequelize.QueryTypes.SELECT
      }
    );

    console.log('Customers retrieved:', customers);
    if (!customers || customers.length === 0) {
      return res.status(404).json({ 
        message: 'No customers found for this company',
        compID: compID
      });
    }

    res.status(200).json(customers);

  } catch (error) {
    console.error('❌ Detailed error in getCustomersByCompany:', {
      message: error.message,
      stack: error.stack,
      originalError: error
    });
    res.status(500).json({ 
      message: 'Failed to fetch customers',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};


const deleteCustomer = async (req, res) => {
  try {
    const { AcctID } = req.body;

    if (!AcctID) {
      return res.status(400).json({ message: 'Customer ID is required' });
    }

    await sequelize.query(
      'DELETE FROM Accounts WHERE AcctID = :AcctID AND AcctType = :AcctType',
      {
        replacements: { AcctID, AcctType: 'Customer' },
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







  

  module.exports = {
    addCustomer,
    addSupplier,
    editAccountInfo,
    getSuppliersByCompany,
    addSuppliers,
    deleteSupplier,
    getCustomersByCompany,
    deleteCustomer,
    getAllAccountsByCompany,
    getCustomerById,
    addCustomer2
    
  };