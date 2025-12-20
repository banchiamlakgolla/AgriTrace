import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { 
  CheckCircle, 
  XCircle, 
  User, 
  MapPin, 
  Calendar, 
  Package,
  Truck,
  Globe,
  Shield
} from 'lucide-react';

const VerifyProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyProduct = async () => {
      setLoading(true);
      setError('');
      
      try {
        let productData = null;
        
        // Try to get by document ID first
        const docRef = doc(db, 'products', productId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          productData = { id: docSnap.id, ...docSnap.data() };
        } else {
          // Try querying by product ID field
          const q = query(collection(db, 'products'), where('id', '==', productId));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            productData = { id: doc.id, ...doc.data() };
          }
        }
        
        if (productData) {
          setProduct(productData);
          
          // Optional: Also fetch shipment data if available
          const shipmentQuery = query(
            collection(db, 'shipments'),
            where('productId', '==', productData.id)
          );
          const shipmentSnapshot = await getDocs(shipmentQuery);
          
          if (!shipmentSnapshot.empty) {
            const shipments = shipmentSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setProduct(prev => ({ ...prev, shipments }));
          }
        } else {
          setError('Product not found in our database');
        }
      } catch (err) {
        console.error('Verification error:', err);
        setError('Failed to verify product: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      verifyProduct();
    }
  }, [productId]);

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-800">Verifying Product...</h2>
          <p className="text-gray-600">Checking our database for product information</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500 mb-6">
            This product may not be registered in our system or the QR code is invalid.
          </p>
          <button
            onClick={() => navigate('/scan')}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Scan Another Code
          </button>
        </div>
      </div>
    );
  }

  // Render success state
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">✅ Product Verified</h1>
              <p className="text-gray-600">Genuine product registered in AgriTrace system</p>
            </div>
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium">
              Authentic
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Product Info Card */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Product Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Product Name</p>
                  <p className="font-bold text-lg">{product.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Product ID</p>
                  <p className="font-mono text-gray-800">{product.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium">{product.category || 'Agricultural Product'}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Farmer</p>
                  <p className="font-medium flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    {product.farmerName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Origin</p>
                  <p className="font-medium flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {product.origin}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Harvest Date</p>
                  <p className="font-medium flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {product.harvestDate}
                  </p>
                </div>
              </div>
            </div>
            
            {product.description && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Description</p>
                <p className="text-gray-700">{product.description}</p>
              </div>
            )}
          </div>

          {/* Verification Status */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Verification Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span>Database Verified</span>
                </div>
                <span className="text-green-600 font-bold">✓</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-blue-600 mr-2" />
                  <span>System Registration</span>
                </div>
                <span className="text-blue-600 font-bold">✓</span>
              </div>
              
              {product.createdAt && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Registered On</p>
                  <p className="font-medium">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Journey */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Product Journey</h2>
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-center mb-4 md:mb-0">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <User className="w-8 h-8 text-green-600" />
              </div>
              <p className="font-medium">Farming</p>
              <p className="text-sm text-gray-500">By {product.farmerName}</p>
            </div>
            
            <div className="hidden md:block flex-1 h-1 bg-green-200 mx-4"></div>
            
            <div className="text-center mb-4 md:mb-0">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
              <p className="font-medium">Processing</p>
              <p className="text-sm text-gray-500">Quality checked & packaged</p>
            </div>
            
            <div className="hidden md:block flex-1 h-1 bg-blue-200 mx-4"></div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Truck className="w-8 h-8 text-purple-600" />
              </div>
              <p className="font-medium">Distribution</p>
              <p className="text-sm text-gray-500">Ready for shipment</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="text-center space-x-4">
          <button
            onClick={() => navigate('/scan')}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Verify Another Product
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Print This Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyProduct;