import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { motion } from 'framer-motion';

const AddEmployeePage = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const compID = sessionStorage.getItem('CompID');
    const userRole = sessionStorage.getItem('UserRole');

    useEffect(() => {
        if (userRole !== 'Admin') {
            navigate('/dashboard');
        }
    }, [userRole, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!formData.username || !formData.password) {
            setError('Username and password are required');
            return;
        }

        if (formData.username.length < 3) {
            setError('Username must be at least 3 characters');
            return;
        }

        if (formData.password.length < 5) {
            setError('Password must be at least 5 characters');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('http://localhost:5000/api/Users/add-employee', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    Username: formData.username,
                    Password: formData.password,
                    CompID: compID
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add employee');
            }

            navigate('/employees');
        } catch (error) {
            console.error('Error adding employee:', error);
            setError(error.message);
        } finally {
            setIsSubmitting(false);
        }
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
            <motion.button
                onClick={() => navigate('/employees')}
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
                    gap: '8px',
                    marginBottom: '30px'
                }}
            >
                <FaArrowLeft /> Back to Employees
            </motion.button>

            {/* Add Employee Form */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    maxWidth: '500px',
                    margin: '0 auto',
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

                <form onSubmit={handleSubmit}>
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
                            value={formData.username}
                            onChange={handleChange}
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
                            value={formData.password}
                            onChange={handleChange}
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
                            Password must be at least 5 characters long and contain a special character
                        </p>
                    </div>

                    <motion.button
                        type="submit"
                        disabled={isSubmitting}
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
                            gap: '8px'
                        }}
                    >
                        <FaSave /> {isSubmitting ? 'Adding...' : 'Add Employee'}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};

export default AddEmployeePage;