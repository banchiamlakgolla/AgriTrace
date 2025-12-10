// src/components/DistributorDashboard.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase'; 
import { 
  Truck, 
  Package, 
  Users, 
  MapPin, 
  Clock, 
  Shield,
  User,
  Bell,
  LogOut,
  BarChart,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const DistributorDashboard = () => {
  const navigate = useNavigate();
  
  // Get user from localStorage
  const userData = JSON.parse(localStorage.getItem('agritrace_user') || '{}');
  const user = {
    name: userData.fullName || "Distributor Name",
    role: "Distributor",
    company: userData.company || "AgriDistributors Inc.",
    location: userData.location || "Addis Ababa, Ethiopia"
  };

  const [shipments, setShipments] = useState([
    { id: 1, product: "Organic Coffee", status: "in-transit", from: "Gondar Farm", to: "Addis Market", eta: "2 days" },
    { id: 2, product: "Avocados", status: "delivered", from: "Hawassa Farm", to: "Dire Dawa Market", eta: "Completed" },
    { id: 3, product: "Tea Leaves", status: "pending", from: "Jimma Farm", to: "Bahir Dar Market", eta: "5 days" },
  ]);

  const stats = {
    totalShipments: 24,
    inTransit: 6,
    delivered: 15,
    pending: 3
  };

  const handleLogout = () => {
    localStorage.removeItem('agritrace_user');
    navigate('/login');
  };

  const updateShipmentStatus = (id, newStatus) => {
    setShipments(shipments.map(shipment => 
      shipment.id === id ? { ...shipment, status: newStatus } : shipment
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-amber-500 rounded-xl flex items-center justify-center">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">AgriTrace</h1>
                  <p className="text-xs text-gray-600">Distribution Network</p>
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
                  <p className="text-sm text-gray-600">{user.role} • {user.company}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-orange-100 to-amber-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-orange-600" />
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
            Distribution Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Manage shipments, track logistics, and update product status across the supply chain.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Total Shipments</h3>
              <Truck className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-center py-4">
              <div className="text-4xl font-bold text-gray-800">{stats.totalShipments}</div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">In Transit</h3>
              <Clock className="w-6 h-6 text-blue-600" />
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

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Pending</h3>
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="text-center py-4">
              <div className="text-4xl font-bold text-gray-800">{stats.pending}</div>
            </div>
          </div>
        </div>

        {/* Active Shipments */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Active Shipments</h2>
                  <p className="text-gray-600">Monitor and manage current deliveries</p>
                </div>
                <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center">
                  <Truck className="w-5 h-5 mr-2" />
                  New Shipment
                </button>
              </div>
              
              <div className="space-y-4">
                {shipments.map((shipment) => (
                  <div key={shipment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <Package className="w-5 h-5 text-orange-600" />
                            <h3 className="font-medium text-gray-800">{shipment.product}</h3>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            shipment.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            shipment.status === 'in-transit' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {shipment.status.charAt(0).toUpperCase() + shipment.status.slice(1)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">From</p>
                            <p className="font-medium">{shipment.from}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">To</p>
                            <p className="font-medium">{shipment.to}</p>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center text-gray-500">
                            <Clock className="w-4 h-4 mr-2" />
                            ETA: {shipment.eta}
                          </div>
                          <div className="space-x-2">
                            {shipment.status === 'pending' && (
                              <button 
                                onClick={() => updateShipmentStatus(shipment.id, 'in-transit')}
                                className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm"
                              >
                                Start Shipment
                              </button>
                            )}
                            {shipment.status === 'in-transit' && (
                              <button 
                                onClick={() => updateShipmentStatus(shipment.id, 'delivered')}
                                className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm"
                              >
                                Mark Delivered
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="font-bold text-gray-800 mb-4">Distribution Info</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Users className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-gray-600">{user.company}</span>
                </div>
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

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="font-bold text-gray-800 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center p-4 border border-orange-200 rounded-lg hover:bg-orange-50">
                  <Truck className="w-5 h-5 text-orange-600 mr-3" />
                  <span>New Shipment</span>
                </button>
                <button className="w-full flex items-center justify-center p-4 border border-orange-200 rounded-lg hover:bg-orange-50">
                  <BarChart className="w-5 h-5 text-orange-600 mr-3" />
                  <span>View Analytics</span>
                </button>
                <button className="w-full flex items-center justify-center p-4 border border-orange-200 rounded-lg hover:bg-orange-50">
                  <Shield className="w-5 h-5 text-orange-600 mr-3" />
                  <span>Verify Products</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DistributorDashboard;