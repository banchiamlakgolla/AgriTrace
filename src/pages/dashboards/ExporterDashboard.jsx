// src/pages/dashboards/ExporterDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { 
  Truck, Globe, BarChart, CheckCircle, Clock, PlusCircle, 
  QrCode, User, Bell, LogOut, Trash2, Eye, Edit, 
  Download, RefreshCw, Shield, ExternalLink, AlertCircle
} from 'lucide-react';

// Firebase imports
import { db } from '../../firebase';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  doc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';

// Blockchain service
import blockchainService from '../../services/blockchain';

const ExporterDashboard = () => {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [shipmentToDelete, setShipmentToDelete] = useState(null);
  const [blockchainLoading, setBlockchainLoading] = useState({});
  
  // Get user from localStorage
  const userData = JSON.parse(localStorage.getItem('agritrace_user') || '{}');
  const user = {
    name: userData.fullName || "Export Manager",
    role: "Exporter",
    company: userData.company || "Global Export Ltd",
    location: userData.location || "Dar es Salaam, Tanzania",
    uid: userData.uid,
    email: userData.email
  };

  // Fetch user's shipments
  const fetchShipments = async () => {
    if (!user.uid) {
      console.error('⚠️ User not logged in');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 Fetching shipments for user:', user.uid);
      
      // Query shipments by exporterId
      const shipmentsRef = collection(db, 'shipments');
      const q = query(shipmentsRef, where('exporterId', '==', user.uid));
      
      const querySnapshot = await getDocs(q);
      const shipmentData = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        shipmentData.push({
          id: doc.id,
          ...data,
          // Ensure all required fields exist
          shipmentName: data.shipmentName || 'Unnamed Shipment',
          destination: data.destination || 'Unknown',
          status: data.status || 'pending',
          shipmentId: data.shipmentId || `SHIP-${doc.id.substring(0, 8)}`,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date()
        });
      });
      
      // Sort by creation date (newest first)
      shipmentData.sort((a, b) => b.createdAt - a.createdAt);
      
      console.log(`✅ Fetched ${shipmentData.length} shipments`);
      setShipments(shipmentData);
      
    } catch (error) {
      console.error('❌ Error fetching shipments:', error);
      alert('Failed to load shipments. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  // Load shipments on component mount
  useEffect(() => {
    fetchShipments();
    
    // Set up real-time updates (polling every 30 seconds)
    const intervalId = setInterval(fetchShipments, 30000);
    
    return () => clearInterval(intervalId);
  }, [user.uid]);

  // Calculate statistics
  const calculateStats = () => {
    const total = shipments.length;
    const pending = shipments.filter(s => s.status === 'pending').length;
    const inTransit = shipments.filter(s => s.status === 'in-transit' || s.status === 'in_progress').length;
    const delivered = shipments.filter(s => s.status === 'delivered' || s.status === 'completed').length;
    const cancelled = shipments.filter(s => s.status === 'cancelled').length;
    
    return { total, pending, inTransit, delivered, cancelled };
  };

  const stats = calculateStats();

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('agritrace_user');
    localStorage.removeItem('agritrace_recent_scans');
    navigate('/login');
  };

  // Delete shipment
  const handleDeleteShipment = async () => {
    if (!shipmentToDelete) return;
    
    try {
      // Delete from Firebase
      await deleteDoc(doc(db, 'shipments', shipmentToDelete.id));
      
      // Remove from state
      setShipments(prev => prev.filter(s => s.id !== shipmentToDelete.id));
      
      alert(`✅ Shipment "${shipmentToDelete.shipmentName}" deleted successfully`);
      
    } catch (error) {
      console.error('❌ Error deleting shipment:', error);
      alert('Failed to delete shipment: ' + error.message);
    } finally {
      setShowDeleteModal(false);
      setShipmentToDelete(null);
    }
  };

  // Update shipment status
  // In ExporterDashboard.jsx, update the updateShipmentStatus function:
const updateShipmentStatus = async (shipmentId, newStatus) => {
  try {
    await updateDoc(doc(db, 'shipments', shipmentId), {
      status: newStatus,
      updatedAt: serverTimestamp() // Use serverTimestamp instead of new Date()
    });
    
    // Update local state
    setShipments(prev => prev.map(s => 
      s.id === shipmentId ? { ...s, status: newStatus } : s
    ));
    
    alert(`✅ Status updated to ${newStatus}`);
  } catch (error) {
    console.error('Error updating status:', error);
    alert('Failed to update status');
  }
};

  // Record shipment on blockchain
// In ExporterDashboard.jsx, update recordOnBlockchain:
const recordOnBlockchain = async (shipment) => {
  setBlockchainLoading(prev => ({ ...prev, [shipment.id]: true }));
  
  try {
    const blockchainData = {
      shipmentId: shipment.shipmentId,
      shipmentName: shipment.shipmentName,
      exporter: shipment.exporterName || user.name,
      destination: shipment.destination,
      products: shipment.products || [],
      timestamp: new Date().toISOString()
    };
    
    const result = await blockchainService.recordShipment(blockchainData);
    
    if (result.success) {
      // Update Firebase with blockchain hash
      await updateDoc(doc(db, 'shipments', shipment.id), {
        blockchainHash: result.txHash,
        onBlockchain: true,
        blockchainTimestamp: serverTimestamp(), // Use serverTimestamp
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      setShipments(prev => prev.map(s => 
        s.id === shipment.id ? { 
          ...s, 
          blockchainHash: result.txHash,
          onBlockchain: true 
        } : s
      ));
      
      alert(`✅ Shipment recorded on blockchain!\nTransaction: ${result.txHash}`);
    } else {
      throw new Error(result.error || 'Blockchain recording failed');
    }
    
  } catch (error) {
    console.error('❌ Blockchain error:', error);
    alert('Failed to record on blockchain: ' + error.message);
  } finally {
    setBlockchainLoading(prev => ({ ...prev, [shipment.id]: false }));
  }
};
  // View shipment details
  const viewShipmentDetails = (shipment) => {
    setSelectedShipment(shipment);
  };

  // Export shipment data
  const exportShipmentData = (shipment) => {
    const dataStr = JSON.stringify(shipment, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `shipment-${shipment.shipmentId}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      'pending': { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      'in-transit': { color: 'bg-blue-100 text-blue-800', label: 'In Transit' },
      'in_progress': { color: 'bg-blue-100 text-blue-800', label: 'In Progress' },
      'delivered': { color: 'bg-green-100 text-green-800', label: 'Delivered' },
      'completed': { color: 'bg-green-100 text-green-800', label: 'Completed' },
      'cancelled': { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Blockchain badge component
  const BlockchainBadge = ({ shipment }) => {
    if (!shipment.onBlockchain) {
      return (
        <button
          onClick={() => recordOnBlockchain(shipment)}
          disabled={blockchainLoading[shipment.id]}
          className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs hover:bg-gray-200 flex items-center"
        >
          {blockchainLoading[shipment.id] ? (
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-1"></div>
          ) : (
            <Shield className="h-3 w-3 mr-1" />
          )}
          Record on Blockchain
        </button>
      );
    }
    
    return (
      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs flex items-center">
        <Shield className="h-3 w-3 mr-1" />
        On Blockchain
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AgriTrace Exporter</h1>
                <p className="text-sm text-gray-500">Shipment Management System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/new-shipment')}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-600 flex items-center"
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                New Shipment
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.company}</p>
                </div>
                <div className="h-10 w-10 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome back, {user.name}!
              </h1>
              <p className="text-gray-600">
                Manage your agricultural exports from {user.location}. 
                Track shipments, update status, and ensure blockchain verification.
              </p>
            </div>
            <button
              onClick={fetchShipments}
              disabled={loading}
              className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
       

<div className="flex space-x-2 mb-4">
  <button 
    onClick={() => navigate('/new-shipment')}
    className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-600 flex items-center"
  >
    <PlusCircle className="h-5 w-5 mr-2" />
    New Shipment
  </button>
  
 
</div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Shipments</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Truck className="h-10 w-10 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-10 w-10 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">In Transit</p>
                <p className="text-3xl font-bold text-blue-600">{stats.inTransit}</p>
              </div>
              <Truck className="h-10 w-10 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Delivered</p>
                <p className="text-3xl font-bold text-green-600">{stats.delivered}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Cancelled</p>
                <p className="text-3xl font-bold text-red-600">{stats.cancelled}</p>
              </div>
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
          </div>
        </div>

        {/* Shipments Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Shipment Management</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  Showing {shipments.length} shipments
                </span>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading shipments...</p>
                  <p className="text-sm text-gray-400 mt-2">Fetching from Firebase</p>
                </div>
              </div>
            ) : shipments.length === 0 ? (
              <div className="text-center py-12">
                <Truck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl text-gray-600 mb-2">No shipments found</p>
                <p className="text-gray-500 mb-6">Create your first shipment to get started</p>
                <button 
                  onClick={() => navigate('/new-shipment')}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-600 flex items-center mx-auto"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Create New Shipment
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shipment ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blockchain</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {shipments.map(shipment => (
                      <tr key={shipment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono font-medium text-gray-900">
                            {shipment.shipmentId}
                          </div>
                          <div className="text-xs text-gray-500">
                            {shipment.createdAt.toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {shipment.shipmentName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {shipment.products?.join?.(' • ') || 'No products'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{shipment.destination}</div>
                          <div className="text-xs text-gray-500">
                            {shipment.departureDate && `Depart: ${shipment.departureDate}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={shipment.status} />
                          <div className="mt-1">
                            <select
                              value={shipment.status}
                              onChange={(e) => updateShipmentStatus(shipment.id, e.target.value)}
                              className="text-xs border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="pending">Pending</option>
                              <option value="in-transit">In Transit</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <BlockchainBadge shipment={shipment} />
                          {shipment.blockchainHash && (
                            <div className="text-xs text-gray-500 mt-1 truncate max-w-[120px]">
                              {shipment.blockchainHash.substring(0, 16)}...
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => viewShipmentDetails(shipment)}
                              className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => exportShipmentData(shipment)}
                              className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg"
                              title="Export Data"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setShipmentToDelete(shipment);
                                setShowDeleteModal(true);
                              }}
                              className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg"
                              title="Delete Shipment"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Shipment Details Modal */}
      {selectedShipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedShipment.shipmentName}
                  </h3>
                  <p className="text-gray-600">{selectedShipment.shipmentId}</p>
                </div>
                <button
                  onClick={() => setSelectedShipment(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Shipment Details</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Status:</dt>
                      <dd><StatusBadge status={selectedShipment.status} /></dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Destination:</dt>
                      <dd className="font-medium">{selectedShipment.destination}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Departure Date:</dt>
                      <dd>{selectedShipment.departureDate || 'Not set'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Expected Delivery:</dt>
                      <dd>{selectedShipment.expectedDelivery || 'Not set'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Shipping Cost:</dt>
                      <dd className="font-medium">
                        {selectedShipment.shippingCost ? `$${selectedShipment.shippingCost}` : 'Not set'}
                      </dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Products</h4>
                  <ul className="space-y-2">
                    {selectedShipment.products?.map((product, index) => (
                      <li key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span>{product.name || product}</span>
                        <span className="text-sm text-gray-600">
                          {product.quantity || product.price || ''}
                        </span>
                      </li>
                    )) || <p className="text-gray-500">No products listed</p>}
                  </ul>
                </div>
              </div>
              
              {selectedShipment.notes && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-700 mb-2">Notes</h4>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {selectedShipment.notes}
                  </p>
                </div>
              )}
              
              {selectedShipment.onBlockchain && (
                <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-800 mb-2 flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Blockchain Verified
                  </h4>
                  <p className="text-sm text-purple-700 font-mono break-all">
                    Hash: {selectedShipment.blockchainHash}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && shipmentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete shipment "{shipmentToDelete.shipmentName}"?
              This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setShipmentToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteShipment}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Shipment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExporterDashboard;