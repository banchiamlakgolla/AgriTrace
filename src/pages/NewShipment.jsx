import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';


const NewShipment = () => {
  const navigate = useNavigate();
  const [availableProducts, setAvailableProducts] = useState([]);
  const [formData, setFormData] = useState({
    shipmentName: '',
    destination: '',
    exportDate: '',
    selectedProducts: [],
    exporterId: '',
    exporterName: '',
    status: 'pending',
    createdAt: new Date().toISOString()
  });

  // Get current user
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('agritrace_user') || '{}');
    setFormData(prev => ({
      ...prev,
      exporterId: userData.uid,
      exporterName: userData.fullName,
      exporterEmail: userData.email
    }));

    // Fetch available products from Firebase
    fetchAvailableProducts();
  }, []);

  // Fetch products from Firebase
  const fetchAvailableProducts = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'products'));
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAvailableProducts(products);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle product selection
  const handleProductSelect = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setFormData(prev => ({
      ...prev,
      selectedProducts: selectedOptions
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Add shipment to Firebase
      const docRef = await addDoc(collection(db, 'shipments'), {
        ...formData,
        shipmentId: `EXP-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tracking: {
          created: new Date().toISOString(),
          stages: ['Export Prepared']
        }
      });

      alert(`✅ Shipment created successfully! ID: ${docRef.id}`);
      
      // Redirect to exporter dashboard
      navigate('/exporter-dashboard');
      
    } catch (error) {
      console.error('Error creating shipment:', error);
      alert('❌ Failed to create shipment. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-6">
      <div className="max-w-6xl mx-auto">
        <Link to="/exporter-dashboard" className="inline-block mb-6 text-blue-700 hover:text-blue-900">
          ← Back to Dashboard
        </Link>
        
        <h1 className="text-3xl font-bold text-blue-800 mb-2">New Export Shipment</h1>
        <p className="text-gray-600 mb-8">Create a new shipment for export products</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Shipment Name *</label>
                <input
                  type="text"
                  name="shipmentName"
                  placeholder="e.g., Coffee Export to Europe"
                  className="w-full p-3 border rounded-lg"
                  value={formData.shipmentName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Destination Country *</label>
                <input
                  type="text"
                  name="destination"
                  placeholder="e.g., Germany"
                  className="w-full p-3 border rounded-lg"
                  value={formData.destination}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Export Date *</label>
                <input
                  type="date"
                  name="exportDate"
                  className="w-full p-3 border rounded-lg"
                  value={formData.exportDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Products to Include</label>
                <select 
                  name="products"
                  className="w-full p-3 border rounded-lg" 
                  multiple
                  onChange={handleProductSelect}
                  value={formData.selectedProducts}
                >
                  {availableProducts.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {product.type} (Batch: {product.batchNumber})
                    </option>
                  ))}
                  {availableProducts.length === 0 && (
                    <option disabled>No products available</option>
                  )}
                </select>
                <p className="text-sm text-gray-500 mt-1">Hold Ctrl to select multiple products</p>
                <p className="text-sm text-blue-600 mt-1">
                  {formData.selectedProducts.length} product(s) selected
                </p>
              </div>

              <button 
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                Create Shipment
              </button>
            </form>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-blue-800 mb-4">Shipment Preview</h2>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-bold text-gray-800">Export Details</h3>
                {formData.shipmentName ? (
                  <>
                    <p className="text-gray-800 mt-2"><strong>Name:</strong> {formData.shipmentName}</p>
                    <p className="text-gray-800"><strong>Destination:</strong> {formData.destination}</p>
                    <p className="text-gray-800"><strong>Export Date:</strong> {formData.exportDate}</p>
                    <p className="text-gray-800"><strong>Exporter:</strong> {formData.exporterName}</p>
                    <p className="text-gray-800"><strong>Products:</strong> {formData.selectedProducts.length}</p>
                  </>
                ) : (
                  <p className="text-gray-600 text-sm mt-2">Fill the form to see shipment details</p>
                )}
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-bold text-gray-800">Blockchain Verification</h3>
                <ul className="space-y-2 text-gray-600 mt-2">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Export certificate will be minted as NFT
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Immutable shipping records
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Customs clearance verification
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewShipment;