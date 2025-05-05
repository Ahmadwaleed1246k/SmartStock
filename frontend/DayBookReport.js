import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaFilter, FaPrint, FaFileExport } from 'react-icons/fa';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DaybookReport = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'payment', 'sale', 'purchase'
  const navigate = useNavigate();

  useEffect(() => {
    fetchDaybookData();
  }, [startDate, endDate, filterType]);

  const fetchDaybookData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const compID = sessionStorage.getItem('CompID');
      if (!compID) {
        navigate('/');
        return;
      }

      const response = await fetch('http://localhost:5000/api/daybook/get-daybook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          compID,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          filterType
        })
      });

      if (!response.ok) throw new Error('Failed to fetch daybook data');
      
      const data = await response.json();
      console.log('Daybook data:', data);
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching daybook data:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // Basic CSV export functionality
    const headers = ['Date', 'Type', 'Voucher No', 'Account', 'Debit', 'Credit', 'Description'];
    const csvRows = [
      headers.join(','),
      ...transactions.map(t => 
        [
          t.date,
          t.type,
          t.voucherNo,
          t.accountName,
          t.debit || 0,
          t.credit || 0,
          t.description || ''
        ].join(',')
      )
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `daybook_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.csv`);
    link.click();
  };

  const filterOptions = [
    { value: 'all', label: 'All Transactions' },
    { value: 'paid', label: 'Payments Only' },
    {value: 'received', label: 'Receipts Only'},
    { value: 'sale', label: 'Sales Only' },
    { value: 'purchase', label: 'Purchases Only' }
  ];

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

  const getTypeColor = (type) => {
    switch(type) {
      case 'Payment': return '#4facfe';
      case 'Sale': return '#66bb6a';
      case 'Purchase': return '#ff7043';
      default: return '#ffffff';
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
      {/* Animated Background Elements */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 50%, rgba(33, 150, 243, 0.1) 0%, transparent 50%)',
        zIndex: 0
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
            marginTop: '20px',
            marginLeft: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FaArrowLeft /> Back to Dashboard
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '25px',
          backgroundColor: 'rgba(15, 30, 45, 0.8)',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative',
          zIndex: 1,
          marginTop: '50px'
        }}
      >
        <h2 style={{ 
          marginBottom: '25px',
          fontSize: '1.5em',
          fontWeight: '600',
          color: '#ffffff',
          textAlign: 'center'
        }}>
          Daybook Report
        </h2>

        {/* Filter Controls */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr',
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
              From Date
            </label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              dateFormat="yyyy-MM-dd"
              className="custom-datepicker"
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.9em'
            }}>
              To Date
            </label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              dateFormat="yyyy-MM-dd"
              className="custom-datepicker"
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.9em'
            }}>
              Transaction Type
            </label>
            <Select
              options={filterOptions}
              onChange={(selected) => setFilterType(selected.value)}
              value={filterOptions.find(option => option.value === filterType)}
              placeholder="Filter by type"
              styles={customSelectStyles}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <motion.button
              onClick={fetchDaybookData}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '10px 15px',
                backgroundColor: 'rgba(79, 172, 254, 0.8)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.9em'
              }}
            >
              <FaFilter /> Apply
            </motion.button>

            <motion.button
              onClick={handlePrint}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '10px 15px',
                backgroundColor: 'rgba(255, 193, 7, 0.8)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.9em'
              }}
            >
              <FaPrint /> Print
            </motion.button>

            <motion.button
              onClick={handleExport}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '10px 15px',
                backgroundColor: 'rgba(76, 175, 80, 0.8)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.9em'
              }}
            >
              <FaFileExport /> Export
            </motion.button>
          </div>
        </div>

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

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Loading transactions...</p>
          </div>
        ) : transactions.length > 0 ? (
          <div style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <table style={{ 
              width: '100%',
              borderCollapse: 'collapse',
              color: 'rgba(255,255,255,0.9)',
              fontSize: '0.9em'
            }}>
              <thead>
                <tr style={{ 
                  backgroundColor: 'rgba(79, 172, 254, 0.2)',
                  textAlign: 'left'
                }}>
                  <th style={{ padding: '12px', width: '100px' }}>Date</th>
                  <th style={{ padding: '12px', width: '100px' }}>Type</th>
                  <th style={{ padding: '12px', width: '80px' }}>Voucher No</th>
                  <th style={{ padding: '12px' }}>Account</th>
                  <th style={{ padding: '12px', textAlign: 'right', width: '100px' }}>Debit</th>
                  <th style={{ padding: '12px', textAlign: 'right', width: '100px' }}>Credit</th>
                  <th style={{ padding: '12px' }}>Description</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction, index) => (
                  <tr key={index} style={{ 
                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <td style={{ padding: '12px' }}>{transaction.date}</td>
                    <td style={{ padding: '12px', color: getTypeColor(transaction.type) }}>
                      {transaction.type}
                    </td>
                    <td style={{ padding: '12px' }}>{transaction.VoucherNo}</td>
                    <td style={{ padding: '12px' }}>{transaction.accountName}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      {transaction.Debit ? transaction.Debit.toFixed(2) : '-'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      {transaction.Credit ? transaction.Credit.toFixed(2) : '-'}
                    </td>
                    <td style={{ padding: '12px' }}>{transaction.description || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ 
            padding: '40px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '8px',
            textAlign: 'center',
            color: 'rgba(255,255,255,0.5)'
          }}>
            No transactions found for the selected period
          </div>
        )}
      </motion.div>

      <style jsx global>{`
        .custom-datepicker {
          width: 100%;
          padding: 10px 12px;
          background-color: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          color: #ffffff;
          font-size: 0.9em;
        }
        
        .react-datepicker {
          background-color: rgba(15, 30, 45, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #ffffff;
        }
        
        .react-datepicker__header {
          background-color: rgba(79, 172, 254, 0.2);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .react-datepicker__current-month,
        .react-datepicker__day-name,
        .react-datepicker__day {
          color: #ffffff;
        }
        
        .react-datepicker__day:hover {
          background-color: rgba(79, 172, 254, 0.5);
        }
        
        .react-datepicker__day--selected {
          background-color: #4facfe;
        }
        
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DaybookReport;
