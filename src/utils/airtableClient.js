import Airtable from 'airtable';

// Load environment variables
const apiKey = process.env.REACT_APP_AIRTABLE_API_KEY;
const baseId = process.env.REACT_APP_AIRTABLE_BASE_ID;

Airtable.configure({
  apiKey: apiKey,
});

const base = Airtable.base(baseId);

export default base;
