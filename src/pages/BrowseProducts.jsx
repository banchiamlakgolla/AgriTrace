import React from 'react';
import { Link } from 'react-router-dom';

const BrowseProducts = () => {
  const products = [
    { id: 1, name: "Organic Coffee Beans", farmer: "Axeb Yirga", location: "Gonder, Ethiopia", price: "$24.99", verified: true },
    { id: 2, name: "Fresh Avocados", farmer: "Farm Fresh Co", location: "Nairobi, Kenya", price: "$18.50", verified: true },
    { id: 3, name: "Arabica Coffee", farmer: "Highland Farms", location: "Addis Ababa", price: "$29.99", verified: true },
    { id: 4, name: "Ethiopian Spices", farmer: "Spice Traders", location: "Harar, Ethiopia", price: "$12.99", verified: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
      <div className="max-w-6xl mx-auto">
        <Link to="/consumer-dashboard" className="inline-block mb-6 text-purple-700 hover:text-purple-900">
          ← Back to Dashboard
        </Link>
        
        <h1 className="text-3xl font-bold text-purple-800 mb-2">Browse Products</h1>
        <p className="text-gray-600 mb-8">Discover authentic farm products with full traceability</p>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="flex">
            <input
              type="text"
              placeholder="Search products by name, farmer, or location..."
              className="flex-1 border border-gray-300 rounded-l-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-r-lg font-semibold">
              Search
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center">
                <span className="text-4xl">🌾</span>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
                  {product.verified ? (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center">
                      ✅ Verified
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                      ⏳ Pending
                    </span>
                  )}
                </div>
                
                <p className="text-gray-600 mb-2">👨‍🌾 Farmer: {product.farmer}</p>
                <p className="text-gray-600 mb-2">📍 Location: {product.location}</p>
                <p className="text-gray-600 mb-4">💰 Price: {product.price}</p>
                
                <div className="flex space-x-3">
                  <button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-600">
                    View Details
                  </button>
                  <button className="flex-1 border border-purple-600 text-purple-600 py-2 rounded-lg font-semibold hover:bg-purple-50">
                    Scan QR
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrowseProducts;