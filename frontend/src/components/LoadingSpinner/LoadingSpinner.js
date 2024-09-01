import React from 'react';

const LoadingSpinner = () => (
  <div className="d-flex justify-content-center mt-4">
    <div className="spinner-border text-primary" role="status">
      <span className="sr-only">Loading...</span>
    </div>
  </div>
);

export default LoadingSpinner;
