import React, { useState, useEffect } from 'react';
import ContractForm from './components/ContractForm/ContractForm';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';
import ResponseDisplay from './components/ResponseDisplay/ResponseDisplay';
import FilesDisplay from './components/FilesDisplay/FilesDisplay';
import BlockscoutResponseDisplay from './components/BlockscoutResponseDisplay/BlockscoutResponseDisplay';
import './App.css';

const explorerUrls = {
  "10": "https://optimistic.etherscan.io/address/",
  "1101": "https://zkevm.polygonscan.com/address/",
  "34443": "https://explorer.mode.network/address/",
  "42161": "https://arbiscan.io/address/",
  "534352": "https://scrollscan.com/address/",
  "7777777": "https://explorer.zora.energy/address/",
  "8453": "https://basescan.org/address/",
  "342": "https://explorer.zksync.io/address/"
};

const blockscoutUrls = {
  "10": "https://optimism.blockscout.com/api/v2/smart-contracts/",
  "1101": "https://explorer.zkevm.com/api/v2/smart-contracts/",
  "34443": "https://explorer.mode.network/api/v2/smart-contracts/",
  "42161": "https://arbitrum.blockscout.com/api/v2/smart-contracts/",
  "534352": "https://explorer.scroll.io/api/v2/smart-contracts/",
  "7777777": "https://explorer.zora.energy/api/v2/smart-contracts/",
  "8453": "https://base.blockscout.com/api/v2/smart-contracts/",
  "342": "https://zksync.blockscout.com/api/v2/smart-contracts/"
};

function App() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [files, setFiles] = useState(null);
  const [blockscoutResponse, setBlockscoutResponse] = useState(null);
  const [contractAddress, setContractAddress] = useState('');
  const [chainId, setChainId] = useState('');

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

  const handleFormSubmit = async (selectedChainId, contractAddress) => {
    setLoading(true);
    setResponse(null);
    setFiles(null);
    setBlockscoutResponse(null);
    setContractAddress(contractAddress);
    setChainId(selectedChainId);

    const url = `https://sourcify.dev/server/check-all-by-addresses?addresses=${contractAddress}&chainIds=${selectedChainId}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
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

    const url = `https://sourcify.dev/server/files/tree/any/${selectedChainId}/${contractAddress}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      const srcFiles = data.files.filter(file => file.includes('/src/') && file.endsWith('.sol'));
      const fileContents = await Promise.all(srcFiles.map(async (file) => {
        const fileRes = await fetch(file);
        const fileContent = await fileRes.text();
        return { url: file, content: fileContent };
      }));
      setFiles({ ...data, files: fileContents });
    } catch (error) {
      setFiles({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleBlockscoutButtonClick = async () => {
    const blockscoutUrl = `${blockscoutUrls[chainId]}${contractAddress}`;
    try {
      const res = await fetch(blockscoutUrl);
      const data = await res.json();
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
    const explorerUrl = `${explorerUrls[chainId]}${contractAddress}`;
    window.open(explorerUrl, '_blank');
  };

  return (
    <div className="container">
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
          <input type="text" id="ownerProject" className="form-control" />

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
}
