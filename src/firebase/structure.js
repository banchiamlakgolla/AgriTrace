// Create this file: src/firebase/structure.js
import { db } from '../firebase';
import { collection, addDoc, setDoc, doc } from 'firebase/firestore';

// Standard shipment structure
export const shipmentStructure = {
  // Basic info
  shipmentId: 'EXP-2024-001', // Generated automatically
  shipmentName: 'Coffee Export to Europe',
  description: 'Premium Ethiopian coffee beans',
  
  // Products
  products: [
    { id: 'PROD-001', name: 'Arabica Coffee', quantity: '1000kg', price: '$8.50/kg' }
  ],
  
  // Logistics
  origin: 'Addis Ababa, Ethiopia',
  destination: 'Hamburg, Germany',
  departureDate: '2024-01-20',
  expectedDelivery: '2024-02-10',
  shippingCost: 2500,
  shippingMethod: 'Sea Freight',
  
  // Tracking
  status: 'pending', // pending, in-transit, delivered, cancelled
  currentLocation: 'Port of Djibouti',
  trackingNumber: 'TRK-ETH-2024-001',
  
  // Blockchain
  blockchainHash: null, // Will store transaction hash when recorded
  onBlockchain: false,
  
  // Metadata
  exporterId: 'user_123',
  exporterName: 'Export Company Name',
  exporterEmail: 'export@company.com',
  
  // Timestamps
  createdAt: new Date(),
  updatedAt: new Date()
};