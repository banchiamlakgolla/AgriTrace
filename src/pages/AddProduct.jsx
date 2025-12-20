// src/pages/AddProduct.jsx - NON-REQUIRED FIELDS VERSION
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import { v4 as uuidv4 } from 'uuid';
import { 
  Upload, Camera, Package, MapPin, Calendar, Hash, 
  FileText, Scale, Award, AlertCircle, CheckCircle, 
  ArrowLeft, Save, X, ChevronRight, ChevronLeft
} from 'lucide-react';

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  
  const [product, setProduct] = useState({
    // Basic Info - Only name is required
    name: '',
    type: '',
    harvestDate: new Date().toISOString().split('T')[0],
    location: '',
    batchNumber: `BATCH-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
    
    // Product Details - None required
    description: '',
    weight: '',
    unit: 'kg',
    qualityGrade: 'A',
    pricePerKg: '',
    
    // Certifications
    certifications: [],
    
    // Processing Info
    processingMethod: '',
    dryingMethod: '',
    storageConditions: '',
    
    // Images - NOT required
    images: [],
    imageUrls: [],
    
    // Blockchain
    recordOnBlockchain: false
  });

  useEffect(() => {
    console.log('🔄 AddProduct mounted');
    console.log('👤 Current user:', auth.currentUser);
  }, []);

  // Validate current step - MINIMAL VALIDATION
  const validateStep = (stepNumber) => {
    const newErrors = {};
    
    switch (stepNumber) {
      case 1:
        // Only require product name
        if (!product.name.trim()) newErrors.name = 'Product name is required';
        break;
      
      case 2:
        // No requirements for product details
        break;
      
      case 3:
        // Images are optional
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Handle certification selection
  const handleCertificationChange = (cert) => {
    setProduct(prev => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter(c => c !== cert)
        : [...prev.certifications, cert]
    }));
  };

  // Image upload - OPTIONAL
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    setUploadProgress(10);
    
    try {
      const uploadedUrls = [];
      
      for (const file of files) {
        try {
          // Validate file size (max 5MB)
          if (file.size > 5 * 1024 * 1024) {
            alert(`File ${file.name} is too large (max 5MB)`);
            continue;
          }
          
          // Create unique filename
          const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
          
          // Create storage reference
          const storageRef = ref(storage, `products/${fileName}`);
          console.log('📤 Uploading to Firebase Storage:', fileName);
          
          // Upload the file
          const snapshot = await uploadBytes(storageRef, file);
          console.log('✅ Upload successful');
          
          // Get download URL
          const downloadURL = await getDownloadURL(snapshot.ref);
          console.log('🔗 Firebase Storage URL:', downloadURL);
          
          uploadedUrls.push(downloadURL);
          
          // Update progress
          setUploadProgress(prev => Math.min(prev + 90 / files.length, 100));
          
        } catch (error) {
          console.error('❌ Firebase upload error:', error);
          console.error('Error code:', error.code);
          console.error('Error message:', error.message);
          
          // Silently fail for optional images
          console.log(`Skipping image ${file.name} due to error`);
        }
      }
      
      if (uploadedUrls.length > 0) {
        // Update product state with Firebase URLs
        setProduct(prev => ({
          ...prev,
          images: [...prev.images, ...files],
          imageUrls: [...prev.imageUrls, ...uploadedUrls]
        }));
        
        console.log(`✅ Successfully uploaded ${uploadedUrls.length} images`);
      }
      
    } catch (error) {
      console.error('❌ General upload error:', error);
    } finally {
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  // Remove image
  const removeImage = (index) => {
    setProduct(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imageUrls: prev.imageUrls.filter((_, i) => i !== index)
    }));
  };

  // Navigate to next step
  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  // Navigate to previous step
  const prevStep = () => {
    setStep(step - 1);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate final step (only checks product name)
    if (!validateStep(step)) {
      return;
    }

    setLoading(true);

    try {
      // Get current user
      const user = auth.currentUser;
      if (!user) {
        alert('You must be logged in to add products');
        navigate('/login');
        return;
      }

      // Generate product ID
      const productId = `PROD-${new Date().getFullYear()}-${uuidv4().split('-')[0].toUpperCase()}`;
      
      // Generate QR code URL
      const qrUrl = `${window.location.origin}/verify/${productId}`;
      
      // Calculate estimated value (optional)
      const calculateValue = () => {
        const weightNum = parseFloat(product.weight) || 0;
        const priceNum = parseFloat(product.pricePerKg) || 0;
        return weightNum * priceNum;
      };

      // Get season from harvest date (optional)
      const getSeason = (dateStr) => {
        if (!dateStr) return 'Unknown';
        const date = new Date(dateStr);
        const month = date.getMonth() + 1;
        if (month >= 3 && month <= 5) return 'Spring';
        if (month >= 6 && month <= 8) return 'Summer';
        if (month >= 9 && month <= 11) return 'Fall';
        return 'Winter';
      };

      // Create product data - ALL FIELDS OPTIONAL except name
      const productData = {
        // Basic Info
        productId,
        name: product.name,
        type: product.type || 'Not specified',
        harvestDate: product.harvestDate || null,
        location: product.location || 'Not specified',
        batchNumber: product.batchNumber,
        
        // Product Details
        description: product.description || 'No description',
        weight: parseFloat(product.weight) || 0,
        unit: product.unit,
        qualityGrade: product.qualityGrade || 'Not graded',
        pricePerKg: product.pricePerKg ? parseFloat(product.pricePerKg) : null,
        estimatedValue: calculateValue(),
        
        // Processing Info
        processingMethod: product.processingMethod || 'Not specified',
        dryingMethod: product.dryingMethod || 'Not specified',
        storageConditions: product.storageConditions || 'Standard storage',
        
        // Certifications
        certifications: product.certifications || [],
        
        // Images - OPTIONAL
        images: product.imageUrls || [],
        mainImage: product.imageUrls[0] || null,
        
        // QR & Verification
        qrUrl,
        verificationUrl: `/verify/${productId}`,
        
        // Farmer Info
        farmerId: user.uid,
        farmerName: user.displayName || user.email,
        farmerEmail: user.email,
        farmerUid: user.uid,
        
        // Status & Timestamps
        status: 'pending',
        season: getSeason(product.harvestDate),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // For exporter linking
        availableForShipment: false,
        shipmentStatus: 'not_shipped',
        
        // For admin validation
        validated: false,
        validatedBy: null,
        validatedAt: null,
        
        // Blockchain
        onBlockchain: product.recordOnBlockchain || false,
        blockchainHash: null,
        blockchainStatus: 'not_recorded'
      };

      console.log('📝 Saving product to Firestore...', productData);
      
      // Save to Firestore
      const docRef = await addDoc(collection(db, 'products'), productData);
      
      console.log('✅ Product saved with ID:', docRef.id, 'Product ID:', productId);
      
      // Show success message
      alert(`✅ Product "${product.name}" created successfully!\n\nProduct ID: ${productId}\n\nYou can now view and share the QR code.`);
      
      // Navigate to product QR page
      navigate(`/product/${productId}/qr`);
      
      // Reset form
      setProduct({
        name: '',
        type: '',
        harvestDate: new Date().toISOString().split('T')[0],
        location: '',
        batchNumber: `BATCH-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
        description: '',
        weight: '',
        unit: 'kg',
        qualityGrade: 'A',
        pricePerKg: '',
        certifications: [],
        processingMethod: '',
        dryingMethod: '',
        storageConditions: '',
        images: [],
        imageUrls: [],
        recordOnBlockchain: false
      });
      setStep(1);
      setErrors({});

    } catch (error) {
      console.error('❌ Error adding product:', error);
      alert(`❌ Failed to add product: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Product types for dropdown
  const productTypes = [
    '', // Empty option first
    'Coffee', 'Tea', 'Cocoa', 'Spices', 'Grains', 
    'Fruits', 'Vegetables', 'Honey', 'Nuts', 'Herbs',
    'Dairy', 'Meat', 'Poultry', 'Fish', 'Other'
  ];

  // Certification options
  const certificationOptions = [
    'Organic', 'Fair Trade', 'Rainforest Alliance', 
    'UTZ Certified', 'Direct Trade', 'Non-GMO',
    'Kosher', 'Halal', 'Gluten-Free', 'Vegan'
  ];

  // Quality grades
  const qualityGrades = [
    { value: '', label: 'Not specified' },
    { value: 'AAA', label: 'AAA - Premium Quality' },
    { value: 'AA', label: 'AA - High Quality' },
    { value: 'A', label: 'A - Standard Quality' },
    { value: 'B', label: 'B - Commercial Grade' },
    { value: 'C', label: 'C - Bulk Grade' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate('/farmer-dashboard')}
            className="flex items-center text-green-600 hover:text-green-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
          
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <Package className="w-8 h-8 mr-3 text-green-600" />
            Add New Farm Product
          </h1>
          <p className="text-gray-600 mt-2">
            Register your farm product - Only product name is required
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {['Basic Info', 'Product Details', 'Images', 'Review'].map((label, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  step > index + 1 ? 'bg-green-600 text-white' :
                  step === index + 1 ? 'bg-green-600 text-white' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  {step > index + 1 ? <CheckCircle className="w-5 h-5" /> : index + 1}
                </div>
                <span className={`text-sm ${
                  step >= index + 1 ? 'text-green-700 font-medium' : 'text-gray-500'
                }`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-green-600 rounded-full transition-all duration-300"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Basic Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Name - ONLY REQUIRED FIELD */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Package className="w-4 h-4 mr-2 text-green-600" />
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={product.name}
                      onChange={handleChange}
                      placeholder="e.g., Organic Arabica Coffee Beans"
                      className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                    <p className="text-gray-500 text-xs mt-1">Required field</p>
                  </div>

                  {/* Product Type - OPTIONAL */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Package className="w-4 h-4 mr-2 text-green-600" />
                      Product Type (Optional)
                    </label>
                    <select
                      name="type"
                      value={product.type}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      {productTypes.map(type => (
                        <option key={type} value={type}>{type || 'Select product type (optional)'}</option>
                      ))}
                    </select>
                  </div>

                  {/* Harvest Date - OPTIONAL */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 mr-2 text-green-600" />
                      Harvest Date (Optional)
                    </label>
                    <input
                      type="date"
                      name="harvestDate"
                      value={product.harvestDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {/* Farm Location - OPTIONAL */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 mr-2 text-green-600" />
                      Farm Location (Optional)
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={product.location}
                      onChange={handleChange}
                      placeholder="e.g., Sidama Zone, Ethiopia (optional)"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {/* Batch Number - AUTO GENERATED */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Hash className="w-4 h-4 mr-2 text-green-600" />
                      Batch Number (Auto-generated)
                    </label>
                    <input
                      type="text"
                      name="batchNumber"
                      value={product.batchNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Product Details - ALL OPTIONAL */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Product Details (All Optional)</h2>
                
                {/* Description - OPTIONAL */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4 mr-2 text-green-600" />
                    Description (Optional)
                  </label>
                  <textarea
                    name="description"
                    value={product.description}
                    onChange={handleChange}
                    placeholder="Describe your product (optional)"
                    rows="3"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Weight - OPTIONAL */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Scale className="w-4 h-4 mr-2 text-green-600" />
                      Weight (Optional)
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        name="weight"
                        value={product.weight}
                        onChange={handleChange}
                        placeholder="e.g., 50 (optional)"
                        min="0"
                        step="0.1"
                        className="flex-1 px-4 py-3 rounded-l-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <select
                        name="unit"
                        value={product.unit}
                        onChange={handleChange}
                        className="px-4 py-3 rounded-r-lg border border-l-0 border-gray-300 bg-gray-50"
                      >
                        <option value="kg">kg</option>
                        <option value="lb">lb</option>
                        <option value="g">g</option>
                        <option value="pieces">pieces</option>
                      </select>
                    </div>
                  </div>

                  {/* Price per kg - OPTIONAL */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <span className="mr-2">💰</span>
                      Price per kg (Optional)
                    </label>
                    <input
                      type="number"
                      name="pricePerKg"
                      value={product.pricePerKg}
                      onChange={handleChange}
                      placeholder="e.g., 8.50 (optional)"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {/* Quality Grade - OPTIONAL */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Award className="w-4 h-4 mr-2 text-green-600" />
                      Quality Grade (Optional)
                    </label>
                    <select
                      name="qualityGrade"
                      value={product.qualityGrade}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      {qualityGrades.map(grade => (
                        <option key={grade.value} value={grade.value}>
                          {grade.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Processing Info - OPTIONAL */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Processing Method (Optional)
                    </label>
                    <input
                      type="text"
                      name="processingMethod"
                      value={product.processingMethod}
                      onChange={handleChange}
                      placeholder="e.g., Washed (optional)"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Drying Method (Optional)
                    </label>
                    <input
                      type="text"
                      name="dryingMethod"
                      value={product.dryingMethod}
                      onChange={handleChange}
                      placeholder="e.g., Sun Dried (optional)"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Storage Conditions (Optional)
                    </label>
                    <input
                      type="text"
                      name="storageConditions"
                      value={product.storageConditions}
                      onChange={handleChange}
                      placeholder="e.g., Cool, Dry Place (optional)"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Certifications - OPTIONAL */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Award className="w-4 h-4 mr-2 text-green-600" />
                    Certifications (Optional - Select any that apply)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {certificationOptions.map(cert => (
                      <label key={cert} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-green-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={product.certifications.includes(cert)}
                          onChange={() => handleCertificationChange(cert)}
                          className="rounded text-green-600"
                        />
                        <span className="text-sm text-gray-700">{cert}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Images - OPTIONAL */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Product Images (Optional)</h2>
                
                {/* Image Upload - OPTIONAL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Product Images (Optional)
                  </label>
                  <div className="border-2 border-dashed border-green-300 bg-green-50 rounded-xl p-8 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="imageUpload"
                    />
                    <label htmlFor="imageUpload" className="cursor-pointer block">
                      {uploadProgress > 0 ? (
                        <div>
                          <div className="w-24 h-24 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                          <p className="text-green-600">Uploading... {uploadProgress}%</p>
                        </div>
                      ) : product.imageUrls.length > 0 ? (
                        <div>
                          <p className="text-green-600">✅ {product.imageUrls.length} images uploaded (optional)</p>
                          <p className="text-sm text-gray-500 mt-2">Click to add more images (optional)</p>
                        </div>
                      ) : (
                        <>
                          <Camera className="w-16 h-16 text-green-400 mx-auto mb-4" />
                          <p className="text-lg font-medium text-gray-700 mb-2">
                            Click to upload images (optional)
                          </p>
                          <p className="text-gray-500">
                            Upload photos of your product (optional)
                          </p>
                          <p className="text-sm text-gray-400 mt-2">
                            Supports JPG, PNG, WebP (max 5MB each) - Optional
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                  <p className="text-gray-500 text-sm mt-2">Images are optional. You can skip this step.</p>
                </div>

                {/* Image Preview */}
                {product.imageUrls.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-4">
                      Uploaded Images ({product.imageUrls.length}) - Optional
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {product.imageUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Product ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          {index === 0 && (
                            <span className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                              Main Image
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Review & Submit</h2>
                
                <div className="bg-green-50 p-4 rounded-lg mb-6">
                  <p className="text-green-700">
                    ✅ <strong>Only product name is required.</strong> All other fields are optional.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Information */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-gray-700">Basic Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{product.name || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">{product.type || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Harvest Date:</span>
                        <span className="font-medium">{product.harvestDate || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium">{product.location || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Specifications */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-gray-700">Specifications</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Weight:</span>
                        <span className="font-medium">{product.weight ? `${product.weight} ${product.unit}` : 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quality Grade:</span>
                        <span className="font-medium">{product.qualityGrade || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Processing:</span>
                        <span className="font-medium">{product.processingMethod || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Images:</span>
                        <span className="font-medium">{product.imageUrls.length} (optional)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Certifications */}
                {product.certifications.length > 0 && (
                  <div>
                    <h3 className="font-bold text-gray-700 mb-2">Certifications (Optional)</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.certifications.map(cert => (
                        <span key={cert} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Image Preview */}
                {product.imageUrls.length > 0 && (
                  <div>
                    <h3 className="font-bold text-gray-700 mb-2">Product Images (Optional)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {product.imageUrls.slice(0, 4).map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 mt-6 border-t border-gray-200">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  Previous
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/farmer-dashboard')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-600 flex items-center"
                >
                  {step === 1 && product.name ? 'Continue' : 'Skip to Next Step'}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !product.name.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-600 disabled:opacity-50 flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating Product...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Create Product
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;