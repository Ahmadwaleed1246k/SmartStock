const { Company, sequelize } = require('../model');

const addCompany = async (req, res) => {
  try {
    const { Name, Address, Tel, Mob } = req.body;

    if (!Name || !Tel || !Mob) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate phone numbers match frontend patterns
    if (!Tel.match(/^\d{10}$/)) {
      return res.status(400).json({ message: 'Tel must be 10 numbers' });
    }

    if (!Mob.match(/^\d{11}$/)) {
      return res.status(400).json({ message: 'Mob must be 11 numbers' }); 
    }

    const [result] = await sequelize.query('EXEC sp_InsertCompany @Name=:Name, @Address=:Address, @Tel=:Tel, @Mob=:Mob;', {
      replacements: { 
        Name, 
        Address, 
        Tel, 
        Mob
      },
      type: sequelize.QueryTypes.RAW
    });

    res.status(201).json({
      CompID: result[0].CompID
    });

  } catch (error) {
    console.error('❌ Error adding company:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: error.errors.map(e => e.message).join(', ') });
    }
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// const loginCompany = async (req, res) => {
//   try {
//     const { userName, password } = req.body;
    
//     if (!userName || !password) {
//       return res.status(400).json({ message: 'Username and password are required' });
//     }

//     const result = await Company.sequelize.query(
//       'SELECT CompID, Name FROM Companies WHERE Name = :userName',
//       {
//         replacements: { userName },
//         type: Company.sequelize.QueryTypes.SELECT
//       }
//     );
    
//     if (!result.length) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     const company = result[0];

//     // Return CompID for frontend session storage
//     res.status(200).json({
//       CompID: company.CompID,
//       Name: company.Name
//     });

//   } catch (error) {
//     console.error('❌ Login error:', error);
//     res.status(500).json({ message: 'Internal server error', error: error.message });
//   }
// };

const getCompanyByID = async (req, res) => {
  const { compID } = req.body;
  try {
    const result = await sequelize.query(
      'SELECT Name FROM Company WHERE CompID = :compID',
      {
        replacements: { compID },
        type: Company.sequelize.QueryTypes.SELECT
     }
    );
    res.status(201).json(result);
  } catch (error) {
    console.error('❌ Error fetching data:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const getCompanyByName = async (req, res) => {
  const { name } = req.body;
  try {
    const result = await Company.sequelize.query(
      'EXEC GetCompanyByName @CompanyName = :name',
      {
        replacements: { name },
        type: Company.sequelize.QueryTypes.SELECT
      }
    );
    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Error fetching data:', error.message);
    console.log(error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const editCompanyInfo = async (req, res) => {
  try {
    const { compid, columnname, newvalue } = req.body;

    if (!compid || !columnname || !newvalue) {
      return res.status(400).json({ message: 'Missing required fields: compid, columnname, newvalue' });
    }

    // Optional: Validate columnname to prevent SQL injection on dynamic SQL
    const validColumns = ['Name', 'Address', 'Tel', 'Mob'];
    if (!validColumns.includes(columnname)) {
      return res.status(400).json({ message: `Invalid column name. Allowed: ${validColumns.join(', ')}` });
    }

    await sequelize.query(
      `EXEC EditCompanyInfo @compid = :compid, @columnname = :columnname, @newvalue = :newvalue`,
      {
        replacements: { compid, columnname, newvalue }
      }
    );

    res.status(200).json({ message: 'Company information updated successfully' });

  } catch (error) {
    console.error('❌ Error updating company info:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const getCompanyStock = async (req, res) => {
  try {
    const { CompID } = req.body;

    if (!CompID) {
      return res.status(400).json({ message: 'CompID is required' });
    }

    const stockData = await sequelize.query(
      'EXEC GetCompanyStock @compid = :CompID',
      {
        replacements: { CompID },
        type: sequelize.QueryTypes.SELECT
      }
    );

    res.status(200).json(stockData);
  } catch (error) {
    console.error('❌ Error fetching company stock:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const getDayBook = async (req, res) => {
  try {
    const { StartDate, EndDate } = req.body;

    if (!StartDate || !EndDate) {
      return res.status(400).json({ message: 'StartDate and EndDate are required' });
    }

    // Validate date format (optional, depending on your use case)
    if (isNaN(Date.parse(StartDate)) || isNaN(Date.parse(EndDate))) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    // Execute the stored procedure to get day book details
    const dayBookData = await sequelize.query(
      'EXEC GetDayBook @startdate = :StartDate, @enddate = :EndDate',
      {
        replacements: { StartDate, EndDate },
        type: sequelize.QueryTypes.SELECT
      }
    );

    res.status(200).json(dayBookData);
  } catch (error) {
    console.error('❌ Error fetching day book:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = {
  addCompany,
  //loginCompany,
  getCompanyByName,
  getCompanyByID,
  editCompanyInfo,
  getCompanyStock,
  getDayBook
};
