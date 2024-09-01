// src/services/airtableApi.js
const AIRTABLE_BASE_URL = 'https://api.airtable.com/v0/appZWDvjvDmVnOici/tblcXnFAf0IEvAQA6'; // Updated to API endpoint
const API_KEY = process.env.REACT_APP_AIRTABLE_TOKEN;

const chainIdToOriginKey = {
  "10": "optimism",
  "1101": "polygon_zkevm",
  "34443": "mode",
  "42161": "arbitrum",
  "534352": "scroll",
  "7777777": "zora",
  "8453": "base",
  "324": "zksync_era"
};

export const fetchAirtableDataWithChainId = async (chainId) => {
  const originKey = chainIdToOriginKey[chainId];
  if (!originKey) {
    console.error(`Invalid Chain ID: ${chainId}`);
    throw new Error(`Invalid Chain ID: ${chainId}`);
  }

  const filterByFormula = `FIND("${originKey}", {origin_key})`;
  const url = `${AIRTABLE_BASE_URL}?filterByFormula=${encodeURIComponent(filterByFormula)}&view=viwFVTWjj0HBWnpiB&fields[]=address`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${API_KEY}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Airtable data');
  }

  const data = await response.json();
  console.log(`Number of records fetched for ${originKey}: ${data.records.length}`);

  return data.records.map(record => ({
    id: record.id,
    address: record.fields.address
  }));
};
