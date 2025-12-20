import React, { useState } from 'react';
import blockchainService from '../services/blockchain';

const TestBlockchain = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    const result = await blockchainService.connectWallet();
    if (result.success) {
      setWalletConnected(true);
      setWalletAddress(result.address);
    } else {
      alert('Failed to connect: ' + result.error);
    }
  };

  const testVerification = async () => {
    setLoading(true);
    const result = await blockchainService.verifyProduct('PROD-001');
    setVerificationResult(result);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Blockchain Integration Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Wallet Connection */}
          <div className="bg-gray-800 p-6 rounded-xl">
            <h2 className="text-xl font-bold mb-4">Wallet Connection</h2>
            {!walletConnected ? (
              <button
                onClick={connectWallet}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg font-bold hover:from-purple-700 hover:to-blue-600"
              >
                Connect Wallet (Metamask)
              </button>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-green-900 rounded-lg">
                  <p className="text-green-300">✅ Wallet Connected</p>
                  <p className="text-sm truncate">{walletAddress}</p>
                </div>
                <button className="w-full py-2 bg-gray-700 rounded-lg">
                  Disconnect
                </button>
              </div>
            )}
          </div>

          {/* Product Verification */}
          <div className="bg-gray-800 p-6 rounded-xl">
            <h2 className="text-xl font-bold mb-4">Product Verification</h2>
            <button
              onClick={testVerification}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-500 rounded-lg font-bold mb-4 hover:from-green-700 hover:to-emerald-600"
            >
              {loading ? 'Verifying...' : 'Test Blockchain Verification'}
            </button>
            
            {verificationResult && (
              <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                <h3 className="font-bold mb-2">Verification Result:</h3>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(verificationResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Blockchain Info */}
        <div className="mt-8 bg-gray-800 p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-4">Blockchain Network Info</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-900 p-4 rounded-lg">
              <p className="text-gray-400">Network</p>
              <p className="font-bold">Polygon Mainnet</p>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <p className="text-gray-400">Smart Contract</p>
              <p className="font-mono text-sm">0xAgri...Trace</p>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <p className="text-gray-400">Token Standard</p>
              <p className="font-bold">ERC-1155</p>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <p className="text-gray-400">Gas Fees</p>
              <p className="font-bold">~$0.01</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestBlockchain;