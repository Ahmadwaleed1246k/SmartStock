const { ProductCategory, sequelize } = require('../model');

const addProductCategory = async (req, res) => {
  try {
    console.log('Incoming product category request body:', req.body);

    const { CategoryName, GroupID, CompID } = req.body;

    // Validate required fields
    if (!CategoryName || !GroupID || !CompID) {
      return res.status(400).json({
        message: 'CategoryName, GroupID, and CompID are required fields',
        receivedBody: req.body
      });
    }

    // Optional: Check CategoryName length
    if (CategoryName.length < 3) {
      return res.status(400).json({ message: 'Category name must be at least 3 characters long' });
    }

    // Use stored procedure to insert product category
    await sequelize.query(
      'EXEC InsertProductCategory @CategoryName = :CategoryName, @GroupID = :GroupID, @CompID = :CompID',
      {
        replacements: { CategoryName, GroupID, CompID },
        type: sequelize.QueryTypes.INSERT
      }
    );

    res.status(201).json({ message: 'Product category added successfully' });

  } catch (error) {
    console.error('❌ Error adding product category:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Category name must be unique' });
    }

    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const getProductCategoriesByGroupID = async (req, res) => {
  try {
    const { GroupID, CompID } = req.body;

    if (!GroupID || !CompID) {
      return res.status(400).json({ message: 'GroupID and CompID are required' });
    }

    const result = await sequelize.query(
      'SELECT * FROM ProductCategory WHERE GroupID = :GroupID AND CompID = :CompID',
      {
        replacements: { GroupID, CompID },
        type: sequelize.QueryTypes.SELECT
      }
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Error getting product categories by GroupID:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


const getProductCategoriesByCompID = async (req, res) => {
  try {
    const { compID } = req.body;

    if (!compID) {
      return res.status(400).json({ message: 'CompID is required' });
    }

    const result = await sequelize.query(
      'SELECT * FROM ProductCategory WHERE CompID = :compID',
      {
        replacements: { compID },
        type: sequelize.QueryTypes.SELECT
      }
    );

    res.status(200).json(result);

  } catch (error) {
    console.error('❌ Error getting product categories by CompID:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


// In your productCatController.js
const deleteProductCategory = async (req, res) => {
  try {
    const { CategoryID } = req.body;
    
    await sequelize.query(
      'EXEC DeleteProductCategoryCompletely @CategoryID = :CategoryID',
      {
        replacements: { CategoryID },
        type: sequelize.QueryTypes.DELETE
      }
    );
    console.log('Category deleted successfully');
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Failed to delete category', error: error.message });
  }
};

// Add to your exports
module.exports = {
  addProductCategory,
  getProductCategoriesByCompID,
  deleteProductCategory,
  getProductCategoriesByGroupID
};
