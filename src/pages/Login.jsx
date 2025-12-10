// src/pages/Login.jsx
import React, { useState } from 'react';
import { Mail, Lock, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from '../firebase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // 1. Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // 2. Get user data from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (!userDoc.exists()) {
        throw new Error("User data not found");
      }
      
      const userData = userDoc.data();
      
      // 3. Update last login time
      await updateDoc(doc(db, "users", user.uid), {
        lastLogin: new Date().toISOString(),
        isNewUser: false
      });
      
      // 4. Save to localStorage
      localStorage.setItem('agritrace_user', JSON.stringify({
        uid: user.uid,
        ...userData,
        lastLogin: new Date().toISOString(),
        isNewUser: false
      }));
      
      // 5. Redirect based on role (with emoji support)
      const userRole = userData.role || '';
      
      if (userRole.includes('Farmer') || userRole.includes('farmer') || userRole.includes('👨‍🌾')) {
        navigate('/farmer-dashboard');
      } else if (userRole.includes('Exporter') || userRole.includes('exporter') || userRole.includes('🚚')) {
        navigate('/exporter-dashboard');
      } else if (userRole.includes('Consumer') || userRole.includes('consumer') || userRole.includes('🛒')) {
        navigate('/consumer-dashboard');
      } else if (userRole.includes('Admin') || userRole.includes('admin') || userRole.includes('🛡️')) {
        // Admin login (only if manually created)
        navigate('/admin-dashboard');
      } else {
        // Default fallback
        navigate('/farmer-dashboard');
      }
      
    } catch (error) {
      console.error('Login error:', error);
      
      // User-friendly error messages
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        alert('Invalid email or password.');
      } else if (error.code === 'auth/too-many-requests') {
        alert('Too many failed attempts. Please try again later.');
      } else if (error.code === 'auth/user-disabled') {
        alert('This account has been disabled.');
      } else if (error.code === 'auth/invalid-email') {
        alert('Please enter a valid email address.');
      } else if (error.code === 'auth/network-request-failed') {
        alert('Network error. Please check your internet connection.');
      } else {
        alert('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-6">
          <div className="inline-block p-4 bg-green-600 rounded-2xl mb-4">
            <span className="text-3xl text-white">🌾</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">AgriTrace</h1>
          <p className="text-gray-600 mt-1">Farm-to-Market Transparency</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to continue tracking your supply chain</p>
          </div>

        

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 mr-2 text-green-600" />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
   
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Lock className="w-4 h-4 mr-2 text-green-600" />
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => alert('Password reset feature coming soon!')}
                  className="text-sm text-green-600 hover:text-green-700"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors flex items-center justify-center ${
                isLoading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In to AgriTrace
                </>
              )}
            </button>
          </form>


          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-600">
              New to AgriTrace?{' '}
              <Link to="/signup" className="text-green-600 hover:text-green-700 font-medium">
                Create an Account
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

export default Login;