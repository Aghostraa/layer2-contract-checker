import React, { useEffect, useState } from 'react';
import base from './airtableClient';

const ExampleComponent = () => {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    base('Table Name').select({}).firstPage((err, records) => {
      if (err) {
        console.error(err);
        return;
      }
      setRecords(records);
    });
  }, []);

  return (
    <div>
      <h1>Records from Airtable</h1>
      <ul>
        {records.map(record => (
          <li key={record.id}>{record.fields.Name}</li> // Adjust according to your table structure
        ))}
      </ul>
    </div>
  );
};

export default ExampleComponent;
