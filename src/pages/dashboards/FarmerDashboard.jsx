// src/pages/dashboards/FarmerDashboard.jsx - UPDATED IMPORTS
import { useEffect, useState } from 'react';
import { 
  doc, getDoc, collection, query, where, getDocs, 
  orderBy, limit, deleteDoc, updateDoc, serverTimestamp // Added updateDoc and serverTimestamp
} from "firebase/firestore";
import { db } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { 
  Package, Clock, Shield, PlusCircle, QrCode, MapPin,
  User, Bell, LogOut, TrendingUp, BarChart, Truck,
  Edit, Trash2, Eye, RefreshCw, AlertCircle, CheckCircle,
  Download, Calendar, DollarSign
} from 'lucide-react';
import blockchainService from '../../services/blockchain';

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [products, setProducts] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [blockchainLoading, setBlockchainLoading] = useState({});

  // Get user from localStorage
  const storedUser = JSON.parse(localStorage.getItem('agritrace_user') || '{}');

  // Fetch all farmer data
// In FarmerDashboard.jsx, update the fetchFarmerData function:
const fetchFarmerData = async () => {
  if (!storedUser.uid) {
    navigate('/login');
    return;
  }

  setLoading(true);
  try {
    console.log('🔍 Fetching farmer data for:', storedUser.uid);
    
    // 1. Get user data from Firestore
    const userDoc = await getDoc(doc(db, "users", storedUser.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      setUserData(userData);
    }

    // 2. Get products from Firestore
    const productsQuery = query(
      collection(db, "products"),
      where("farmerId", "==", storedUser.uid),
      orderBy("createdAt", "desc")
    );
    const productsSnapshot = await getDocs(productsQuery);
    const productsData = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Handle Firestore timestamps properly
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
    }));
    setProducts(productsData);

    // 3. Get shipments linked to products
    if (productsData.length > 0) {
      const productIds = productsData.map(p => p.productId);
      const shipmentsQuery = query(
        collection(db, "shipments"),
        where("products", "array-contains-any", productIds),
        orderBy("createdAt", "desc"),
        limit(5)
      );
      const shipmentsSnapshot = await getDocs(shipmentsQuery);
      const shipmentsData = shipmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Handle Firestore timestamps for shipments too
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));
      setShipments(shipmentsData);
    }

    // 4. Get recent activity
    const activity = [];
    
    // Product created activity
    productsData.slice(0, 3).forEach(product => {
      activity.push({
        type: 'product_added',
        title: 'Product Added',
        description: product.name,
        timestamp: product.createdAt,
        data: product
      });
    });

    // Blockchain verification activity
    const blockchainProducts = productsData.filter(p => p.onBlockchain);
    blockchainProducts.slice(0, 2).forEach(product => {
      activity.push({
        type: 'blockchain_verified',
        title: 'Blockchain Verified',
        description: product.name,
        timestamp: product.updatedAt,
        data: product
      });
    });

    // Sort activity by timestamp (newest first)
    activity.sort((a, b) => b.timestamp - a.timestamp);
    setRecentActivity(activity.slice(0, 5));

  } catch (error) {
    console.error('❌ Error fetching farmer data:', error);
    alert('Failed to load data: ' + error.message);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchFarmerData();
  }, [navigate]);

  // Create user object for display
  const user = {
    name: userData?.fullName || storedUser.fullName || "Azeb Yirga",
    role: "Farmer",
    location: userData?.farmLocation || storedUser.farmLocation || "Ethiopia, Gondar",
    email: storedUser.email || "farmer@example.com",
    farmSize: userData?.farmSize || "5 hectares",
    registrationDate: userData?.createdAt?.toDate?.() || new Date(),
    certifications: userData?.certifications || ['Organic']
  };

  // Calculate real stats
  const stats = {
    totalProducts: products.length,
    blockchainVerified: products.filter(p => p.onBlockchain).length,
    pendingShipment: products.filter(p => p.status === 'pending_shipment').length,
    inMarket: products.filter(p => p.status === 'in_market').length,
    totalValue: products.reduce((sum, p) => {
      const price = parseFloat(p.pricePerKg?.replace('$', '') || 0);
      const weight = parseFloat(p.weight?.replace('kg', '') || 0);
      return sum + (price * weight);
    }, 0)
  };

  // Handle product deletion
  const deleteProduct = async () => {
    if (!productToDelete) return;
    
    try {
      await deleteDoc(doc(db, 'products', productToDelete.id));
      
      // Remove from state
      setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
      
      alert(`✅ Product "${productToDelete.name}" deleted successfully`);
      
      // Refresh data
      fetchFarmerData();
      
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      alert('Failed to delete product: ' + error.message);
    } finally {
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  // Record product on blockchain
// In FarmerDashboard.jsx, update the recordOnBlockchain function:
const recordOnBlockchain = async (product) => {
  setBlockchainLoading(prev => ({ ...prev, [product.id]: true }));
  
  try {
    const blockchainData = {
      productId: product.productId,
      productName: product.name,
      farmer: user.name,
      location: user.location,
      harvestDate: product.harvestDate,
      certifications: product.certifications || [],
      timestamp: new Date().toISOString()
    };
    
    const result = await blockchainService.recordProduct(blockchainData);
    
    if (result.success) {
      // Update product in Firestore using updateDoc
      await updateDoc(doc(db, 'products', product.id), {
        onBlockchain: true,
        blockchainHash: result.txHash,
        blockchainTimestamp: serverTimestamp(), // Use serverTimestamp instead of new Date()
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      setProducts(prev => prev.map(p => 
        p.id === product.id ? { 
          ...p, 
          onBlockchain: true,
          blockchainHash: result.txHash
        } : p
      ));
      
      // Add to recent activity
      setRecentActivity(prev => [{
        type: 'blockchain_verified',
        title: 'Blockchain Verified',
        description: product.name,
        timestamp: new Date(),
        data: product
      }, ...prev.slice(0, 4)]);
      
      alert(`✅ Product recorded on blockchain!\nTransaction: ${result.txHash}`);
    } else {
      throw new Error(result.error || 'Blockchain recording failed');
    }
    
  } catch (error) {
    console.error('❌ Blockchain error:', error);
    alert('Failed to record on blockchain: ' + error.message);
  } finally {
    setBlockchainLoading(prev => ({ ...prev, [product.id]: false }));
  }
};

  // View product details
  const viewProductDetails = (product) => {
    navigate(`/product-details/${product.id}`);
  };

  // Export product data
  const exportProductData = (product) => {
    const data = {
      ...product,
      farmer: user.name,
      farmLocation: user.location,
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const fileName = `product-${product.productId}-${new Date().toISOString().split('T')[0]}.json`;
    
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', fileName);
    link.click();
  };

  // Status badge component
  const StatusBadge = ({ product }) => {
    const getStatusConfig = () => {
      if (product.onBlockchain) {
        return { color: 'bg-purple-100 text-purple-800', label: 'Blockchain Verified' };
      }
      
      switch (product.status) {
        case 'harvested':
          return { color: 'bg-green-100 text-green-800', label: 'Harvested' };
        case 'processing':
          return { color: 'bg-blue-100 text-blue-800', label: 'Processing' };
        case 'packaged':
          return { color: 'bg-yellow-100 text-yellow-800', label: 'Packaged' };
        case 'shipped':
          return { color: 'bg-orange-100 text-orange-800', label: 'Shipped' };
        case 'in_market':
          return { color: 'bg-green-100 text-green-800', label: 'In Market' };
        default:
          return { color: 'bg-gray-100 text-gray-800', label: 'Registered' };
      }
    };
    
    const config = getStatusConfig();
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your farm dashboard...</p>
          <p className="text-sm text-gray-400 mt-2">Fetching from database</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">AgriTrace Farmer</h1>
                  <p className="text-xs text-gray-600">Farm Management System</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="text-right hidden md:block">
                  <p className="font-semibold text-gray-800">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.role}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <button 
                  onClick={() => {
                    localStorage.removeItem('agritrace_user');
                    navigate('/login');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Welcome back, {user.name}!
              </h1>
              <p className="text-gray-600 text-lg">
                Manage your farm products, track shipments, and verify on blockchain.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  📍 {user.location}
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  🚜 {user.farmSize}
                </span>
                {user.certifications.map((cert, index) => (
                  <span key={index} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                    ✅ {cert}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={fetchFarmerData}
              disabled={loading}
              className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 flex items-center"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">Total Products</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalProducts}</p>
              </div>
              <Package className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">Blockchain Verified</p>
                <p className="text-3xl font-bold text-purple-600">{stats.blockchainVerified}</p>
              </div>
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">Pending Shipment</p>
                <p className="text-3xl font-bold text-orange-600">{stats.pendingShipment}</p>
              </div>
              <Truck className="w-8 h-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">Estimated Value</p>
                <p className="text-3xl font-bold text-blue-600">${stats.totalValue.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Products and Shipments Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Products */}
          <div className="lg:col-span-2 space-y-6">
            {/* Products Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Your Farm Products</h2>
                  <p className="text-gray-600">Manage and track all your registered products</p>
                </div>
                <Link
                  to="/add-product"
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-600 flex items-center"
                >
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Add Product
                </Link>
              </div>
              
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No Products Yet</h3>
                  <p className="text-gray-600 mb-6">Add your first farm product to get started</p>
                  <Link
                    to="/add-product"
                    className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                  >
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Add First Product
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map(product => (
                    <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start space-x-3">
                          {product.imageUrl ? (
                            <img 
                              src={product.imageUrl} 
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                              <Package className="w-6 h-6 text-green-600" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-medium text-gray-800">{product.name}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-gray-500">
                                ID: {product.productId}
                              </span>
                              <span className="text-xs text-gray-500">
                                <Calendar className="w-3 h-3 inline mr-1" />
                                {product.harvestDate}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                              <StatusBadge product={product} />
                              {!product.onBlockchain && (
                                <button
                                  onClick={() => recordOnBlockchain(product)}
                                  disabled={blockchainLoading[product.id]}
                                  className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs hover:bg-gray-200 flex items-center"
                                >
                                  {blockchainLoading[product.id] ? (
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-1"></div>
                                  ) : (
                                    <Shield className="h-3 w-3 mr-1" />
                                  )}
                                  Record on Blockchain
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => viewProductDetails(product)}
                            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => exportProductData(product)}
                            className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg"
                            title="Export Data"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setProductToDelete(product);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg"
                            title="Delete Product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No recent activity</p>
                ) : (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {activity.type === 'product_added' ? (
                          <Package className="w-5 h-5 text-green-600" />
                        ) : activity.type === 'blockchain_verified' ? (
                          <Shield className="w-5 h-5 text-purple-600" />
                        ) : (
                          <TrendingUp className="w-5 h-5 text-blue-600" />
                        )}
                        <div>
                          <p className="font-medium">{activity.title}</p>
                          <p className="text-sm text-gray-500">{activity.description}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {activity.timestamp.toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Farm Info & Shipments */}
          <div className="space-y-6">
            {/* Farm Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="font-bold text-gray-800 mb-4">Farm Information</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-gray-600">{user.location}</span>
                </div>
                <div className="flex items-center">
                  <User className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-gray-600">{user.name}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-gray-600">
                    Registered: {user.registrationDate.toLocaleDateString()}
                  </span>
                </div>
                {user.farmSize && (
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-3">🏞️</span>
                    <span className="text-gray-600">{user.farmSize}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <h3 className="font-medium text-gray-700 mb-2">Certifications</h3>
                <div className="flex flex-wrap gap-2">
                  {user.certifications.map((cert, index) => (
                    <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Shipments */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="font-bold text-gray-800 mb-4">Recent Shipments</h2>
              {shipments.length === 0 ? (
                <div className="text-center py-4">
                  <Truck className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No shipments yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {shipments.map(shipment => (
                    <div key={shipment.id} className="p-3 bg-blue-50 rounded-lg">
                      <p className="font-medium text-blue-800">{shipment.shipmentName}</p>
                      <p className="text-sm text-blue-600">{shipment.destination}</p>
                      <div className="flex justify-between mt-2">
                        <span className="text-xs text-blue-700">
                          {shipment.status || 'pending'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {shipment.createdAt?.toDate?.().toLocaleDateString() || 'N/A'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="font-bold text-gray-800 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  to="/add-product"
                  className="w-full flex items-center justify-center p-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                >
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Add New Product
                </Link>
                <button
                  onClick={() => navigate('/qr-scanner')}
                  className="w-full flex items-center justify-center p-3 border border-blue-200 text-blue-700 rounded-lg font-medium hover:bg-blue-50"
                >
                  <QrCode className="w-5 h-5 mr-2" />
                  Scan Product QR
                </button>
                <button
                  onClick={() => exportProductData}
                  className="w-full flex items-center justify-center p-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Export All Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && productToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{productToDelete.name}"?
              This will remove all product data and cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setProductToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={deleteProduct}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerDashboard;