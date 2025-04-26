

import React, {useState} from "react";

const AccountForm = ({onsubmit}) => {
    const [accounts, setAccounts] = useState([]);
    const [form, setForm] = useState({
        AcctName: '',
        Address: '',
        Tel: '',
        Mob: '',
        Email: '',
        CompID: '',
        AcctType: 'Supplier' // Default value
    });

    // Handle form changes
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Handle account type change
    const handleAccountTypeChange = (e) => {
        setForm({ ...form, AcctType: e.target.value });
    };

    // Submit new account
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Get CompID from session storage
        const compID = sessionStorage.getItem('CompID');
        const formData = { ...form, CompID: compID };

        console.log('📤 Sending Payload:', formData);

        try {
            const response = await fetch('http://localhost:5000/api/Account/add-account', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Failed to add account: ${error.message}`);
            }

            const data = await response.json();
            console.log('✅ Account added:', data);

            // Update state with the new account
            setAccounts((prev) => [...prev, data]);

            // Reset form after success
            setForm({
                AcctName: '',
                Address: '',
                Tel: '',
                Mob: '',
                Email: '',
                CompID: '',
                AcctType: 'Supplier'
            });
        } catch (error) {
            console.error('❌ Error adding account:', error.message);
        }
    };

    return (
        <div>
            <h2>Create New Account</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Account Type:</label>
                    <select 
                        value={form.AcctType} 
                        onChange={handleAccountTypeChange}
                        style={{
                            padding: '8px',
                            marginBottom: '10px',
                            width: '200px'
                        }}
                    >
                        <option value="Supplier">Supplier</option>
                        <option value="Customer">Customer</option>
                    </select>
                </div>
                <div>
                    <input 
                        type="text"
                        name="AcctName"
                        value={form.AcctName}
                        onChange={handleChange}
                        placeholder="Account Name"
                        required
                        style={{
                            padding: '8px',
                            marginBottom: '10px',
                            width: '200px'
                        }}
                    />
                </div>
                <div>
                    <input 
                        type="text"
                        name="Address"
                        value={form.Address}
                        onChange={handleChange}
                        placeholder="Address"
                        style={{
                            padding: '8px',
                            marginBottom: '10px',
                            width: '200px'
                        }}
                    />
                </div>
                <div>
                    <input 
                        type="tel"
                        name="Tel"
                        value={form.Tel}
                        onChange={handleChange}
                        placeholder="Telephone (10 digits)"
                        pattern="[0-9]{10}"
                        style={{
                            padding: '8px',
                            marginBottom: '10px',
                            width: '200px'
                        }}
                    />
                </div>
                <div>
                    <input 
                        type="tel"
                        name="Mob"
                        value={form.Mob}
                        onChange={handleChange}
                        placeholder="Mobile (11 digits)"
                        pattern="[0-9]{11}"
                        style={{
                            padding: '8px',
                            marginBottom: '10px',
                            width: '200px'
                        }}
                    />
                </div>
                <div>
                    <input 
                        type="email"
                        name="Email"
                        value={form.Email}
                        onChange={handleChange}
                        placeholder="Email"
                        style={{
                            padding: '8px',
                            marginBottom: '10px',
                            width: '200px'
                        }}
                    />
                </div>
                <button 
                    type="submit"
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Add {form.AcctType}
                </button>
            </form>
        </div>
    );
};

export default AccountForm;



