// src/components/qr/QRScanner.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QrCode, Search, CheckCircle, XCircle, MapPin, Calendar, User, Truck, Factory, Store, Shield, ExternalLink } from 'lucide-react';
import { db } from '../../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import blockchainService from '../../services/blockchain';

const QRScanner = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [productId, setProductId] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [productData, setProductData] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [blockchainData, setBlockchainData] = useState(null);
  const [farmerInfo, setFarmerInfo] = useState(null);

  // Check for pre-filled productId from navigation
  useEffect(() => {
    if (location.state?.productId) {
      setProductId(location.state.productId);
      if (location.state.prefill) {
        setTimeout(() => handleVerify(), 500);
      }
    }
  }, [location]);

  // Main verification function
  const handleVerify = async () => {
    if (!productId.trim()) {
      setError('Please enter a valid Product ID');
      return;
    }
    
    setLoading(true);
    setError('');
    setVerificationResult(null);
    setProductData(null);
    setShipments([]);
    setBlockchainData(null);
    setFarmerInfo(null);
    
    try {
      // Try to fetch from Firebase first
      await fetchFromFirebase(productId);
      
      // Also try to fetch from blockchain (your mock service)
      await fetchFromBlockchain(productId);
      
      // Combine results
      combineResults();
      
    } catch (error) {
      console.error('Verification error:', error);
      setError('Verification failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch from Firebase
 // In QRScanner.jsx, enhance the fetchFromFirebase function:
const fetchFromFirebase = async (id) => {
  try {
    // 1. Get product
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('productId', '==', id));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const productDoc = querySnapshot.docs[0];
      const productData = productDoc.data();
      
      // 2. Get farmer info
      if (productData.farmerId) {
        const farmerDoc = await getDoc(doc(db, 'users', productData.farmerId));
        if (farmerDoc.exists()) {
          productData.farmerInfo = farmerDoc.data();
        }
      }
      
      // 3. Get shipment info
      if (productData.shipmentId) {
        const shipmentDoc = await getDoc(doc(db, 'shipments', productData.shipmentId));
        if (shipmentDoc.exists()) {
          productData.shipmentInfo = shipmentDoc.data();
          
          // 4. Get exporter info
          if (shipmentDoc.data().exporterId) {
            const exporterDoc = await getDoc(doc(db, 'users', shipmentDoc.data().exporterId));
            if (exporterDoc.exists()) {
              productData.exporterInfo = exporterDoc.data();
            }
          }
        }
      }
      
      setProductData(productData);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Firebase fetch error:', error);
    return false;
  }
};

  // Fetch farmer info
  const fetchFarmerInfo = async (farmerId) => {
    try {
      const farmerDoc = await getDoc(doc(db, 'users', farmerId));
      if (farmerDoc.exists()) {
        setFarmerInfo(farmerDoc.data());
      }
    } catch (error) {
      console.error('Error fetching farmer info:', error);
    }
  };

  // Fetch shipment history
  const fetchShipments = async (productId) => {
    try {
      const shipmentsRef = collection(db, 'shipments');
      const q = query(shipmentsRef, where('productId', '==', productId));
      const querySnapshot = await getDocs(q);
      
      const shipmentList = [];
      querySnapshot.forEach((doc) => {
        shipmentList.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort by date if available
      shipmentList.sort((a, b) => {
        const dateA = a.timestamp?.toDate?.() || a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.timestamp?.toDate?.() || b.createdAt?.toDate?.() || new Date(0);
        return dateA - dateB;
      });
      
      setShipments(shipmentList);
    } catch (error) {
      console.error('Error fetching shipments:', error);
    }
  };

  // Fetch from blockchain (your mock service)
  const fetchFromBlockchain = async (id) => {
    try {
      console.log('🔗 Checking blockchain for product:', id);
      const result = await blockchainService.verifyProduct(id);
      console.log('📊 Blockchain result:', result);
      setBlockchainData(result);
    } catch (error) {
      console.error('Blockchain fetch error:', error);
    }
  };

  // Combine results from Firebase and Blockchain
  const combineResults = () => {
    const result = {
      verified: false,
      productId: productId,
      sources: {
        firebase: !!productData,
        blockchain: !!blockchainData?.verified
      },
      data: {}
    };

    // Combine Firebase data
    if (productData) {
      result.verified = true;
      result.data.firebase = {
        productName: productData.name || productData.productName || 'Agricultural Product',
        productType: productData.type || productData.category || 'Produce',
        farmer: farmerInfo?.fullName || productData.farmerName || 'Unknown Farmer',
        farmerId: productData.farmerId,
        location: productData.origin || productData.location || 'Unknown',
        harvestDate: productData.harvestDate || 
                    productData.createdAt?.toDate?.()?.toISOString().split('T')[0] || 
                    'Unknown',
        qualityGrade: productData.qualityGrade || productData.grade || 'Standard',
        certifications: productData.certifications || [],
        batchNumber: productData.batchNumber,
        weight: productData.weight,
        price: productData.price
      };
      
      // Add shipments as journey
      result.data.journey = shipments.map((shipment, index) => ({
        step: index + 1,
        action: shipment.step || shipment.action || 'Shipment',
        location: shipment.location || shipment.fromLocation || 'Unknown',
        date: shipment.timestamp?.toDate?.()?.toISOString().split('T')[0] || 
              shipment.createdAt?.toDate?.()?.toISOString().split('T')[0] || 
              'Unknown',
        handler: shipment.handler || shipment.transporter || 'Unknown',
        status: shipment.status || 'Completed'
      }));
    }

    // Combine Blockchain data
    if (blockchainData) {
      result.data.blockchain = {
        txHash: blockchainData.txHash,
        blockNumber: blockchainData.blockNumber,
        timestamp: blockchainData.timestamp,
        verified: blockchainData.verified,
        history: blockchainData.steps || []
      };
    }

    // Final verification status
    result.verified = result.sources.firebase || result.sources.blockchain;
    
    console.log('🎯 Combined result:', result);
    setVerificationResult(result);
    
    // Save to recent scans
    saveToRecentScans(result);
  };

  // Save to recent scans
  const saveToRecentScans = (result) => {
    const newScan = {
      id: Date.now(),
      name: result.data.firebase?.productName || `Product ${productId}`,
      date: new Date().toISOString().split('T')[0],
      verified: result.verified,
      productId: productId,
      farmer: result.data.firebase?.farmer || 'Unknown',
      location: result.data.firebase?.location || 'Unknown',
      sources: result.sources
    };
    
    const savedScans = JSON.parse(localStorage.getItem('agritrace_recent_scans') || '[]');
    const updatedScans = [newScan, ...savedScans.slice(0, 9)];
    localStorage.setItem('agritrace_recent_scans', JSON.stringify(updatedScans));
  };

  const handleReset = () => {
    setProductId('');
    setVerificationResult(null);
    setProductData(null);
    setShipments([]);
    setBlockchainData(null);
    setFarmerInfo(null);
    setError('');
  };

  const handleViewDetails = () => {
    if (productData?.id) {
      navigate(`/product-details/${productData.id}`);
    }
  };

  // Render source badges
  const renderSourceBadges = () => {
    if (!verificationResult?.sources) return null;
    
    const { firebase, blockchain } = verificationResult.sources;
    
    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {firebase && (
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center">
            <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
            Firebase Verified
          </span>
        )}
        {blockchain && (
          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center">
            <div className="w-2 h-2 bg-purple-600 rounded-full mr-2"></div>
            Blockchain Verified
          </span>
        )}
        {!firebase && !blockchain && (
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
            No Verification Sources
          </span>
        )}
      </div>
    );
  };

  // Render product details
  const renderProductDetails = () => {
    if (!verificationResult?.data?.firebase) return null;
    
    const data = verificationResult.data.firebase;
    
    return (
      <div className="bg-white rounded-lg p-4 mb-4">
        <h4 className="font-bold text-gray-800 mb-3 flex items-center">
          <User className="w-4 h-4 mr-2" />
          Product Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Product Name</p>
            <p className="font-medium">{data.productName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Type</p>
            <p className="font-medium">{data.productType}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Farmer</p>
            <p className="font-medium">{data.farmer}</p>
            {data.farmerId && <p className="text-xs text-gray-500">ID: {data.farmerId}</p>}
          </div>
          <div>
            <p className="text-sm text-gray-500">Origin</p>
            <p className="font-medium flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              {data.location}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Harvest Date</p>
            <p className="font-medium flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {data.harvestDate}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Quality Grade</p>
            <p className="font-medium">{data.qualityGrade}</p>
          </div>
        </div>
        
        {/* Certifications */}
        {data.certifications && data.certifications.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Certifications</p>
            <div className="flex flex-wrap gap-2">
              {data.certifications.map((cert, index) => (
                <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {cert}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render blockchain details
  const renderBlockchainDetails = () => {
    if (!verificationResult?.data?.blockchain) return null;
    
    const data = verificationResult.data.blockchain;
    
    return (
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
        <h4 className="font-bold text-gray-800 mb-3 flex items-center">
          <Shield className="w-4 h-4 mr-2" />
          Blockchain Verification
        </h4>
        
        <div className="space-y-3">
          {data.txHash && (
            <div className="flex items-center">
              <span className="text-sm text-gray-600 w-24">Transaction:</span>
              <code className="text-xs bg-purple-100 px-2 py-1 rounded">
                {data.txHash.substring(0, 20)}...
              </code>
            </div>
          )}
          
          {data.blockNumber && (
            <div className="flex items-center">
              <span className="text-sm text-gray-600 w-24">Block:</span>
              <span className="font-medium">#{data.blockNumber}</span>
            </div>
          )}
          
          {data.timestamp && (
            <div className="flex items-center">
              <span className="text-sm text-gray-600 w-24">Timestamp:</span>
              <span className="font-medium">
                {new Date(data.timestamp).toLocaleString()}
              </span>
            </div>
          )}
          
          {/* Blockchain history steps */}
          {data.history && data.history.length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-gray-600 mb-2">Blockchain History:</p>
              <div className="space-y-2">
                {data.history.map((step, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mr-2"></div>
                    <span>{step.step}</span>
                    <span className="text-gray-500 text-xs ml-auto">
                      {new Date(step.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render journey timeline
  const renderJourney = () => {
    const journey = verificationResult?.data?.journey || [];
    
    if (journey.length === 0) return null;
    
    return (
      <div className="bg-white rounded-lg p-4">
        <h4 className="font-bold text-gray-800 mb-4">Product Journey</h4>
        <div className="space-y-4">
          {journey.map((step, index) => (
            <div key={index} className="flex">
              <div className="flex flex-col items-center mr-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-700 font-bold">{index + 1}</span>
                </div>
                {index < journey.length - 1 && (
                  <div className="w-0.5 h-full bg-gray-200 my-2"></div>
                )}
              </div>
              <div className="flex-1 pb-4">
                <p className="font-medium text-gray-800">{step.action}</p>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span>{step.location}</span>
                  <span className="mx-2">•</span>
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>{step.date}</span>
                </div>
                {step.handler && (
                  <p className="text-sm text-gray-500 mt-1">Handler: {step.handler}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
                <QrCode className="w-8 h-8 mr-3 text-green-600" />
                AgriTrace Product Verification
              </h1>
              <p className="text-gray-600 mt-2">Verify product authenticity using Product ID</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                Firebase Database
              </span>
              <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">
                Blockchain (Mock)
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-700 mb-4">Enter Product ID</h2>
              
              {/* Manual Input */}
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Product ID
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Enter Product ID (e.g., PROD-001, TEST-123)"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <p className="text-xs text-gray-500 mt-2">
                  Try: PROD-001, PROD-002, or any product ID from your Firebase
                </p>
                
                {error && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 flex items-center">
                      <XCircle className="w-4 h-4 mr-2" />
                      {error}
                    </p>
                  </div>
                )}

                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={handleVerify}
                    disabled={!productId.trim() || loading}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Verifying...
                      </>
                    ) : (
                      'Verify Product'
                    )}
                  </button>
                  
                  <button
                    onClick={handleReset}
                    className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-gray-700 mb-4">Verification Sources</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-bold">F</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Firebase Database</h4>
                    <p className="text-sm text-gray-600">Real-time product data, farmer info, shipment history</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-purple-600 font-bold">B</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Blockchain (Mock)</h4>
                    <p className="text-sm text-gray-600">Immutable verification records and transaction history</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6 min-h-[500px]">
              <h2 className="text-xl font-bold text-gray-700 mb-6">Verification Results</h2>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-700 font-medium">Checking product authenticity...</p>
                  <p className="text-gray-500 text-sm mt-2">Querying Firebase & Blockchain</p>
                </div>
              ) : verificationResult ? (
                <div>
                  {/* Status Banner */}
                  <div className={`rounded-xl p-6 mb-6 ${
                    verificationResult.verified 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-center mb-4">
                      {verificationResult.verified ? (
                        <>
                          <CheckCircle className="w-10 h-10 text-green-600 mr-3" />
                          <div>
                            <h3 className="text-2xl font-bold text-gray-800">✅ Product Verified</h3>
                            <p className="text-green-700">Product found and authenticated</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-10 h-10 text-red-600 mr-3" />
                          <div>
                            <h3 className="text-2xl font-bold text-gray-800">❌ Product Not Found</h3>
                            <p className="text-red-700">Product ID not found in any system</p>
                          </div>
                        </>
                      )}
                    </div>
                    
                    {/* Source Badges */}
                    {renderSourceBadges()}
                    
                    {/* Verification Summary */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Product ID</p>
                        <p className="font-bold text-gray-800">{verificationResult.productId}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Status</p>
                        <p className={`font-bold ${
                          verificationResult.verified ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {verificationResult.verified ? 'VERIFIED' : 'NOT VERIFIED'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Product Details */}
                  {renderProductDetails()}
                  
                  {/* Blockchain Details */}
                  {renderBlockchainDetails()}
                  
                  {/* Journey */}
                  {renderJourney()}
                  
                  {/* Actions */}
                  <div className="mt-8 space-y-3">
                    <button 
                      onClick={handleViewDetails}
                      disabled={!productData?.id}
                      className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Detailed Report
                    </button>
                    <button 
                      onClick={handleReset}
                      className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Verify Another Product
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">Ready to Verify</h3>
                  <p className="text-gray-600 mb-6">
                    Enter a Product ID to check product authenticity
                  </p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <p>✓ Checks Firebase database for product details</p>
                    <p>✓ Verifies blockchain records (mock service)</p>
                    <p>✓ Shows complete product journey</p>
                    <p>✓ Validates farmer and origin information</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;