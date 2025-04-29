import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChartBar, FaBook, FaFileInvoiceDollar, FaCalendarDay } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Reports = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const reportTypes = [
    {
        title: 'Stock Report',
        description: 'Display entire stock grouped by products',
        icon: <FaChartBar size={40} color="#4facfe" />,
        onClick: () => navigate(`/reports/stock`)
      },
    {
      title: 'Product Ledger',
      description: 'Past purchases, sales and stock by product',
      icon: <FaBook size={40} color="#00f2fe" />,
      onClick: () => navigate('/reports/product-ledger')
    },
    {
      title: 'Account Ledger',
      description: 'Transactions with a supplier/customer',
      icon: <FaFileInvoiceDollar size={40} color="#4facfe" />,
      onClick: () => navigate('/reports/account-ledger')
    },
    {
      title: 'Day Book',
      description: 'Chronological record of all transactions',
      icon: <FaCalendarDay size={40} color="#00f2fe" />,
      onClick: () => navigate('/reports/day-book')
    }
  ];

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
      minHeight: '100vh',
      padding: '30px',
      color: '#e0e0e0'
    }}>
      {/* Header similar to Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          padding: '25px',
          backgroundColor: 'rgba(15, 30, 45, 0.8)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(8px)',
          marginBottom: '40px'
        }}
      >
        <h1 style={{ 
          background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: '700'
        }}>
          Reports Dashboard
        </h1>
      </motion.div>

      {/* Date Range Selector */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Select Date Range:</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="date" 
            value={dateRange.start}
            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
          />
          <input 
            type="date" 
            value={dateRange.end}
            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
          />
        </div>
      </div>

      {/* Report Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '25px'
      }}>
        {reportTypes.map((report, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.03 }}
            onClick={report.onClick}
            style={{
              padding: '25px',
              backgroundColor: 'rgba(15, 30, 45, 0.8)',
              borderRadius: '16px',
              cursor: 'pointer',
              textAlign: 'center'
            }}
          >
            <div style={{ marginBottom: '15px' }}>
              {report.icon}
            </div>
            <h3>{report.title}</h3>
            <p>{report.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Reports;