import React, { useState, useEffect } from "react";

const CustomerForm = ({ onSubmit }) => {
    const [form, setForm] = useState({
        AcctName: '',
        Address: '',
        Tel: '',
        Mob: '',
        Email: ''
    });
    const [error, setError] = useState('');
    const [compID, setCompID] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Check for company ID on component mount
    useEffect(() => {
        const id = sessionStorage.getItem('CompID');
        if (!id) {
            setError('Company ID not found in session. Please login again.');
        } else {
            setCompID(id);
        }
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!compID) {
            setError('Company session expired. Please refresh and login again.');
            return;
        }

        // Validate required fields
        if (!form.AcctName) {
            setError('Account name is required');
            return;
        }

        // Validate mobile number if provided
        if (form.Mob && form.Mob.length !== 11) {
            setError('Mobile number must be exactly 11 digits');
            return;
        }

        // Validate email if provided
        if (form.Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.Email)) {
            setError('Invalid email format');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/account/add-customer2', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    AccountName: form.AcctName,
                    Address: form.Address,
                    Tel: form.Tel,
                    Mob: form.Mob,
                    Email: form.Email
                    // CompID comes from session in backend
                }),
                credentials: 'include'
            });

            const data = await response.json();
            
            if (!response.ok) {
                // Handle session errors
                if (data.message.includes('session') || response.status === 401) {
                    sessionStorage.clear();
                    window.location.href = '/login';
                    return;
                }
                throw new Error(data.message || 'Failed to add customer');
            }

            onSubmit(data);
            setForm({
                AcctName: '',
                Address: '',
                Tel: '',
                Mob: '',
                Email: ''
            });
            
        } catch (error) {
            console.error('Error:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!compID) {
        return (
            <div style={{ 
                padding: '20px',
                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                border: '1px solid rgba(255, 0, 0, 0.3)',
                borderRadius: '8px',
                color: '#ff6b6b',
                textAlign: 'center'
            }}>
                {error || 'Company session not found. Please login again.'}
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Add New Customer</h2>
            
            {error && (
                <div style={{
                    padding: '15px',
                    backgroundColor: 'rgba(255, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 0, 0, 0.3)',
                    borderRadius: '8px',
                    color: '#ff6b6b',
                    marginBottom: '20px'
                }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                        Account Name *
                    </label>
                    <input
                        type="text"
                        name="AcctName"
                        value={form.AcctName}
                        onChange={handleChange}
                        required
                        style={{
                            width: '95%',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                        Mobile (11 digits)
                    </label>
                    <input
                        type="text"
                        name="Mob"
                        value={form.Mob}
                        onChange={handleChange}
                        style={{
                            width: '95%',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                        Email
                    </label>
                    <input
                        type="email"
                        name="Email"
                        value={form.Email}
                        onChange={handleChange}
                        style={{
                            width: '95%',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px'
                        }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                        width: '95%',
                        padding: '12px',
                        backgroundColor: isLoading ? '#ccc' : '#4facfe',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                >
                    {isLoading ? 'Adding Customer...' : 'Add Customer'}
                </button>
            </form>
        </div>
    );
};

export default CustomerForm;