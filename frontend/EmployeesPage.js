import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaArrowLeft, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';
import { motion } from 'framer-motion';

const EmployeesPage = () => {
    const [employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentEmployee, setCurrentEmployee] = useState(null);
    const [newEmployee, setNewEmployee] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const compID = sessionStorage.getItem('CompID');
    const userRole = sessionStorage.getItem('UserRole');
    const currentUserID = sessionStorage.getItem('UserID');
    const currentUsername = sessionStorage.getItem('Username');

    useEffect(() => {
        if (!compID) {
            navigate('/');
            return;
        }
        fetchEmployees();
    }, [compID, navigate]);

    const fetchEmployees = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/Users/get-employees-by-company', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ compID })
            });

            if (!response.ok) throw new Error('Failed to fetch employees');
            const data = await response.json();
            setEmployees(data);
        } catch (error) {
            console.error('Error fetching employees:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddEmployee = async () => {
        setError('');
        
        if (!newEmployee.username || !newEmployee.password) {
            setError('Username and password are required');
            return;
        }

        if (newEmployee.username.length < 3) {
            setError('Username must be at least 3 characters');
            return;
        }

        if (newEmployee.password.length < 5) {
            setError('Password must be at least 5 characters');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/Users/add-employee', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    Username: newEmployee.username,
                    Password: newEmployee.password,
                    CompID: compID
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add employee');
            }

            setSuccess('Employee added successfully!');
            await fetchEmployees();
            setTimeout(() => {
                setShowAddModal(false);
                setNewEmployee({ username: '', password: '' });
                setSuccess('');
            }, 1500);
        } catch (error) {
            console.error('Error adding employee:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditEmployee = async () => {
        setError('');
        
        if (!currentEmployee?.Username) {
            setError('Username is required');
            return;
        }

        // For employees changing their own password
        if (currentEmployee.UserID.toString() === currentUserID && currentEmployee.Password && currentEmployee.Password.length < 5) {
            setError('Password must be at least 5 characters');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/Users/edit-employee', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    UserID: currentEmployee.UserID,
                    Username: currentEmployee.Username,
                    Password: currentEmployee.UserID.toString() === currentUserID ? currentEmployee.Password : undefined,
                    CompID: compID
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update employee');
            }

            // Update session storage if editing own username
            if (currentEmployee.UserID.toString() === currentUserID) {
                sessionStorage.setItem('Username', currentEmployee.Username);
            }

            setSuccess(currentEmployee.UserID.toString() === currentUserID ? 'Password changed successfully!' : 'Employee updated successfully!');
            await fetchEmployees();
            setTimeout(() => {
                setShowEditModal(false);
                setCurrentEmployee(null);
                setSuccess('');
            }, 1500);
        } catch (error) {
            console.error('Error updating employee:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteEmployee = async (employeeId) => {
        if (!window.confirm('Are you sure you want to delete this employee?')) return;
      
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/Users/delete-user', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    userID: employeeId,
                    CompID: compID
                })
            });
        
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete employee');
            }
        
            setEmployees(employees.filter(emp => emp.UserID !== employeeId));
            setSuccess('Employee deleted successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Error deleting employee:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (showEditModal) {
            setCurrentEmployee(prev => ({ ...prev, [name]: value }));
        } else {
            setNewEmployee(prev => ({ ...prev, [name]: value }));
        }
    };

    const openEditModal = (employee) => {
        setCurrentEmployee({ 
            ...employee, 
            Password: employee.UserID.toString() === currentUserID ? '' : undefined 
        });
        setShowEditModal(true);
        setError('');
    };

    return (
        <div style={{
            fontFamily: "'Inter', sans-serif",
            background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
            minHeight: '100vh',
            padding: '30px',
            color: '#e0e0e0'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px'
            }}>
                <motion.button
                    onClick={() => navigate('/dashboard')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: 'rgba(79, 172, 254, 0.2)',
                        color: '#4facfe',
                        border: '1px solid #4facfe',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <FaArrowLeft /> Back to Dashboard
                </motion.button>
                
                {userRole === 'Admin' && (
                    <motion.button
                        onClick={() => setShowAddModal(true)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            padding: '12px 24px',
                            background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
                            color: '#0f2027',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <FaPlus /> Add Employee
                    </motion.button>
                )}
            </div>

            {/* Success/Error Messages */}
            {success && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        backgroundColor: 'rgba(76, 175, 80, 0.2)',
                        color: '#4CAF50',
                        padding: '15px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        border: '1px solid #4CAF50'
                    }}
                >
                    {success}
                </motion.div>
            )}
            {error && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        backgroundColor: 'rgba(244, 67, 54, 0.2)',
                        color: '#f44336',
                        padding: '15px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        border: '1px solid #f44336'
                    }}
                >
                    {error}
                </motion.div>
            )}

            {/* Employees List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    backgroundColor: 'rgba(15, 30, 45, 0.8)',
                    borderRadius: '16px',
                    padding: '30px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
            >
                <h2 style={{ 
                    marginBottom: '25px',
                    color: '#ffffff',
                    fontSize: '1.8em',
                    fontWeight: '600'
                }}>
                    Employees List
                </h2>

                {isLoading ? (
                    <div style={{ textAlign: 'center' }}>
                        <p>Loading employees...</p>
                    </div>
                ) : employees.length > 0 ? (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {employees.map((emp, index) => (
                            <motion.li 
                                key={emp.UserID}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                style={{ 
                                    padding: '15px 20px', 
                                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '600', marginBottom: '5px' }}>
                                        {emp.Username}
                                        {emp.UserID.toString() === currentUserID && (
                                            <span style={{ 
                                                marginLeft: '10px',
                                                fontSize: '0.8em',
                                                color: '#00f2fe'
                                            }}>(You)</span>
                                        )}
                                    </div>
                                    <div style={{ 
                                        color: emp.UserRole === 'Admin' ? '#00f2fe' : '#4facfe',
                                        fontSize: '0.9em'
                                    }}>
                                        {emp.UserRole}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {(userRole === 'Admin' || emp.UserID.toString() === currentUserID) && (
                                        <motion.button
                                            onClick={() => openEditModal(emp)}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#4facfe',
                                                cursor: 'pointer',
                                                fontSize: '1.1em'
                                            }}
                                        >
                                            <FaEdit />
                                        </motion.button>
                                    )}
                                    {userRole === 'Admin' && emp.UserID.toString() !== currentUserID && (
                                        <motion.button
                                            onClick={() => handleDeleteEmployee(emp.UserID)}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#f44336',
                                                cursor: 'pointer',
                                                fontSize: '1.1em'
                                            }}
                                        >
                                            <FaTrash />
                                        </motion.button>
                                    )}
                                </div>
                            </motion.li>
                        ))}
                    </ul>
                ) : (
                    <p style={{ textAlign: 'center' }}>No employees found for this company.</p>
                )}
            </motion.div>

            {/* Add Employee Modal - Only shown for Admin */}
            {userRole === 'Admin' && showAddModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                            backgroundColor: '#1a2a3a',
                            padding: '30px',
                            borderRadius: '16px',
                            width: '60%',
                            maxWidth: '500px',
                            position: 'relative'
                        }}
                    >
                        <button 
                            onClick={() => {
                                setShowAddModal(false);
                                setError('');
                                setNewEmployee({ username: '', password: '' });
                            }}
                            style={{
                                position: 'absolute',
                                top: '15px',
                                right: '15px',
                                background: 'none',
                                border: 'none',
                                color: 'rgba(255,255,255,0.7)',
                                cursor: 'pointer',
                                fontSize: '1.2em'
                            }}
                        >
                            <FaTimes />
                        </button>
                        <h2 style={{ 
                            marginBottom: '25px',
                            color: '#ffffff',
                            fontSize: '1.5em',
                            fontWeight: '600',
                            textAlign: 'center'
                        }}>
                            Add New Employee
                        </h2>

                        {error && (
                            <div style={{
                                backgroundColor: 'rgba(255, 50, 50, 0.2)',
                                color: '#ff6b6b',
                                padding: '12px',
                                borderRadius: '8px',
                                marginBottom: '20px',
                                textAlign: 'center'
                            }}>
                                {error}
                            </div>
                        )}

                        {success && (
                            <div style={{
                                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                                color: '#4CAF50',
                                padding: '12px',
                                borderRadius: '8px',
                                marginBottom: '20px',
                                textAlign: 'center'
                            }}>
                                {success}
                            </div>
                        )}

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: 'rgba(255,255,255,0.8)'
                            }}>
                                Username
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={newEmployee.username}
                                onChange={handleInputChange}
                                placeholder="Enter username"
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '8px',
                                    color: '#ffffff',
                                    fontSize: '1em'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '30px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: 'rgba(255,255,255,0.8)'
                            }}>
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={newEmployee.password}
                                onChange={handleInputChange}
                                placeholder="Enter password"
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '8px',
                                    color: '#ffffff',
                                    fontSize: '1em'
                                }}
                            />
                            <p style={{
                                marginTop: '8px',
                                fontSize: '0.9em',
                                color: 'rgba(255,255,255,0.5)'
                            }}>
                                Password must be at least 5 characters long
                            </p>
                        </div>

                        <motion.button
                            onClick={handleAddEmployee}
                            disabled={isLoading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                width: '100%',
                                padding: '14px',
                                background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
                                color: '#0f2027',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '1.1em',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '8px',
                                opacity: isLoading ? 0.7 : 1
                            }}
                        >
                            {isLoading ? 'Adding...' : 'Add Employee'}
                        </motion.button>
                    </motion.div>
                </div>
            )}

            {/* Edit Employee Modal */}
            {showEditModal && currentEmployee && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                            backgroundColor: '#1a2a3a',
                            padding: '30px',
                            borderRadius: '16px',
                            width: '60%',
                            maxWidth: '500px',
                            position: 'relative'
                        }}
                    >
                        <button 
                            onClick={() => {
                                setShowEditModal(false);
                                setError('');
                                setCurrentEmployee(null);
                            }}
                            style={{
                                position: 'absolute',
                                top: '15px',
                                right: '15px',
                                background: 'none',
                                border: 'none',
                                color: 'rgba(255,255,255,0.7)',
                                cursor: 'pointer',
                                fontSize: '1.2em'
                            }}
                        >
                            <FaTimes />
                        </button>
                        <h2 style={{ 
                            marginBottom: '25px',
                            color: '#ffffff',
                            fontSize: '1.5em',
                            fontWeight: '600',
                            textAlign: 'center'
                        }}>
                            {currentEmployee.UserID.toString() === currentUserID ? 'Change Password' : 'Edit Employee'}
                        </h2>

                        {error && (
                            <div style={{
                                backgroundColor: 'rgba(255, 50, 50, 0.2)',
                                color: '#ff6b6b',
                                padding: '12px',
                                borderRadius: '8px',
                                marginBottom: '20px',
                                textAlign: 'center'
                            }}>
                                {error}
                            </div>
                        )}

                        {success && (
                            <div style={{
                                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                                color: '#4CAF50',
                                padding: '12px',
                                borderRadius: '8px',
                                marginBottom: '20px',
                                textAlign: 'center'
                            }}>
                                {success}
                            </div>
                        )}

                        {currentEmployee.UserID.toString() !== currentUserID && (
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: 'rgba(255,255,255,0.8)'
                                }}>
                                    Username
                                </label>
                                <input
                                    type="text"
                                    name="Username"
                                    value={currentEmployee.Username}
                                    onChange={handleInputChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '8px',
                                        color: '#ffffff',
                                        fontSize: '1em'
                                    }}
                                />
                            </div>
                        )}

                        {currentEmployee.UserID.toString() === currentUserID && (
                            <>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        color: 'rgba(255,255,255,0.8)'
                                    }}>
                                        Current Username
                                    </label>
                                    <div style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '8px',
                                        color: '#ffffff',
                                        fontSize: '1em'
                                    }}>
                                        {currentEmployee.Username}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '30px' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        color: 'rgba(255,255,255,0.8)'
                                    }}>
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        name="Password"
                                        value={currentEmployee.Password || ''}
                                        onChange={handleInputChange}
                                        placeholder="Enter new password"
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            borderRadius: '8px',
                                            color: '#ffffff',
                                            fontSize: '1em'
                                        }}
                                    />
                                    <p style={{
                                        marginTop: '8px',
                                        fontSize: '0.9em',
                                        color: 'rgba(255,255,255,0.5)'
                                    }}>
                                        Password must be at least 5 characters long
                                    </p>
                                </div>
                            </>
                        )}

                        <motion.button
                            onClick={handleEditEmployee}
                            disabled={isLoading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                width: '100%',
                                padding: '14px',
                                background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
                                color: '#0f2027',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '1.1em',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '8px',
                                opacity: isLoading ? 0.7 : 1
                            }}
                        >
                            {isLoading ? 'Updating...' : currentEmployee.UserID.toString() === currentUserID ? 'Change Password' : 'Update Employee'}
                        </motion.button>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default EmployeesPage;