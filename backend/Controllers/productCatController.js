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

module.exports = {
    addProductCategory
};