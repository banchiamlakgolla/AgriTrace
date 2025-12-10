// FIXED VERSION - Copy and replace your entire AddProduct.jsx imports:
import React, { useState } from 'react'; // ADD React back
import { db, auth } from '../firebase'; // Remove 'storage' from here
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';

// Initialize storage
const storage = getStorage();
const AddProduct = () => {
  const [product, setProduct] = useState({
    name: '',
    type: '',
    harvestDate: '',
    location: '',
    batchNumber: '',
    images: []
  });
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  // Handle form input changes
  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

const handleImageUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Create preview
  const reader = new FileReader();
  reader.onloadend = () => {
    setPreview(reader.result);
  };
  reader.readAsDataURL(file);

  // Store the file object, not URL yet
  setProduct({ ...product, images: [file] });
};

  // Handle form submission
const handleSubmit = async (e) => {
  e.preventDefault();
  setUploading(true);

  try {
    console.log("Starting product submission...");
    
    // Check if user is logged in
    if (!auth.currentUser) {
      alert("You must be logged in!");
      return;
    }

    // Check if image is selected
    if (product.images.length === 0) {
      alert("Please select an image!");
      return;
    }

    // 1. Upload image to Firebase Storage
    console.log("Uploading image to Firebase Storage...");
    const file = product.images[0];
    const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
    
    await uploadBytes(storageRef, file);
    const imageUrl = await getDownloadURL(storageRef);
    console.log("Image uploaded, URL:", imageUrl);

    // 2. Save to Firestore
    console.log("Saving to Firestore...");
    const docRef = await addDoc(collection(db, 'products'), {
      name: product.name,
      type: product.type,
      harvestDate: product.harvestDate,
      location: product.location,
      batchNumber: product.batchNumber,
      imageUrl: imageUrl, // Store the URL
      farmerId: auth.currentUser.uid,
      farmerEmail: auth.currentUser.email,
      createdAt: new Date(),
      status: 'pending',
      blockchain: {
        minted: false,
        txHash: null,
        ipfsHash: null
      }
    });

    console.log("Product saved with ID:", docRef.id);
    alert('✅ Product added successfully!');
    
    // Reset form
    setProduct({
      name: '',
      type: '',
      harvestDate: '',
      location: '',
      batchNumber: '',
      images: []
    });
    setPreview(null);

  } catch (error) {
    console.error('❌ Error adding product:', error);
    console.error('Error details:', error.message, error.code);
    alert(`Failed to add product: ${error.message}`);
  } finally {
    setUploading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-green-800 mb-8">
          Add New Product
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    value={product.name}
                    onChange={handleChange}
                    placeholder="e.g., Organic Coffee Beans"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Product Type</label>
                  <select
                    name="type"
                    value={product.type}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg"
                    required
                  >
                    <option value="">Select product type</option>
                    <option value="Coffee">Coffee</option>
                    <option value="Tea">Tea</option>
                    <option value="Cocoa">Cocoa</option>
                    <option value="Spices">Spices</option>
                    <option value="Grains">Grains</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Vegetables">Vegetables</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Harvest Date</label>
                  <input
                    type="date"
                    name="harvestDate"
                    value={product.harvestDate}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Farm Location</label>
                  <input
                    type="text"
                    name="location"
                    value={product.location}
                    onChange={handleChange}
                    placeholder="e.g., Gonder, Ethiopia"
                    className="w-full p-3 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Batch Number</label>
                  <input
                    type="text"
                    name="batchNumber"
                    value={product.batchNumber}
                    onChange={handleChange}
                    placeholder="# e.g., ETH-2024-001"
                    className="w-full p-3 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Upload Images</label>
                  <div className="border-2 border-dashed border-green-300 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="imageUpload"
                    />
                    <label htmlFor="imageUpload" className="cursor-pointer">
                      <div className="text-green-600 mb-2">
                        📸 Click to upload product images
                      </div>
                      <p className="text-sm text-gray-500">
                        Images will be stored on IPFS
                      </p>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
                >
                  {uploading ? 'Submitting...' : 'Submit Product'}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Preview */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-green-800 mb-4">Product Preview</h2>
            
            {preview ? (
              <div className="mb-4">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <p className="text-sm text-gray-500 mt-2">
                  This image will be uploaded to IPFS for permanent, decentralized storage.
                </p>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                No image selected
              </div>
            )}

            <div className="mt-8">
              <h3 className="font-bold text-green-700 mb-2">Blockchain Info</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  CIP-68 NFT will be minted on Cardano Testnet
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Immutable certificate of authenticity
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  QR code for instant verification
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Full supply chain transparency
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;