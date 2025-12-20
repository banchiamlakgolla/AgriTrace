// src/App.js - CORRECTED VERSION
import Welcome from './pages/Welcome';
import React, { Suspense } from 'react';
import Login from './pages/Login';
import Signup from './pages/signup';
import AddProduct from './pages/AddProduct';
import NewShipment from './pages/NewShipment';
import BrowseProducts from './pages/BrowseProducts';
import TestBlockchain from './pages/TestBlockchain';
import QRScanner from './components/qr/QRScanner';
import QRGenerator from './components/qr/QRGenerator.jsx';
import ProductDetails from './pages/ProductDetails';
import DebugFirebase from './pages/DebugFirebase';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VerifyProduct from './pages/VerifyProduct';
import ProductQRDisplay from './pages/ProductQRDisplay';

// Lazy imports (heavy components)
const FarmerDashboard = React.lazy(() => import('./pages/dashboards/FarmerDashboard'));
const ExporterDashboard = React.lazy(() => import('./pages/dashboards/ExporterDashboard'));
const ConsumerDashboard = React.lazy(() => import('./pages/dashboards/ConsumerDashboard'));
const AdminDashboard = React.lazy(() => import('./pages/dashboards/AdminDashboard'));

function App() {
  return (
    <Router>
      <Routes>
        {/* FIXED: Welcome is now the homepage */}
        <Route path="/" element={<Welcome />} />
        
        {/* Regular routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/new-shipment" element={<NewShipment />} />
        <Route path="/browse-products" element={<BrowseProducts />} />
        <Route path="/test-blockchain" element={<TestBlockchain />} />
        
        {/* FIXED: Changed from /scan to /qr-scanner */}
        <Route path="/qr-scanner" element={<QRScanner />} />
        
        <Route path="/generate-qr" element={<QRGenerator />} />
        <Route path="/product-details/:id" element={<ProductDetails />} />
        <Route path="/debug-firebase" element={<DebugFirebase />} />
        <Route path="/verify/:productId" element={<VerifyProduct />} />
        <Route path="/product/:productId/qr" element={<ProductQRDisplay />} />
        {/* REMOVE THIS DUPLICATE: <Route path="/scan" element={<QRScanner />} /> */}
       
        {/* Lazy loaded routes with Suspense */}
        <Route 
          path="/admin-dashboard" 
          element={
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Admin Dashboard...</div>}>
              <AdminDashboard />
            </Suspense>
          } 
        />
        <Route 
          path="/farmer-dashboard" 
          element={
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Farmer Dashboard...</div>}>
              <FarmerDashboard />
            </Suspense>
          } 
        />
        <Route 
          path="/exporter-dashboard" 
          element={
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Exporter Dashboard...</div>}>
              <ExporterDashboard />
            </Suspense>
          } 
        />
        <Route 
          path="/consumer-dashboard" 
          element={
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Consumer Dashboard...</div>}>
              <ConsumerDashboard />
            </Suspense>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;