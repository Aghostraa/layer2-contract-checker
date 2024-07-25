import React, { useState, useEffect } from 'react';
import ContractForm from './components/ContractForm/ContractForm';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';
import ResponseDisplay from './components/ResponseDisplay/ResponseDisplay';
import FilesDisplay from './components/FilesDisplay/FilesDisplay';
import BlockscoutResponseDisplay from './components/BlockscoutResponseDisplay/BlockscoutResponseDisplay';
import { fetchSourcifyData, fetchFilesData } from './services/sourcifyApi';
import { fetchBlockscoutData } from './services/blockscoutApi';
import { fetchAirtableData } from './services/airtableApi';
import AppContext from './contexts/AppContext';
import './App.css';

const App = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [files, setFiles] = useState(null);
  const [blockscoutResponse, setBlockscoutResponse] = useState(null);
  const [contractAddress, setContractAddress] = useState('');
  const [chainId, setChainId] = useState('');
  const [airtableData, setAirtableData] = useState([]);
  const [ownerProjectSearch, setOwnerProjectSearch] = useState('');
  const [filteredAirtableData, setFilteredAirtableData] = useState([]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'SET_CONTRACT_ADDRESS') {
        setContractAddress(event.data.contractAddress);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  useEffect(() => {
    const getAirtableData = async () => {
      try {
        const data = await fetchAirtableData();
        setAirtableData(data);
      } catch (error) {
        console.error(error);
      }
    };

    getAirtableData();
  }, []);

  useEffect(() => {
    if (ownerProjectSearch) {
      const filtered = airtableData.filter((item) =>
        item.Name.toLowerCase().includes(ownerProjectSearch.toLowerCase())
      );
      setFilteredAirtableData(filtered);
    } else {
      setFilteredAirtableData([]);
    }
  }, [ownerProjectSearch, airtableData]);

  const handleFormSubmit = async (selectedChainId, contractAddress) => {
    setLoading(true);
    setResponse(null);
    setFiles(null);
    setBlockscoutResponse(null);
    setContractAddress(contractAddress);
    setChainId(selectedChainId);

    try {
      const data = await fetchSourcifyData(contractAddress, selectedChainId);
      setResponse(data);
    } catch (error) {
      setResponse({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleFetchFiles = async (selectedChainId, contractAddress) => {
    setLoading(true);
    setFiles(null);

    try {
      const data = await fetchFilesData(contractAddress, selectedChainId);
      setFiles(data);
    } catch (error) {
      setFiles({ error: error.message });
    } finally {
      setLoading(false);
    }
  };
  const explorerUrls = {
    "10": "https://optimistic.etherscan.io/address/",
    "1101": "https://zkevm.polygonscan.com/address/",
    "34443": "https://explorer.mode.network/address/",
    "42161": "https://arbiscan.io/address/",
    "534352": "https://scrollscan.com/address/",
    "7777777": "https://explorer.zora.energy/address/",
    "8453": "https://basescan.com/address/",
    "342": "https://explorer.zksync.io/address/"
  };

  const handleBlockscoutButtonClick = async () => {
    try {
      const data = await fetchBlockscoutData(contractAddress, chainId);
      setBlockscoutResponse(data);
    } catch (error) {
      setBlockscoutResponse({ error: error.message });
    }
  };

  const handleGithubButtonClick = () => {
    const githubUrl = `https://github.com/search?q=${contractAddress}&type=code`;
    window.open(githubUrl, '_blank');
  };

  const handleGoogleButtonClick = () => {
    const googleUrl = `https://www.google.com/search?q=${contractAddress}`;
    window.open(googleUrl, '_blank');
  };

  const handleExplorerButtonClick = () => {
    if (!explorerUrls[chainId]) {
      console.error(`No explorer URL found for chain ID: ${chainId}`);
      return;
    }
    const explorerUrl = `${explorerUrls[chainId]}${contractAddress}`;
    window.open(explorerUrl, '_blank');
  };

  return (
    <div className="container">
      <div className="background-gradient-group">
        <div className="background-gradient-green"></div>
        <div className="background-gradient-yellow"></div>
      </div>

      <div className="unlabeled section">
        <h2 className="section-title">Unlabeled Contracts</h2>
        <iframe
          className="airtable-embed"
          src="https://airtable.com/embed/appZWDvjvDmVnOici/shrOw3v4Tn1InPmmF?viewControls=on"
          frameborder="0"
          onmousewheel=""
        ></iframe>
      </div>
      <div className="analyse section">
        <h2 className="section-title">Analyse</h2>
        <ContractForm onFormSubmit={handleFormSubmit} onFetchFiles={handleFetchFiles} contractAddress={contractAddress} />
        {loading && <LoadingSpinner />}
        {response && <ResponseDisplay response={response} />}
        {response && (
          <div className="text-center mt-4">
            <button className="btn btn-primary mr-2" onClick={handleGithubButtonClick}>
              Github
            </button>
            <button className="btn btn-warning mr-2" onClick={handleBlockscoutButtonClick}>
              Blockscout
            </button>
            <button className="btn btn-info mr-2" onClick={handleExplorerButtonClick}>
              Explorer
            </button>
            <button className="btn btn-secondary" onClick={handleGoogleButtonClick}>
              Google Search
            </button>
          </div>
        )}
        {files && <FilesDisplay files={files} />}
        {blockscoutResponse && <BlockscoutResponseDisplay response={blockscoutResponse} />}
      </div>

      <div className="label section">
        <h2 className="section-title">Label</h2>
        <div className="form-container">
          <label htmlFor="contractName">Contract Name</label>
          <input type="text" id="contractName" className="form-control" />

          <label htmlFor="ownerProject">Owner Project</label>
          <input
            type="text"
            id="ownerProject"
            className="form-control"
            value={ownerProjectSearch}
            onChange={(e) => setOwnerProjectSearch(e.target.value)}
          />
          {filteredAirtableData.length > 0 && (
            <div className="dropdown-menu">
              {filteredAirtableData.map((item) => (
                <div
                  key={item.id}
                  className="dropdown-item"
                  onClick={() => {
                    setOwnerProjectSearch(item.Name);
                    setFilteredAirtableData([]);
                  }}
                >
                  {item.Name}
                </div>
              ))}
            </div>
          )}

          <label htmlFor="usageCategory">Usage Category</label>
          <input type="text" id="usageCategory" className="form-control" />

          <label htmlFor="labeller">Labeler</label>
          <input type="text" id="labeler" className="form-control" />
          
          <button className="btn btn-primary">Submit</button>
        </div>

        <div className="ranking-container">
          <h3 className="section-subtitle">Chain Overview</h3>
          <h4 className="sub-subtitle">Unlabeled transactions</h4>
          <div className="ranking-list">
            <div className="ranking-item">
              <span className="chain-name">Base</span>
              <span className="chain-value">2.7M</span>
            </div>
            <div className="ranking-item">
              <span className="chain-name">OP Mainnet</span>
              <span className="chain-value">709K</span>
            </div>
            <div className="ranking-item">
              <span className="chain-name">Zora</span>
              <span className="chain-value">134K</span>
            </div>
            <div className="ranking-item">
              <span className="chain-name">Arbitrum One</span>
              <span className="chain-value">682K</span>
            </div>
            <div className="ranking-item">
              <span className="chain-name">Polygon zkEVM</span>
              <span className="chain-value">15K</span>
            </div>
            {/* Add more ranking items as needed */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
