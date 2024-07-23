import React, { useState } from 'react';

const ContractForm = ({ onFormSubmit, onFetchFiles }) => {
  const [chainId, setChainId] = useState('10');
  const [contractAddress, setContractAddress] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onFormSubmit(chainId, contractAddress);
  };

  const handleFetchFiles = () => {
    onFetchFiles(chainId, contractAddress);
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
    </form>
  );
};

export default ContractForm;
