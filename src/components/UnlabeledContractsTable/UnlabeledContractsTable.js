import React, { useState, useEffect, useMemo } from 'react';
import './UnlabeledContractsTable.css';
import { fetchUnlabeledContracts } from '../../services/airtableOperations';

const UnlabeledContractsTable = ({ chainId, onSelectAddress, refresh }) => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  useEffect(() => {
    const loadContracts = async () => {
      setLoading(true);
      try {
        const data = await fetchUnlabeledContracts(chainId);
        console.log('Number of records fetched for', chainId, ':', data.length); // Debugging output
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

  return (
    <div className="unlabeled-contracts-table">
      <table>
        <thead>
          <tr>
            <th>Address</th>
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
              <td>{contract.gas_eth}</td>
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
