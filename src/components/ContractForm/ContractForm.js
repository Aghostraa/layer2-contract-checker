import React, { useEffect, useState } from 'react';
import { fetchAirtableDataWithChainId } from '../../services/airtableApi';

const ContractForm = ({ onFormSubmit, onFetchFiles, contractAddress, setContractAddress, chainId, setRecordId }) => {
  const [localRecordId, setLocalRecordId] = useState('');

  useEffect(() => {
    if (contractAddress) {
      fetchRecordId();
    }
  }, [contractAddress, chainId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onFormSubmit(chainId, contractAddress);
    fetchRecordId();
  };

  const handleFetchFiles = () => {
    onFetchFiles(chainId, contractAddress);
  };

  const fetchRecordId = async () => {
    try {
      const records = await fetchAirtableDataWithChainId(chainId);
      const matchingRecord = records.find(record => record.address === contractAddress);
      if (matchingRecord) {
        setLocalRecordId(matchingRecord.id);
        setRecordId(matchingRecord.id);
      } else {
        setLocalRecordId('No matching record found');
        setRecordId('');
      }
    } catch (error) {
      console.error('Error fetching record ID:', error);
      setLocalRecordId('Error fetching record ID');
      setRecordId('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="chainSelect">Selected Layer 2 Network</label>
        <input
          type="text"
          className="form-control"
          id="chainSelect"
          value={getChainName(chainId)}
          readOnly
        />
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
      {localRecordId && (
        <div className="form-group mt-3">
          <label>Record ID:</label>
          <p>{localRecordId}</p>
        </div>
      )}
    </form>
  );
};

// Helper function to get chain name from chainId
const getChainName = (chainId) => {
  const chainNames = {
    "10": "OP Mainnet",
    "1101": "Polygon zkEVM",
    "34443": "Mode",
    "42161": "Arbitrum One",
    "534352": "Scroll",
    "7777777": "Zora",
    "8453": "Base",
    "324": "ZKSync"
  };
  return chainNames[chainId] || "Unknown Chain";
};

export default ContractForm;