const blockscoutUrls = {
  "10": "https://optimism.blockscout.com/api/v2/smart-contracts/",
  "1101": "https://explorer.zkevm.com/api/v2/smart-contracts/",
  "34443": "https://explorer.mode.network/api/v2/smart-contracts/",
  "42161": "https://arbitrum.blockscout.com/api/v2/smart-contracts/",
  "534352": "https://explorer.scroll.io/api/v2/smart-contracts/",
  "7777777": "https://explorer.zora.energy/api/v2/smart-contracts/",
  "8453": "https://base.blockscout.com/api/v2/smart-contracts/",
  "342": "https://zksync.blockscout.com/api/v2/smart-contracts/"
};

export const fetchBlockscoutData = async (contractAddress, chainId) => {
  const blockscoutUrl = `${blockscoutUrls[chainId]}${contractAddress}`;

  console.log('Fetching Blockscout data from URL:', blockscoutUrl);

  try {
    const res = await fetch(blockscoutUrl);

    // Check if the response is JSON
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(`Expected JSON, but got ${contentType}`);
    }

    const data = await res.json();

    // Extract relevant information
    const isVerified = data.is_fully_verified || false;
    const contractName = data.name || ''; // If there's a name field, use it. Otherwise, it's an empty string.

    console.log('Verification status:', isVerified);
    console.log('Contract name:', contractName);

    return {
      verified: isVerified,
      contractName: contractName,
      sourceCode: data.source_code || '',
      verifiedAt: data.verified_at || '',
      filePath: data.file_path || ''
    };
  } catch (error) {
    console.error('Error fetching Blockscout data:', error);
    return {
      verified: false,
      contractName: '',
      sourceCode: '',
      verifiedAt: '',
      filePath: ''
    };
  }
};