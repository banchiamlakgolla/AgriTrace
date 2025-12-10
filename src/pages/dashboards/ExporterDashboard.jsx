
import React, { useState, useEffect } from 'react'; 
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
 
import { 
  Truck, 
  Globe, 
  BarChart,

  CheckCircle,
  Clock,
  PlusCircle,
  QrCode,
  User,
  Bell,
  LogOut
} from 'lucide-react';


const ExporterDashboard = () => {
  const navigate = useNavigate();
  const [isNewUser, setIsNewUser] = useState(false); // Now useState is defined
  
  // Get user from localStorage
  const userData = JSON.parse(localStorage.getItem('agritrace_user') || '{}');
  const user = {
    name: userData.fullName || "Export Manager",
    role: "Exporter",
    company: "Global Export Ltd",
    location: "Dar es Salaam, Tanzania"
  };

  // Check if user is new (registered within last 24 hours)
  useEffect(() => { // Now useEffect is defined
    if (userData.registeredAt) {
      const registeredDate = new Date(userData.registeredAt);
      const now = new Date();
      const hoursSinceRegistration = (now - registeredDate) / (1000 * 60 * 60);
      setIsNewUser(hoursSinceRegistration < 24);
    } else {
      setIsNewUser(true);
    }
  }, [userData]);

  // Different stats for new vs returning users
  const newUserStats = {
    totalShipments: 0,
    pendingShipments: 0,
    inTransit: 0,
    delivered: 0
  };

  const returningUserStats = {
    totalShipments: 24,
    pendingShipments: 3,
    inTransit: 8,
    delivered: 13
  };

  const stats = isNewUser ? newUserStats : returningUserStats;

  const handleLogout = () => {
    localStorage.removeItem('agritrace_user');
    navigate('/login');
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
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">AgriTrace</h1>
                  <p className="text-xs text-gray-600">Export Management</p>
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
                  {isNewUser && <span className="text-xs text-blue-600">New User</span>}
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isNewUser ? `Welcome to AgriTrace, ${user.name}!` : `Welcome back, ${user.name}!`}
          </h1>
          <p className="text-gray-600 text-lg">
            {isNewUser 
              ? "Get started by creating your first export shipment." 
              : "Manage export shipments and track products through the supply chain."}
          </p>
        </div>

        {/* Stats Grid for Exporter */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Total Shipments</h3>
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-center py-4">
              <div className="text-4xl font-bold text-gray-800">{stats.totalShipments}</div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Pending</h3>
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-center py-4">
              <div className="text-4xl font-bold text-gray-800">{stats.pendingShipments}</div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">In Transit</h3>
              <Globe className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="text-center py-4">
              <div className="text-4xl font-bold text-gray-800">{stats.inTransit}</div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Delivered</h3>
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-center py-4">
              <div className="text-4xl font-bold text-gray-800">{stats.delivered}</div>
            </div>
          </div>
        </div>

        {/* Different Content for New vs Returning Exporters */}
        {isNewUser ? (
          /* NEW EXPORTER CONTENT */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="text-center py-12">
                  <Truck className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                  <h2 className="text-2xl font-bold text-gray-800 mb-3">No Shipments Yet</h2>
                  <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                    Start by creating your first export shipment. Track products through the supply chain with complete visibility.
                  </p>
                 <Link 
  to="/new-shipment" 
  className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center mx-auto shadow-lg hover:shadow-xl transition-all"
>
  <PlusCircle className="w-6 h-6 mr-3" />
  Create First Shipment
</Link>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="font-bold text-gray-800 mb-4">Getting Started</h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-blue-600">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Add Products</p>
                      <p className="text-sm text-gray-600">Select products for export</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-green-600">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Create Shipment</p>
                      <p className="text-sm text-gray-600">Set up export documentation</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-purple-600">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Track & Monitor</p>
                      <p className="text-sm text-gray-600">Follow shipment progress</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="font-bold text-gray-800 mb-4">Quick Actions</h2>
                <div className="space-y-3">
               <Link 
  to="/new-shipment" 
  className="w-full flex items-center justify-center p-4 border border-blue-200 rounded-lg hover:bg-blue-50"
>
  <PlusCircle className="w-5 h-5 text-blue-600 mr-3" />
  <span>New Shipment</span>
</Link>
                  <button className="w-full flex items-center justify-center p-4 border border-blue-200 rounded-lg hover:bg-blue-50">
                    <QrCode className="w-5 h-5 text-blue-600 mr-3" />
                    <span>Scan Products</span>
                  </button>
                  <button className="w-full flex items-center justify-center p-4 border border-blue-200 rounded-lg hover:bg-blue-50">
                    <BarChart className="w-5 h-5 text-blue-600 mr-3" />
                    <span>View Analytics</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* RETURNING EXPORTER CONTENT */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Shipment Management</h2>
                    <p className="text-gray-600">Manage and track all export shipments</p>
                  </div>
                  <Link 
        to="/new-shipment" 
        className="block w-full max-w-sm mx-auto bg-blue-600 text-white text-center py-3 px-6 rounded-lg hover:bg-blue-700"
      >
        📦 New Shipment
      </Link>
                </div>
                
                {/* Sample Shipments */}
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Truck className="w-5 h-5 text-blue-600" />
                        <div>
                          <h3 className="font-medium text-gray-800">Coffee to Europe</h3>
                          <p className="text-sm text-gray-500">Shipment ID: EXP-001</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Delivered</span>
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Truck className="w-5 h-5 text-orange-600" />
                        <div>
                          <h3 className="font-medium text-gray-800">Cocoa to USA</h3>
                          <p className="text-sm text-gray-500">Shipment ID: EXP-002</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">In Transit</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="font-bold text-gray-800 mb-4">Company Info</h2>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600"><span className="font-medium">Company:</span> {user.company}</p>
                  <p className="text-sm text-gray-600"><span className="font-medium">Location:</span> {user.location}</p>
                  <p className="text-sm text-gray-600"><span className="font-medium">Role:</span> {user.role}</p>
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white py-4 rounded-xl font-bold flex items-center justify-center shadow-lg">
                <PlusCircle className="w-5 h-5 mr-2" />
                Add More Shipment
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ExporterDashboard;