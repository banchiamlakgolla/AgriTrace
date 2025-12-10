// Blockchain configuration
export const blockchainConfig = {
  network: 'polygon', // Cheap and fast
  rpcUrl: 'https://polygon-rpc.com', // Free Polygon node
  chainId: 137, // Polygon Mainnet ID
  
  // Test network (use while developing)
  testRpcUrl: 'https://rpc-mumbai.maticvigil.com',
  testChainId: 80001, // Mumbai Testnet
  
  // Contract addresses (we'll create these)
  productRegistry: '0x...', // Will fill later
  certificateNFT: '0x...'   // Will fill later
};

// ABIs (Application Binary Interface)
export const contractABIs = {
  productRegistry: [
    'function registerProduct(string memory productId, string memory farmerName, string memory location) public returns (uint256)',
    'function addProductStep(string memory productId, string memory step, string memory data) public',
    'function verifyProduct(string memory productId) public view returns (bool)',
    'function getProductHistory(string memory productId) public view returns (string[] memory)'
  ],
  
  certificateNFT: [
    'function mintCertificate(address to, string memory tokenURI) public returns (uint256)',
    'function ownerOf(uint256 tokenId) public view returns (address)'
  ]
};