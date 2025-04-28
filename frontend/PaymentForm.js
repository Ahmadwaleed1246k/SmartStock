import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaMoneyBillWave, FaCheckCircle } from 'react-icons/fa';
import Select from 'react-select';

const PaymentForm = () => {
  const [voucherNo, setVoucherNo] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [paymentType, setPaymentType] = useState('Received');
  const [amount, setAmount] = useState(0);
  const [outstandingBalance, setOutstandingBalance] = useState(0);
  const [reference, setReference] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [voucherDate, setVoucherDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const compID = sessionStorage.getItem('CompID');
        if (!compID) return;

        // Get next voucher number
        const voucherRes = await fetch('http://localhost:5000/api/payment/get-next-voucher', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ compID })
        });
        const voucherData = await voucherRes.json();
        setVoucherNo(voucherData.nextVoucherNo);

        // Fetch accounts (suppliers and customers)
        const accountsRes = await fetch('http://localhost:5000/api/account/get-payment-accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ compID })
        });
        const accountsData = await accountsRes.json();
        setAccounts(accountsData);

        // Fetch payment methods
        const cashBankRes = await fetch('http://localhost:5000/api/account/get-cash-bank', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ compID })
          });
        const cashBankData = await cashBankRes.json();
        setPaymentMethods(cashBankData);

      } catch (error) {
        console.error('Error initializing form:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleAccountChange = async (selectedOption) => {
    const accountId = selectedOption.value;
    const selected = accounts.find(a => a.AcctID === accountId);
    setSelectedAccount(selected);
    
    if (accountId) {
      try {
        const compID = sessionStorage.getItem('CompID');
        const response = await fetch('http://localhost:5000/api/account/get-outstanding-balance', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Add if using auth
          },
          body: JSON.stringify({ 
            AcctID: accountId, 
            compID: parseInt(compID) // Ensure compID is a number
          })
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const balanceData = await response.json();
        if (balanceData.success) {
          setOutstandingBalance(balanceData.balance || 0);
        } else {
          console.error('Failed to get balance:', balanceData.message);
          setOutstandingBalance(0);
        }
      } catch (error) {
        console.error('Error fetching outstanding balance:', error);
        setOutstandingBalance(0);
      }
    }
  };

  const handlePaymentTypeChange = (e) => {
    setPaymentType(e.target.value);
    setSelectedAccount(null);
  };

  const handleSubmit = async () => {
    if (!selectedAccount || !selectedMethod || amount <= 0) {
      alert('Please fill all required fields with valid values');
      return;
    }

    try {
      const compID = sessionStorage.getItem('CompID');
      const paymentData = {
        compID,
        AcctID: selectedAccount.AcctID,
        PaymentType: paymentType,
        Amount: amount,
        PaymentMethodID: selectedMethod.value,
        VoucherNo: voucherNo,
        Reference: reference,
        TransactionReference: transactionRef,
        VoucherDate: voucherDate
      };

      const response = await fetch('http://localhost:5000/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Payment successful:', data);
        navigate('/dashboard');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment submission error:', error);
      alert(`Payment failed: ${error.message}`);
    }
  };

  // Format options for react-select
  const accountOptions = accounts
    .filter(account => (paymentType === 'Received' ? account.AcctType === 'Customer' : account.AcctType === 'Supplier'))
    .map(account => ({
      value: account.AcctID,
      label: `${account.AcctName} (${account.AcctType})`
    }));

  const methodOptions = paymentMethods.map(method => ({
    value: method.AcctID,
    label: method.AcctName
  }));

  // Custom styles for react-select components
  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '6px',
      minHeight: '40px',
      color: '#ffffff',
    }),
    input: (provided) => ({
      ...provided,
      color: '#ffffff',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#ffffff',
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: 'rgba(15, 30, 45, 0.95)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? 'rgba(79, 172, 254, 0.5)' : 'transparent',
      color: state.isFocused ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: 'rgba(255, 255, 255, 0.5)',
    }),
  };

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
      minHeight: '100vh',
      padding: '30px',
      color: '#e0e0e0'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 50%, rgba(33, 150, 243, 0.1) 0%, transparent 50%)',
        zIndex: 0
      }}></div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '25px',
          backgroundColor: 'rgba(15, 30, 45, 0.8)',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative',
          zIndex: 1
        }}
      >
        <h2 style={{ 
          marginBottom: '25px',
          fontSize: '1.5em',
          fontWeight: '600',
          color: '#ffffff',
          textAlign: 'center'
        }}>
          Payment Voucher
        </h2>

        {/* Header Fields */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '30px',
          alignItems: 'end'
        }}>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.9em'
            }}>
              Voucher No.
            </label>
            <input
              type="text"
              value={voucherNo}
              readOnly
              style={{
                width: '80%',
                padding: '10px 12px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '0.9em'
              }}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.9em'
            }}>
              Date
            </label>
            <input
              type="date"
              value={voucherDate}
              onChange={(e) => setVoucherDate(e.target.value)}
              style={{
                width: '80%',
                padding: '10px 12px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '0.9em'
              }}
            />
          </div>
        </div>

        {/* Payment Details */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '30px',
          alignItems: 'end'
        }}>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.9em'
            }}>
              Payment Type
            </label>
            <select
              value={paymentType}
              onChange={handlePaymentTypeChange}
              style={{
                width: '80%',
                padding: '10px 12px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '0.9em'
              }}
            >
              <option value="Received" style={{ color: 'rgba(0, 0, 0, 0.8)' }}>Received (From Customer)</option>
              <option value="Paid" style={{ color: 'rgba(0, 0, 0, 0.8)' }}>Paid (To Supplier)</option>
            </select>
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.9em'
            }}>
              {paymentType === 'Received' ? 'Customer' : 'Supplier'}
            </label>
            <Select
              options={accountOptions}
              onChange={handleAccountChange}
              value={selectedAccount ? accountOptions.find(option => option.value === selectedAccount.AcctID) : null}
              placeholder={`Select ${paymentType === 'Received' ? 'Customer' : 'Supplier'}`}
              styles={customSelectStyles}
              isSearchable
            />
          </div>
        </div>

        {selectedAccount && (
          <div style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Account:</span>
              <span>{selectedAccount.AcctName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Type:</span>
              <span>{selectedAccount.AcctType}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {paymentType === 'Received' ? 'Amount Receivable' : 'Amount Payable'}:
              </span>
              <span style={{ 
                color: outstandingBalance >= 0 ? '#4fdc4f' : '#ff6b6b',
                fontWeight: '500'
              }}>
                {outstandingBalance.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '30px',
          alignItems: 'end'
        }}>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.9em'
            }}>
              Payment Method
            </label>
            <Select
              options={methodOptions}
              onChange={setSelectedMethod}
              value={methodOptions.find(option => option.value === selectedMethod?.value)}
              placeholder="Select Payment Method"
              styles={customSelectStyles}
              isSearchable
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.9em'
            }}>
              Amount
            </label>
            <input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              min="0.01"
              step="0.01"
              style={{
                width: '80%',
                padding: '10px 12px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '0.9em'
              }}
            />
          </div>
        </div>

        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '30px',
          alignItems: 'end'
        }}>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.9em'
            }}>
              Reference
            </label>
            <input 
              type="text" 
              value={reference} 
              onChange={(e) => setReference(e.target.value)}
              placeholder="Payment purpose/note"
              style={{
                width: '80%',
                padding: '10px 12px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '0.9em'
              }}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.9em'
            }}>
              Transaction Reference
            </label>
            <input 
              type="text" 
              value={transactionRef} 
              onChange={(e) => setTransactionRef(e.target.value)}
              placeholder="Cheque/Transaction ID"
              style={{
                width: '80%',
                padding: '10px 12px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '0.9em'
              }}
            />
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <motion.button
            onClick={handleSubmit}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={!selectedAccount || !selectedMethod || amount <= 0}
            style={{
              padding: '12px 30px',
              backgroundColor: !selectedAccount || !selectedMethod || amount <= 0
                ? 'rgba(0, 200, 150, 0.4)'
                : 'rgba(0, 200, 150, 0.8)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: !selectedAccount || !selectedMethod || amount <= 0
                ? 'not-allowed'
                : 'pointer',
              fontWeight: '500',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '1em'
            }}
          >
            <FaMoneyBillWave /> {paymentType === 'Received' ? 'Receive Payment' : 'Make Payment'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentForm;
