// src/services/blockchain.js - COMPLETE VERSION WITH SHIPMENT FUNCTION
// NO ETHERS IMPORT - Pure mock service

// Mock blockchain data for testing
const MOCK_BLOCKCHAIN_DATA = {
  'PROD-001': {
    txHash: '0x1234...abcd',
    blockNumber: 1234567,
    timestamp: '2024-01-15T10:30:00Z',
    verified: true,
    data: {
      farmer: 'Azeb Yirga',
      location: 'Gonder, Ethiopia',
      harvestDate: '2024-01-10',
      certifications: ['Organic', 'Fair Trade']
    }
  },
  'PROD-002': {
    txHash: '0x5678...efgh',
    blockNumber: 1234568,
    timestamp: '2024-01-16T14:20:00Z',
    verified: true
  }
};

// Mock blockchain interaction
class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
  }

  // Connect to blockchain wallet (MOCK VERSION)
  async connectWallet() {
    // Mock implementation - no real ethers
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          address: '0xMock' + Math.random().toString(16).substr(2, 10),
          message: 'Mock wallet connection'
        });
      }, 500);
    });
  }

  // Verify product on blockchain (mock version)
  async verifyProduct(productId) {
    // For now, return mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = MOCK_BLOCKCHAIN_DATA[productId] || {
          txHash: `0x${Math.random().toString(16).substr(2, 12)}...`,
          blockNumber: Math.floor(Math.random() * 1000000) + 1000000,
          timestamp: new Date().toISOString(),
          verified: Math.random() > 0.3, // 70% verified
          data: null
        };
        resolve(data);
      }, 1000);
    });
  }

  // Record product on blockchain (mock version)
  async recordProduct(productData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          txHash: `0x${Math.random().toString(36).substr(2, 16)}`,
          blockNumber: Math.floor(Math.random() * 1000000) + 2000000,
          timestamp: new Date().toISOString(),
          message: 'Product recorded on blockchain'
        });
      }, 1500);
    });
  }

  // RECORD SHIPMENT ON BLOCKCHAIN - NEW FUNCTION
  async recordShipment(shipmentData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const txHash = `0x${Math.random().toString(36).substr(2, 16)}${Math.random().toString(36).substr(2, 16)}`;
        
        resolve({
          success: true,
          txHash: txHash,
          blockNumber: Math.floor(Math.random() * 1000000) + 3000000,
          timestamp: new Date().toISOString(),
          message: 'Shipment recorded on blockchain',
          data: {
            shipmentId: shipmentData.shipmentId,
            exporter: shipmentData.exporter,
            destination: shipmentData.destination,
            products: shipmentData.products || [],
            timestamp: shipmentData.timestamp || new Date().toISOString()
          }
        });
      }, 1500);
    });
  }

  // Get product history from blockchain
  async getProductHistory(productId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            action: 'Harvested',
            timestamp: '2024-01-10T08:00:00Z',
            location: 'Gonder, Ethiopia',
            txHash: '0xabc123...'
          },
          {
            action: 'Processed',
            timestamp: '2024-01-12T14:30:00Z',
            location: 'Processing Facility',
            txHash: '0xdef456...'
          },
          {
            action: 'Packaged',
            timestamp: '2024-01-14T10:15:00Z',
            location: 'Packaging Center',
            txHash: '0xghi789...'
          }
        ]);
      }, 800);
    });
  }

  // Get shipment history from blockchain
  async getShipmentHistory(shipmentId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            action: 'Shipment Created',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            location: 'Export Facility',
            txHash: '0xship123...',
            status: 'Recorded'
          },
          {
            action: 'Customs Clearance',
            timestamp: new Date(Date.now() - 43200000).toISOString(),
            location: 'Port Authority',
            txHash: '0xship456...',
            status: 'Completed'
          },
          {
            action: 'Loaded on Vessel',
            timestamp: new Date().toISOString(),
            location: 'Shipping Port',
            txHash: '0xship789...',
            status: 'In Progress'
          }
        ]);
      }, 800);
    });
  }
}

export default new BlockchainService();