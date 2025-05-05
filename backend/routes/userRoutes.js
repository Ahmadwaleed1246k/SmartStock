const express = require('express');
const {addUser, getUsersByCompID, loginUser, getSessionData, getUsersByUserID, 
    addEmployee, editEmployee, changePassword, deleteUser,
     getEmployeesByCompany} = require('../Controllers/userController');

const router = express.Router();

router.post('/add-User', addUser);
router.post('/get-user-by-compID', getUsersByCompID);
router.post('/login', loginUser);
router.get('/session', getSessionData);
router.post('/get-users-by-user-id', getUsersByUserID);
router.post('/change-password', changePassword);
router.post('/delete-user', deleteUser);
router.post('/get-employees-by-company', getEmployeesByCompany);
router.post('/add-employee', addEmployee);
router.post('/edit-employee', editEmployee);
module.exports = router;
