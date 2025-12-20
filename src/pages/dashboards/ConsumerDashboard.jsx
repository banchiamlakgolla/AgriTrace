// src/pages/dashboards/ConsumerDashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { Link } from 'react-router-dom';

import { 
  Search, 
  QrCode, 
  Package, 
  MapPin, 
  Clock, 
  Shield,
  User,
  Bell,
  LogOut,
  TrendingUp,
  History,
  Scan,
  ShoppingBag
} from 'lucide-react';

const ConsumerDashboard = () => {
  const navigate = useNavigate();
  const [recentScans, setRecentScans] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Get user from localStorage
  const userData = JSON.parse(localStorage.getItem('agritrace_user') || '{}');
  const user = {
    name: userData.fullName || "Consumer Name",
    role: "Consumer",
    email: userData.email || "consumer@example.com"
  };

  // Fetch recent scans from localStorage or backend
  useEffect(() => {
    const savedScans = JSON.parse(localStorage.getItem('agritrace_recent_scans') || '[]');
    if (savedScans.length > 0) {
      setRecentScans(savedScans);
    } else {
      // Default mock data
      const mockScans = [
        { 
          id: 1, 
          name: "Organic Coffee Beans", 
          date: "2024-11-15", 
          verified: true, 
          productId: "PROD-123456-ABC",
          farmer: "Axeb Yirga",
          location: "Gonder, Ethiopia"
        },
        { 
          id: 2, 
          name: "Fresh Avocados", 
          date: "2024-11-14", 
          verified: true, 
          productId: "PROD-789012-DEF",
          farmer: "Maria Garcia",
          location: "Michoacán, Mexico"
        },
        { 
          id: 3, 
          name: "Arabica Coffee", 
          date: "2024-11-13", 
          verified: false, 
          productId: "PROD-345678-GHI",
          farmer: "Unknown",
          location: "Unknown"
        },
      ];
      setRecentScans(mockScans);
      localStorage.setItem('agritrace_recent_scans', JSON.stringify(mockScans));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('agritrace_user');
    navigate('/login');
  };

  // Fixed: Navigate to QRScanner page
  const handleScanQR = () => {
    navigate('/qr-scanner');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to verification with product ID
      navigate('/qr-scanner', { state: { productId: searchQuery } });
    }
  };

  // Handle viewing product details
  const handleViewDetails = (scan) => {
    navigate('/qr-scanner', { 
      state: { 
        productId: scan.productId,
        prefill: true 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">AgriTrace</h1>
                  <p className="text-xs text-gray-600">Track Your Food's Journey</p>
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
                <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
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
            Track Product Origins, {user.name}!
          </h1>
          <p className="text-gray-600 text-lg">
            Scan QR codes to verify authenticity and trace the journey of your food from farm to table.
          </p>
          
          {/* Quick Scan Button */}
          <div className="mt-6">
            <button
              onClick={handleScanQR}
              className="inline-flex items-center bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all"
            >
              <QrCode className="w-6 h-6 mr-3" />
              Scan Product QR Code
            </button>
            <p className="text-gray-600 mt-3">Verify product authenticity in seconds</p>
          </div>
        </div>

        {/* Search and Scan Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Search Product */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Search Product</h2>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter product ID (e.g., PROD-123456-ABC)"
                  className="flex-1 border border-gray-300 rounded-l-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-3 rounded-r-lg font-semibold hover:from-blue-700 hover:to-cyan-600 flex items-center"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Scan QR Code */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Scan QR Code</h2>
            <div className="text-center py-4">
              <div className="w-32 h-32 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <QrCode className="w-16 h-16 text-blue-600" />
              </div>
              <button
                onClick={handleScanQR}
                className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center mx-auto shadow-lg hover:shadow-xl transition-all"
              >
                <Scan className="w-6 h-6 mr-3" />
                Open QR Scanner
              </button>
              <p className="text-sm text-gray-500 mt-4">
                Scan product QR codes for instant verification
              </p>
            </div>
          </div>

          {/* Browse Products */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Browse Products</h2>
            <div className="text-center py-4">
              <div className="w-32 h-32 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-16 h-16 text-purple-600" />
              </div>
              <Link
                to="/browse-products"
                className="block bg-gradient-to-r from-purple-600 to-pink-500 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center mx-auto shadow-lg hover:shadow-xl transition-all"
              >
                <ShoppingBag className="w-6 h-6 mr-3" />
                Browse All Products
              </Link>
              <p className="text-sm text-gray-500 mt-4">
                View farm products, check authenticity, make purchases
              </p>
            </div>
          </div>
        </div>

        {/* Recent Scans */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Recent Verifications</h2>
            <button 
              onClick={() => navigate('/qr-scanner')}
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              <History className="w-5 h-5 mr-2" />
              Verify More
            </button>
          </div>
          
          <div className="space-y-4">
            {recentScans.map((scan) => (
              <div key={scan.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Package className="w-5 h-5 text-blue-600" />
                    <div>
                      <h3 className="font-medium text-gray-800">{scan.name}</h3>
                      <p className="text-sm text-gray-500">Verified: {scan.date}</p>
                      <p className="text-xs text-gray-400">ID: {scan.productId}</p>
                      <p className="text-xs text-gray-400">Farmer: {scan.farmer}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {scan.verified ? (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center">
                        <Shield className="w-4 h-4 mr-1" />
                        Verified
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                        Unverified
                      </span>
                    )}
                    <button 
                      onClick={() => handleViewDetails(scan)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 hover:bg-blue-50 rounded"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product Journey Example */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Farm Origin</h3>
              <p className="text-sm text-gray-600">Trace back to the exact farm location</p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Harvest Date</h3>
              <p className="text-sm text-gray-600">Know exactly when it was harvested</p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Supply Chain</h3>
              <p className="text-sm text-gray-600">Track every step of the journey</p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Verification</h3>
              <p className="text-sm text-gray-600">Blockchain-verified authenticity</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConsumerDashboard;