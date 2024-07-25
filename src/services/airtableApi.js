// src/services/airtableApi.js
const AIRTABLE_API_URL = 'https://api.airtable.com/v0/appZWDvjvDmVnOici/tblZxky1IdnhEJEDv';
const API_KEY = process.env.REACT_APP_AIRTABLE_API_KEY;

export const fetchAirtableData = async () => {
  const response = await fetch(`${AIRTABLE_API_URL}?view=viw8ydkpuAmi6TCr9`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Airtable data');
  }

  const data = await response.json();
  return data.records.map(record => record.fields);
};
