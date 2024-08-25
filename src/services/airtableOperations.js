import { projectsTable, categoriesTable } from './airtableClient';

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
  const API_KEY = process.env.REACT_APP_AIRTABLE_TOKEN; // Ensure you have your API key set in your environment variables
  const AIRTABLE_BASE_URL = 'https://api.airtable.com/v0/appZWDvjvDmVnOici'; // Use your actual base ID
  const tableName = 'tblcXnFAf0IEvAQA6'; // Replace with your actual table name or ID
  const url = `${AIRTABLE_BASE_URL}/${tableName}/${recordId}`;

  const requestBody = {
    fields: {
      owner_project: labelInfo.ownerProject,  // Ensure these match your Airtable field names
      usage_category: labelInfo.usageCategory,
      contract_name: labelInfo.contractName,
      labelling_type: "info@orbal-analytics.com" // This field is always set to "orbal"
    },
    typecast: true // Enable automatic data conversion
  };

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
      // Capture detailed error response from Airtable
      const errorDetails = await response.json();
      console.error('Error details:', errorDetails);
      throw new Error('Failed to update Airtable record');
    }

    const data = await response.json();
    console.log('Record updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Error updating Airtable record:', error);
  }
};


