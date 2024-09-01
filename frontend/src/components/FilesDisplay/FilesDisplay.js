import React, { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

const FilesDisplay = ({ files }) => {
  const [selectedFileContent, setSelectedFileContent] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [tabRef, setTabRef] = useState(null);

  if (files.error) {
    return <div className="alert alert-danger">Error: {files.error}</div>;
  }

  if (!files.files || files.files.length === 0) {
    return <div className="alert alert-warning">No .sol files found in the /src directory for the given contract address and chain ID.</div>;
  }

  const handleCopyClick = (fileContent) => {
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

  const handleFileSelect = (file) => {
    setSelectedFileContent(file.content);
    setSelectedFileName(file.url.split('/').pop().replace(/-/g, ' ').replace('.sol', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
  };

  return (
    <div className="mt-4">
      <h4>Contract Files in /src Directory:</h4>
      <DropdownButton id="dropdown-basic-button" title="Select a .sol file to view">
        {files.files.map((file, index) => (
          <Dropdown.Item key={index} onClick={() => handleFileSelect(file)}>
            {file.url.split('/').pop()}
          </Dropdown.Item>
        ))}
      </DropdownButton>
      {selectedFileContent && (
        <div className="card mt-2">
          <div className="card-body">
            <div className="card-title">
              <span>Suggested Contract Name: {selectedFileName}</span>
              <CopyToClipboard text={selectedFileName}>
                <button className="btn btn-link btn-sm ml-2">
                  <i className="fas fa-copy"></i> Copy
                </button>
              </CopyToClipboard>
            </div>
            <div className="card-title">
              <span>Selected File Content</span>
              <CopyToClipboard text={selectedFileContent}>
                <button className="btn btn-link btn-sm ml-2" onClick={() => handleCopyClick(selectedFileContent)}>
                  <i className="fas fa-copy"></i> Copy
                </button>
              </CopyToClipboard>
            </div>
            <pre className="card-text"><code>{selectedFileContent}</code></pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilesDisplay;
