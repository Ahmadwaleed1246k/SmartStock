import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ReportLayout = ({ 
  title, 
  children, 
  loading, 
  error, 
  emptyMessage = "No data available",
  onRetry,
  showDateRange = true
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  
  const [dateRange, setDateRange] = useState({
    start: query.get('start') || new Date().toISOString().split('T')[0],
    end: query.get('end') || new Date().toISOString().split('T')[0]
  });

  const handleDateChange = (type, value) => {
    const newDateRange = {...dateRange, [type]: value};
    setDateRange(newDateRange);
    navigate(`?start=${newDateRange.start}&end=${newDateRange.end}`);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <p>Loading {title.toLowerCase()}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <h2>Error Loading Report</h2>
        <p>{error.message || error}</p>
        <button onClick={onRetry} style={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>{title}</h2>
        
        {showDateRange && (
          <div style={styles.dateRangeContainer}>
            <input 
              type="date" 
              value={dateRange.start}
              onChange={(e) => handleDateChange('start', e.target.value)}
              style={styles.dateInput}
              max={dateRange.end}
            />
            <span style={styles.dateSeparator}>to</span>
            <input 
              type="date" 
              value={dateRange.end}
              onChange={(e) => handleDateChange('end', e.target.value)}
              style={styles.dateInput}
              min={dateRange.start}
            />
          </div>
        )}
      </div>

      {React.Children.count(children) === 0 ? (
        <div style={styles.emptyContainer}>
          <p>{emptyMessage}</p>
        </div>
      ) : (
        children
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    color: '#e0e0e0',
    fontFamily: "'Inter', sans-serif",
    backgroundColor: 'rgba(15, 30, 45, 0.5)',
    borderRadius: '8px',
    margin: '20px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '15px'
  },
  title: {
    background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: '700',
    margin: 0,
    fontSize: '1.5rem'
  },
  dateRangeContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'rgba(15, 30, 45, 0.8)',
    padding: '10px',
    borderRadius: '6px'
  },
  dateInput: {
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #2c5364',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    color: '#e0e0e0',
    fontSize: '0.9rem'
  },
  dateSeparator: {
    color: '#4facfe',
    fontWeight: '500'
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    color: '#e0e0e0',
    fontSize: '1.2rem'
  },
  errorContainer: {
    padding: '20px',
    color: '#ff6b6b',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: '8px',
    margin: '20px 0'
  },
  retryButton: {
    padding: '8px 16px',
    background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
    }
  },
  emptyContainer: {
    padding: '40px 20px',
    color: '#e0e0e0',
    textAlign: 'center',
    fontSize: '1.1rem',
    backgroundColor: 'rgba(15, 30, 45, 0.3)',
    borderRadius: '8px'
  }
};

export default ReportLayout;