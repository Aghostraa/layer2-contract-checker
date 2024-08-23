import Airtable from 'airtable';

const baseId = process.env.REACT_APP_AIRTABLE_BASE_ID;
const token = process.env.REACT_APP_AIRTABLE_TOKEN;

if (!baseId || !token) {
  throw new Error('Airtable Base ID and Token must be provided in environment variables');
}

Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: token  // Airtable library uses 'apiKey' but sends it as a bearer token
});

const base = Airtable.base(baseId);

export const projectsTable = base('tblZxky1IdnhEJEDv');
export const categoriesTable = base('tblNDOoyBfvtmAzEk');

export default base;