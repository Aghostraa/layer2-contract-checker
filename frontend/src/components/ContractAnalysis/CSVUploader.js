import React, { useState } from 'react';

function CSVUploader({ onUpload }) {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    console.log('Selected file:', selectedFile);
    setFile(selectedFile);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      console.error('No file selected');
      return;
    }

    console.log('Submitting file:', file);
    try {
      await onUpload(file);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" onChange={handleFileChange} accept=".csv" />
      <button type="submit" disabled={!file}>Upload CSV</button>
    </form>
  );
}

export default CSVUploader;