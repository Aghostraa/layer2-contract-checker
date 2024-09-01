import React, { useState } from 'react';
import { fetchAirtableData } from './services/airtableApi';

const AirtableTest = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFetchData = async () => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const records = await fetchAirtableData();
      setData(records);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="airtable-test-container">
      <button onClick={handleFetchData} className="btn btn-primary">Fetch Airtable Data</button>
      {loading && <p>Loading...</p>}
      {error && <p className="error">Error: {error}</p>}
      {data && (
        <div className="data-container">
          <h3>Fetched Data:</h3>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default AirtableTest;
