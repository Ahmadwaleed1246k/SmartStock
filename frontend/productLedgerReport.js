import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaFilter, FaPrint, FaFileExport, FaSearch } from 'react-icons/fa';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ProductLedgerReport = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openingStock, setOpeningStock] = useState(0);
  const [closingStock, setClosingStock] = useState(0);
  const [ledgerData, setLedgerData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      fetchProductLedger();
    }
  }, [startDate, endDate, selectedProduct]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const compID = sessionStorage.getItem('CompID');
      if (!compID) {
        navigate('/');
        return;
      }

      const response = await fetch('http://localhost:5000/api/product/get-products-by-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ compID })
      });

      if (!response.ok) throw new Error('Failed to fetch products');
      
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProductLedger = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const compID = sessionStorage.getItem('CompID');
      if (!compID) {
        navigate('/');
        return;
      }

      const response = await fetch('http://localhost:5000/api/product/get-product-ledger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          PrdID: selectedProduct.PrdID,
          CompID: compID,
          StartDate: startDate.toISOString().split('T')[0],
          EndDate: endDate.toISOString().split('T')[0]
        })
      });

      if (!response.ok) throw new Error('Failed to fetch product ledger');
      const data = await response.json();
      console.log(data);
      setOpeningStock(data.openingStock || 0);
      setLedgerData(data.transactions || []);
      setClosingStock(data.transactions[data.transactions.length - 1]?.Balance || 0);
    } catch (error) {
      console.error('Error fetching product ledger:', error);
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
    
    const headers = ['Date', 'Type', 'Voucher No', 'QtyIn', 'QtyOut', 'Rate', 'Amount', 'Balance', 'Party'];
    const csvRows = [
      headers.join(','),
      ...ledgerData.map(item => 
        [
          item.Date,
          item.Type,
          item.VoucherNo,
          item.QtyIn || 0,
          item.QtyOut || 0,
          item.UnitRate || 0,
          item.TotalAmount || 0,
          item.RunningBalance || 0,
          item.Party || ''
        ].join(',')
      )
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `product_ledger_${selectedProduct.PrdName}_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.csv`);
    link.click();
  };

  const filteredProducts = products.filter(product => 
    product.PrdName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.PrdCode.toLowerCase().includes(searchTerm.toLowerCase())
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
          Product Ledger Report
        </h2>

        {/* Product Selection */}
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
              Search Product
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or code..."
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
              Select Product
            </label>
            <Select
              options={filteredProducts.map(product => ({
                value: product.PrdID,
                label: `${product.PrdCode} - ${product.PrdName}`
              }))}
              onChange={(selected) => {
                const product = products.find(p => p.PrdID === selected.value);
                setSelectedProduct(product);
              }}
              placeholder="Select a product..."
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

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <motion.button
              onClick={fetchProductLedger}
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
            <p>Loading product ledger...</p>
          </div>
        ) : selectedProduct ? (
          <>
            <div style={{ 
              backgroundColor: 'rgba(79, 172, 254, 0.1)',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid rgba(79, 172, 254, 0.3)'
            }}>
              <h3 style={{ 
                margin: '0 0 10px 0',
                color: '#4facfe',
                fontSize: '1.1em'
              }}>
                {selectedProduct.PrdName} ({selectedProduct.PrdCode})
              </h3>
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '10px',
                fontSize: '0.9em'
              }}>
                <div>
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Purchase Price:</span> 
                  <span style={{ marginLeft: '8px' }}>{selectedProduct.PurchasePrice?.toFixed(2)}</span>
                </div>
                <div>
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Sale Price:</span> 
                  <span style={{ marginLeft: '8px' }}>{selectedProduct.SalePrice?.toFixed(2)}</span>
                </div>
                <div>
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Restock Level:</span> 
                  <span style={{ marginLeft: '8px' }}>{selectedProduct.RestockLevel}</span>
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
                      <th style={{ padding: '12px', textAlign: 'right', width: '80px' }}>QtyIn</th>
        
                      <th style={{ padding: '12px', textAlign: 'right', width: '80px' }}>QtyOut</th>
                      <th style={{ padding: '12px', textAlign: 'right', width: '80px' }}>Rate</th>
                      <th style={{ padding: '12px', textAlign: 'right', width: '100px' }}>Amount</th>
                      <th style={{ padding: '12px', textAlign: 'right', width: '100px' }}>Balance</th>
                      <th style={{ padding: '12px' }}>Party</th>
                    </tr>
                  </thead>
                  <tbody>
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
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          {item.QtyIn}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          {item.QtyOut}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          {item.UnitRate ? item.UnitRate.toFixed(2) : '-'}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          {item.TotalAmount ? item.TotalAmount.toFixed(2) : '-'}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          {item.RunningBalance ? item.RunningBalance.toFixed(2) : '-'}
                        </td>
                        <td style={{ padding: '12px' }}>{item.Party || '-'}</td>
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
                No ledger entries found for the selected product and date range
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
            {products.length > 0 
              ? 'Please select a product to view its ledger'
              : 'No products found'}
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

export default ProductLedgerReport;