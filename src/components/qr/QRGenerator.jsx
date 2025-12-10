
import React from 'react';
import { QrCode, Download, Printer, Copy, CheckCircle } from 'lucide-react';

const QRGenerator = ({ product }) => {
  const [copied, setCopied] = React.useState(false);

  // Generate verification URL
  const verificationUrl = `${window.location.origin}/verify/${product.id}`;
  
  // QR data
  const qrData = JSON.stringify({
    productId: product.id,
    productName: product.name,
    farmerName: product.farmerName,
    verificationUrl: verificationUrl,
    timestamp: new Date().toISOString()
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    // For now, just show message
    alert('QR download feature will be implemented');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <QrCode className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Product QR Code</h2>
        <p className="text-gray-600">Scan to verify authenticity</p>
      </div>

      {/* QR Code Display */}
      <div className="border-2 border-green-200 rounded-xl p-6 mb-6 flex justify-center">
        <div className="relative">
          {/* QR Placeholder - Replace with actual QR component */}
          <div className="w-48 h-48 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="grid grid-cols-10 gap-0.5">
                {Array.from({ length: 100 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="w-2 h-2 bg-green-700"
                    style={{ 
                      opacity: Math.random() > 0.3 ? 1 : 0,
                      borderRadius: i % 3 === 0 ? '50%' : '2px'
                    }}
                  />
                ))}
              </div>
              <div className="mt-4">
                <div className="w-8 h-8 bg-green-600 rounded-lg mx-auto"></div>
              </div>
            </div>
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-green-600 font-bold">AT</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="mb-6">
        <h3 className="font-bold text-gray-700 mb-3">Product Information</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Name:</span>
            <span className="font-medium">{product.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Product ID:</span>
            <span className="font-mono text-sm">{product.id.substring(0, 12)}...</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Farmer:</span>
            <span className="font-medium">{product.farmerName}</span>
          </div>
          {product.blockchainVerified && (
            <div className="flex justify-between">
              <span className="text-gray-600">Blockchain:</span>
              <span className="text-green-600 font-medium flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                Verified
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Verification URL */}
      <div className="mb-6">
        <h3 className="font-bold text-gray-700 mb-2">Verification URL</h3>
        <div className="flex">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-l-lg p-3 overflow-hidden">
            <p className="text-sm text-gray-600 truncate">{verificationUrl}</p>
          </div>
          <button
            onClick={handleCopy}
            className="bg-gray-200 hover:bg-gray-300 px-4 rounded-r-lg flex items-center"
          >
            {copied ? (
              <span className="text-green-600 text-sm">Copied!</span>
            ) : (
              <Copy className="w-4 h-4 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleDownload}
          className="flex items-center justify-center py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Download
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center justify-center py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Printer className="w-4 h-4 mr-2" />
          Print
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-700 mb-2">How to Use:</h4>
        <ol className="text-sm text-gray-600 space-y-1">
          <li>1. Print and attach QR to product packaging</li>
          <li>2. Consumers scan with smartphone camera</li>
          <li>3. View complete product journey instantly</li>
          <li>4. Verify authenticity on blockchain</li>
        </ol>
      </div>
    </div>
  );
};

// Default props for testing
QRGenerator.defaultProps = {
  product: {
    id: 'PROD-2024-001-ABC123',
    name: 'Organic Coffee Beans',
    farmerName: 'Abel Farm',
    blockchainVerified: true
  }
};

export default QRGenerator;
