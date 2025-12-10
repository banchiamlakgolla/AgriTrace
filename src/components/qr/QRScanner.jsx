
import React, { useState } from 'react';
import { QrCode, Search, CheckCircle, XCircle } from 'lucide-react';

const QRScanner = () => {
  const [productId, setProductId] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (!productId.trim()) {
      setError('Please enter a Product ID');
      return;
    }
    
    setLoading(true);
    setError('');
    setVerificationResult(null);
    
    // Mock verification for now
    setTimeout(() => {
      if (productId.length >= 10) {
        setVerificationResult({
          verified: true,
          productName: "Organic Coffee Beans",
          farmer: "Abel Farm",
          location: "Ethiopia",
          harvestDate: "2024-01-15",
          blockchain: true,
          journey: [
            "Harvested in Ethiopia",
            "Processed in Addis Ababa",
            "Packaged for export",
            "Shipped to destination"
          ]
        });
      } else {
        setError('Invalid Product ID. Please check and try again.');
      }
      setLoading(false);
    }, 1500);
  };

  const handleReset = () => {
    setProductId('');
    setVerificationResult(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
                <QrCode className="w-8 h-8 mr-3 text-green-600" />
                AgriTrace Product Verification
              </h1>
              <p className="text-gray-600 mt-2">Verify product authenticity using QR code or Product ID</p>
            </div>
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
              Secure Blockchain Verification
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-700 mb-4">Scan or Enter Product ID</h2>
              
              {/* QR Scanner Placeholder */}
              <div className="mb-6">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50">
                  <QrCode className="w-24 h-24 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-700 font-medium mb-2">QR Code Scanner</p>
                  <p className="text-gray-500 text-sm">Camera scanning feature coming soon</p>
                  <p className="text-gray-400 text-xs mt-2">(Currently use Product ID below)</p>
                </div>
              </div>

              {/* Manual Input */}
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Or Enter Product ID Manually
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Enter Product ID (e.g., PROD-123456-ABC)"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                {error && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 flex items-center">
                      <XCircle className="w-4 h-4 mr-2" />
                      {error}
                    </p>
                  </div>
                )}

                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={handleVerify}
                    disabled={!productId.trim() || loading}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Verifying...
                      </>
                    ) : (
                      'Verify Product'
                    )}
                  </button>
                  
                  <button
                    onClick={handleReset}
                    className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-gray-700 mb-4">How Verification Works</h3>
              <ol className="space-y-3">
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-800 w-6 h-6 rounded-full flex items-center justify-center text-sm mr-3">1</span>
                  <span>Scan QR code on product packaging</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-800 w-6 h-6 rounded-full flex items-center justify-center text-sm mr-3">2</span>
                  <span>System checks blockchain for product history</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-800 w-6 h-6 rounded-full flex items-center justify-center text-sm mr-3">3</span>
                  <span>View complete farm-to-table journey</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-800 w-6 h-6 rounded-full flex items-center justify-center text-sm mr-3">4</span>
                  <span>Verify authenticity and quality claims</span>
                </li>
              </ol>
            </div>
          </div>

          {/* Right Column - Results */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-700 mb-6">Verification Results</h2>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-700 font-medium">Checking product authenticity...</p>
                  <p className="text-gray-500 text-sm mt-2">Querying blockchain records</p>
                </div>
              ) : verificationResult ? (
                <div>
                  {/* Success Banner */}
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
                    <div className="flex items-center mb-4">
                      <CheckCircle className="w-10 h-10 text-green-600 mr-3" />
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">✅ Genuine Product</h3>
                        <p className="text-green-700">Verified on AgriTrace Blockchain</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Product</p>
                        <p className="font-bold text-gray-800">{verificationResult.productName}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Farmer</p>
                        <p className="font-bold text-gray-800">{verificationResult.farmer}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Origin</p>
                        <p className="font-bold text-gray-800">{verificationResult.location}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Harvest</p>
                        <p className="font-bold text-gray-800">{verificationResult.harvestDate}</p>
                      </div>
                    </div>

                    {/* Blockchain Badge */}
                    {verificationResult.blockchain && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white text-sm">⛓️</span>
                          </div>
                          <div>
                            <p className="font-medium text-blue-800">Blockchain Verified</p>
                            <p className="text-sm text-blue-600">Immutable record on Polygon network</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Journey */}
                  <div>
                    <h4 className="font-bold text-gray-700 mb-4">Product Journey</h4>
                    <div className="space-y-3">
                      {verificationResult.journey.map((step, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-green-700 font-bold">{index + 1}</span>
                          </div>
                          <p className="text-gray-700">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-8 space-y-3">
                    <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                      View Detailed Report
                    </button>
                    <button 
                      onClick={handleReset}
                      className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Verify Another Product
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <QrCode className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">Ready to Verify</h3>
                  <p className="text-gray-600 mb-6">
                    Enter a Product ID or scan QR code to check product authenticity
                  </p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <p>✓ Check origin and farming practices</p>
                    <p>✓ Verify processing and handling</p>
                    <p>✓ Confirm transportation records</p>
                    <p>✓ Validate quality certifications</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
