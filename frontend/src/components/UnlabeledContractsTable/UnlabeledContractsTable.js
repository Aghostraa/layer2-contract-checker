import React, { useState, useEffect, useMemo } from 'react';
import './UnlabeledContractsTable.css';
import { fetchUnlabeledContracts } from '../../services/airtableOperations';
import { fetchBlockscoutData } from '../../services/blockscoutApi';

const chainIdToOriginKey = {
  "42161": "arbitrum",
  "10": "optimism",
  "8453": "base",
  "324": "zksync_era",
  "7777777": "zora",
  "534352": "scroll",
  "34443": "mode"
};

const updateContractsWithBlockscoutData = async (contracts, chainId) => {
  const updatedContracts = await Promise.all(contracts.map(async (contract) => {
    try {
      const blockscoutData = await fetchBlockscoutData(contract.address, chainId);
      return {
        ...contract,
        contractName: blockscoutData.contractName || 'N/A',
      };
    } catch (error) {
      console.error('Error fetching Blockscout data:', error);
      return contract;
    }
  }));
  return updatedContracts;
};

const UnlabeledContractsTable = ({ chainId, onSelectAddress, onContractNameClick, refresh, contracts: propContracts, isProcessedData }) => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  useEffect(() => {
    const loadContracts = async () => {
      setLoading(true);
      try {
        let data;
        if (isProcessedData) {
          // Filter contracts based on origin_key
          const originKey = chainIdToOriginKey[chainId];
          data = propContracts.filter(contract => contract.origin_key === originKey);
        } else {
          data = await fetchUnlabeledContracts(chainId);
          data = await updateContractsWithBlockscoutData(data, chainId);
        }
        console.log('Number of records fetched for', chainId, ':', data.length);
        setContracts(data);
      } catch (error) {
        console.error('Error fetching contracts:', error);
      } finally {
        setLoading(false);
      }
    };

    if (chainId) {
      loadContracts();
    }
  }, [chainId, refresh, isProcessedData, propContracts]);

  const sortedContracts = useMemo(() => {
    let sortedData = [...contracts];
    
    // First, sort by whether the contract has a name
    sortedData.sort((a, b) => {
      const aHasName = a.name || a.contractName;
      const bHasName = b.name || b.contractName;
      if (aHasName && !bHasName) return -1;
      if (!aHasName && bHasName) return 1;
      return 0;
    });

    // Then, apply the user-selected sort
    if (sortConfig.key) {
      sortedData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return sortedData;
  }, [contracts, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortDirectionIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? '↑' : '↓';
    }
    return '';
  };

  if (loading) {
    return <div>Loading contracts...</div>;
  }

  if (contracts.length === 0) {
    return <div>No contracts found for this chain.</div>;
  }

  const formatGasValue = (value) => {
    return parseFloat(value).toFixed(3);
  };

  const getContractData = (contract) => {
    if (isProcessedData) {
      return {
        address: contract.address,
        name: contract.name || 'N/A',
        gasEth: contract.gas_eth || '0',
        txCount: contract.txcount || '0',
        avgDaa: contract.avg_daa || '0'
      };
    } else {
      return {
        address: contract.address,
        name: contract.contractName || 'N/A',
        usageCategory: contract.usageCategory || 'N/A',
        ownerProject: contract.ownerProject || 'N/A',
        gasEth: contract.gas_eth || '0',
        txCount: contract.txcount || '0',
        avgDaa: contract.avg_daa || '0'
      };
    }
  };


  return (
    <div className="unlabeled-contracts-table">
      <table>
        <thead>
          <tr>
            <th>Address</th>
            <th>Contract Name</th>
            <th onClick={() => requestSort('gasEth')}>
              Gas (ETH) {getSortDirectionIcon('gasEth')}
            </th>
            <th onClick={() => requestSort('txCount')}>
              Transaction Count {getSortDirectionIcon('txCount')}
            </th>
            <th onClick={() => requestSort('avgDaa')}>
              Avg. Daily Active Addresses {getSortDirectionIcon('avgDaa')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedContracts.map(contract => {
            const contractData = getContractData(contract);
            return (
              <tr key={contractData.address}>
                <td>
                  <button 
                    className="address-link" 
                    onClick={() => onSelectAddress(contractData.address)}
                    data-full-address={contractData.address} 
                  >
                    {`${contractData.address.slice(0, 6)}...${contractData.address.slice(-4)}`}
                  </button>
                </td>
                <td>
                  <span 
                    className="contract-name-tooltip"
                    data-full-name={contractData.name}
                    onClick={() => onContractNameClick(contractData.name)}
                  >
                    {contractData.name.length > 15 
                      ? `${contractData.name.slice(0, 15)}...` 
                      : contractData.name
                    }
                  </span>
                </td>
                <td>{formatGasValue(contractData.gasEth)}</td>
                <td>{contractData.txCount}</td>
                <td>{contractData.avgDaa}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UnlabeledContractsTable;
