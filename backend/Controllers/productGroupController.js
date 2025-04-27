const { ProductGroup, sequelize } = require('../model');

const addProductGroup = async (req, res) => {
  try {
    const { GroupName, CompID } = req.body;

    if (!GroupName || !CompID) {
      return res.status(400).json({ message: 'GroupName and CompID are required fields' });
    }

    const [result] = await sequelize.query(
      'EXEC InsertProductGroup @GroupName = :GroupName, @CompID = :CompID',
      {
        replacements: { GroupName, CompID },
        type: sequelize.QueryTypes.INSERT
      }
    );

    res.status(201).json({ message: 'Product group added successfully' });

  } catch (error) {
    console.error('Error adding product group:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const getAllProductGroupsByCompID = async (req, res) => {
  try {
    const { CompID } = req.body;

    if (!CompID) {
      return res.status(400).json({ message: 'CompID is required' });
    }

    // Remove the array destructuring - this was causing only the first row to be returned
    const result = await sequelize.query(
      'SELECT * FROM ProductGroup WHERE CompID = :CompID',
      {
        replacements: { CompID },
        type: sequelize.QueryTypes.SELECT
      }
    );

    res.status(200).json(result);

  } catch (error) {
    console.error('Error getting all product groups by CompID:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const deleteProductGroup = async (req, res) => {
  try {
    const { GroupID } = req.body;

    if (!GroupID) {
      return res.status(400).json({ message: 'GroupID is required' });
    }

    await sequelize.query(
      'EXEC DeleteProductGroupCompletely @GroupID = :GroupID',
      {
        replacements: { GroupID },
        type: sequelize.QueryTypes.DELETE
      }
    );

    res.status(200).json({ message: 'Product group deleted successfully' });

  } catch (error) {
    console.error('Error deleting product group:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = {
  addProductGroup,
  getAllProductGroupsByCompID,
  deleteProductGroup
};