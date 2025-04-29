import React, { useState, useEffect } from 'react';
import ReportLayout from './ReportLayout';

const DayBookReport = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const compID = sessionStorage.getItem('CompID');

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const fetchData = async () => {
      try {
        // Build URL with query parameters
        const params = new URLSearchParams({
          CompID: compID,
          StartDate: query.get('start') || new Date().toISOString().split('T')[0],
          EndDate: query.get('end') || new Date().toISOString().split('T')[0]
        });

        const res = await fetch(`http://localhost:5000/api/daybook/get-daybook?${params.toString()}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!res.ok) {
          throw new Error(await res.text());
        }

        const data = await res.json();
        if (data.success) {
          setTransactions(data.data || []);
          setError(null);
        } else {
          throw new Error(data.message || 'Failed to load daybook');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message || 'Failed to load daybook');
      } finally {
        setLoading(false);
      }
    };
    
    if (compID) {
      fetchData();
    } else {
      setError('Company ID not found');
      setLoading(false);
    }
  }, [compID]);

  if (loading) return <ReportLayout title="Day Book">Loading...</ReportLayout>;
  if (error) return <ReportLayout title="Day Book"><div style={{ color: 'red' }}>Error: {error}</div></ReportLayout>;

  return (
    <ReportLayout title="Day Book" showDateRange={true}>
      <div style={{ overflowX: 'auto' }}>
        {/* Your table rendering code here */}
      </div>
    </ReportLayout>
  );
};

export default DayBookReport;