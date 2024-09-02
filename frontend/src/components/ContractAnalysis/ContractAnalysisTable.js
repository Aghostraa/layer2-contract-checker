import React from 'react';
import './ContractAnalysisTable.css';

function ContractAnalysisTable({ contracts }) {
  return (
    <div className="contract-analysis-container">
      <h2>Fetched Contracts</h2>
      <div className="table-container">
        <table className="contract-analysis-table">
          <thead>
            <tr>
              <th>Address</th>
              <th>Origin Key</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((contract, index) => (
              <tr key={index}>
                <td>{contract.address}</td>
                <td>{contract.origin_key}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ContractAnalysisTable;