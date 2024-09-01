export const fetchSourcifyData = async (contractAddress, chainId) => {
    const url = `https://sourcify.dev/server/check-all-by-addresses?addresses=${contractAddress}&chainIds=${chainId}`;
    const res = await fetch(url);
    const data = await res.json();
    return data;
  };
  
  export const fetchFilesData = async (contractAddress, chainId) => {
    const url = `https://sourcify.dev/server/files/tree/any/${chainId}/${contractAddress}`;
    const res = await fetch(url);
    const data = await res.json();
    const srcFiles = data.files.filter(file => file.includes('/src/') && file.endsWith('.sol'));
    const fileContents = await Promise.all(srcFiles.map(async (file) => {
      const fileRes = await fetch(file);
      const fileContent = await fileRes.text();
      return { url: file, content: fileContent };
    }));
    return { ...data, files: fileContents };
  };
  