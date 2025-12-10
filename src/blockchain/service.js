import { ethers } from 'ethers';
import { blockchainConfig, contractABIs } from './config';

class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.isConnected = false;
  }

  // Step 1: Connect to blockchain
  async connect() {
    try {
      // Check if user has MetaMask
      if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        this.provider = new ethers.BrowserProvider(window.ethereum);
        this.signer = await this.provider.getSigner();
        this.isConnected = true;
        
        console.log('✅ Connected to blockchain');
        return true;
      } else {
        console.log('❌ Please install MetaMask');
        return false;
      }
    } catch (error) {
      console.error('Blockchain connection error:', error);
      return false;
    }
  }

  // Step 2: Register product on blockchain
  async registerProduct(productData) {
    try {
      const { productId, farmerName, location, farmerAddress } = productData;
      
      // Create transaction
      const tx = {
        to: '0x0000000000000000000000000000000000000000', // Will replace with actual contract
        value: ethers.parseEther('0'), // No payment needed
        data: `0x${productId}${farmerName}${location}` // Simple data
      };
      
      // Send transaction
      const transaction = await this.signer.sendTransaction(tx);
      console.log('📝 Product registered on blockchain:', transaction.hash);
      
      return {
        success: true,
        txHash: transaction.hash,
        blockNumber: transaction.blockNumber
      };
      
    } catch (error) {
      console.error('Product registration error:', error);
      return { success: false, error: error.message };
    }
  }

  // Step 3: Add product step (harvest → process → ship)
  async addProductStep(productId, step, stepData) {
    try {
      // Simple transaction for product step
      const tx = await this.signer.sendTransaction({
        to: '0x0000000000000000000000000000000000000000',
        data: `Step:${step}|Product:${productId}|Data:${JSON.stringify(stepData)}`
      });
      
      return {
        success: true,
        txHash: tx.hash,
        step: step
      };
      
    } catch (error) {
      console.error('Add step error:', error);
      return { success: false, error: error.message };
    }
  }

  // Step 4: Verify product
  async verifyProduct(productId) {
    try {
      // For now, return mock data
      // Later will connect to actual contract
      return {
        verified: true,
        productId: productId,
        blockchainVerified: true,
        steps: [
          { step: 'Harvested', timestamp: Date.now() - 86400000, txHash: '0x123...' },
          { step: 'Processed', timestamp: Date.now() - 43200000, txHash: '0x456...' }
        ]
      };
    } catch (error) {
      console.error('Verification error:', error);
      return { verified: false, error: error.message };
    }
  }
}

// Create single instance
const blockchainService = new BlockchainService();
export default blockchainService;