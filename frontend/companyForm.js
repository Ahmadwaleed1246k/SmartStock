import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const CompanyForm = () => {
    const navigate = useNavigate();
    const [showUserForm, setShowUserForm] = useState(false);
    const [companyData, setCompanyData] = useState(null);
    const [form, setForm] = useState({
        Name: '',
        Address: '',
        Tel: '',
        Mob: '',
        DateOfRegistration: new Date().toISOString()
    });
    const [userForm, setUserForm] = useState({
        Username: '',
        Password: '',
        UserRole: 'Admin'
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleUserChange = (e) => {
        setUserForm({ ...userForm, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        console.log('📤 Sending company data:', form);

        try {
            const response = await fetch('http://localhost:5000/api/company/add-company', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create company');
            }

            const data = await response.json();
            console.log('✅ Company created:', data);
            
            setCompanyData(data);
            setShowUserForm(true);

        } catch (error) {
            console.error('❌ Error creating company:', error.message);
            setError(error.message);
        }
    };

    const handleUserSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const userData = {
            Username: userForm.Username,
            Password: userForm.Password,
            UserRole: userForm.UserRole,
            CompID: companyData.CompID
        };

        console.log('📤 Sending user data:', userData);

        try {
            const response = await fetch('http://localhost:5000/api/Users/add-User', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create user');
            }

            const data = await response.json();
            console.log('✅ Admin user created:', data);
            
            sessionStorage.setItem('CompID', companyData.CompID);
            navigate('/login');

        } catch (error) {
            console.error('❌ Error creating user:', error.message);
            setError(error.message);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
            fontFamily: "'Inter', sans-serif",
            color: '#e0e0e0',
            padding: '20px'
        }}>
            {/* Animated Background Elements */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 20% 50%, rgba(33, 150, 243, 0.1) 0%, transparent 50%)',
                zIndex: 0
            }}></div>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 80% 30%, rgba(76, 175, 80, 0.1) 0%, transparent 50%)',
                zIndex: 0
            }}></div>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{
                    width: '100%',
                    maxWidth: '500px',
                    padding: '40px',
                    backgroundColor: 'rgba(15, 30, 45, 0.8)',
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    position: 'relative',
                    zIndex: 1
                }}
            >
                <h1 style={{
                    textAlign: 'center',
                    marginBottom: '30px',
                    fontSize: '2em',
                    background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: '700'
                }}>
                    {showUserForm ? 'Create Admin User' : 'Create New Company'}
                </h1>
                
                {error && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                            backgroundColor: 'rgba(255, 50, 50, 0.2)',
                            color: '#ff6b6b',
                            padding: '12px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            border: '1px solid rgba(255, 50, 50, 0.3)',
                            textAlign: 'center'
                        }}
                    >
                        {error}
                    </motion.div>
                )}

                {!showUserForm ? (
                    <motion.form 
                        onSubmit={handleSubmit}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div style={{ marginBottom: '20px' }}>
                            <input 
                                type="text"
                                name="Name"
                                value={form.Name}
                                onChange={handleChange}
                                placeholder="Company Name"
                                required
                                style={{
                                    padding: '14px 16px',
                                    width: '100%',
                                    fontSize: '1em',
                                    marginLeft: '-15px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '8px',
                                    color: '#ffffff',
                                    transition: 'all 0.3s ease',
                                    outline: 'none'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#4facfe';
                                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                                }}
                            />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <input 
                                type="text"
                                name="Address"
                                value={form.Address}
                                onChange={handleChange}
                                placeholder="Address"
                                style={{
                                    padding: '14px 16px',
                                    width: '100%',
                                    fontSize: '1em',
                                    marginLeft: '-15px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '8px',
                                    color: '#ffffff',
                                    transition: 'all 0.3s ease',
                                    outline: 'none'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#4facfe';
                                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                                }}
                            />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <input 
                                type="tel"
                                name="Tel"
                                value={form.Tel}
                                onChange={handleChange}
                                placeholder="Telephone (10 digits)"
                                pattern="[0-9]{10}"
                                style={{
                                    padding: '14px 16px',
                                    width: '100%',
                                    fontSize: '1em',
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '8px',
                                    marginLeft: '-15px',
                                    color: '#ffffff',
                                    transition: 'all 0.3s ease',
                                    outline: 'none'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#4facfe';
                                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                                }}
                            />
                        </div>
                        <div style={{ marginBottom: '30px' }}>
                            <input 
                                type="tel"
                                name="Mob"
                                value={form.Mob}
                                onChange={handleChange}
                                placeholder="Mobile (11 digits)"
                                pattern="[0-9]{11}"
                                style={{
                                    padding: '14px 16px',
                                    width: '100%',
                                    fontSize: '1em',
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '8px',
                                    marginLeft: '-15px',
                                    color: '#ffffff',
                                    transition: 'all 0.3s ease',
                                    outline: 'none'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#4facfe';
                                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                                }}
                            />
                        </div>
                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                padding: '14px',
                                background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
                                color: '#0f2027',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '1.1em',
                                width: '100%',
                                fontWeight: '600',
                                marginBottom: '15px',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 15px rgba(79, 172, 254, 0.3)'
                            }}
                        >
                            Create Company
                        </motion.button>
                    </motion.form>
                ) : (
                    <motion.form 
                        onSubmit={handleUserSubmit}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div style={{ marginBottom: '20px' }}>
                            <input 
                                type="text"
                                name="Username"
                                value={userForm.Username}
                                onChange={handleUserChange}
                                placeholder="Username (min 3 characters)"
                                required
                                minLength="3"
                                style={{
                                    padding: '14px 16px',
                                    width: '100%',
                                    fontSize: '1em',
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '8px',
                                    color: '#ffffff',
                                    transition: 'all 0.3s ease',
                                    outline: 'none',
                                    marginLeft: '-15px',
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#4facfe';
                                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                                }}
                            />
                        </div>
                        <div style={{ marginBottom: '30px' }}>
                            <input 
                                type="password"
                                name="Password"
                                value={userForm.Password}
                                onChange={handleUserChange}
                                placeholder="Password (min 5 chars, 1 special char)"
                                required
                                minLength="5"
                                style={{
                                    padding: '14px 16px',
                                    width: '100%',
                                    fontSize: '1em',
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '8px',
                                    marginLeft: '-15px',
                                    color: '#ffffff',
                                    transition: 'all 0.3s ease',
                                    outline: 'none'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#4facfe';
                                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                                }}
                            />
                        </div>
                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                padding: '14px',
                                background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
                                color: '#0f2027',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '1.1em',
                                width: '100%',
                                fontWeight: '600',
                                marginBottom: '15px',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 15px rgba(79, 172, 254, 0.3)'
                            }}
                        >
                            Create Admin User
                        </motion.button>
                    </motion.form>
                )}

                <motion.button 
                    onClick={() => navigate('/login')}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                        padding: '14px',
                        backgroundColor: 'transparent',
                        color: '#4facfe',
                        border: '1px solid rgba(79, 172, 254, 0.5)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '1.1em',
                        width: '100%',
                        fontWeight: '500',
                        transition: 'all 0.3s ease'
                    }}
                >
                    Back to Login
                </motion.button>
            </motion.div>

            <div style={{
                marginTop: '40px',
                color: 'rgba(255,255,255,0.5)',
                fontSize: '0.9em',
                textAlign: 'center',
                position: 'relative',
                zIndex: 1
            }}>
                © {new Date().getFullYear()} SmartStock. All rights reserved.
            </div>
        </div>
    );
};

export default CompanyForm;