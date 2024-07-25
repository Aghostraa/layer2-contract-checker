
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
  const res = await fetch(blockscoutUrl);
  const data = await res.json();
  return data;
};
