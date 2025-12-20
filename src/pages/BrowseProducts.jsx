import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, QrCode } from 'lucide-react';

const BrowseProducts = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  
  // Original products data
  const products = [
    { id: 1, name: "Organic Coffee Beans", farmer: "Azeb Yirga", location: "Gonder, Ethiopia", price: "$24.99", verified: true },
    { id: 2, name: "Fresh Avocados", farmer: "Farm Fresh Co", location: "Nairobi, Kenya", price: "$18.50", verified: true },
    { id: 3, name: "Arabica Coffee", farmer: "Highland Farms", location: "Addis Ababa", price: "$29.99", verified: true },
    { id: 4, name: "Ethiopian Spices", farmer: "Spice Traders", location: "Harar, Ethiopia", price: "$12.99", verified: false },
  ];

  // Initialize filtered products with all products
  const [displayProducts, setDisplayProducts] = useState(products);

  // Function to handle search
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setDisplayProducts(products); // Reset to all products if search is empty
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.farmer.toLowerCase().includes(query) ||
      product.location.toLowerCase().includes(query)
    );
    
    setDisplayProducts(filtered);
  };

  // Function to handle Enter key in search
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Function to handle Scan QR button
  const handleScanQR = () => {
    // Navigate to your QR scanner page
    navigate('/scan');
  };

  // Function to handle Scan QR for a specific product
  const handleScanProductQR = (productId) => {
    // You can either navigate to scanner or show a QR for this specific product
    navigate(`/generate-qr?productId=${productId}`);
    // OR navigate to scanner with product ID
    // navigate(`/scan?product=${productId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
      <div className="max-w-6xl mx-auto">
        <Link to="/consumer-dashboard" className="inline-block mb-6 text-purple-700 hover:text-purple-900">
          ← Back to Dashboard
        </Link>
        
        <h1 className="text-3xl font-bold text-purple-800 mb-2">Browse Products</h1>
        <p className="text-gray-600 mb-8">Discover authentic farm products with full traceability</p>

        {/* Search Bar - NOW WORKING */}
        <div className="mb-8">
          <div className="flex">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search products by name, farmer, or location..."
              className="flex-1 border border-gray-300 rounded-l-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button 
              onClick={handleSearch}
              className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-r-lg font-semibold flex items-center hover:from-purple-700 hover:to-pink-600"
            >
              <Search className="w-5 h-5 mr-2" />
              Search
            </button>
          </div>
          
          {/* Search Results Info */}
          {searchQuery && (
            <div className="mt-2 text-sm text-gray-600">
              Found {displayProducts.length} product(s) for "{searchQuery}"
            </div>
          )}
        </div>

        {/* QR Scan Button in Header */}
        <div className="mb-6 flex justify-end">
          <button 
            onClick={handleScanQR}
            className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-6 py-3 rounded-lg font-semibold flex items-center hover:from-green-700 hover:to-emerald-600 shadow-lg"
          >
            <QrCode className="w-5 h-5 mr-2" />
            Scan Product QR Code
          </button>
        </div>

        {/* Products Grid */}
        {displayProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">No products match your search: "{searchQuery}"</p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setDisplayProducts(products);
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Show All Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayProducts.map((product) => (
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
                    <Link 
                      to={`/product-details/${product.id}`} 
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-600 text-center"
                    >
                      View Details
                    </Link>
                    <button 
                      onClick={() => handleScanProductQR(product.id)}
                      className="flex-1 border border-purple-600 text-purple-600 py-2 rounded-lg font-semibold hover:bg-purple-50 flex items-center justify-center"
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      Scan QR
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseProducts;