import React, { useState } from 'react';
import ContractAnalysisTable from '../components/ContractAnalysis/ContractAnalysisTable';
import CSVUploader from '../components/ContractAnalysis/CSVUploader';
import useContractAnalysis from '../hooks/useContractAnalysis';
import './ContractAnalysisPage.css';

function ContractAnalysisPage() {
  const { contracts, uploadCSV, processContracts, isProcessing, processingStats, error } = useContractAnalysis();
  const [maxQueries, setMaxQueries] = useState(10);

  const handleProcessContracts = async () => {
    await processContracts();
  };

  const handleTestProcessing = async () => {
    await processContracts(maxQueries);
  };

  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(contracts, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "processed_contracts.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="contract-analysis-page">
      <h1>Contract Analysis</h1>
      <div className="csv-uploader-container">
        <CSVUploader onUpload={uploadCSV} />
      </div>
      {error && <p className="error">{error}</p>}
      {contracts.length > 0 && (
        <div className="process-controls">
          <button 
            onClick={handleProcessContracts} 
            disabled={isProcessing}
            className="process-button"
          >
            {isProcessing ? 'Processing...' : 'Process All Contracts'}
          </button>
          <div className="test-controls">
            <input 
              type="number" 
              value={maxQueries} 
              onChange={(e) => setMaxQueries(parseInt(e.target.value))} 
              min="1"
            />
            <button 
              onClick={handleTestProcessing}
              disabled={isProcessing}
              className="test-button"
            >
              Test Processing
            </button>
          </div>
          <button 
            onClick={handleDownload}
            disabled={isProcessing || contracts.length === 0}
            className="download-button"
          >
            Download Results
          </button>
        </div>
      )}
      {processingStats && (
        <div className="processing-stats">
          <h2>Processing Statistics</h2>
          <p>Total Contracts: {processingStats.total_contracts}</p>
          <p>Processed: {processingStats.processed_count}</p>
          <p>Contracts with Name: {processingStats.contracts_with_name}</p>
          <p>Proxy Contracts: {processingStats.proxy_contracts}</p>
          <p>Elapsed Time: {processingStats.elapsed_time}</p>
        </div>
      )}
      {contracts.length > 0 ? (
        <ContractAnalysisTable contracts={contracts} />
      ) : (
        <p className="no-contracts">No contracts to display. Please upload a CSV file.</p>
      )}
    </div>
  );
}

export default ContractAnalysisPage;