import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const ProductLedgerReport = () => {
  const { productId } = useParams();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const compID = sessionStorage.getItem('CompID');

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const fetchProductLedger = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/product/product-transaction-history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            PrdID: productId,
            CompID: compID,
            StartDate: query.get('start') || new Date().toISOString().split('T')[0],
            EndDate: query.get('end') || new Date().toISOString().split('T')[0]
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch product ledger');
        }

        const data = await response.json();
        setTransactions(data);
        setError(null);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message || 'Failed to load product ledger');
      } finally {
        setLoading(false);
      }
    };
    fetchProductLedger();
  }, [productId, compID, window.location.search]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        color: '#e0e0e0'
      }}>
        <p>Loading product ledger...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        color: '#ff6b6b',
        textAlign: 'center'
      }}>
        <h2>Error</h2>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '8px 16px',
            background: '#4facfe',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div style={{ padding: '20px', color: '#e0e0e0', textAlign: 'center' }}>
        <h2>Product Ledger</h2>
        <p>No transactions found for the selected period</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', color: '#e0e0e0' }}>
      <h2>Product Ledger</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          marginTop: '20px'
        }}>
          <thead>
            <tr style={{ 
              backgroundColor: 'rgba(15, 30, 45, 0.8)',
              position: 'sticky',
              top: 0
            }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Type</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Party</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Payment Method</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Quantity</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn, index) => (
              <tr 
                key={index} 
                style={{ 
                  borderBottom: '1px solid #2c5364',
                  ':hover': {
                    backgroundColor: 'rgba(79, 172, 254, 0.1)'
                  }
                }}
              >
                <td style={{ padding: '12px' }}>
                  {new Date(txn.Date).toLocaleDateString()}
                </td>
                <td style={{ 
                  padding: '12px',
                  color: txn.Type === 'Purchase' ? '#00f2fe' : '#4facfe'
                }}>
                  {txn.Type}
                </td>
                <td style={{ padding: '12px' }}>{txn.Party}</td>
                <td style={{ padding: '12px' }}>{txn.PaymentMethod}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  {txn.Quantity || 0}
                </td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  {(txn.TotalAmount || 0).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductLedgerReport;