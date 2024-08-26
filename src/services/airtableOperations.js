import { projectsTable, categoriesTable } from './airtableClient';
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

export const fetchProjects = async () => {
  try {
    console.log('Fetching projects from Airtable...');
    const records = await projectsTable.select().all();
    console.log('Raw records from Airtable:', records);
    
    if (records.length === 0) {
      console.warn('No records found in the Airtable project table.');
    }
    
    const projects = records.map(record => {
      const name = record.get('Name');
      if (!name) {
        console.warn(`Record ${record.id} is missing a Name field.`);
      }
      return {
        id: record.id,
        name: name || 'Unnamed Project'
      };
    });
    
    console.log('Processed projects:', projects);
    return projects;
  } catch (error) {
    console.error('Error fetching projects:', error);
    if (error.message) {
      console.error('Error message:', error.message);
    }
    if (error.stack) {
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
};

export const fetchCategories = async () => {
  try {
    console.log('Fetching categories from Airtable...');
    const records = await categoriesTable.select().all();
    console.log('Raw records from Airtable:', records);
    
    if (records.length === 0) {
      console.warn('No records found in the Airtable category table.');
    }
    
    const categories = records.map(record => {
      const name = record.get('Category');
      if (!name) {
        console.warn(`Record ${record.id} is missing a Category field.`);
      }
      return {
        id: record.id,
        name: name || 'Unnamed Category'
      };
    });
    
    console.log('Processed categories:', categories);
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    if (error.message) {
      console.error('Error message:', error.message);
    }
    if (error.stack) {
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
};

export const updateAirtableRecord = async (recordId, labelInfo) => {
  const API_KEY = process.env.REACT_APP_AIRTABLE_TOKEN;
  const AIRTABLE_BASE_URL = 'https://api.airtable.com/v0/appZWDvjvDmVnOici'; // Replace with your base ID
  const tableName = 'tblcXnFAf0IEvAQA6'; // Replace with your table name or ID
  const url = `${AIRTABLE_BASE_URL}/${tableName}/${recordId}`;

  console.log('Updating Airtable record with ID:', recordId); // Log the record ID

  const requestBody = {
    fields: {
      owner_project: labelInfo.ownerProject,
      usage_category: labelInfo.usageCategory,
      contract_name: labelInfo.contractName,
      labelling_type: "info@orbal-analytics.com" // This field is always set to "orbal"
    },
    typecast: true // Enable automatic data conversion
  };

  console.log('Request Body:', requestBody); // Log the request body

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error('Failed to update Airtable record');
    }

    const data = await response.json();
    console.log('Record updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Error updating Airtable record:', error);
  }
};


export const fetchUnlabeledContracts = async (chainId) => {
  const originKey = chainIdToOriginKey[chainId];
  if (!originKey) {
    throw new Error('Invalid Chain ID');
  }

  const filterByFormula = `FIND("${originKey}", {origin_key})`;
  const url = `${AIRTABLE_BASE_URL}?filterByFormula=${encodeURIComponent(filterByFormula)}&view=viwFVTWjj0HBWnpiB&fields[]=address&fields[]=gas_eth&fields[]=txcount&fields[]=avg_daa`;

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
    address: record.fields.address,
    gas_eth: record.fields.gas_eth,
    txcount: record.fields.txcount,
    avg_daa: record.fields.avg_daa,
  }));
};

