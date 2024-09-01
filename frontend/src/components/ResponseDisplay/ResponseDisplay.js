import React from 'react';

const ResponseDisplay = ({ response }) => {
  if (response.error) {
    return <div className="alert alert-danger">Error: {response.error}</div>;
  }

  if (response.length === 0 || !response[0].chainIds) {
    return <div className="alert alert-warning">No data found for the given contract address and chain ID.</div>;
  }

  return (
    <div className="mt-4">
      <h4>Contract Verification Status:</h4>
      {response.map((item, index) => (
        item.chainIds.map((chain, chainIndex) => (
          <div className="card" key={`${index}-${chainIndex}`}>
            <div className="card-body">
              <h5 className="card-title">Result {index + 1}</h5>
              <p className="card-text"><strong>Address:</strong> {item.address}</p>
              <p className="card-text"><strong>Chain ID:</strong> {chain.chainId}</p>
              <p className="card-text"><strong>Verification Status:</strong> {chain.status === 'perfect' ? 'Verified' : chain.status === 'partial' ? 'Partially Verified' : 'Not Verified'}</p>
            </div>
          </div>
        ))
      ))}
    </div>
  );
};

export default ResponseDisplay;
