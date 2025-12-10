// src/pages/dashboards/FarmerDashboard.jsx
import { useEffect, useState } from 'react';
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { 
  Package, Clock, Shield, PlusCircle, QrCode, MapPin,
  User, Bell, LogOut, TrendingUp, BarChart
} from 'lucide-react';

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const [isNewUser, setIsNewUser] = useState(false);
  const [userDataFromFirestore, setUserDataFromFirestore] = useState(null); // Renamed state
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
 <Link 
        to="/add-product" 
        className="block w-full max-w-sm mx-auto bg-green-600 text-white text-center py-3 px-6 rounded-lg hover:bg-green-700 transition duration-300"
      >
        + Add First Product
      </Link>

  useEffect(() => {
    const fetchUserData = async () => {
      // Get stored user from localStorage
      const storedUser = JSON.parse(localStorage.getItem('agritrace_user') || '{}');
      
      if (!storedUser.uid) {
        navigate('/login');
        return;
      }

      try {
        // Get user document from Firestore
        const userDoc = await getDoc(doc(db, "users", storedUser.uid));
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserDataFromFirestore(data);
          
          // Check if user is new
          if (data.registeredAt) {
            const registeredDate = new Date(data.registeredAt);
            const now = new Date();
            const hoursSinceRegistration = (now - registeredDate) / (1000 * 60 * 60);
            setIsNewUser(hoursSinceRegistration < 24);
          } else {
            setIsNewUser(true);
          }

          // Get products
          const productsQuery = query(
            collection(db, "products"),
            where("userId", "==", storedUser.uid)
          );
          const productsSnapshot = await getDocs(productsQuery);
          const productsData = productsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setProducts(productsData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Get stored user from localStorage (no conflict now)
  const storedUser = JSON.parse(localStorage.getItem('agritrace_user') || '{}');
  
  // Create display user object
  const user = {
    name: storedUser.fullName || "Azeb Yirga",
    role: "Farmer",
    location: storedUser.farmLocation || "Ethiopia, Gondar",
    email: storedUser.email || "farmer@example.com"
  };

  // Stats calculation
  const newUserStats = {
    totalProducts: products.length,
    blockchainVerified: products.filter(p => p.status === 'verified').length,
    pendingVerification: products.filter(p => p.status === 'pending').length,
    processing: products.filter(p => p.status === 'processing').length
  };

  const returningUserStats = {
    totalProducts: products.length || 12,
    blockchainVerified: products.filter(p => p.status === 'verified').length || 8,
    pendingVerification: products.filter(p => p.status === 'pending').length || 1,
    processing: products.filter(p => p.status === 'processing').length || 3
  };

  const stats = isNewUser ? newUserStats : returningUserStats;

  const handleLogout = () => {
    localStorage.removeItem('agritrace_user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
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
                  <h1 className="text-xl font-bold text-gray-800">AgriTrace</h1>
                  <p className="text-xs text-gray-600">Farm-to-Market Transparency</p>
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
                  {isNewUser && <span className="text-xs text-green-600">New User</span>}
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <button 
                  onClick={handleLogout}
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isNewUser ? `Welcome to AgriTrace, ${user.name}!` : `Welcome back, ${user.name}!`}
          </h1>
          <p className="text-gray-600 text-lg">
            {isNewUser 
              ? "Get started by adding your first farm product to the blockchain." 
              : "Manage your farm products and track their journey through the supply chain."}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Products */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Total Products</h3>
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-center py-4">
              <div className="text-4xl font-bold text-gray-800">{stats.totalProducts}</div>
            </div>
          </div>

          {/* Blockchain Verified */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Blockchain Verified</h3>
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-center py-4">
              <div className="text-4xl font-bold text-gray-800">{stats.blockchainVerified}</div>
            </div>
          </div>

          {/* Pending Verification */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Pending Verification</h3>
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-center py-4">
              <div className="text-4xl font-bold text-gray-800">{stats.pendingVerification}</div>
            </div>
          </div>

          {/* Processing */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Processing</h3>
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="text-center py-4">
              <div className="text-4xl font-bold text-gray-800">{stats.processing}</div>
            </div>
          </div>
        </div>

        {/* Different Content for New vs Returning Users */}
        {isNewUser ? (
          /* NEW USER CONTENT - EMPTY STATE */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Empty State */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="text-center py-12">
                  <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                  <h2 className="text-2xl font-bold text-gray-800 mb-3">No Products Yet</h2>
                  <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                    Start by adding your first farm product to the blockchain. Track its journey from farm to market with complete transparency.
                  </p>
                  <button className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center mx-auto shadow-lg hover:shadow-xl transition-all">
                    <PlusCircle className="w-6 h-6 mr-3" />
                    Add First Product
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Quick Start Guide */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="font-bold text-gray-800 mb-4">Getting Started</h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-green-600">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Add Product</p>
                      <p className="text-sm text-gray-600">Register your farm product details</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-blue-600">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Get Verified</p>
                      <p className="text-sm text-gray-600">Submit for blockchain verification</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-purple-600">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Track Journey</p>
                      <p className="text-sm text-gray-600">Monitor product through supply chain</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="font-bold text-gray-800 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                   <Link 
        to="/add-product" 
        className="block w-full max-w-sm mx-auto bg-green-600 text-white text-center py-3 px-6 rounded-lg hover:bg-green-700 transition duration-300"
      >
        + Add First Product
      </Link>
                  <button className="w-full flex items-center justify-center p-4 border border-green-200 rounded-lg hover:bg-green-50">
                    <QrCode className="w-5 h-5 text-green-600 mr-3" />
                    <span>Verify QR Code</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* RETURNING USER CONTENT - WITH DATA */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Products */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Your Products</h2>
                    <p className="text-gray-600">Track and manage all your registered farm products</p>
                  </div>
                <Link 
        to="/add-product" 
        className="block w-full max-w-sm mx-auto bg-green-600 text-white text-center py-3 px-6 rounded-lg hover:bg-green-700 transition duration-300"
      >
        + Add First Product
      </Link>
                </div>
                
                {/* Sample Products */}
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Package className="w-5 h-5 text-green-600" />
                        <div>
                          <h3 className="font-medium text-gray-800">Organic Coffee Beans</h3>
                          <p className="text-sm text-gray-500">Harvested: Nov 15, 2024</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Verified</span>
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Package className="w-5 h-5 text-blue-600" />
                        <div>
                          <h3 className="font-medium text-gray-800">Arabica Coffee Batch</h3>
                          <p className="text-sm text-gray-500">Harvested: Nov 10, 2024</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Processing</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">Product Verified</p>
                        <p className="text-sm text-gray-500">Organic Coffee Beans</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <BarChart className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Analytics Updated</p>
                        <p className="text-sm text-gray-500">Monthly report generated</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">1 day ago</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="font-bold text-gray-800 mb-4">Farm Information</h2>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-gray-600">{user.location}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-gray-600">{user.role}</span>
                  </div>
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white py-4 rounded-xl font-bold flex items-center justify-center shadow-lg">
                <PlusCircle className="w-5 h-5 mr-2" />
                Add More Product
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default FarmerDashboard;