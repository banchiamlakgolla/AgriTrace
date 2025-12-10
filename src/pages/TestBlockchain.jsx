import React from 'react';
import { useBlockchain } from '../contexts/BlockchainContext';

const TestBlockchain = () => {
  const { 
    isConnected, 
    walletAddress, 
    network, 
    connectWallet,
    verifyProduct 
  } = useBlockchain();

  const handleTest = async () => {
    const result = await verifyProduct('test-123');
    console.log('Blockchain test result:', result);
    alert(`Verified: ${result.verified}\nBlockchain: ${result.blockchainVerified}`);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Blockchain Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded-lg">
          <p><strong>Status:</strong> {isConnected ? '✅ Connected' : '❌ Disconnected'}</p>
          <p><strong>Network:</strong> {network || 'Not connected'}</p>
          <p><strong>Wallet:</strong> {walletAddress || 'Not connected'}</p>
        </div>
        
        <button
          onClick={connectWallet}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          {isConnected ? 'Reconnect Wallet' : 'Connect MetaMask'}
        </button>
        
        <button
          onClick={handleTest}
          className="px-4 py-2 bg-green-600 text-white rounded-lg ml-4"
        >
          Test Product Verification
        </button>
      </div>
    </div>
  );
};

export default TestBlockchain;