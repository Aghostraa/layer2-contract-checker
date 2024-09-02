import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ContractForm from './components/ContractForm/ContractForm';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';
import ResponseDisplay from './components/ResponseDisplay/ResponseDisplay';
import FilesDisplay from './components/FilesDisplay/FilesDisplay';
import BlockscoutResponseDisplay from './components/BlockscoutResponseDisplay/BlockscoutResponseDisplay';
import { fetchSourcifyData, fetchFilesData } from './services/sourcifyApi';
import { fetchBlockscoutData } from './services/blockscoutApi';
import { fetchProjects, fetchCategories, updateAirtableRecord, fetchUnlabeledContracts } from './services/airtableOperations';
import { fetchAirtableDataWithChainId } from './services/airtableApi';
import UnlabeledContractsTable from './components/UnlabeledContractsTable/UnlabeledContractsTable';
import ContractAnalysisPage from './pages/ContractAnalysisPage';
import './App.css';

const Navigation = () => (
  <nav className="main-nav">
    <ul>
      <li><Link to="/" className="nav-link">Home</Link></li>
      <li><Link to="/contract-analysis" className="nav-link">Contract Analysis</Link></li>
    </ul>
  </nav>
);

const App = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [files, setFiles] = useState(null);
  const [blockscoutResponse, setBlockscoutResponse] = useState(null);
  const [contractAddress, setContractAddress] = useState('');
  const [chainId, setChainId] = useState('42161'); // Default to Arbitrum
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [projectSearch, setProjectSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const projectDropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);
  const [recordId, setRecordId] = useState('');
  const [labelInfo, setLabelInfo] = useState({
    ownerProject: '',
    usageCategory: '',
    contractName: '',
  });
  const [updateStatus, setUpdateStatus] = useState('');
  const [refreshTable, setRefreshTable] = useState(false);
  const [contracts, setContracts] = useState([]);
  const [error, setError] = useState(null);

  const [labelingStats, setLabelingStats] = useState({
    session: {
      count: 0,
      gasSpent: 0,
      txCount: 0,
    },
    allTime: {
      count: 0,
      gasSpent: 0,
      txCount: 0,
    },
  });
  const updateLabelingStats = (contract) => {
    setLabelingStats(prevStats => ({
      session: {
        count: prevStats.session.count + 1,
        gasSpent: prevStats.session.gasSpent + parseFloat(contract.gas_eth || 0),
        txCount: prevStats.session.txCount + parseInt(contract.txcount || 0),
      },
      allTime: {
        count: prevStats.allTime.count + 1,
        gasSpent: prevStats.allTime.gasSpent + parseFloat(contract.gas_eth || 0),
        txCount: prevStats.allTime.txCount + parseInt(contract.txcount || 0),
      },
    }));
  };

  const handleContractNameClick = (contractName) => {
    setLabelInfo((prevState) => ({
      ...prevState,
      contractName,
    }));
  };
  

  useEffect(() => {
    const fetchAirtableData = async () => {
      try {
        console.log('Fetching data for chainId:', chainId);
  
        const projectsData = await fetchProjects();
        const categoriesData = await fetchCategories();
        const fetchedContracts = await fetchAirtableDataWithChainId(chainId); // Assume this returns an array of contracts
  
        setContracts(fetchedContracts); // Set the contracts state
        setProjects(projectsData);
        setCategories(categoriesData);
  
        if (fetchedContracts.length > 0) {
          setRecordId(fetchedContracts[0].id);
          console.log('Record ID fetched:', fetchedContracts[0].id);
        } else {
          setRecordId(''); // Clear record ID if no contracts are found
        }
        setError(null); // Clear any previous errors
      } catch (error) {
        console.error('Error fetching Airtable data:', error);
        setError(error.message);
      }
    };
  
    if (chainId) {
      fetchAirtableData();
    }
  }, [chainId]);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(event.target)) {
        setIsProjectDropdownOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setIsCategoryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectAddress = async (address) => {
    setContractAddress(address); // This will update the contract address in your form

    // Fetch the record ID corresponding to the clicked address
    try {
      const records = await fetchAirtableDataWithChainId(chainId); // Fetch records based on the current chain ID
      const matchingRecord = records.find(record => record.address === address);
      if (matchingRecord) {
        setRecordId(matchingRecord.id); // Save the record ID
        console.log('Record ID saved:', matchingRecord.id); // Log the saved record ID
      } else {
        console.log('No matching record found for address:', address);
        setRecordId(''); // Clear record ID if no match is found
      }
    } catch (error) {
      console.error('Error fetching record ID:', error);
      setRecordId(''); // Clear record ID if there's an error
    }
  };

  const handleChainChange = (newChainId) => {
    setChainId(newChainId);
    setContractAddress('');
    setRecordId('');
    setRefreshTable(prev => !prev);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setLabelInfo(prevState => ({
      ...prevState,
      [id]: value, // Use the input's `id` attribute to update the correct field in `labelInfo`
    }));
  };

  const handleFormSubmit = async (selectedChainId, contractAddress) => {
    setLoading(true);
    setResponse(null);
    setFiles(null);
    setBlockscoutResponse(null);
    setContractAddress(contractAddress);

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

  const handleBlockscoutButtonClick = async () => {
    try {
      const data = await fetchBlockscoutData(contractAddress, chainId);
      setBlockscoutResponse(data);
    } catch (error) {
      setBlockscoutResponse({ error: error.message });
    }
  };

  const handleVerifyContracts = async () => {
    if (!contracts || contracts.length === 0) {
      console.warn('No contracts available to verify');
      return;
    }
  
    setLoading(true); // Start loading indicator
  
    const updatedContracts = await Promise.all(contracts.map(async (contract) => {
      try {
        const { verified, contractName, sourceCode, verifiedAt, filePath } = await fetchBlockscoutData(contract.address, chainId);
  
        console.log(`Contract: ${contract.address}, Verified: ${verified}, Name: ${contractName}`);
  
        return {
          ...contract,
          verified,
          contractName,
          sourceCode,
          verifiedAt,
          filePath
        };
      } catch (error) {
        console.error('Error verifying contract:', error);
        return contract; // Return the original contract data if verification fails
      }
    }));
  
    console.log('Updated contracts array:', updatedContracts); // Log before setting state
    setContracts(updatedContracts); // Update the state with the verification info
    setLoading(false); // Stop loading indicator
    console.log('Contracts state updated'); // Log after setting state
  };
  

  const handleGithubButtonClick = () => {
    const githubUrl = `https://github.com/search?q=${contractAddress}&type=code`;
    window.open(githubUrl, '_blank');
  };

  const handleGoogleButtonClick = () => {
    const googleUrl = `https://www.google.com/search?q=${contractAddress}`;
    window.open(googleUrl, '_blank');
  };

  const dedaubUrls = {
    "10": "https://app.dedaub.com/optimism/address/",
    "1101": "https://app.dedaub.com/polygon_zkevm/address/",
    "34443": "https://app.dedaub.com/mode/address/",
    "42161": "https://app.dedaub.com/arbitrum/address/",
    "534352": "https://app.dedaub.com/scroll/address/",
    "7777777": "https://app.dedaub.com/zora/address/",
    "8453": "https://app.dedaub.com/base/address/",
    "324": "https://app.dedaub.com/zksync_era/address/"
  };

  const getDedaubUrl = (chainId, contractAddress) => {
    const baseUrl = dedaubUrls[chainId];
    if (!baseUrl) {
      console.error(`No Dedaub URL found for chain ID: ${chainId}`);
      return '';
    }
    return `${baseUrl}${contractAddress}/overview`;
  };

  const handleDedaubButtonClick = () => {
    const dedaubUrl = getDedaubUrl(chainId, contractAddress);
    if (dedaubUrl) {
      window.open(dedaubUrl, '_blank');
    } else {
      console.error('Dedaub URL is not available.');
    }
  };
  

  const handleExplorerButtonClick = () => {
    const explorerUrls = {
      "10": "https://optimistic.etherscan.io/address/",
      "1101": "https://zkevm.polygonscan.com/address/",
      "34443": "https://explorer.mode.network/address/",
      "42161": "https://arbiscan.io/address/",
      "534352": "https://scrollscan.com/address/",
      "7777777": "https://explorer.zora.energy/address/",
      "8453": "https://basescan.com/address/",
      "324": "https://explorer.zksync.io/address/"
    };

    if (!explorerUrls[chainId]) {
      console.error(`No explorer URL found for chain ID: ${chainId}`);
      return;
    }
    const explorerUrl = `${explorerUrls[chainId]}${contractAddress}`;
    window.open(explorerUrl, '_blank');
  };

  const handleProjectSearch = (e) => {
    setProjectSearch(e.target.value);
    setIsProjectDropdownOpen(true);
  };

  const handleCategorySearch = (e) => {
    setCategorySearch(e.target.value);
    setIsCategoryDropdownOpen(true);
  };

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(projectSearch.toLowerCase())
  );

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const selectProject = (project) => {
    setLabelInfo(prevState => ({
      ...prevState,
      ownerProject: project.name, // Update labelInfo with selected project
    }));
    setProjectSearch(project.name);
    setIsProjectDropdownOpen(false);
  };

  const selectCategory = (category) => {
    setLabelInfo(prevState => ({
      ...prevState,
      usageCategory: category.name, // Update labelInfo with selected category
    }));
    setCategorySearch(category.name);
    setIsCategoryDropdownOpen(false);
  };
  

  return (
    <Router>
      <div className="background-container">
        <div className="background-gradient-group">
          <div className="background-gradient-yellow"></div>
          <div className="background-gradient-green"></div>
        </div>
      </div>
      <Navigation />
      <Routes>
        <Route path="/" element={
          <div className="container">
            <div className="unlabeled section">
              <h2 className="section-title">Unlabeled Contracts</h2>
              <select onChange={(e) => handleChainChange(e.target.value)} value={chainId}>
                <option value="42161">Arbitrum</option>
                <option value="10">Optimism</option>
                <option value="8453">Base</option>
                <option value="324">ZKSync</option>
                <option value="7777777">Zora</option>
                <option value="534352">Scroll</option>
                <option value="34443">Mode</option>
              </select>
              {error && <div className="error-message">{error}</div>}
              <button className="verify-button" onClick={handleVerifyContracts}>
                Verify Contracts
              </button>
              <UnlabeledContractsTable 
                chainId={chainId} 
                onSelectAddress={handleSelectAddress}
                onContractNameClick={handleContractNameClick}
                refresh={refreshTable}
                contracts={contracts}
              />
            </div>
            <div className="analyse section">
              <h2 className="section-title">Analyse</h2>
              <ContractForm
                onFormSubmit={handleFormSubmit}
                onFetchFiles={handleFetchFiles}
                setRecordId={setRecordId}
                setLabelInfo={setLabelInfo}
                updateStatus={setUpdateStatus}
                contractAddress={contractAddress}
                setContractAddress={setContractAddress}
                chainId={chainId}
              />
              {loading && <LoadingSpinner />}
              {response && <ResponseDisplay response={response} />}
              {response && (
                <div className="button-group">
                  <button className="btn" onClick={handleGithubButtonClick}>Github</button>
                  <button className="btn" onClick={handleBlockscoutButtonClick}>Blockscout</button>
                  <button className="btn" onClick={handleExplorerButtonClick}>Explorer</button>
                  <button className="btn btn-secondary" onClick={handleGoogleButtonClick}>Google Search</button>
                  <button className="btn btn-secondary" onClick={handleDedaubButtonClick}>Dedaub Lookup</button>
                </div>
              )}
              {files && <FilesDisplay files={files} />}
              {blockscoutResponse && <BlockscoutResponseDisplay response={blockscoutResponse} />}
            </div>
            <div className="label section">
              <h2 className="section-title">Label</h2>
              <div className="form-container">
                <div className="searchable-dropdown" ref={projectDropdownRef}>
                  <label htmlFor="ownerProject">Owner Project</label>
                  <input
                    type="text"
                    id="ownerProject"
                    value={projectSearch}
                    onChange={handleProjectSearch}
                    onClick={() => setIsProjectDropdownOpen(true)}
                    placeholder="Search or select a project"
                    className="form-control"
                  />
                  {isProjectDropdownOpen && (
                    <ul className="dropdown-list">
                      {filteredProjects.map(project => (
                        <li key={project.id} onClick={() => selectProject(project)}>
                          {project.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
      
                <div className="searchable-dropdown" ref={categoryDropdownRef}>
                  <label htmlFor="usageCategory">Usage Category</label>
                  <input
                    type="text"
                    id="usageCategory"
                    value={categorySearch}
                    onChange={handleCategorySearch}
                    onClick={() => setIsCategoryDropdownOpen(true)}
                    placeholder="Search or select a category"
                    className="form-control"
                  />
                  {isCategoryDropdownOpen && (
                    <ul className="dropdown-list">
                      {filteredCategories.map(category => (
                        <li key={category.id} onClick={() => selectCategory(category)}>
                          {category.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
      
                <label htmlFor="contractName">Contract Name</label>
                <input 
                  type="text" 
                  id="contractName" 
                  value={labelInfo.contractName}
                  onChange={handleInputChange}
                  className="form-control" 
                />
      
                <label htmlFor="labeler">Labeler</label>
                <input 
                  type="text" 
                  id="labeler" 
                  value={labelInfo.labeler}
                  onChange={handleInputChange}
                  className="form-control" 
                />
                
                <button className="btn btn-primary" onClick={() => { 
                  if (recordId) {
                    setLoading(true);
                    updateAirtableRecord(recordId, labelInfo)
                      .then(response => {
                        if(response) {
                          setUpdateStatus('Success');
                          const labeledContract = contracts.find(c => c.id === recordId);
                          updateLabelingStats(labeledContract);
                          setLoading(false);
                          setContractAddress('');
                          setRecordId('');
                          setLabelInfo({
                            ownerProject: '',
                            usageCategory: '',
                            contractName: '',
                          });
                          setProjectSearch('');
                          setCategorySearch('');
                          setRefreshTable(prev => !prev);
                          console.log('Form fields cleared and table refreshed.');
                        }
                        setLoading(false);
                     })
                     .catch(error => {
                       console.error('Error updating record:', error);
                       setUpdateStatus('Failed');
                       setLoading(false);
                     });
                    } else {
                      console.error('Record ID is not available');
                      setUpdateStatus('Failed');
                    }
                }}>
                  Submit
                </button>
              </div>
      
              <div className="labeling-stats-container">
                <h3 className="section-subtitle">Labeling Statistics</h3>
                <div className="stats-group"></div>
                 <h4>Current Session</h4>
                 <div className="stat-item">
                    <span className="stat-label">Contracts Labeled:</span>
                    <span className="stat-value">{labelingStats.session.count}</span>
                 </div>
                 <div className="stat-item">
                    <span className="stat-label">Total labeled SM Gas Spent:</span>
                   <span className="stat-value">{labelingStats.session.gasSpent.toFixed(3)} ETH</span>
                 </div>
                 <div className="stat-item">
                    <span className="stat-label">Total labeled SM Transactions:</span>
                   <span className="stat-value">{labelingStats.session.txCount}</span>
                 </div>
                </div>
                <div className="stats-group">
                  <h4>All Time</h4>
                  <div className="stat-item">
                    <span className="stat-label">Contracts Labeled:</span>
                    <span className="stat-value">{labelingStats.allTime.count}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total labeled SM Gas Spent:</span>
                    <span className="stat-value">{labelingStats.allTime.gasSpent.toFixed(3)} ETH</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total labeled SM Transactions:</span>
                    <span className="stat-value">{labelingStats.allTime.txCount}</span>
                  </div>
                </div>
              </div>
            </div>
           } />
        <Route path="/contract-analysis" element={<ContractAnalysisPage />} />
      </Routes>
    </Router>
  );
};

export default App;