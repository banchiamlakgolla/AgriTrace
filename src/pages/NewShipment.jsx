// src/pages/NewShipment.jsx - COMPLETE FIXED VERSION
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc 
} from 'firebase/firestore';
import { db } from '../firebase';
import { Truck, Save, X, Package, MapPin, Calendar, DollarSign, FileText } from 'lucide-react';

const NewShipment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    shipmentName: '',
    products: '',
    destination: '',
    departureDate: '',
    expectedDelivery: '',
    shippingCost: '',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Helper function to get product IDs from names
  const getProductIdsFromNames = async (productNames) => {
    const names = productNames.split(',').map(p => p.trim()).filter(p => p);
    const productIds = [];
    
    for (const name of names) {
      const q = query(collection(db, 'products'), where('name', '==', name));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        productIds.push(querySnapshot.docs[0].data().productId);
      }
    }
    
    return productIds;
  };

  // Helper function to update products with shipment reference
  const updateProductsWithShipment = async (productIds, shipmentId) => {
    for (const productId of productIds) {
      const q = query(collection(db, 'products'), where('productId', '==', productId));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const productDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, 'products', productDoc.id), {
          shipmentId: shipmentId,
          shipmentStatus: 'pending',
          updatedAt: serverTimestamp()
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Get current user
      const userData = JSON.parse(localStorage.getItem('agritrace_user') || '{}');
      
      if (!userData.uid) {
        alert('You must be logged in to create shipments');
        navigate('/login');
        return;
      }
      
      console.log('🚚 Creating shipment...');
      
      // Get product IDs from names
      const productIds = await getProductIdsFromNames(formData.products);
      
      if (productIds.length === 0) {
        alert('❌ No valid products found. Please check product names.');
        setLoading(false);
        return;
      }
      
      // Generate shipment ID
      const shipmentId = `SHIP-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
      
      // Create shipment data
      const shipmentData = {
        shipmentId: shipmentId,
        shipmentName: formData.shipmentName,
        destination: formData.destination,
        products: productIds, // Store product IDs
        productNames: formData.products.split(',').map(p => p.trim()).filter(p => p),
        departureDate: formData.departureDate,
        expectedDelivery: formData.expectedDelivery,
        shippingCost: formData.shippingCost ? parseFloat(formData.shippingCost) : 0,
        notes: formData.notes,
        
        // Exporter info
        exporterId: userData.uid,
        exporterName: userData.fullName || userData.email,
        exporterEmail: userData.email,
        
        // Status
        status: 'pending',
        currentLocation: 'At Origin',
        shippingMethod: 'Sea Freight',
        trackingNumber: `TRK-${Date.now().toString().slice(-8)}`,
        
        // Timestamps
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Blockchain
        onBlockchain: false,
        blockchainHash: null
      };

      console.log('📦 Saving shipment to Firestore...', shipmentData);
      
      // Save to Firestore
      const shipmentRef = await addDoc(collection(db, 'shipments'), shipmentData);
      
      // Update products with shipment reference
      await updateProductsWithShipment(productIds, shipmentRef.id);
      
      console.log('✅ Shipment saved with ID:', shipmentRef.id, 'Shipment ID:', shipmentId);
      
      // Show success message
      alert(`✅ Shipment "${formData.shipmentName}" created successfully!\n\nShipment ID: ${shipmentId}\nLinked Products: ${productIds.length}\n\nProducts are now marked for shipment.`);
      
      // Navigate back to exporter dashboard
      navigate('/exporter-dashboard');
      
      // Reset form
      setFormData({
        shipmentName: '',
        products: '',
        destination: '',
        departureDate: '',
        expectedDelivery: '',
        shippingCost: '',
        notes: ''
      });
      
    } catch (error) {
      console.error('❌ Error creating shipment:', error);
      alert(`❌ Failed to create shipment: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate('/exporter-dashboard')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <X className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
          
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <Truck className="w-8 h-8 mr-3 text-blue-600" />
            Create New Shipment
          </h1>
          <p className="text-gray-600 mt-2">Export products with complete traceability</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shipment Name */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Package className="w-4 h-4 mr-2 text-blue-600" />
                  Shipment Name *
                </label>
                <input
                  type="text"
                  name="shipmentName"
                  value={formData.shipmentName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Coffee to Europe"
                  required
                />
              </div>

              {/* Products */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Package className="w-4 h-4 mr-2 text-green-600" />
                  Products (comma separated) *
                </label>
                <input
                  type="text"
                  name="products"
                  value={formData.products}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Organic Arabica Coffee, Premium Cocoa Beans"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter exact product names as registered by farmers
                </p>
              </div>

              {/* Destination */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 mr-2 text-red-600" />
                  Destination *
                </label>
                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g., Hamburg, Germany"
                  required
                />
              </div>

              {/* Departure Date */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 mr-2 text-orange-600" />
                  Departure Date *
                </label>
                <input
                  type="date"
                  name="departureDate"
                  value={formData.departureDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Expected Delivery */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 mr-2 text-green-600" />
                  Expected Delivery *
                </label>
                <input
                  type="date"
                  name="expectedDelivery"
                  value={formData.expectedDelivery}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Shipping Cost */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 mr-2 text-yellow-600" />
                  Shipping Cost ($)
                </label>
                <input
                  type="number"
                  name="shippingCost"
                  value={formData.shippingCost}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="e.g., 2500"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 mr-2 text-purple-600" />
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent h-32"
                placeholder="Special instructions, handling requirements, temperature control, etc."
              />
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                <strong>How it works:</strong> Enter product names exactly as they appear in the system. 
                The shipment will be linked to those products, updating their status to "pending shipment".
                Farmers will be notified when their products are scheduled for export.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/exporter-dashboard')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-medium hover:from-blue-700 hover:to-cyan-600 disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Create Shipment
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewShipment;