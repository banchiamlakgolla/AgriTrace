// src/pages/ProductDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { 
  Package, MapPin, Calendar, Hash, Scale, Award, 
  DollarSign, Shield, Download, Printer, QrCode,
  ArrowLeft, CheckCircle, Clock, Truck, Factory, Store
} from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shipments, setShipments] = useState([]);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    fetchProductData();
  }, [id]);

  const fetchProductData = async () => {
    try {
      // Try to get by productId first
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('productId', '==', id));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const productDoc = querySnapshot.docs[0];
        setProduct({ id: productDoc.id, ...productDoc.data() });
        
        // Fetch shipments for this product
        const shipmentsQuery = query(
          collection(db, 'shipments'),
          where('products', 'array-contains', id)
        );
        const shipmentsSnapshot = await getDocs(shipmentsQuery);
        const shipmentData = shipmentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setShipments(shipmentData);
      } else {
        // Try to get by document ID
        const productDoc = await getDoc(doc(db, 'products', id));
        if (productDoc.exists()) {
          setProduct({ id: productDoc.id, ...productDoc.data() });
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/farmer-dashboard')}
            className="px-6 py-3 bg-green-600 text-white rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate('/farmer-dashboard')}
            className="flex items-center text-green-600 hover:text-green-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
              <p className="text-gray-600">Product ID: {product.productId}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowQR(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Show QR
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center">
                <Printer className="w-4 h-4 mr-2" />
                Print Label
              </button>
            </div>
          </div>
        </div>

        {/* Product Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Product Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Product Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500">Product Name</label>
                    <p className="font-medium">{product.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Type</label>
                    <p className="font-medium">{product.type}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Batch Number</label>
                    <p className="font-medium">{product.batchNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Harvest Date</label>
                    <p className="font-medium">{product.harvestDate}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500">Farm Location</label>
                    <p className="font-medium flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-green-600" />
                      {product.location}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Weight</label>
                    <p className="font-medium flex items-center">
                      <Scale className="w-4 h-4 mr-2 text-green-600" />
                      {product.weight} {product.unit}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Quality Grade</label>
                    <p className="font-medium flex items-center">
                      <Award className="w-4 h-4 mr-2 text-green-600" />
                      {product.qualityGrade}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Price</label>
                    <p className="font-medium flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                      {product.pricePerKg ? `$${product.pricePerKg}/kg` : 'Not set'}
                    </p>
                  </div>
                </div>
              </div>
              
              {product.description && (
                <div className="mt-6">
                  <label className="text-sm text-gray-500">Description</label>
                  <p className="mt-2 text-gray-700">{product.description}</p>
                </div>
              )}
            </div>

            {/* Certifications Card */}
            {product.certifications && product.certifications.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Certifications</h2>
                <div className="flex flex-wrap gap-3">
                  {product.certifications.map((cert, index) => (
                    <span key={index} className="px-4 py-2 bg-green-100 text-green-800 rounded-full flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Shipments Card */}
            {shipments.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Shipment History</h2>
                <div className="space-y-4">
                  {shipments.map(shipment => (
                    <div key={shipment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">{shipment.shipmentName}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs ${
                          shipment.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          shipment.status === 'in-transit' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {shipment.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        <Truck className="w-4 h-4 inline mr-2" />
                        {shipment.destination}
                      </p>
                      {shipment.expectedDelivery && (
                        <p className="text-sm text-gray-600 mt-1">
                          <Calendar className="w-4 h-4 inline mr-2" />
                          Expected: {shipment.expectedDelivery}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Status & Actions */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Status</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Registration</span>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Quality Check</span>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Blockchain</span>
                  {product.onBlockchain ? (
                    <div className="flex items-center">
                      <Shield className="w-5 h-5 text-purple-600 mr-2" />
                      <span className="text-purple-600">Verified</span>
                    </div>
                  ) : (
                    <Clock className="w-5 h-5 text-yellow-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Market Ready</span>
                  {product.status === 'in_market' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-yellow-600" />
                  )}
                </div>
              </div>
            </div>

            {/* Blockchain Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-purple-600" />
                Blockchain Verification
              </h2>
              {product.onBlockchain ? (
                <div className="space-y-3">
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-700 font-mono break-all">
                      Hash: {product.blockchainHash || '0x...'}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600">
                    This product is immutably recorded on the blockchain.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 mb-4">
                    Record this product on the blockchain for permanent verification.
                  </p>
                  <button className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700">
                    Record on Blockchain
                  </button>
                </div>
              )}
            </div>

            {/* Actions Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Actions</h2>
              <div className="space-y-3">
                <button className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center justify-center">
                  <Download className="w-5 h-5 mr-2" />
                  Export Product Data
                </button>
                <button
                  onClick={() => navigate(`/product/${product.productId}/qr`)}
                  className="w-full py-3 border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 flex items-center justify-center"
                >
                  <QrCode className="w-5 h-5 mr-2" />
                  View QR Code
                </button>
                <button className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center">
                  <Printer className="w-5 h-5 mr-2" />
                  Print Labels
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Product QR Code</h3>
              <button
                onClick={() => setShowQR(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="text-center">
              <div className="w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                {/* QR Code would be generated here */}
                <QrCode className="w-32 h-32 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-2">Scan to verify product authenticity</p>
              <p className="text-sm text-gray-500">Product ID: {product.productId}</p>
              <div className="mt-6 space-y-2">
                <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium">
                  Download QR Code
                </button>
                <button className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium">
                  Print QR Label
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;