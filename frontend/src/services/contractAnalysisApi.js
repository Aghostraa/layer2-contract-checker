// src/services/contractAnalysisApi.js

export const uploadCSV = async (file) => {
  if (!file) {
    throw new Error('No file provided');
  }

  const formData = new FormData();
  formData.append('file', file);

  console.log('Uploading file:', file.name);

  try {
    const response = await fetch('http://localhost:8080/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server response:', errorText);
      throw new Error(`CSV upload failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error during fetch:', error);
    throw error;
  }
};

export const fetchContractAnalysis = async () => {
  try {
    const response = await fetch('http://localhost:8080/contracts');

    if (!response.ok) {
      throw new Error(`Contract analysis failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Fetched contract data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching contract analysis:', error);
    throw error;
  }
};

export const processContracts = (maxQueries = null, onProgress) => {
  return new Promise((resolve, reject) => {
    let url = `ws://${window.location.hostname}:8080/process`;
    if (maxQueries !== null) {
      url += `?max_queries=${maxQueries}`;
    }

    const socket = new WebSocket(url);

    socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.error) {
        reject(new Error(data.error));
      } else if (data.message) {
        resolve(data);
      } else {
        onProgress(data);
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      reject(new Error('WebSocket connection failed'));
    };

    socket.onclose = (event) => {
      if (event.wasClean) {
        console.log(`WebSocket connection closed cleanly, code=${event.code}, reason=${event.reason}`);
      } else {
        console.error('WebSocket connection died');
        reject(new Error('WebSocket connection died'));
      }
    };
  });
};
