const { Users, sequelize } = require('../model');

const addUser = async (req, res) => {
  try {
    // Debug logs to see exactly what's coming in
    console.log('Full request body:', req.body);
    console.log('Username value:', req.body.Username);

    // Explicit check for Username
    if (!req.body.Username) {
      return res.status(400).json({ 
        error: 'Username is required',
        receivedBody: req.body  // This will help debug what was actually received
      });
    }

    const { Username, Password, UserRole, CompID } = req.body;

    if (!Username || !Password || !UserRole || !CompID) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate username length
    if (Username.length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters' });
    }

    // Validate password first
    if (!isValidPassword(Password)) {
      return res.status(400).json({ 
        error: 'Password must be at least 5 characters long and contain at least one special character (!@#$%^&*()_-|)'
      });
    }

    const [newUser] = await sequelize.query(
      'INSERT INTO Users (Username, Password, UserRole, CompID) VALUES (:Username, :Password, :UserRole, :CompID)',
      {
        replacements: { Username, Password, UserRole, CompID },
        type: sequelize.QueryTypes.INSERT
      }
    );

    res.status(201).json(newUser);
  } catch (error) {
    console.error('❌ Error adding User:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: error.errors.map(e => e.message).join(', ') });
    }
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

function isValidPassword(password) {
  if (!password || password.length < 5) return false;
  
  const specialChars = '!@#$%^&*()_-|';
  return [...password].some(char => specialChars.includes(char));
}

const getUsersByCompID = async (req, res) => {
  const { compID } = req.body;
  try {
    const result = await sequelize.query(
      'select * from Users where CompID = :CompID',
      {
        replacements: { compID },
        type: Users.sequelize.QueryTypes.SELECT
      }
    );
    res.status(201).json(result);
  } catch (err) {
    console.error('❌ Error fetching data:', err.message);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

const getUsersByUserID = async (req, res) => {
  const { userID } = req.body;
  try {
    const result = await sequelize.query(
      'select Username, UserRole from Users where UserID = :userID',
      {
        replacements: { userID },
        type: Users.sequelize.QueryTypes.SELECT
      }
    );
    res.status(201).json(result);
  } catch (err) {
    console.error('❌ Error fetching data:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

const loginUser = async (req, res) => {
  const { userName, password } = req.body;

  try {
    const [user] = await sequelize.query(
      'SELECT * FROM Users WHERE Username = :userName AND Password = :password',
      {
        replacements: { userName, password },
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Store Company ID in session
    req.session.CompID = user.CompID;
    req.session.UserID = user.UserID;

    res.status(200).json({ 
      message: 'Login successful', 
      CompID: user.CompID, 
      UserID: user.UserID,
      UserRole: user.UserRole 
    });
  } catch (err) {
    console.error('❌ Error logging in:', err.message);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

const getSessionData = (req, res) => {
  if (req.session.CompID) {
    res.status(200).json({ 
      CompID: req.session.CompID,
      UserRole: req.session.UserRole 
    });
  } else {
    res.status(400).json({ message: 'Session data not found' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { userID, oldPassword, newPassword } = req.body;

    if (!userID || !oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate new password
    if (!isValidPassword(newPassword)) {
      return res.status(400).json({
        error: 'New password must be at least 5 characters long and contain at least one special character (!@#$%^&*()_-|)'
      });
    }

    const [result] = await sequelize.query(
      `EXEC ChangePassword @userid = :userID, @oldpassword = :oldPassword, @newpassword = :newPassword`,
      {
        replacements: { userID, oldPassword, newPassword },
        type: sequelize.QueryTypes.RAW
      }
    );

    const outputMessage = result && result.length > 0 ? result[0] : '';

    // You can check logs to debug what SQL Server returns
    console.log('Password change result:', outputMessage);

    // Since PRINT in SQL Server doesn't return data, assume success if no error thrown
    res.status(200).json({ message: 'Password changed successfully' });

  } catch (error) {
    const errMsg = error.message || error.original?.message || 'Something went wrong';
    console.error('❌ Error changing password:', errMsg);

    if (errMsg.includes('Incorrect old password')) {
      return res.status(401).json({ message: 'Incorrect old password' });
    }

    res.status(500).json({ message: 'Internal server error', error: errMsg });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userID, CompID } = req.body;

    if (!userID) {
      return res.status(400).json({ message: 'UserID is required' });
    }

    // First verify the user exists and belongs to the company
    const [user] = await sequelize.query(
      `SELECT UserID FROM Users WHERE UserID = :userID AND CompID = :CompID`,
      {
        replacements: { userID, CompID },
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found or not in your company' });
    }

    // Check if user is an admin (admins shouldn't be deletable this way)
    const [isAdmin] = await sequelize.query(
      `SELECT 1 FROM Users WHERE UserID = :userID AND UserRole = 'Admin'`,
      {
        replacements: { userID },
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (isAdmin) {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }

    // Perform the deletion
    await sequelize.query(
      `DELETE FROM Users WHERE UserID = :userID`,
      {
        replacements: { userID },
        type: sequelize.QueryTypes.DELETE
      }
    );

    res.status(200).json({ message: 'User deleted successfully' });

  } catch (error) {
    const errMsg = error.message || error.original?.message || 'Something went wrong';
    console.error('❌ Error deleting user:', errMsg);
    res.status(500).json({ message: 'Internal server error', error: errMsg });
  }
};

const getEmployeesByCompany = async (req, res) => {
  try {
    const { compID } = req.body;

    if (!compID) {
      return res.status(400).json({ message: 'compID is required' });
    }

    const employees = await sequelize.query(
      `SELECT 
        UserID,
        Username,
        UserRole
       FROM Users
       WHERE CompID = :compID 
       AND UserRole = 'Employee'
       ORDER BY Username`,
      {
        replacements: { compID },
        type: sequelize.QueryTypes.SELECT
      }
    );

    res.status(200).json(employees);

  } catch (error) {
    console.error('❌ Error fetching employees:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};

const addEmployee = async (req, res) => {
  try {
    const { Username, Password, CompID } = req.body;

    // Validate required fields
    if (!Username || !Password || !CompID) {
      return res.status(400).json({ message: 'Username, Password, and CompID are required' });
    }

    // Validate username length
    if (Username.length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters' });
    }

    // Validate password
    if (!isValidPassword(Password)) {
      return res.status(400).json({ 
        error: 'Password must be at least 5 characters long and contain at least one special character (!@#$%^&*()_-|)'
      });
    }

    // Check if company exists
    const [company] = await sequelize.query(
      'SELECT 1 FROM Company WHERE CompID = :CompID',
      {
        replacements: { CompID },
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Insert the employee (UserRole is hardcoded to 'Employee')
    const [newEmployee] = await sequelize.query(
      'INSERT INTO Users (Username, Password, UserRole, CompID) VALUES (:Username, :Password, :UserRole, :CompID)',
      {
        replacements: { 
          Username, 
          Password, 
          UserRole: 'Employee', // Hardcoded to ensure only employee role
          CompID 
        },
        type: sequelize.QueryTypes.INSERT
      }
    );

    res.status(201).json({ 
      message: 'Employee added successfully',
      employeeId: newEmployee
    });
  } catch (error) {
    console.error('❌ Error adding employee:', error);
    
    // Handle duplicate username error
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};

const editEmployee = async (req, res) => {
  try {
      const { UserID, Username, Password, CompID } = req.body;
      
      if (!UserID || !Username) {
          return res.status(400).json({ message: 'UserID and Username are required' });
      }

      const updateData = { Username };
      if (Password && Password.length >= 5) {
          updateData.Password = Password;
      }

      const [updated] = await Users.update(updateData, {
          where: { UserID, CompID }
      });

      if (!updated) {
          return res.status(404).json({ message: 'Employee not found or no changes made' });
      }

      res.json({ success: true, message: 'Employee updated successfully' });
  } catch (error) {
      console.error('Error updating employee:', error);
      res.status(500).json({ message: 'Failed to update employee', error: error.message });
  }
};

module.exports = {
  addUser,
  getUsersByCompID,
  getUsersByUserID,
  loginUser,
  getSessionData,
  changePassword,
  deleteUser,
  getEmployeesByCompany,
  addEmployee,
  editEmployee
};