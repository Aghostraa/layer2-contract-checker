import React, { useState, useEffect, useMemo } from 'react';
import './UnlabeledContractsTable.css';
import { fetchUnlabeledContracts } from '../../services/airtableOperations';
import { fetchBlockscoutData } from '../../services/blockscoutApi'; // Make sure this import is correct

const updateContractsWithBlockscoutData = async (contracts, chainId) => {
    const updatedContracts = await Promise.all(contracts.map(async (contract) => {
      try {
        const blockscoutData = await fetchBlockscoutData(contract.address, chainId);
        return {
          ...contract,
          contractName: blockscoutData.contractName || 'N/A', // Add contract name or default to 'N/A'
        };
      } catch (error) {
        console.error('Error fetching Blockscout data:', error);
        return contract; // Return the original contract data if the Blockscout query fails
      }
    }));
    return updatedContracts;
  };

  const UnlabeledContractsTable = ({ chainId, onSelectAddress, onContractNameClick, refresh }) => {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  
    useEffect(() => {
      const loadContracts = async () => {
        setLoading(true);
        try {
          // Fetch contracts from Airtable
          const data = await fetchUnlabeledContracts(chainId);
          console.log('Number of records fetched for', chainId, ':', data.length);
  
          // Update contracts with Blockscout data
          const updatedContracts = await updateContractsWithBlockscoutData(data, chainId);
  
          setContracts(updatedContracts);
        } catch (error) {
          console.error('Error fetching contracts:', error);
        } finally {
          setLoading(false);
        }
      };
  
      if (chainId) {
        loadContracts();
      }
    }, [chainId, refresh]);

    

  // Unconditionally use useMemo before any returns
  const sortedContracts = useMemo(() => {
    if (sortConfig.key) {
      return [...contracts].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return contracts;
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

  return (
    <div className="unlabeled-contracts-table">
      <table>
        <thead>
          <tr>
            <th>Address</th>
            <th>Contract Name</th> {/* Removed Verified column */}
            <th onClick={() => requestSort('gas_eth')}>
              Gas (ETH) {getSortDirectionIcon('gas_eth')}
            </th>
            <th onClick={() => requestSort('txcount')}>
              Transaction Count {getSortDirectionIcon('txcount')}
            </th>
            <th onClick={() => requestSort('avg_daa')}>
              Avg. Daily Active Addresses {getSortDirectionIcon('avg_daa')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedContracts.map(contract => (
            <tr key={contract.id}>
              <td>
                <button 
                  className="address-link" 
                  onClick={() => onSelectAddress(contract.address)}
                  data-full-address={contract.address} 
                >
                  {`${contract.address.slice(0, 6)}...${contract.address.slice(-4)}`}
                </button>
              </td>
              <td>
                <span 
                  className="contract-name-tooltip"
                  data-full-name={contract.contractName}
                  onClick={() => onContractNameClick(contract.contractName || 'N/A')}
                >
                  {contract.contractName.length > 15 
                    ? `${contract.contractName.slice(0, 15)}...` 
                    : contract.contractName
                  }
                </span>
              </td>
              <td>{formatGasValue(contract.gas_eth)}</td> {/* Format Gas (ETH) value */}
              <td>{contract.txcount}</td>
              <td>{contract.avg_daa}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UnlabeledContractsTable;
