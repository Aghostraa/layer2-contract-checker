// src/hooks/useContractAnalysis.js

import { useState } from 'react';
import { uploadCSV, fetchContractAnalysis, processContracts } from '../services/contractAnalysisApi';

function useContractAnalysis() {
  const [contracts, setContracts] = useState([]);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStats, setProcessingStats] = useState(null);

  const handleUploadCSV = async (file) => {
    try {
      setError(null);
      await uploadCSV(file);
      const data = await fetchContractAnalysis();
      setContracts(data);
    } catch (error) {
      console.error('Error processing CSV:', error);
      setError(error.message);
    }
  };

  const handleProcessContracts = async (maxQueries = null) => {
    try {
      setError(null);
      setIsProcessing(true);
      setProcessingStats(null);

      await processContracts(maxQueries, (stats) => {
        setProcessingStats(stats);
      });

      const data = await fetchContractAnalysis();
      setContracts(data);
    } catch (error) {
      console.error('Error processing contracts:', error);
      setError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return { 
    contracts, 
    uploadCSV: handleUploadCSV, 
    processContracts: handleProcessContracts, 
    isProcessing, 
    processingStats,
    error 
  };
}

export default useContractAnalysis;