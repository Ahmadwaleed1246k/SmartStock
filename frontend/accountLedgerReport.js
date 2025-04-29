import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReportLayout from '../reportLayout';
import { FaFileExport, FaSearch } from 'react-icons/fa';

const AccountLedgerReport = () => {
  const { accountId } = useParams();
  const [data, setData] = useState({ transactions: [], accountType: '' });
  const [loading, setLoading] = useState(true);
  const compID = sessionStorage.getItem('CompID');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/account/get-account-ledger', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            AcctID: accountId,
            CompID: compID,
            StartDate: query.get('start') || new Date().toISOString().split('T')[0],
            EndDate: query.get('end') || new Date().toISOString().split('T')[0]
          })
        });
        const result = await response.json();
        setData(result.data || { transactions: [], accountType: '' });
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [accountId, compID]);

  const filteredTransactions = data.transactions.filter(txn => 
    txn.Product?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    txn.Type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ReportLayout 
      title={`${data.accountType} Ledger`}
      loading={loading}
      showDateRange={true}
    >
      {/* Search and Export */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ position: 'relative' }}>
          <FaSearch style={{ position: 'absolute', left: '10px', top: '10px' }} />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '8px 8px 8px 30px', borderRadius: '4px', width: '300px' }}
          />
        </div>
        <button style={{ padding: '8px 16px', background: '#4facfe', color: 'white', border: 'none', borderRadius: '4px' }}>
          <FaFileExport /> Export
        </button>
      </div>

      {/* Transactions Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#0f1e2d', color: 'white' }}>
            <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Type</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Product</th>
            <th style={{ padding: '12px', textAlign: 'right' }}>Qty</th>
            <th style={{ padding: '12px', textAlign: 'right' }}>Amount</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Payment</th>
          </tr>
        </thead>
        <tbody>
          {filteredTransactions.map((txn, index) => (
            <tr key={index} style={{ borderBottom: '1px solid #2c5364' }}>
              <td style={{ padding: '12px' }}>{new Date(txn.Date).toLocaleDateString()}</td>
              <td style={{ padding: '12px', color: txn.Type === 'Purchase' ? '#00f2fe' : '#4facfe' }}>
                {txn.Type}
              </td>
              <td style={{ padding: '12px' }}>{txn.Product}</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>{txn.Quantity}</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>{txn.TotalAmount.toFixed(2)}</td>
              <td style={{ padding: '12px' }}>{txn.PaymentMethod || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ReportLayout>
  );
};

export default AccountLedgerReport;