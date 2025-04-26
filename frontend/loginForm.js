import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        userName: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/Users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Store all necessary user data in sessionStorage
            sessionStorage.setItem('CompID', data.CompID);
            sessionStorage.setItem('UserID', data.UserID);
            sessionStorage.setItem('UserRole', data.UserRole);
            sessionStorage.setItem('Username', data.Username || form.userName);
            
            console.log('Login successful', data);
            navigate('/dashboard');

        } catch (error) {
            console.error('❌ Login error:', error);
            setError(error.message || 'An error occurred during login');
        } finally {
            setIsLoading(false);
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
            fontFamily: "'Segoe UI', 'Roboto', sans-serif",
            color: '#e0e0e0',
            padding: '20px',
            boxSizing: 'border-box'
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

            <div style={{
                width: '100%',
                maxWidth: '500px',
                padding: '40px 20px',
                textAlign: 'center',
                position: 'relative',
                zIndex: 1
            }}>
                <h1 style={{
                    margin: 0,
                    color: '#ffffff',
                    fontSize: '3.5em',
                    fontWeight: '700',
                    letterSpacing: '1px',
                    background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: 'none'
                }}>SmartStock</h1>
                <p style={{
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: '1.3em',
                    marginTop: '15px',
                    fontWeight: '300',
                    letterSpacing: '0.5px'
                }}>Manage Your Company Online</p>
            </div>

            <div style={{
                width: '100%',
                maxWidth: '400px',
                padding: '40px',
                backgroundColor: 'rgba(15, 30, 45, 0.8)',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                position: 'relative',
                zIndex: 1,
                margin: '0 auto'
            }}>
                <h2 style={{
                    textAlign: 'center',
                    fontSize: '1.8em',
                    marginBottom: '25px',
                    color: '#ffffff',
                    fontWeight: '600',
                    letterSpacing: '0.5px',
                    padding: 0,
                    marginLeft: 0,
                    marginRight: 0
                }}>Company Login</h2>

                {error && (
                    <div style={{
                        backgroundColor: 'rgba(255, 50, 50, 0.2)',
                        color: '#ff6b6b',
                        marginBottom: '20px',
                        padding: '12px',
                        borderRadius: '8px',
                        fontSize: '0.95em',
                        border: '1px solid rgba(255, 50, 50, 0.3)',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ width: '100%', margin: 0, padding: 0 }}>
                    <div style={{ 
                        marginBottom: '20px',
                        width: '100%'
                    }}>
                        <input
                            type="text"
                            name="userName"
                            value={form.userName}
                            onChange={handleChange}
                            placeholder="Username"
                            required
                            style={{
                                padding: '14px 16px',
                                width: '100%',
                                boxSizing: 'border-box',
                                fontSize: '1em',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '8px',
                                color: '#ffffff',
                                transition: 'all 0.3s ease',
                                outline: 'none',
                                margin: 0
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
                    <div style={{ 
                        marginBottom: '25px',
                        width: '100%'
                    }}>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Password"
                            required
                            style={{
                                padding: '14px 16px',
                                width: '100%',
                                boxSizing: 'border-box',
                                fontSize: '1em',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '8px',
                                color: '#ffffff',
                                transition: 'all 0.3s ease',
                                outline: 'none',
                                margin: 0
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
                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            padding: '14px',
                            background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
                            color: '#0f2027',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '1.1em',
                            width: '100%',
                            marginBottom: '15px',
                            fontWeight: '600',
                            letterSpacing: '0.5px',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 15px rgba(79, 172, 254, 0.3)',
                            opacity: isLoading ? 0.7 : 1
                        }}
                        onMouseOver={(e) => {
                            if (!isLoading) {
                                e.target.style.boxShadow = '0 4px 20px rgba(79, 172, 254, 0.6)';
                                e.target.style.transform = 'translateY(-1px)';
                            }
                        }}
                        onMouseOut={(e) => {
                            e.target.style.boxShadow = '0 4px 15px rgba(79, 172, 254, 0.3)';
                            e.target.style.transform = 'translateY(0)';
                        }}
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    margin: '20px 0',
                    color: 'rgba(255,255,255,0.5)'
                }}>
                    <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.2)' }}></div>
                    <div style={{ padding: '0 10px', fontSize: '0.9em' }}>OR</div>
                    <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.2)' }}></div>
                </div>

                <button
                    onClick={() => navigate('/create-company')}
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
                    onMouseOver={(e) => {
                        e.target.style.backgroundColor = 'rgba(79, 172, 254, 0.1)';
                        e.target.style.borderColor = '#4facfe';
                    }}
                    onMouseOut={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.borderColor = 'rgba(79, 172, 254, 0.5)';
                    }}
                >
                    Create New Company
                </button>
            </div>

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

export default LoginForm;