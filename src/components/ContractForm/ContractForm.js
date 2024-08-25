import React, { useState } from 'react';
import { fetchAirtableDataWithChainId } from '../../services/airtableApi'; // Step 1: Import the function

const ContractForm = ({ onFormSubmit, onFetchFiles, }) => {
  const [chainId, setChainId] = useState('10');
  const [contractAddress, setContractAddress] = useState('');
  const [recordId, setRecordId] = useState(''); // Step 2: New state for record ID

  const handleSubmit = (e) => {
    e.preventDefault();
    onFormSubmit(chainId, contractAddress);
    fetchRecordId(); // Fetch record ID on form submit
  };

  const handleFetchFiles = () => {
    onFetchFiles(chainId, contractAddress);
  };

  // Step 3: Function to fetch record ID
  const fetchRecordId = async () => {
    try {
      // Pass chainId to the fetch function
      const records = await fetchAirtableDataWithChainId(chainId);
      const matchingRecord = records.find(record => record.address === contractAddress);
      if (matchingRecord) {
        setRecordId(matchingRecord.id);
      } else {
        setRecordId('No matching record found');
      }
    } catch (error) {
      console.error('Error fetching record ID:', error);
      setRecordId('Error fetching record ID');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="chainSelect">Select Layer 2 Network</label>
        <select
          className="form-control"
          id="chainSelect"
          value={chainId}
          onChange={(e) => setChainId(e.target.value)}
          required
        >
          <option value="10">OP Mainnet</option>
          <option value="1101">Polygon zkEVM</option>
          <option value="34443">Mode</option>
          <option value="42161">Arbitrum One</option>
          <option value="534352">Scroll</option>
          <option value="7777777">Zora</option>
          <option value="8453">Base</option>
          <option value="324">ZKSync</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="contractAddress">Contract Address</label>
        <input
          type="text"
          className="form-control"
          id="contractAddress"
          placeholder="Enter contract address"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
          required
        />
      </div>
      <div className="d-flex justify-content-between">
        <button type="submit" className="btn btn-primary">Sourcify</button>
        <button type="button" className="btn btn-secondary" onClick={handleFetchFiles}>Fetch Files</button>
      </div>
      {/* Step 4: Update UI to display the record ID */}
      {recordId && <div className="form-group mt-3">
        <label>Record ID:</label>
        <p>{recordId}</p>
      </div>}
    </form>
  );
};

export default ContractForm;