import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Download, Printer, Copy, CheckCircle, XCircle } from 'lucide-react'; // ADD XCircle here

const QRGenerator = ({ product }) => {
  const [copied, setCopied] = useState(false);

  // Check if product exists FIRST
  if (!product) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md mx-auto text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">No Product Data</h2>
        <p className="text-gray-600">Product information is not available</p>
      </div>
    );
  }

  // Generate verification URL - use productId field if available
  const verificationUrl = `${window.location.origin}/verify/${product.productId || product.id}`;
  
  const handleCopy = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const svg = document.getElementById('qrcode-svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `qrcode-${product.productId || product.id}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
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

      {/* QR CODE */}
      <div className="border-2 border-green-200 rounded-xl p-6 mb-6 flex justify-center">
        <QRCodeSVG
          id="qrcode-svg"
          value={verificationUrl}
          size={200}
          level="H"
          includeMargin={true}
          bgColor="#ffffff"
          fgColor="#000000"
        />
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
            <span className="font-mono text-sm">{product.productId || product.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Farmer:</span>
            <span className="font-medium">{product.farmerName || product.farmerEmail || 'Unknown'}</span>
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
    productId: 'PROD-2024-001-ABC123',
    name: 'Organic Coffee Beans',
    farmerName: 'Abel Farm',
    farmerEmail: 'farmer@example.com',
    blockchainVerified: true
  }
};

export default QRGenerator;