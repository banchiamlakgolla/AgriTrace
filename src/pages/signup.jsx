// src/pages/signup.jsx
import React, { useState } from 'react';
import { User, Mail, MapPin, Lock, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from '../firebase';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: '',
    farmLocation: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ CORRECT ROLES (No Admin in public signup)
  const roles = [
    'Farmer 👨‍🌾',
    'Exporter 🚚',
    'Consumer 🛒'
  ];

  const roleDescriptions = {
    'Farmer 👨‍🌾': 'Register farm products & start traceability',
    'Exporter 🚚': 'Process, package & transport products',
    'Consumer 🛒': 'Verify products & view supply chain'
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }

    // Farm location only required for farmers
    if (formData.role.includes('Farmer') && !formData.farmLocation.trim()) {
      newErrors.farmLocation = 'Farm Location is required for farmers';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  // Function to create default data based on role
  const getDefaultDataForRole = (role) => {
    const roleLower = role.toLowerCase();
    const timestamp = new Date().toISOString();
    
    if (roleLower.includes('farmer')) {
      return {
        products: [
          {
            id: `product_${Date.now()}`,
            name: "Sample Product",
            productCode: "FARM-001",
            productType: "Coffee",
            harvestDate: new Date().toISOString().split('T')[0],
            location: formData.farmLocation || "Farm Location",
            status: "pending",
            createdAt: timestamp,
            description: "Your first farm product"
          }
        ],
        stats: {
          totalProducts: 1,
          verified: 0,
          blockchainVerified: 0,
          processing: 1,
          pendingVerification: 0
        }
      };
    }
    
    if (roleLower.includes('exporter')) {
      return {
        shipments: [
          {
            id: `shipment_${Date.now()}`,
            name: "First Export Shipment",
            shipmentCode: "EXP-001",
            destination: "To be determined",
            status: "pending",
            createdAt: timestamp
          }
        ],
        stats: {
          totalShipments: 1,
          pendingShipments: 1,
          inTransit: 0,
          delivered: 0
        }
      };
    }
    
    if (roleLower.includes('consumer')) {
      return {
        scans: [],
        stats: {
          totalScans: 0,
          verifiedProducts: 0
        }
      };
    }
    
    return {};
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 1. Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      
      const user = userCredential.user;
      
      // 2. Create user document in Firestore
      const userDoc = {
        uid: user.uid,
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role,
        farmLocation: formData.farmLocation || '',
        createdAt: new Date().toISOString(),
        isNewUser: true,
        ...getDefaultDataForRole(formData.role)
      };
      
      await setDoc(doc(db, "users", user.uid), userDoc);
      
      // 3. Save to localStorage for immediate access
      localStorage.setItem('agritrace_user', JSON.stringify({
        uid: user.uid,
        ...userDoc
      }));
      
      // 4. Redirect based on role
      const roleLower = formData.role.toLowerCase();
      if (roleLower.includes('farmer')) {
        navigate('/farmer-dashboard');
      } else if (roleLower.includes('exporter')) {
        navigate('/exporter-dashboard');
      } else if (roleLower.includes('consumer')) {
        navigate('/consumer-dashboard');
      } else {
        navigate('/dashboard'); // fallback
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      
      // User-friendly error messages
      if (error.code === 'auth/email-already-in-use') {
        alert('This email is already registered. Please login instead.');
      } else if (error.code === 'auth/weak-password') {
        alert('Password is too weak. Please use a stronger password.');
      } else if (error.code === 'auth/invalid-email') {
        alert('Invalid email address.');
      } else {
        alert('Registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link 
          to="/login" 
          className="inline-flex items-center text-green-700 hover:text-green-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </Link>

        {/* Registration Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Join AgriTrace
            </h1>
            <p className="text-gray-600">
              Choose your role in the supply chain
            </p>
          </div>

       

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 mr-2 text-green-600" />
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.fullName ? 'border-red-300' : 'border-gray-300'
                } focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors`}
                placeholder="John Mwamba"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 mr-2 text-green-600" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                } focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors`}
                placeholder="farmer@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 mr-2 text-green-600" />
                Your Role in Supply Chain
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.role ? 'border-red-300' : 'border-gray-300'
                } focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors appearance-none bg-white`}
              >
                <option value="">Select your role</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              
              {/* Show role description */}
              {formData.role && (
                <p className="mt-2 text-sm text-gray-600 p-2 bg-gray-50 rounded">
                  {roleDescriptions[formData.role] || 'Select a role to see description'}
                </p>
              )}
              
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
              )}
            </div>

            {/* Farm Location - Only for Farmers */}
            {formData.role.includes('Farmer') && (
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 mr-2 text-green-600" />
                  Farm Location
                </label>
                <input
                  type="text"
                  name="farmLocation"
                  value={formData.farmLocation}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.farmLocation ? 'border-red-300' : 'border-gray-300'
                  } focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors`}
                  placeholder="e.g., Gonder, Ethiopia"
                />
                {errors.farmLocation && (
                  <p className="mt-1 text-sm text-red-600">{errors.farmLocation}</p>
                )}
              </div>
            )}

            {/* Password */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Lock className="w-4 h-4 mr-2 text-green-600" />
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                } focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                } focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 mr-3 rounded text-green-600 focus:ring-green-500"
                required
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the{' '}
                <button 
                  type="button" 
                  onClick={() => window.open('/terms', '_blank')}
                  className="text-green-600 hover:text-green-700 font-medium bg-transparent border-none p-0 cursor-pointer"
                >
                  Terms & Conditions
                </button>{' '}
                and{' '}
                <button 
                  type="button" 
                  onClick={() => window.open('/privacy', '_blank')}
                  className="text-green-600 hover:text-green-700 font-medium bg-transparent border-none p-0 cursor-pointer"
                >
                  Privacy Policy
                </button>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                isSubmitting
                  ? 'bg-green-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating Account...
                </span>
              ) : (
                'Register Account'
              )}
            </button>
          </form>

          {/* Already have account */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-green-600 hover:text-green-700 font-medium">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>© 2024 AgriTrace. All rights reserved.</p>
          <p className="mt-1">Empowering farmers with transparent supply chains</p>
        </div>
      </div>
    </div>
  );
};

export default Signup;