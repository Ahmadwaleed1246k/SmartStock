import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReportLayout from '../reportLayout';
import { FaBoxes } from 'react-icons/fa';

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

  return (
    <ReportLayout
      title="Total Stock by Product"
      loading={loading}
      error={error}
      emptyMessage={stockData.length === 0 && !loading ? "No stock data available" : null}
      onRetry={fetchStockReport}
      showDateRange={false}  // This will hide the date range
    >
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

      <div style={{ overflowX: 'auto', marginTop: '20px' }}>
        <table style={tableStyles.table}>
          <thead>
            <tr style={tableStyles.headerRow}>
              <th style={{ ...tableStyles.headerCell, textAlign: 'left' }}>Product</th>
              <th style={{ ...tableStyles.headerCell, textAlign: 'left' }}>Total Stock</th>
            </tr>
          </thead>
          <tbody>
            {stockData.length > 0 ? (
              stockData.map((item, index) => (
                <tr key={`${item.PrdName}-${index}`} style={tableStyles.row}>
                  <td style={{ ...tableStyles.cell, textAlign: 'left' }}>{item.PrdName}</td>
                  <td style={{ ...tableStyles.cell, textAlign: 'left', paddingLeft: '35px' }}>{item.TotalStock.toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" style={{ textAlign: 'center', padding: '20px', color: '#e0e0e0' }}>
                  {loading ? 'Loading...' : 'No stock data available'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </ReportLayout>
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