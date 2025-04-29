const { Purchases, Sales, Accounts, Products, PurchaseDetails, SaleDetails, sequelize } = require('../model');
const { Op } = require('sequelize');

const getDaybook = async (req, res) => {
  try {
    const { CompID, StartDate, EndDate } = req.query;

    // Validate input
    if (!CompID || !StartDate || !EndDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters'
      });
    }

    // Process dates
    const startDate = new Date(StartDate);
    const endDate = new Date(EndDate);
    endDate.setHours(23, 59, 59, 999);

    // Alternative approach using raw query with proper parameter binding
    const purchasesQuery = `
      SELECT 
        'Purchase' AS TransactionType,
        p.PurchaseDate AS TransactionDate,
        p.PurchaseID AS TransactionID,
        a.AccountName AS Account,
        pr.ProductName AS ProductName,
        pd.Quantity,
        pd.PurchasePrice AS Price,
        p.TotalAmount
      FROM Purchases p
      JOIN Accounts a ON p.SupplierID = a.AccountID
      JOIN PurchaseDetails pd ON p.PurchaseID = pd.PurchaseID
      JOIN Products pr ON pd.PrdID = pr.PrdID
      WHERE p.CompID = @compID
        AND p.PurchaseDate BETWEEN @startDate AND @endDate
    `;

    const salesQuery = `
      SELECT 
        'Sale' AS TransactionType,
        s.SaleDate AS TransactionDate,
        s.SaleID AS TransactionID,
        a.AccountName AS Account,
        pr.ProductName AS ProductName,
        sd.Quantity,
        sd.SalePrice AS Price,
        s.TotalAmount
      FROM Sales s
      JOIN Accounts a ON s.CustomerID = a.AccountID
      JOIN SaleDetails sd ON s.SaleID = sd.SaleID
      JOIN Products pr ON sd.PrdID = pr.PrdID
      WHERE s.CompID = @compID
        AND s.SaleDate BETWEEN @startDate AND @endDate
    `;

    // Execute queries
    const [purchases] = await sequelize.query(purchasesQuery, {
      replacements: { 
        compID: CompID,
        startDate: startDate,
        endDate: endDate 
      },
      type: sequelize.QueryTypes.SELECT
    });

    const [sales] = await sequelize.query(salesQuery, {
      replacements: { 
        compID: CompID,
        startDate: startDate,
        endDate: endDate 
      },
      type: sequelize.QueryTypes.SELECT
    });

    // Combine and sort results
    const transactions = [...purchases, ...sales]
      .sort((a, b) => new Date(a.TransactionDate) - new Date(b.TransactionDate));

    // Calculate totals
    const totals = {
      purchaseTotal: purchases.reduce((sum, t) => sum + parseFloat(t.TotalAmount), 0),
      saleTotal: sales.reduce((sum, t) => sum + parseFloat(t.TotalAmount), 0),
      netTotal: purchases.reduce((sum, t) => sum + parseFloat(t.TotalAmount), 0) - 
               sales.reduce((sum, t) => sum + parseFloat(t.TotalAmount), 0)
    };

    res.status(200).json({
      success: true,
      data: transactions,
      totals,
      counts: {
        purchases: purchases.length,
        sales: sales.length,
        total: transactions.length
      }
    });

  } catch (error) {
    console.error('Daybook error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating daybook',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = { getDaybook };