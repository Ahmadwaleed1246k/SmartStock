const { SupplierProduct, sequelize } = require('../model');

const addSupplierProduct = async (req, res) => {
  try {
    const { SupplierID, PrdID, CompID } = req.body;  // Include CompID in the request body
    console.log('Incoming request body:', req.body);

    if (!SupplierID || !PrdID || !CompID) {  // Check if CompID is provided
      return res.status(400).json({ message: 'SupplierID, PrdID, and CompID are required fields' });
    }

    await sequelize.query(
      'INSERT INTO SupplierProducts (SupplierID, PrdID, CompID) VALUES (:SupplierID, :PrdID, :CompID)',  // Insert CompID as well
      {
        replacements: { SupplierID, PrdID, CompID },
        type: sequelize.QueryTypes.INSERT
      }
    );
    console.log('Supplier-Product relationship added successfully');

    res.status(201).json({ message: 'Supplier-Product relationship added successfully' });

  } catch (error) {
    console.error('Error adding supplier-product relationship:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
const getSuppliersByProduct = async (req, res) => {
  try {
    const { PrdID } = req.body;

    if (!PrdID) {
      return res.status(400).json({ message: 'PrdID is required' });
    }
    console.log('Incoming request body:', PrdID);
    const result = await sequelize.query(
      `SELECT a.AcctID, a.AcctName 
       FROM Accounts a
       JOIN SupplierProducts sp ON a.AcctID = sp.SupplierID
       WHERE sp.PrdID = :PrdID`,
      {
        replacements: { PrdID },
        type: sequelize.QueryTypes.SELECT
      }
    );

    res.status(200).json(result);

  } catch (error) {
    console.error('Error getting suppliers by product:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


// In your supplierProductController.js
const deleteAllSuppliersForProduct = async (req, res) => {
  try {
    const { PrdID } = req.body;

    if (!PrdID) {
      return res.status(400).json({ message: 'PrdID is required' });
    }

    await SupplierProduct.destroy({
      where: { PrdID }
    });

    res.status(200).json({ message: 'All supplier relationships deleted successfully' });
  } catch (error) {
    console.error('Error deleting supplier relationships:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const deleteSupplierProduct = async (req, res) => {
  try {
    const { SupplierID, PrdID, CompID } = req.body;  // Include CompID

    console.log('Incoming request body:', req.body);
    if (!SupplierID || !PrdID || !CompID) {
      return res.status(400).json({ message: 'SupplierID, PrdID, and CompID are required' });
    }

    await SupplierProduct.destroy({
      where: { SupplierID, PrdID, CompID }  // Filter by SupplierID, PrdID, and CompID
    });

    res.status(200).json({ message: 'Supplier-Product relationship deleted successfully' });

  } catch (error) {
    console.error('Error deleting supplier-product relationship:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = {
  addSupplierProduct,
  getSuppliersByProduct,
  deleteSupplierProduct,
  deleteAllSuppliersForProduct
};