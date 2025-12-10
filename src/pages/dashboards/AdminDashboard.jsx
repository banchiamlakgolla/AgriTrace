import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { useBlockchain } from '../../contexts/BlockchainContext';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  doc, 
  deleteDoc,
  limit,      
  getDoc      
} from 'firebase/firestore';
import { 
  Users, 
  Shield, 
  CheckCircle, 
  Clock,  
  XCircle, 
  Package, 
  AlertTriangle,
  BarChart3,
  Settings,
  LogOut,
  UserCheck,
  FileText,
  Bell,
  Database,
  Activity,
  Search,
  Filter,
  Eye,
  Truck,
  ShoppingCart,
  User as UserIcon,
  MapPin,
  Calendar,
  Download,
  Save,
  Trash2,
  Lock,      
  Unlock  
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [adminTeam, setAdminTeam] = useState([]);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const { isConnected, registerProduct, connectWallet } = useBlockchain();
  const [isLoading, setIsLoading] = useState(true);

  const [stats, setStats] = useState({
    totalFarmers: 0,
    totalExporters: 0,
    totalConsumers: 0,
    totalProducts: 0,
    pendingApprovals: 0,
    blockchainVerified: 0,
    pendingVerification: 0
  });
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Check admin authentication
  useEffect(() => {
    const checkAdminAuth = () => {
      const userData = localStorage.getItem('agritrace_user');
      if (!userData) {
        navigate('/login');
        return;
      }
      
      try {
        const user = JSON.parse(userData);
        if (user.role && user.role.includes('Admin')) {
          setCurrentAdmin(user);
        } else {
          alert('Access denied: Admin privileges required');
          navigate('/login');
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/login');
      }
    };
    
    checkAdminAuth();
  }, [navigate]);

  const checkFirebaseConnection = async () => {
    try {
      console.log("🔄 Testing Firebase connection...");
      
      // Try to read from a test collection
      const testRef = collection(db, 'users');
      const snapshot = await getDocs(query(testRef, limit(1)));
      
      console.log("✅ Firebase connected successfully");
      setIsFirebaseConnected(true);
      return true;
      
    } catch (error) {
      console.error("❌ Firebase connection failed:", error.message);
      setIsFirebaseConnected(false);
      return false;
    }
  };

  // Fetch admin team
  const fetchAdminTeam = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const allUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter for admin roles
      const admins = allUsers.filter(user => 
        user.role && user.role.includes('Admin')
      );
      
      console.log("Found admins:", admins.length);
      setAdminTeam(admins);
      
    } catch (error) {
      console.error("Error fetching admin team:", error);
    }
  };

  // Fetch all users with role counts
  const fetchAllUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllUsers(users);
      
      // Calculate role counts
      const farmers = users.filter(u => u.role === 'Farmer 👨‍🌾' && u.status === 'active').length;
      const exporters = users.filter(u => u.role === 'Exporter 🚚' && u.status === 'active').length;
      const consumers = users.filter(u => u.role === 'Consumer 🛒' && u.status === 'active').length;
      const pending = users.filter(u => u.status === 'pending').length;
      
      return { farmers, exporters, consumers, pending };
    } catch (error) {
      console.error("Error fetching users:", error);
      return { farmers: 0, exporters: 0, consumers: 0, pending: 0 };
    }
  };

  // Fetch pending users for approval
  const fetchPendingUsers = async () => {
    try {
      const q = query(collection(db, 'users'), where('status', '==', 'pending'));
      const snapshot = await getDocs(q);
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPendingUsers(users);
    } catch (error) {
      console.error("Error fetching pending users:", error);
    }
  };

  // Fetch all products
  const fetchAllProducts = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'products'));
      const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllProducts(products);
      
      const total = products.length;
      const verified = products.filter(p => p.status === 'verified').length;
      const pending = products.filter(p => p.status === 'pending').length;
      
      return { total, verified, pending };
    } catch (error) {
      console.error("Error fetching products:", error);
      return { total: 0, verified: 0, pending: 0 };
    }
  };

  // Fetch pending products for validation
  const fetchPendingProducts = async () => {
    try {
      const q = query(collection(db, 'products'), where('status', '==', 'pending'));
      const snapshot = await getDocs(q);
      const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPendingProducts(products);
    } catch (error) {
      console.error("Error fetching pending products:", error);
    }
  };

  // Fetch all data
  const fetchAllData = async () => {
    setIsLoading(true); 
    try {
      console.log("🔄 Starting to fetch all data...");
      
      // Check Firebase connection
      const isConnected = await checkFirebaseConnection();
      
      if (!isConnected) {
        console.error("❌ Cannot fetch data: Firebase not connected");
        return;
      }
      
      // Fetch data in parallel
      const [userStats, productStats] = await Promise.all([
        fetchAllUsers(),
        fetchAllProducts()
      ]);
      
      await Promise.all([
        fetchPendingUsers(),
        fetchPendingProducts(),
        fetchAdminTeam()
      ]);
      
      setStats({
        totalFarmers: userStats.farmers,
        totalExporters: userStats.exporters,
        totalConsumers: userStats.consumers,
        totalProducts: productStats.total,
        pendingApprovals: userStats.pending,
        blockchainVerified: productStats.verified,
        pendingVerification: productStats.pending
      });
      
      console.log("✅ All data fetched successfully!");
      
    } catch (error) {
      console.error("❌ Error fetching data:", error);
    } finally {
      setIsLoading(false); 
    }
  };

  // Fetch data when component mounts and admin is set
  useEffect(() => {
    if (currentAdmin) {
      fetchAllData();
    }
  }, [currentAdmin]);

  // Filter users based on role
  const filteredUsers = allUsers.filter(user => {
    if (filterRole === 'all') return true;
    if (filterRole === 'farmer') return user.role === 'Farmer 👨‍🌾';
    if (filterRole === 'exporter') return user.role === 'Exporter 🚚';
    if (filterRole === 'consumer') return user.role === 'Consumer 🛒';
    if (filterRole === 'admin') return user.role && user.role.includes('Admin');
    if (filterRole === 'pending') return user.status === 'pending';
    return true;
  }).filter(user => 
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter products based on search
  const filteredProducts = allProducts.filter(product => 
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.farmerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasPermission = (permission) => {
    if (!currentAdmin) return false;
    if (currentAdmin.adminLevel === 'super') return true;
    return currentAdmin.permissions?.[permission] || false;
  };

  // Approve user
  const approveUser = async (userId, userName, userRole) => {
    if (!hasPermission('canApproveFarmers') && userRole === 'Farmer 👨‍🌾') {
      alert('⚠️ You do not have permission to approve farmers');
      return;
    }
    if (!hasPermission('canApproveExporters') && userRole === 'Exporter 🚚') {
      alert('⚠️ You do not have permission to approve exporters');
      return;
    }
    
    try {
      await updateDoc(doc(db, 'users', userId), {
        status: 'active',
        approvedAt: new Date().toISOString(),
        approvedBy: currentAdmin.fullName,
        approvedByAdminId: currentAdmin.uid
      });
      
      alert(`✅ ${userName} (${userRole}) approved successfully!`);
      fetchAllData();
    } catch (error) {
      console.error('Error approving user:', error);
      alert('❌ Failed to approve user');
    }
  };

  // Reject user
  const rejectUser = async (userId, userName) => {
    if (!hasPermission('canApproveFarmers') && !hasPermission('canApproveExporters')) {
      alert('⚠️ You do not have permission to reject users');
      return;
    }
    
    const reason = prompt(`Enter rejection reason for ${userName}:`, 'Does not meet verification criteria');
    if (!reason) return;
    
    try {
      await updateDoc(doc(db, 'users', userId), {
        status: 'rejected',
        rejectionReason: reason,
        rejectedAt: new Date().toISOString(),
        rejectedBy: currentAdmin.fullName
      });
      
      alert(`❌ User ${userName} rejected: ${reason}`);
      fetchAllData();
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert('❌ Failed to reject user');
    }
  };

  const validateProduct = async (productId, productName) => {
    if (!hasPermission('canValidateProducts')) {
      alert('⚠️ You do not have permission to validate products');
      return;
    }
    
    try {
      // 1. Update in Firebase
      await updateDoc(doc(db, 'products', productId), {
        status: 'verified',
        verifiedAt: new Date().toISOString(),
        verifiedBy: currentAdmin.fullName,
        verifiedByAdminId: currentAdmin.uid
      });
      
      // 2. Get product data for blockchain
      const productDoc = await getDoc(doc(db, 'products', productId));
      const productData = productDoc.data();
      
      // 3. Register on blockchain if connected
      if (isConnected) {
        try {
          const blockchainResult = await registerProduct({
            productId: productId,
            farmerName: productData.farmerName,
            location: productData.location,
            farmerAddress: productData.farmerId
          });
          
          if (blockchainResult.success) {
            await updateDoc(doc(db, 'products', productId), {
              blockchainVerified: true,
              blockchainTxHash: blockchainResult.txHash,
              blockchainTimestamp: new Date().toISOString()
            });
            
            alert(`✅ Product "${productName}" validated and added to blockchain!\nTransaction: ${blockchainResult.txHash}`);
          } else {
            await updateDoc(doc(db, 'products', productId), {
              blockchainVerified: false,
              blockchainError: blockchainResult.error
            });
            
            alert(`✅ Product validated but blockchain failed: ${blockchainResult.error}`);
          }
        } catch (blockchainError) {
          console.error('Blockchain error:', blockchainError);
          await updateDoc(doc(db, 'products', productId), {
            blockchainVerified: false,
            blockchainError: 'Blockchain registration failed'
          });
          
          alert(`✅ Product validated but blockchain registration failed`);
        }
      } else {
        await updateDoc(doc(db, 'products', productId), {
          blockchainVerified: false,
          blockchainError: 'Blockchain not connected'
        });
        
        alert(`✅ Product "${productName}" validated (offline mode)\nConnect blockchain for full verification`);
      }
      
      fetchAllData();
      
    } catch (error) {
      console.error('Validation error:', error);
      alert('❌ Error validating product');
    }
  };

  const toggleUserStatus = async (userId, currentStatus, userName) => {
    if (!hasPermission('canManageUsers')) {
      alert('⚠️ You do not have permission to manage users');
      return;
    }
    
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const action = newStatus === 'active' ? 'activated' : 'suspended';
    
    try {
      await updateDoc(doc(db, 'users', userId), {
        status: newStatus,
        statusUpdatedAt: new Date().toISOString(),
        statusUpdatedBy: currentAdmin.fullName
      });
      
      alert(`✅ User ${userName} has been ${action}`);
      fetchAllData();
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert('❌ Failed to update user status');
    }
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const viewProductDetails = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('agritrace_user');
    navigate('/login');
  };

  if (!currentAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-800">Loading Admin Dashboard</h2>
          <p className="text-gray-600">Fetching data from Firebase...</p>
          <div className="mt-4 space-y-2">
            <div className="h-2 bg-gray-200 rounded-full w-64 mx-auto">
              <div className="h-full bg-green-600 rounded-full animate-pulse"></div>
            </div>
            <p className="text-sm text-gray-500">Connecting to blockchain...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Top Navigation */}
      <nav className="bg-gray-900 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Shield className="w-8 h-8 text-green-400" />
                <span className="absolute -top-1 -right-1 bg-green-500 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {adminTeam.length}
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold">AgriTrace Admin Panel</h1>
                <p className="text-xs text-gray-300">
                  {adminTeam.length}-Admin Team • {currentAdmin.adminLevel === 'super' ? 'Super Admin' : 'Standard Admin'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="font-semibold">{currentAdmin.fullName}</p>
                <p className="text-xs text-gray-300">{currentAdmin.email}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-gray-800 rounded-lg"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Welcome back, {currentAdmin.fullName}! 🛡️
              </h2>
              <p className="text-gray-600 text-sm">
                Manage all user roles and track products through the supply chain.
              </p>
            </div>
            <div className="flex space-x-2">
              <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                {currentAdmin.adminLevel === 'super' ? 'Super Admin' : 'Standard Admin'}
              </div>
              <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {stats.pendingApprovals} Pending
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                 ${activeTab === 'dashboard' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'users' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Users ({allUsers.length})
            </button>
            <button
              onClick={() => setActiveTab('approvals')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'approvals' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <UserCheck className="w-4 h-4 inline mr-2" />
              Approvals ({pendingUsers.length})
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'products' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <Package className="w-4 h-4 inline mr-2" />
              Products ({allProducts.length})
            </button>
            <button
              onClick={() => setActiveTab('validation')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap 
                ${activeTab === 'validation' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Validation ({pendingProducts.length})
            </button>
            <button
              onClick={() => setActiveTab('admins')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                 ${activeTab === 'admins' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <Shield className="w-4 h-4 inline mr-2" />
              Admin Team ({adminTeam.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Database Info Button for Super Admin */}
      {currentAdmin?.adminLevel === 'super' && (
        <button 
          onClick={() => {
            alert(`📊 Database Overview:
👥 Total Users: ${allUsers.length}
📦 Total Products: ${allProducts.length}
🛡️ Admin Team: ${adminTeam.length}
⏳ Pending: ${pendingUsers.length + pendingProducts.length}
✅ Firebase: ${isFirebaseConnected ? 'Connected' : 'Disconnected'}
🔗 Blockchain: ${isConnected ? 'Connected' : 'Disconnected'}`);
          }}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 z-40"
          title="Database Info"
        >
          <Database className="w-6 h-6" />
        </button>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users, products, or anything..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Role Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Farmers Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wider">Farmers 👨‍🌾</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalFarmers}</p>
                    <p className="text-sm text-gray-500 mt-1">Product Creators</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-100 to-green-50 p-4 rounded-xl">
                    <UserIcon className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </div>

              {/* Exporters Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wider">Exporters 🚚</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalExporters}</p>
                    <p className="text-sm text-gray-500 mt-1">Process & Transport</p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-100 to-blue-50 p-4 rounded-xl">
                    <Truck className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Consumers Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wider">Consumers 🛒</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalConsumers}</p>
                    <p className="text-sm text-gray-500 mt-1">End Users</p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-100 to-purple-50 p-4 rounded-xl">
                    <ShoppingCart className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Products Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wider">Total Products</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalProducts}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {stats.blockchainVerified} on blockchain
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 p-4 rounded-xl">
                    <Package className="w-8 h-8 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Team */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Admin Team ({adminTeam.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {adminTeam.map(admin => (
                  <div 
                    key={admin.id} 
                    className={`p-4 rounded-xl border ${admin.id === currentAdmin.uid ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold">{admin.fullName}</p>
                        <p className="text-sm text-gray-500">{admin.email}</p>
                        <span className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${
                          admin.adminLevel === 'super' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {admin.adminLevel === 'super' ? 'Super Admin' : 'Standard Admin'}
                        </span>
                      </div>
                      {admin.id === currentAdmin.uid && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">You</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pending Actions */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-gray-800 mb-4">Pending Actions</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center">
                      <UserCheck className="w-5 h-5 text-yellow-600 mr-3" />
                      <span>User Approvals</span>
                    </div>
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                      {stats.pendingApprovals}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-blue-600 mr-3" />
                      <span>Product Validations</span>
                    </div>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                      {stats.pendingVerification}
                    </span>
                  </div>
                </div>
              </div>

              {/* System Status */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-gray-800 mb-4">System Status</h3>
                <div className="space-y-3">
                  {/* Firebase Status */}
                  <button 
                    onClick={() => {
                      if (currentAdmin?.adminLevel === 'super') {
                        alert(`Firebase Database Status:\nConnected: ${isFirebaseConnected}\nUsers: ${allUsers.length}\nProducts: ${allProducts.length}`);
                      }
                    }}
                    className={`w-full text-left flex justify-between items-center p-3 rounded-lg transition-all ${
                      isFirebaseConnected 
                        ? 'bg-green-50 hover:bg-green-100' 
                        : 'bg-red-50 hover:bg-red-100'
                    } ${currentAdmin?.adminLevel === 'super' ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <div className="flex items-center">
                      <Database className="w-5 h-5 mr-3" 
                                style={{ color: isFirebaseConnected ? '#16a34a' : '#dc2626' }} />
                      <span>Firebase Database</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      isFirebaseConnected 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {isFirebaseConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </button>
                  
                  {/* Blockchain Status */}
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <Activity className="w-5 h-5 text-green-600 mr-3" />
                      <span>Blockchain Network</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {isConnected ? 'Connected' : 'Disconnected'}
                      </span>
                      {!isConnected && (
                        <button
                          onClick={connectWallet}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">All Users ({filteredUsers.length})</h2>
              <div className="flex space-x-2">
                <select 
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="all">All Roles</option>
                  <option value="farmer">Farmers 👨‍🌾</option>
                  <option value="exporter">Exporters 🚚</option>
                  <option value="consumer">Consumers 🛒</option>
                  <option value="admin">Admins 🛡️</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            {filteredUsers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No users found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-3 px-4 text-left">User</th>
                      <th className="py-3 px-4 text-left">Role</th>
                      <th className="py-3 px-4 text-left">Status</th>
                      <th className="py-3 px-4 text-left">Joined</th>
                      <th className="py-3 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{user.fullName || 'No Name'}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs ${
                            user.role === 'Farmer 👨‍🌾' ? 'bg-green-100 text-green-800' :
                            user.role === 'Exporter 🚚' ? 'bg-blue-100 text-blue-800' :
                            user.role === 'Consumer 🛒' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs ${
                            user.status === 'active' ? 'bg-green-100 text-green-800' :
                            user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            user.status === 'suspended' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => viewUserDetails(user)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {hasPermission('canManageUsers') && user.id !== currentAdmin.uid && (
                              <button
                                onClick={() => toggleUserStatus(user.id, user.status, user.fullName)}
                                className="p-1 text-orange-600 hover:bg-orange-50 rounded"
                                title={user.status === 'active' ? 'Suspend User' : 'Activate User'}
                              >
                                {user.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'approvals' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Pending Approvals ({pendingUsers.length})
            </h2>

            {pendingUsers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No pending approvals</p>
            ) : (
              <div className="space-y-4">
                {pendingUsers.map(user => (
                  <div key={user.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            user.role === 'Farmer 👨‍🌾' ? 'bg-green-100' :
                            user.role === 'Exporter 🚚' ? 'bg-blue-100' :
                            'bg-gray-100'
                          }`}>
                            {user.role === 'Farmer 👨‍🌾' ? <UserIcon className="w-5 h-5 text-green-600" /> :
                             user.role === 'Exporter 🚚' ? <Truck className="w-5 h-5 text-blue-600" /> :
                             <ShoppingCart className="w-5 h-5 text-gray-600" />}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800">{user.fullName}</h3>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                                {user.role}
                              </span>
                              {user.farmLocation && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                  📍 {user.farmLocation}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => approveUser(user.id, user.fullName, user.role)}
                          disabled={
                            (user.role === 'Farmer 👨‍🌾' && !hasPermission('canApproveFarmers')) ||
                            (user.role === 'Exporter 🚚' && !hasPermission('canApproveExporters'))
                          }
                          className={`px-4 py-2 rounded-lg flex items-center ${
                            ((user.role === 'Farmer 👨‍🌾' && hasPermission('canApproveFarmers')) ||
                             (user.role === 'Exporter 🚚' && hasPermission('canApproveExporters')))
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </button>
                        <button
                          onClick={() => rejectUser(user.id, user.fullName)}
                          disabled={
                            (user.role === 'Farmer 👨‍🌾' && !hasPermission('canApproveFarmers')) ||
                            (user.role === 'Exporter 🚚' && !hasPermission('canApproveExporters'))
                          }
                          className={`px-4 py-2 rounded-lg flex items-center ${
                            ((user.role === 'Farmer 👨‍🌾' && hasPermission('canApproveFarmers')) ||
                             (user.role === 'Exporter 🚚' && hasPermission('canApproveExporters')))
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">All Products ({filteredProducts.length})</h2>
            </div>

            {filteredProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No products found</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <div key={product.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-gray-800">{product.name}</h3>
                        <p className="text-sm text-gray-500">{product.type} • Batch: {product.batchNumber}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        product.status === 'verified' ? 'bg-green-100 text-green-800' :
                        product.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {product.status}
                      </span>
                    </div>
                    
                    <div className="mt-2 space-y-1">
                      <p className="text-sm">📍 {product.location}</p>
                      <p className="text-sm">👨‍🌾 By: {product.farmerName || 'Unknown Farmer'}</p>
                      <p className="text-sm">📅 Harvest: {product.harvestDate ? new Date(product.harvestDate).toLocaleDateString() : 'N/A'}</p>
                      
                      {product.blockchainVerified ? (
                        <p className="text-sm text-green-600 flex items-center">
                          <span className="mr-1">✅</span>
                          On Blockchain: {product.blockchainTxHash?.substring(0, 20)}...
                        </p>
                      ) : (
                        <p className="text-sm text-yellow-600 flex items-center">
                          <span className="mr-1">⏳</span>
                          Awaiting blockchain verification
                        </p>
                      )}
                    </div>
                    
                    <div className="mt-4 flex justify-between items-center">
                      <button
                        onClick={() => viewProductDetails(product)}
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </button>
                      
                      {product.status === 'pending' && hasPermission('canValidateProducts') && (
                        <button
                          onClick={() => validateProduct(product.id, product.name)}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                        >
                          Validate
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'validation' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Product Validation ({pendingProducts.length})
            </h2>

            {pendingProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No products pending validation</p>
            ) : (
              <div className="space-y-4">
                {pendingProducts.map(product => (
                  <div key={product.id} className="border border-yellow-200 rounded-xl p-4 bg-yellow-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-gray-800">{product.name}</h3>
                        <p className="text-sm text-gray-500">
                          {product.type} • Batch: {product.batchNumber}
                        </p>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm">📍 {product.location}</p>
                          <p className="text-sm">👨‍🌾 By: {product.farmerName || 'Unknown Farmer'}</p>
                          <p className="text-sm">📅 Harvest: {product.harvestDate ? new Date(product.harvestDate).toLocaleDateString() : 'N/A'}</p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => viewProductDetails(product)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Inspect
                        </button>
                        <button
                          onClick={() => validateProduct(product.id, product.name)}
                          disabled={!hasPermission('canValidateProducts')}
                          className={`px-4 py-2 rounded-lg flex items-center ${
                            hasPermission('canValidateProducts')
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Validate
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'admins' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Admin Team ({adminTeam.length})
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {adminTeam.map(admin => (
                <div 
                  key={admin.id} 
                  className={`p-6 rounded-xl border-2 ${admin.id === currentAdmin.uid ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${
                      admin.adminLevel === 'super' 
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      <Shield className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-lg">{admin.fullName}</p>
                          <p className="text-sm text-gray-500">{admin.email}</p>
                        </div>
                        {admin.id === currentAdmin.uid && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">You</span>
                        )}
                      </div>
                      
                      <div className="mt-4">
                        <span className={`text-sm px-3 py-1 rounded-full ${
                          admin.adminLevel === 'super' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {admin.adminLevel === 'super' ? 'Super Admin' : 'Standard Admin'}
                        </span>
                      </div>
                      
                      <div className="mt-4 text-sm text-gray-600">
                        <p>Permissions:</p>
                        <ul className="mt-1 space-y-1">
                          {admin.permissions?.canApproveFarmers && <li className="flex items-center">✅ Approve Farmers</li>}
                          {admin.permissions?.canApproveExporters && <li className="flex items-center">✅ Approve Exporters</li>}
                          {admin.permissions?.canValidateProducts && <li className="flex items-center">✅ Validate Products</li>}
                          {admin.adminLevel === 'super' && <li className="flex items-center">⚡ All Permissions</li>}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-gray-200 mt-8">
        <div className="text-center text-gray-500 text-sm">
          <p>🛡️ <strong>Admin Team:</strong> {adminTeam.map(a => a.fullName).join(', ')}</p>
          <p className="mt-1">Logged in as: {currentAdmin.fullName} • {currentAdmin.adminLevel === 'super' ? 'Super Admin ⚡' : 'Standard Admin'}</p>
          <p className="mt-1">System Status: {isFirebaseConnected && isConnected ? 'All Systems Operational 🟢' : 'Some Systems Offline 🟡'}</p>
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">User Details</h3>
              <button onClick={() => setShowUserModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Full Name</label>
                <p className="font-medium">{selectedUser.fullName}</p>
              </div>
              
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <p className="font-medium">{selectedUser.email}</p>
              </div>
              
              <div>
                <label className="text-sm text-gray-500">Role</label>
                <p className={`px-3 py-1 rounded-full text-sm inline-block ${
                  selectedUser.role === 'Farmer 👨‍🌾' ? 'bg-green-100 text-green-800' :
                  selectedUser.role === 'Exporter 🚚' ? 'bg-blue-100 text-blue-800' :
                  selectedUser.role === 'Consumer 🛒' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedUser.role}
                </p>
              </div>
              
              <div>
                <label className="text-sm text-gray-500">Status</label>
                <p className={`px-3 py-1 rounded-full text-sm inline-block ${
                  selectedUser.status === 'active' ? 'bg-green-100 text-green-800' :
                  selectedUser.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  selectedUser.status === 'suspended' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedUser.status}
                </p>
              </div>
              
              {selectedUser.farmLocation && (
                <div>
                  <label className="text-sm text-gray-500">Farm Location</label>
                  <p className="font-medium">{selectedUser.farmLocation}</p>
                </div>
              )}
              
              {selectedUser.createdAt && (
                <div>
                  <label className="text-sm text-gray-500">Joined On</label>
                  <p className="font-medium">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Details Modal */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Product Details</h3>
              <button onClick={() => setShowProductModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Basic Information</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-500">Product Name</label>
                    <p className="font-medium">{selectedProduct.name}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-500">Type</label>
                    <p className="font-medium">{selectedProduct.type}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-500">Batch Number</label>
                    <p className="font-medium">{selectedProduct.batchNumber}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-500">Quantity</label>
                    <p className="font-medium">{selectedProduct.quantity}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Location & Timing</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-500">Farm Location</label>
                    <p className="font-medium">{selectedProduct.location}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-500">Harvest Date</label>
                    <p className="font-medium">
                      {selectedProduct.harvestDate ? new Date(selectedProduct.harvestDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-500">Created On</label>
                    <p className="font-medium">
                      {selectedProduct.createdAt ? new Date(selectedProduct.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <h4 className="font-bold text-gray-800 mb-2">Farmer Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>Name:</strong> {selectedProduct.farmerName || 'Unknown'}</p>
                  <p className="mt-1"><strong>Farmer ID:</strong> {selectedProduct.farmerId}</p>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <h4 className="font-bold text-gray-800 mb-2">Verification Status</h4>
                <div className={`p-4 rounded-lg ${
                  selectedProduct.status === 'verified' ? 'bg-green-50 border border-green-200' :
                  selectedProduct.status === 'pending' ? 'bg-yellow-50 border border-yellow-200' :
                  'bg-gray-50 border border-gray-200'
                }`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Status: {selectedProduct.status}</p>
                      {selectedProduct.verifiedBy && (
                        <p className="text-sm text-gray-600 mt-1">
                          Verified by: {selectedProduct.verifiedBy} on {
                            selectedProduct.verifiedAt ? new Date(selectedProduct.verifiedAt).toLocaleDateString() : 'N/A'
                          }
                        </p>
                      )}
                    </div>
                    
                    {selectedProduct.status === 'pending' && hasPermission('canValidateProducts') && (
                      <button
                        onClick={() => {
                          validateProduct(selectedProduct.id, selectedProduct.name);
                          setShowProductModal(false);
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Validate Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowProductModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;