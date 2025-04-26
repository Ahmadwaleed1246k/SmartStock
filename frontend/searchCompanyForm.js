import { useState } from 'react';

const SearchCompanyForm = ({ onCompaniesFetched }) => {
  const [name, setName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/Company/get-company-by-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch companies');
      }

      const data = await response.json();
      onCompaniesFetched(data); // ✅ Update the list
    } catch (error) {
      console.error('❌ Error fetching companies:', error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter Company Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button type="submit">Search</button>
    </form>
  );
};

export default SearchCompanyForm;
