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

    res.status(201).json({ message: 'Product added successfully' });

  } catch (error) {
    console.error('❌ Error adding product:', error);

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Product code must be unique' });
    }

    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const { sequelize } = require('../model');

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

const { sequelize } = require('../model');

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

module.exports = {
    addProduct,
    getStockByProduct,
    getProductLedger,
    updateProduct
};