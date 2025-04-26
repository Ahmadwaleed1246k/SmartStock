import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaArrowLeft, FaTimes, FaBuilding, FaEdit, FaTrash } from 'react-icons/fa';
import { motion } from 'framer-motion';

const SuppliersPage = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentSupplier, setCurrentSupplier] = useState(null);
    const [newSupplier, setNewSupplier] = useState({
        acctName: '',
        address: '',
        tel: '',
        mob: '',
        email: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const compID = sessionStorage.getItem('CompID');

    useEffect(() => {
        fetchSuppliers();
    }, [compID]);

    const fetchSuppliers = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/accounts/get-suppliers-by-company', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ compID }),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch suppliers');
            }
            const data = await response.json();
            setSuppliers(data);
        } catch (error) {
            console.error('Error fetching suppliers:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddSupplier = async () => {
        setError('');
        setSuccess('');
        
        if (!newSupplier.acctName) {
            setError('Account name is required');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/accounts/add-suppliers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    AccountName: newSupplier.acctName,
                    Address: newSupplier.address,
                    Tel: newSupplier.tel,
                    Mob: newSupplier.mob,
                    Email: newSupplier.email,
                    CompID: compID
                }),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add supplier');
            }

            setSuccess('Supplier added successfully!');
            await fetchSuppliers();
            setTimeout(() => {
                setShowAddModal(false);
                setNewSupplier({ 
                    acctName: '',
                    address: '',
                    tel: '',
                    mob: '',
                    email: ''
                });
                setSuccess('');
            }, 1500);
        } catch (error) {
            console.error('Error adding supplier:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteSupplier = async (supplierId) => {
        if (!window.confirm('Are you sure you want to delete this supplier?')) return;

        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/accounts/delete-supplier', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ AcctID: supplierId }),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete supplier');
            }

            setSuppliers(suppliers.filter(s => s.AcctID !== supplierId));
            setSuccess('Supplier deleted successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Error deleting supplier:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditSupplier = async () => {
        setError('');
        setSuccess('');
    
        if (!currentSupplier?.AcctName) {
            setError('Account name is required');
            return;
        }
    
        setIsLoading(true);
        try {
            // First update the account name
            await fetch('http://localhost:5000/api/accounts/edit-account-info', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    AcctID: currentSupplier.AcctID,
                    columnName: 'AcctName',
                    newValue: currentSupplier.AcctName
                }),
                credentials: 'include'
            });
    
            // Then update other fields if they exist
            const updates = [];
            if (currentSupplier.Address !== undefined) {
                updates.push(fetch('http://localhost:5000/api/accounts/edit-account-info', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        AcctID: currentSupplier.AcctID,
                        columnName: 'Address',
                        newValue: currentSupplier.Address
                    }),
                    credentials: 'include'
                }));
            }
    
            if (currentSupplier.Tel !== undefined) {
                updates.push(fetch('http://localhost:5000/api/accounts/edit-account-info', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        AcctID: currentSupplier.AcctID,
                        columnName: 'Tel',
                        newValue: currentSupplier.Tel
                    }),
                    credentials: 'include'
                }));
            }
    
            if (currentSupplier.Mob !== undefined) {
                updates.push(fetch('http://localhost:5000/api/accounts/edit-account-info', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        AcctID: currentSupplier.AcctID,
                        columnName: 'Mob',
                        newValue: currentSupplier.Mob
                    }),
                    credentials: 'include'
                }));
            }
    
            if (currentSupplier.Email !== undefined) {
                updates.push(fetch('http://localhost:5000/api/accounts/edit-account-info', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        AcctID: currentSupplier.AcctID,
                        columnName: 'Email',
                        newValue: currentSupplier.Email
                    }),
                    credentials: 'include'
                }));
            }
    
            // Wait for all updates to complete
            await Promise.all(updates);
    
            setSuccess('Supplier updated successfully!');
            await fetchSuppliers();
            setTimeout(() => {
                setShowEditModal(false);
                setSuccess('');
            }, 1500);
        } catch (error) {
            console.error('Error updating supplier:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (showEditModal) {
            setCurrentSupplier(prev => ({ ...prev, [name]: value }));
        } else {
            setNewSupplier(prev => ({ ...prev, [name]: value }));
        }
    };

    const openEditModal = (supplier) => {
        setCurrentSupplier(supplier);
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
                
                <motion.button
                    onClick={() => setShowAddModal(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        padding: '12px 24px',
                        background: 'linear-gradient(90deg, #00f2fe 0%, #4facfe 100%)',
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
                    <FaPlus /> Add Supplier
                </motion.button>
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

            {/* Suppliers List */}
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
                    Suppliers List
                </h2>

                {isLoading ? (
                    <div style={{ textAlign: 'center' }}>
                        <p>Loading suppliers...</p>
                    </div>
                ) : suppliers.length > 0 ? (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {suppliers.map((supplier, index) => (
                            <motion.li 
                                key={supplier.AcctID}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                style={{ 
                                    padding: '15px 20px', 
                                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    ':hover': {
                                        backgroundColor: 'rgba(255,255,255,0.05)'
                                    }
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '600', marginBottom: '5px' }}>
                                        {supplier.AcctName}
                                    </div>
                                    {supplier.Email && (
                                        <div style={{ fontSize: '0.9em', color: 'rgba(255,255,255,0.7)' }}>
                                            {supplier.Email}
                                        </div>
                                    )}
                                    {supplier.Mob && (
                                        <div style={{ fontSize: '0.9em', color: 'rgba(255,255,255,0.7)' }}>
                                            {supplier.Mob}
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <motion.button
                                        onClick={() => openEditModal(supplier)}
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
                                    <motion.button
                                        onClick={() => handleDeleteSupplier(supplier.AcctID)}
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
                                </div>
                            </motion.li>
                        ))}
                    </ul>
                ) : (
                    <p style={{ textAlign: 'center' }}>No suppliers found for this company.</p>
                )}
            </motion.div>

            {/* Add Supplier Modal */}
            {showAddModal && (
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
                                setNewSupplier({ 
                                    acctName: '',
                                    address: '',
                                    tel: '',
                                    mob: '',
                                    email: ''
                                });
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
                            Add New Supplier
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
                                Account Name *
                            </label>
                            <input
                                type="text"
                                name="acctName"
                                value={newSupplier.acctName}
                                onChange={handleInputChange}
                                placeholder="Enter supplier name"
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

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: 'rgba(255,255,255,0.8)'
                            }}>
                                Address
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={newSupplier.address}
                                onChange={handleInputChange}
                                placeholder="Enter address"
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

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: 'rgba(255,255,255,0.8)'
                            }}>
                                Telephone (10 digits)
                            </label>
                            <input
                                type="text"
                                name="tel"
                                value={newSupplier.tel}
                                onChange={handleInputChange}
                                placeholder="Enter telephone"
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

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: 'rgba(255,255,255,0.8)'
                            }}>
                                Mobile (11 digits)
                            </label>
                            <input
                                type="text"
                                name="mob"
                                value={newSupplier.mob}
                                onChange={handleInputChange}
                                placeholder="Enter mobile"
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
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={newSupplier.email}
                                onChange={handleInputChange}
                                placeholder="Enter email"
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

                        <motion.button
                            onClick={handleAddSupplier}
                            disabled={isLoading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                width: '100%',
                                padding: '14px',
                                background: 'linear-gradient(90deg, #00f2fe 0%, #4facfe 100%)',
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
                            {isLoading ? 'Adding...' : 'Add Supplier'}
                        </motion.button>
                    </motion.div>
                </div>
            )}

            {/* Edit Supplier Modal */}
            {showEditModal && currentSupplier && (
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
                                setCurrentSupplier(null);
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
                            Edit Supplier
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
                                Account Name *
                            </label>
                            <input
                                type="text"
                                name="AcctName"
                                value={currentSupplier.AcctName}
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

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: 'rgba(255,255,255,0.8)'
                            }}>
                                Address
                            </label>
                            <input
                                type="text"
                                name="Address"
                                value={currentSupplier.Address || ''}
                                onChange={handleInputChange}
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

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: 'rgba(255,255,255,0.8)'
                            }}>
                                Telephone (10 digits)
                            </label>
                            <input
                                type="text"
                                name="Tel"
                                value={currentSupplier.Tel || ''}
                                onChange={handleInputChange}
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

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: 'rgba(255,255,255,0.8)'
                            }}>
                                Mobile (11 digits)
                            </label>
                            <input
                                type="text"
                                name="Mob"
                                value={currentSupplier.Mob || ''}
                                onChange={handleInputChange}
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
                                Email
                            </label>
                            <input
                                type="email"
                                name="Email"
                                value={currentSupplier.Email || ''}
                                onChange={handleInputChange}
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

                        <motion.button
                            onClick={handleEditSupplier}
                            disabled={isLoading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                width: '100%',
                                padding: '14px',
                                background: 'linear-gradient(90deg, #00f2fe 0%, #4facfe 100%)',
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
                            {isLoading ? 'Updating...' : 'Update Supplier'}
                        </motion.button>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default SuppliersPage;