import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { color, motion } from 'framer-motion';
import { FaArrowLeft, FaFilter, FaPrint, FaFileExport, FaSearch } from 'react-icons/fa';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AccountLedgerReport = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [ledgerData, setLedgerData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [openingBalance, setOpeningBalance] = useState(0);
  const [closingBalance, setClosingBalance] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      fetchAccountLedger();
    }
  }, [startDate, endDate, selectedAccount]);

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const compID = sessionStorage.getItem('CompID');
      if (!compID) {
        navigate('/');
        return;
      }

      const response = await fetch('http://localhost:5000/api/account/get-all-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ compID })
      });

      if (!response.ok) throw new Error('Failed to fetch accounts');
      
      const data = await response.json();
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAccountLedger = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const compID = sessionStorage.getItem('CompID');
      if (!compID) {
        navigate('/');
        return;
      }

      // Fix the date formatting to ensure correct date
      const formatDate = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const response = await fetch('http://localhost:5000/api/account/get-account-ledger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          AcctID: selectedAccount.AcctID,
          CompID: compID,
          StartDate: formatDate(startDate),
          EndDate: formatDate(endDate)
        })
      });

      if (!response.ok) throw new Error('Failed to fetch account ledger');
      
      const data = await response.json();
      console.log(data);
      console.log(data.transactions);
      setLedgerData(data.transactions);
      setOpeningBalance(data.openingBalance);
      setClosingBalance(data.transactions[ledgerData.length - 1]?.Balance || 0);
    } catch (error) {
      console.error('Error fetching account ledger:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    if (!ledgerData.length) return;
    
    const headers = ['Date', 'Type', 'Voucher No', 'Account', 'Credit', 'Debit', 'Balance'];
    const csvRows = [
      headers.join(','),
      ...ledgerData.map(item => 
        [
          item.Date,
          item.Type,
          item.VoucherNo,
          item.counterAccount || '',
          item.Credit,
          item.Debit,
          item.Balance
        ].join(',')
      )
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `account_ledger_${selectedAccount.AcctName}_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.csv`);
    link.click();
  };

  const filteredAccounts = accounts.filter(account => 
    account.AcctName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      case 'Purchase': return '#4facfe';
      case 'Sale': return '#66bb6a';
      case 'Payment': return '#ff9800';
      default: return '#ffffff';
    }
  };

  const calculateRunningBalance = () => {
    let balance = parseFloat(openingBalance) || 0;
    return ledgerData.map(item => {
      if (selectedAccount.AcctType === 'Supplier') {
        if (item.Type === 'Purchase') {
          balance += parseFloat(item.Amount || 0);
        } else if (item.Type === 'Payment') {
          balance -= parseFloat(item.Amount || 0);
        }
      } else { // Customer
        if (item.Type === 'Sale') {
          balance += parseFloat(item.Amount || 0);
        } else if (item.Type === 'Payment') {
          balance -= parseFloat(item.Amount || 0);
        }
      }
      return { ...item, Balance: balance.toFixed(2) };
    });
  };

  const ledgerWithBalance = calculateRunningBalance();

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
          Account Ledger Report
        </h2>

        {/* Account Selection */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '20px'
        }}>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.9em'
            }}>
              Search Account
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by account name..."
                style={{
                  width: '80%',
                  padding: '10px 12px 10px 35px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '0.9em'
                }}
              />
              <FaSearch style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgba(255, 255, 255, 0.5)'
              }} />
            </div>
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.9em'
            }}>
              Select Account
            </label>
            <Select
              options={filteredAccounts.map(account => ({
                value: account.AcctID,
                label: `${account.AcctName} (${account.AcctType})`
              }))}
              onChange={(selected) => {
                const account = accounts.find(a => a.AcctID === selected.value);
                setSelectedAccount(account);
              }}
              placeholder="Select an account..."
              styles={customSelectStyles}
              isSearchable={false}
            />
          </div>
        </div>

        {/* Date Range Controls */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
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
              style={{
                color: 'white',
              }}
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
              style={{
                color: '#ffffff',
              }}
              dateFormat="yyyy-MM-dd"
              className="custom-datepicker"
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <motion.button
              onClick={() => {
                fetchAccountLedger();
              }}
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
            <p>Loading account ledger...</p>
          </div>
        ) : selectedAccount ? (
          <>
            <div style={{ 
              backgroundColor: 'rgba(79, 172, 254, 0.1)',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid rgba(79, 172, 254, 0.3)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '20px'
            }}>
              <div>
                <h3 style={{ 
                  margin: '0 0 10px 0',
                  color: '#4facfe',
                  fontSize: '1.1em'
                }}>
                  {selectedAccount.AcctName} ({selectedAccount.AcctType})
                </h3>
                <div style={{ fontSize: '0.9em' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Account ID: </span>
                  <span>{selectedAccount.AcctID}</span>
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9em' }}>Opening Balance</div>
                <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>
                  {openingBalance.toFixed(2)}
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9em' }}>Closing Balance</div>
                <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>
                  {closingBalance.toFixed(2)}
                </div>
              </div>
            </div>

            {ledgerData.length > 0 ? (
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
                      <th style={{ padding: '12px', textAlign: 'right', width: '80px' }}>Credit</th>
                      <th style={{ padding: '12px', textAlign: 'right', width: '100px' }}>Debit</th>
                      <th style={{ padding: '12px', textAlign: 'right', width: '100px' }}>Balance</th>

                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px' }} colSpan="6">Opening Balance</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        {openingBalance.toFixed(2)}
                      </td>
                      <td style={{ padding: '12px' }}></td>
                    </tr>
                    
                    {ledgerData.map((item, index) => (
                      <tr key={index} style={{ 
                        borderBottom: '1px solid rgba(255,255,255,0.05)'
                      }}>
                        <td style={{ padding: '12px' }}>{item.Date}</td>
                        <td style={{ 
                          padding: '12px',
                          color: getTypeColor(item.Type)
                        }}>
                          {item.Type}
                        </td>
                        <td style={{ padding: '12px' }}>{item.VoucherNo}</td>
                        <td style={{ padding: '12px' }}>{item.Account || '-'}</td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          {item.Credit || '-'}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          {item.Debit || '-'}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          {item.Balance}
                        </td>
                      </tr>
                    ))}

                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px' }} colSpan="6">Closing Balance</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        {closingBalance.toFixed(2)}
                      </td>
                      <td style={{ padding: '12px' }}></td>
                    </tr>
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
                No ledger entries found for the selected account and date range
              </div>
            )}
          </>
        ) : (
          <div style={{ 
            padding: '40px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '8px',
            textAlign: 'center',
            color: 'rgba(255,255,255,0.5)'
          }}>
            {accounts.length > 0 
              ? 'Please select an account to view its ledger'
              : 'No accounts found'}
          </div>
        )}
      </motion.div>

      <style jsx global>{`
        .custom-datepicker {
          width: 100%;
          padding: 10px 12px;
          background-color: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          borderRadius: '6px',
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

export default AccountLedgerReport;
