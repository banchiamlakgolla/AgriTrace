import React, { createContext, useState, useContext } from 'react';
import blockchainService from '../blockchain/service';

const BlockchainContext = createContext();

export const BlockchainProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [network, setNetwork] = useState('');

  const connectWallet = async () => {
    const connected = await blockchainService.connect();
    if (connected && blockchainService.signer) {
      const address = await blockchainService.signer.getAddress();
      setWalletAddress(address);
      setIsConnected(true);
      setNetwork('Polygon');
    }
    return connected;
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress('');
    setNetwork('');
  };

  return (
    <BlockchainContext.Provider
      value={{
        isConnected,
        walletAddress,
        network,
        connectWallet,
        disconnectWallet,
        registerProduct: blockchainService.registerProduct.bind(blockchainService),
        addProductStep: blockchainService.addProductStep.bind(blockchainService),
        verifyProduct: blockchainService.verifyProduct.bind(blockchainService)
      }}
    >
      {children}
    </BlockchainContext.Provider>
  );
};

export const useBlockchain = () => useContext(BlockchainContext);