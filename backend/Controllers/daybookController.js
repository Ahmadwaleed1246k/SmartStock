const { sequelize } = require('../model');

const getDaybook = async (req, res) => {
  try {
    const { compID, startDate, endDate, filterType = 'all' } = req.body;

    if (!compID || !startDate || !endDate) {
      return res.status(400).json({ message: 'compID, startDate, and endDate are required' });
    }

    // Base query for account details (payments)
    let accountDetailsQuery = `
      SELECT 
        CONVERT(VARCHAR, ad.EntryDate, 23) AS date,
        ad.VoucherType AS type,
        ad.VoucherNo,
        a.AcctName AS accountName,
        ad.Debit,
        ad.Credit,
        CASE 
          WHEN ad.VoucherType = 'Payment' THEN 
            CASE 
              WHEN p.PaymentType = 'Paid' THEN 'Payment to ' + a.AcctName
              WHEN p.PaymentType = 'Received' THEN 'Payment from ' + a.AcctName
              ELSE p.Reference
            END
          ELSE ad.VoucherType + ' entry'
        END AS description
      FROM AccountDetails ad
      LEFT JOIN Accounts a ON ad.AcctID = a.AcctID
      LEFT JOIN Payments p ON ad.VoucherNo = p.VoucherNo AND ad.CompID = p.CompID
      WHERE ad.CompID = :compID 
        AND CAST(ad.EntryDate AS DATE) BETWEEN :startDate AND :endDate
    `;

    // Add filter for transaction type if needed
    if (filterType !== 'all') {
      accountDetailsQuery += ` AND ad.VoucherType = :filterType`;
    }

    // Purchase transactions
    let purchaseQuery = `
      SELECT 
        CONVERT(VARCHAR, p.PurchaseDate, 23) AS date,
        'Purchase' AS type,
        p.VoucherNo,
        a.AcctName AS accountName,
        pd.PurchasePrice * pd.Quantity AS Debit,
        0 AS Credit,
        'Purchase of ' + prd.PrdName AS description
      FROM Purchases p
      JOIN PurchaseDetails pd ON p.PurchaseID = pd.PurchaseID
      JOIN Accounts a ON p.SupplierID = a.AcctID
      JOIN Products prd ON pd.PrdID = prd.PrdID
      WHERE p.CompID = :compID
        AND CAST(p.PurchaseDate AS DATE) BETWEEN :startDate AND :endDate
    `;

    // Only include purchases if filter allows
    if (filterType !== 'all' && filterType !== 'purchase') {
      purchaseQuery = '';
    }

    // Sale transactions
    let saleQuery = `
      SELECT 
        CONVERT(VARCHAR, s.SaleDate, 23) AS date,
        'Sale' AS type,
        s.VoucherNo,
        a.AcctName AS accountName,
        0 AS Debit,
        sd.SalePrice * sd.Quantity AS Credit,
        'Sale of ' + prd.PrdName AS description
      FROM Sales s
      JOIN SaleDetails sd ON s.SaleID = sd.SaleID
      JOIN Accounts a ON s.CustomerID = a.AcctID
      JOIN Products prd ON sd.PrdID = prd.PrdID
      WHERE s.CompID = :compID
        AND CAST(s.SaleDate AS DATE) BETWEEN :startDate AND :endDate
    `;

    // Only include sales if filter allows
    if (filterType !== 'all' && filterType !== 'sale') {
      saleQuery = '';
    }

    // Combine all queries with UNION ALL
    let fullQuery = accountDetailsQuery;
    
    if (purchaseQuery) {
      fullQuery += ` UNION ALL ${purchaseQuery}`;
    }
    
    if (saleQuery) {
      fullQuery += ` UNION ALL ${saleQuery}`;
    }

    fullQuery += ` ORDER BY date, VoucherNo`;

    const replacements = { 
      compID, 
      startDate, 
      endDate,
      ...(filterType !== 'all' && { filterType })
    };

    const transactions = await sequelize.query(fullQuery, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    });

    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching daybook:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getDaybook
};
