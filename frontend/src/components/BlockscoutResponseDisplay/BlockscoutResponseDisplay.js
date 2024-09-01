import React, { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

const BlockscoutResponseDisplay = ({ response }) => {
  const [tabRef, setTabRef] = useState(null);

  const handleCopyClick = (text) => {
    const tabName = 'uniqueTabName';
    let newWindow = tabRef || window.open('', tabName);

    if (!newWindow || newWindow.closed) {
      newWindow = window.open('', tabName);
      setTabRef(newWindow);
    }

    if (newWindow.location.href === 'about:blank') {
      newWindow.location.href = 'https://chatgpt.com/g/g-2yuF4GLZK-contract-labeling-assistant';
    }

    newWindow.focus();
  };

  if (response.error) {
    return <div className="alert alert-danger">Error: {response.error}</div>;
  }

  return (
    <div className="mt-4">
      <h4>Blockscout Contract Details:</h4>
      <div className="card">
        <div className="card-body">
          <p><strong>Name:</strong> {response.name}</p>
          <CopyToClipboard text={response.name}>
            <button className="btn btn-link btn-sm ml-2">
              <i className="fas fa-copy"></i> Copy Name
            </button>
          </CopyToClipboard>
          <p><strong>Source Code:</strong></p>
          <pre><code>{response.source_code}</code></pre>
          <CopyToClipboard text={response.source_code}>
            <button className="btn btn-link btn-sm ml-2" onClick={() => handleCopyClick(response.source_code)}>
              <i className="fas fa-copy"></i> Copy Source Code
            </button>
          </CopyToClipboard>
        </div>
      </div>
    </div>
  );
};

export default BlockscoutResponseDisplay;
