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