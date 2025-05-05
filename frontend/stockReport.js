import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBoxes, FaArrowLeft, FaPrint, FaFileExport } from 'react-icons/fa';

const StockReport = () => {
  const location = useLocation();
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const compID = sessionStorage.getItem('CompID');

  const fetchStockReport = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = 'http://localhost:5000/api/product/complete-stock-report';
      const requestBody = { CompID: compID };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(requestBody)
      });

      const responseText = await response.text();
      console.log('Response text:', responseText);
      if (responseText.startsWith('<!DOCTYPE html>')) {
        const errorMessage = response.status === 404
          ? 'Stock report endpoint not found'
          : `Server error (${response.status})`;
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Invalid server response format');
      }

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      if (!Array.isArray(data)) {
        console.error('Invalid data format:', data);
        throw new Error('Received invalid stock data format from server');
      }

      const validatedData = data.map(item => ({
        PrdName: item.PrdName || 'Unknown Product',
        TotalStock: parseInt(item.TotalStock) || 0
      }));

      setStockData(validatedData);
      setRetryCount(0);
    } catch (err) {
      console.error('Failed to fetch stock report:', err);
      setError(err.message || 'Failed to load stock data');
      setRetryCount(prev => prev + 1);
      if (retryCount < 3) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 8000);
        setTimeout(fetchStockReport, delay);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockReport();
  }, [compID, location.search]);

  const totalItems = stockData.reduce((sum, item) => sum + item.TotalStock, 0);

  const navigate = useNavigate();
  
  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    if (!stockData.length) return;
    
    const headers = ['Product', 'Total Stock'];
    const csvRows = [
      headers.join(','),
      ...stockData.map(item => [
        item.PrdName,
        item.TotalStock
      ].join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `stock_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
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
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '25px'
        }}>
          <h2 style={{ 
            fontSize: '1.5em',
            fontWeight: '600',
            color: '#ffffff',
            margin: 0
          }}>
            Total Stock by Product
          </h2>
          
          <div style={{ display: 'flex', gap: '10px' }}>
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

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Loading stock data...</p>
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
              marginBottom: '30px'
            }}>
              <SummaryCard
                icon={<FaBoxes size={24} />}
                title="Total Items in Stock"
                value={totalItems.toLocaleString()}
                color="#4CAF50"
              />
            </div>

            {stockData.length > 0 ? (
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
                      <th style={{ padding: '12px' }}>Product</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Total Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockData.map((item, index) => (
                      <tr key={`${item.PrdName}-${index}`} style={{ 
                        borderBottom: '1px solid rgba(255,255,255,0.05)'
                      }}>
                        <td style={{ padding: '12px' }}>{item.PrdName}</td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          {item.TotalStock.toLocaleString()}
                        </td>
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
                No stock data available
              </div>
            )}
          </>
        )}
      </motion.div>

      <style jsx global>{`
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

const SummaryCard = ({ icon, title, value, color }) => (
  <div style={{
    backgroundColor: '#1E1E1E',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    textAlign: 'center',
    borderLeft: `4px solid ${color}`
  }}>
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px', color }}>
      {icon}
    </div>
    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#e0e0e0' }}>{title}</h3>
    <p style={{ margin: 0, fontSize: '24px', color, fontWeight: 'bold' }}>{value}</p>
  </div>
);

const tableStyles = {
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
    backgroundColor: '#1E1E1E',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  headerRow: {
    backgroundColor: '#2C2C2C',
    position: 'sticky',
    top: 0,
    zIndex: 10
  },
  headerCell: {
    padding: '12px 15px',
    borderBottom: '1px solid #3E3E3E',
    fontWeight: 600,
    color: '#FFFFFF'
  },
  row: {
    borderBottom: '1px solid #3E3E3E',
    '&:hover': {
      backgroundColor: '#2C2C2C'
    }
  },
  cell: {
    padding: '12px 15px',
    color: '#E0E0E0',
    verticalAlign: 'middle'
  }
};

export default StockReport;