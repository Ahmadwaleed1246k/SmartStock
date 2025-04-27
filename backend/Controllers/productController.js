const { Product, sequelize } = require('../model');

const addProduct = async (req, res) => {
  try {
    console.log('Incoming product request body:', req.body);

    const {
      PrdName,
      PrdCode,
      GroupID,
      CategoryID,
      PurchasePrice,
      SalePrice,
      RestockLevel,
      Description,
      CompID
    } = req.body;

    // Check for required fields
    if (
      !PrdName || !PrdCode || !GroupID || !CategoryID ||
      PurchasePrice == null || SalePrice == null ||
      RestockLevel == null || !CompID
    ) {
      return res.status(400).json({
        message: 'Missing required fields',
        receivedBody: req.body
      });
    }

    // Optional: basic validations
    if (PrdName.length < 3) {
      return res.status(400).json({ message: 'Product name must be at least 3 characters' });
    }

    if (PrdCode.length < 2) {
      return res.status(400).json({ message: 'Product code must be at least 2 characters' });
    }

    if (PurchasePrice < 0 || SalePrice < 0) {
      return res.status(400).json({ message: 'Prices must be non-negative numbers' });
    }

    if (RestockLevel < 0) {
      return res.status(400).json({ message: 'Restock level must be a non-negative integer' });
    }

    // Insert using stored procedure
    await sequelize.query(
      `EXEC InsertProduct 
        @prdname = :PrdName, 
        @prdcode = :PrdCode, 
        @groupid = :GroupID, 
        @categoryid = :CategoryID, 
        @purchaseprice = :PurchasePrice, 
        @saleprice = :SalePrice, 
        @restocklevel = :RestockLevel, 
        @description = :Description, 
        @compid = :CompID`,
      {
        replacements: {
          PrdName,
          PrdCode,
          GroupID,
          CategoryID,
          PurchasePrice,
          SalePrice,
          RestockLevel,
          Description: Description || '', // fallback to empty if null
          CompID
        },
        type: sequelize.QueryTypes.INSERT
      }
    );

    const [result] = await sequelize.query(
      'SELECT PrdID FROM Products WHERE PrdCode = :PrdCode and CompID = :CompID',
      {
        replacements: { PrdCode, CompID },
        type: sequelize.QueryTypes.SELECT
      }
    ) 
    res.status(201).json({ message: 'Product added successfully', result });

  } catch (error) {
    console.error('❌ Error adding product:', error);

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Product code must be unique' });
    }

    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

//const { sequelize } = require('../model');

const getProductsByCompany = async (req, res) => {
  try {
    const { compID } = req.body;
    
    if (!compID) {
      return res.status(400).json({ message: 'CompID is required' });
    }

    // Correct: Get the full result set without destructuring
    const result = await sequelize.query(
      'SELECT * FROM Products WHERE CompID = :compID',
      {
        replacements: { compID },
        type: sequelize.QueryTypes.SELECT
      }
    );

    res.status(200).json(result);

  } catch (error) {
    console.error('❌ Error in getProductsByCompany:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}


const getPurchasePriceByPrdID = async (req, res) => {
  try {
    const { PrdID } = req.body;

    if (!PrdID) {
      return res.status(400).json({ message: 'PrdID is required' });
    }

    console.log('Incoming request body:', PrdID);
    const [result] = await sequelize.query(
      'SELECT PurchasePrice FROM Products WHERE PrdID = :PrdID',
      {
        replacements: { PrdID },
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (!result) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ PurchasePrice: result.PurchasePrice });

  } catch (error) {
    console.error('❌ Error fetching purchase price:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const getSalePriceByPrdID = async (req, res) => {
  try {
    const { PrdID } = req.body;

    if (!PrdID) {
      return res.status(400).json({ message: 'PrdID is required' });
    }

    console.log('Incoming request body:', PrdID);
    const [result] = await sequelize.query(
      'SELECT SalePrice FROM Products WHERE PrdID = :PrdID',
      {
        replacements: { PrdID },
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (!result) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ SalePrice: result.SalePrice });

  } catch (error) {
    console.error('❌ Error fetching sale price:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};



const getStockByProduct = async (req, res) => {
  try {
    const { PrdID, CompID } = req.body;

    if (!PrdID || !CompID) {
      return res.status(400).json({ message: 'PrdID and CompID are required' });
    }

    // Execute raw query manually because the procedure only prints message
    const [result] = await sequelize.query(
      `
      SELECT 
        s.StockQuantity, 
        p.RestockLevel 
      FROM Products p 
      LEFT JOIN Stock s ON p.PrdID = s.PrdID 
      WHERE p.CompID = :CompID AND p.PrdID = :PrdID
      `,
      {
        replacements: { PrdID, CompID },
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (!result) {
      return res.status(404).json({ message: 'Product or stock data not found' });
    }

    const { StockQuantity, RestockLevel } = result;

    if (StockQuantity <= RestockLevel) {
      return res.status(200).json({
        message: 'You need to reorder',
        StockQuantity,
        RestockLevel
      });
    } else {
      return res.status(200).json({
        message: 'Stock level is sufficient',
        StockQuantity,
        RestockLevel
      });
    }

  } catch (error) {
    console.error('❌ Error in getStockByProduct:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

//const { sequelize } = require('../model');

const getProductLedger = async (req, res) => {
  try {
    const { PrdID, StartDate, EndDate } = req.body;

    if (!PrdID || !StartDate || !EndDate) {
      return res.status(400).json({ message: 'PrdID, StartDate, and EndDate are required' });
    }

    // Validate date format (optional, depending on your use case)
    if (isNaN(Date.parse(StartDate)) || isNaN(Date.parse(EndDate))) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const ledgerData = await sequelize.query(
      'EXEC GetProductLedger @prdid = :PrdID, @startdate = :StartDate, @enddate = :EndDate',
      {
        replacements: { PrdID, StartDate, EndDate },
        type: sequelize.QueryTypes.SELECT
      }
    );

    res.status(200).json(ledgerData);
  } catch (error) {
    console.error('❌ Error fetching product ledger:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const updateProduct = async (req, res) => {
    try {
      const { PrdID, PurchasePrice, RestockLevel, SalePrice, Description } = req.body;
  
      // Validate the required field (PrdID)
      if (!PrdID) {
        return res.status(400).json({ message: 'PrdID is required' });
      }
  
      // Optional: basic validations
      if (PurchasePrice !== undefined && isNaN(PurchasePrice)) {
        return res.status(400).json({ message: 'PurchasePrice must be a valid number' });
      }
      if (RestockLevel !== undefined && isNaN(RestockLevel)) {
        return res.status(400).json({ message: 'RestockLevel must be a valid integer' });
      }
      if (SalePrice !== undefined && isNaN(SalePrice)) {
        return res.status(400).json({ message: 'SalePrice must be a valid number' });
      }
  
      // Execute the stored procedure to update the product
      await sequelize.query(
        `EXEC UpdateProduct 
          @prdid = :PrdID, 
          @purchaseprice = :PurchasePrice, 
          @restocklevel = :RestockLevel, 
          @saleprice = :SalePrice, 
          @description = :Description`,
        {
          replacements: { 
            PrdID, 
            PurchasePrice, 
            RestockLevel, 
            SalePrice, 
            Description: Description || null // fallback to null if no description
          },
          type: sequelize.QueryTypes.RAW
        }
      );
  
      res.status(200).json({ message: `Product ID ${PrdID} updated successfully` });
  
    } catch (error) {
      console.error('❌ Error updating product:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  };

  
  const getStockByPrdID = async (req, res) => {
    try {
      const { PrdID } = req.body;
      console.log('Incoming request body:', PrdID);
      if (!PrdID) {
        return res.status(400).json({ message: 'PrdID is required' });
      }
  
      // Remove array destructuring to get all results
      const results = await sequelize.query(
        'SELECT StockQuantity FROM Stock WHERE PrdID = :PrdID',
        {
          replacements: { PrdID },
          type: sequelize.QueryTypes.SELECT
        }
      );
  
      console.log('Raw stock results:', results);
  
      if (!results || results.length === 0) {
        return res.status(404).json({ message: 'Product stock not found' });
      }
  
      // Return the first stock record found
      res.status(200).json({ 
        StockQuantity: results[0].StockQuantity 
      });
      
    } catch (error) {
      console.error('❌ Error fetching product stock:', error);
      res.status(500).json({ 
        message: 'Internal server error', 
        error: error.message 
      });
    }
  };
  
  // Add these new controller methods
const getCompleteStockReport = async (req, res) => {
  const { CompID } = req.body;

  const query = `EXEC GetTotalStockByCompany @CompID = :CompID`;
  
  try {
    const results = await sequelize.query(query, {
      replacements: { CompID: parseInt(CompID) },
      type: sequelize.QueryTypes.SELECT
    });
  
    const cleanedResults = results.map(row => ({
      PrdName: row.PrdName,
      TotalStock: Number(row.TotalStock) || 0
    }));
    
  
    res.json(cleanedResults);
  } catch (error) {
    console.error("Error executing stored procedure:", error);
    res.status(500).json({ error: "Failed to fetch total stock." });
  }
  
};

const getProductTransactionHistory = async (req, res) => {
  try {
    const { PrdID, CompID, StartDate, EndDate } = req.body;
    
    const [purchases] = await sequelize.query(
      `SELECT 
        'Purchase' AS Type,
        pur.PurchaseDate AS Date,
        pur.TotalAmount,
        pur.Quantity,
        a.AcctName AS Party,
        pm.PaymentMethod
       FROM Purchases pur
       JOIN Accounts a ON pur.SupplierID = a.AcctID
       JOIN PaymentMethods pm ON pur.PaymentMethodID = pm.PaymentID
       WHERE pur.PrdID = :PrdID 
         AND pur.CompID = :CompID
         AND pur.PurchaseDate BETWEEN :StartDate AND :EndDate`,
      { replacements: { PrdID, CompID, StartDate, EndDate } }
    );
    
    const [sales] = await sequelize.query(
      `SELECT 
        'Sale' AS Type,
        s.SaleDate AS Date,
        s.TotalAmount,
        s.Quantity,
        a.AcctName AS Party,
        pm.PaymentMethod
       FROM Sales s
       JOIN Accounts a ON s.CustomerID = a.AcctID
       JOIN PaymentMethods pm ON s.PaymentMethodID = pm.PaymentID
       WHERE s.PrdID = :PrdID 
         AND s.CompID = :CompID
         AND s.SaleDate BETWEEN :StartDate AND :EndDate`,
      { replacements: { PrdID, CompID, StartDate, EndDate } }
    );
    
    const result = [...purchases, ...sales].sort((a, b) => new Date(a.Date) - new Date(b.Date));
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Product history error:', error);
    res.status(500).json({ message: 'Error generating product history' });
  }
};

const deleteProduct = async (req, res) => {
  const { PrdID } = req.body;
  
  try {
    const result = await sequelize.query(
      `EXEC DeleteProductCompletely @PrdID = :PrdID`,
      { replacements: { PrdID } }
    );
    
    if (result[0]?.Deleted === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product' });
  }
};

const getProductsBySupplier = async (req, res) => {
  try {
    const { SupplierID, CompID } = req.body;

    if (!SupplierID || !CompID) {
      return res.status(400).json({ message: 'SupplierID and CompID are required' });
    }

    const products = await sequelize.query(
      `SELECT p.* 
       FROM Products p
       JOIN SupplierProducts sp ON p.PrdID = sp.PrdID
       WHERE sp.SupplierID = :SupplierID AND p.CompID = :CompID`,
      {
        replacements: { SupplierID, CompID },
        type: sequelize.QueryTypes.SELECT
      }
    );

    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products by supplier:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// In your productController.js
const getProductsWithSuppliers = async (req, res) => {
  try {
    const { compID } = req.body;

    if (!compID) {
      return res.status(400).json({ message: 'compID is required' });
    }

    const products = await sequelize.query(
      `SELECT p.*, 
       (SELECT STRING_AGG(a.AccName, ', ') 
        FROM SupplierProducts sp
        JOIN Accounts a ON sp.SupplierID = a.AccID
        WHERE sp.PrdID = p.PrdID) AS Suppliers
       FROM Products p
       WHERE p.CompID = :compID`,
      {
        replacements: { compID },
        type: sequelize.QueryTypes.SELECT
      }
    );

    res.status(200).json(products);
  } catch (error) {
    console.error('Error getting products with suppliers:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = {
    addProduct,
    getStockByProduct,
    getProductLedger,
    updateProduct,
    getProductsByCompany,
    getPurchasePriceByPrdID,
    getSalePriceByPrdID,
    getStockByPrdID,
    getCompleteStockReport,
    getProductTransactionHistory,
    deleteProduct,
    getProductsWithSuppliers,
    getProductsBySupplier
};