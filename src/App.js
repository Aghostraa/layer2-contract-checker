import React, { useState, useEffect, useRef } from 'react';
import ContractForm from './components/ContractForm/ContractForm';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';
import ResponseDisplay from './components/ResponseDisplay/ResponseDisplay';
import FilesDisplay from './components/FilesDisplay/FilesDisplay';
import BlockscoutResponseDisplay from './components/BlockscoutResponseDisplay/BlockscoutResponseDisplay';
import { fetchSourcifyData, fetchFilesData } from './services/sourcifyApi';
import { fetchBlockscoutData } from './services/blockscoutApi';
import { fetchProjects, fetchCategories } from './services/airtableOperations';
import './App.css';

const App = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [files, setFiles] = useState(null);
  const [blockscoutResponse, setBlockscoutResponse] = useState(null);
  const [contractAddress, setContractAddress] = useState('');
  const [chainId, setChainId] = useState('');
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [projectSearch, setProjectSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const projectDropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);

  useEffect(() => {
    const fetchAirtableData = async () => {
      try {
        const projectsData = await fetchProjects();
        const categoriesData = await fetchCategories();
        setProjects(projectsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching Airtable data:', error);
      }
    };

    fetchAirtableData();
  }, []);

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
    setProjectSearch(project.name);
    setIsProjectDropdownOpen(false);
  };

  const selectCategory = (category) => {
    setCategorySearch(category.name);
    setIsCategoryDropdownOpen(false);
  };

  return (
    <>
      <div className="background-container">
        <div className="background-gradient-group">
          <div className="background-gradient-yellow"></div>
          <div className="background-gradient-green"></div>
        </div>
      </div>
      <div className="container">
        <div className="unlabeled section">
          <h2 className="section-title">Unlabeled Contracts</h2>
          <iframe
            className="airtable-embed"
            src="https://airtable.com/embed/appZWDvjvDmVnOici/shrOw3v4Tn1InPmmF?viewControls=on"
            frameBorder="0"
            onMouseWheel=""
          ></iframe>
        </div>
        <div className="analyse section">
          <h2 className="section-title">Analyse</h2>
          <ContractForm 
            onFormSubmit={handleFormSubmit} 
            onFetchFiles={handleFetchFiles} 
            contractAddress={contractAddress}
          />
          {loading && <LoadingSpinner />}
          {response && <ResponseDisplay response={response} />}
          {response && (
            <div className="button-group">
              <button className="btn" onClick={handleGithubButtonClick}>Github</button>
              <button className="btn" onClick={handleBlockscoutButtonClick}>Blockscout</button>
              <button className="btn" onClick={handleExplorerButtonClick}>Explorer</button>
              <button className="btn btn-secondary" onClick={handleGoogleButtonClick}>Google Search</button>
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
            <input type="text" id="contractName" className="form-control" />

            <label htmlFor="labeler">Labeler</label>
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;