import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserTie, FaBuilding, FaChartLine, FaSignOutAlt, FaUsers } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Dashboard = () => {
    const [companyName, setCompanyName] = useState('');
    const [userName, setUserName] = useState('');
    const [userRole, setUserRole] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const compID = sessionStorage.getItem('CompID');
        const userID = sessionStorage.getItem('UserID');
        const role = sessionStorage.getItem('UserRole');

        if (!compID) {
            navigate('/');
            return;
        }

        setUserRole(role);

        const fetchUserName = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/Users/get-users-by-user-id', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userID })
                });

                if (!response.ok) throw new Error('Failed to fetch user details');
                const data = await response.json();
                if (data && data[0]) setUserName(data[0].Username);
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        };

        const fetchCompanyDetails = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/company/get-company-by-id', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ compID })
                });

                if (!response.ok) throw new Error('Failed to fetch company details');
                const data = await response.json();
                if (data && data[0]) setCompanyName(data[0].Name);
            } catch (error) {
                console.error('Error fetching company details:', error);
            }
        };

        fetchUserName();
        fetchCompanyDetails();
    }, [navigate]);

    const handleLogout = () => {
        sessionStorage.removeItem('CompID');
        sessionStorage.removeItem('UserID');
        sessionStorage.removeItem('UserRole');
        navigate('/');
    };

    const handleEmployeeClick = () => {
        // Removed the admin-only restriction here
        navigate('/employees');
    };

    const handleSupplierClick = () => {
        navigate('/suppliers');
    };

    const handleCustomerClick = () => {
        navigate('/customers');
    };

    const handleSalesClick = () => {
        console.log('Sales clicked');
    };

    const sectionData = [
        { 
            title: 'Employee', 
            icon: <FaUserTie size={30} color="#4facfe" />,
            onClick: handleEmployeeClick,
            description: 'Manage employee-related tasks here.'
        },
        { 
            title: 'Suppliers', 
            icon: <FaBuilding size={30} color="#00f2fe" />,
            onClick: handleSupplierClick,
            description: 'Manage supplier-related tasks here.'
        },
        { 
            title: 'Customers', 
            icon: <FaUsers size={30} color="#4facfe" />,
            onClick: handleCustomerClick,
            description: 'Manage customer-related tasks here.'
        },
        { 
            title: 'Sales', 
            icon: <FaChartLine size={30} color="#00f2fe" />,
            onClick: handleSalesClick,
            description: 'View sales reports and analytics.'
        }
    ];

    return (
        <div style={{
            fontFamily: "'Inter', sans-serif",
            background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
            minHeight: '100vh',
            padding: '30px',
            color: '#e0e0e0',
            position: 'relative',
            overflow: 'hidden'
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

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '25px',
                    backgroundColor: 'rgba(15, 30, 45, 0.8)',
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    marginBottom: '40px',
                    position: 'relative',
                    zIndex: 1
                }}
            >
                <div>
                    <h1 style={{ 
                        margin: '0', 
                        fontSize: '28px',
                        background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: '700'
                    }}>
                        {companyName}
                    </h1>
                    <p style={{ 
                        marginTop: '10px',
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: '1.1em'
                    }}>
                        Welcome, {userName} ({userRole})
                    </p>
                </div>
                <motion.button
                    onClick={handleLogout}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: 'rgba(220, 53, 69, 0.8)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backdropFilter: 'blur(4px)',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <FaSignOutAlt /> Logout
                </motion.button>
            </motion.div>

            {/* Dashboard Main Content */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                style={{
                    padding: '30px',
                    backgroundColor: 'rgba(15, 30, 45, 0.8)',
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    marginBottom: '30px',
                    position: 'relative',
                    zIndex: 1
                }}
            >
                <h2 style={{ 
                    marginBottom: '15px',
                    color: '#ffffff',
                    fontSize: '1.8em',
                    fontWeight: '600'
                }}>
                    Dashboard Content
                </h2>
                <p style={{ 
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '1.1em',
                    lineHeight: '1.6'
                }}>
                    This is where you can add your dashboard features and widgets.
                </p>
            </motion.div>

            {/* Section Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '25px',
                position: 'relative',
                zIndex: 1
            }}>
                {sectionData.map((section, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        whileHover={{ 
                            scale: 1.03,
                            boxShadow: '0 8px 32px rgba(79, 172, 254, 0.3)'
                        }}
                        style={{
                            padding: '30px',
                            backgroundColor: 'rgba(15, 30, 45, 0.8)',
                            borderRadius: '16px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            color: '#ffffff'
                        }}
                        onClick={section.onClick}
                    >
                        <div style={{ 
                            marginBottom: '20px',
                            display: 'flex',
                            justifyContent: 'center'
                        }}>
                            {section.icon}
                        </div>
                        <h3 style={{ 
                            marginBottom: '15px',
                            fontSize: '1.5em',
                            fontWeight: '600',
                            background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            {section.title}
                        </h3>
                        <p style={{ 
                            color: 'rgba(255,255,255,0.7)',
                            lineHeight: '1.6'
                        }}>
                            {section.description}
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* Footer */}
            <div style={{
                marginTop: '50px',
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

export default Dashboard;