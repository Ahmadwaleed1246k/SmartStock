const express = require('express');
const {
  addUser,
  addEmployee, // Add this import
  getUsersByCompID, 
  loginUser, 
  getSessionData, 
  getUsersByUserID, 
  changePassword, 
  deleteUser,
  getEmployeesByCompany,
  editEmployee // Add this
} = require('../Controllers/userController');

const router = express.Router();

router.post('/add-User', addUser);
router.post('/add-employee', addEmployee); // Add this new route
router.post('/get-user-by-compID', getUsersByCompID);
router.post('/login', loginUser);
router.get('/session', getSessionData);
router.post('/get-users-by-user-id', getUsersByUserID);
router.post('/change-password', changePassword);
router.post('/delete-user', deleteUser);
router.post('/edit-employee', editEmployee); // Add this new route
router.post('/get-employees-by-company', getEmployeesByCompany);

module.exports = router;