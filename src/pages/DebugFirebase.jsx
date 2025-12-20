// Create src/pages/DebugFirebase.jsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const DebugFirebase = () => {
  const [collections, setCollections] = useState({});
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      // Get current user
      const storedUser = JSON.parse(localStorage.getItem('agritrace_user') || '{}');
      setUserData(storedUser);
      
      // Check all collections
      const collectionsToCheck = ['shipments', 'users', 'products'];
      const data = {};
      
      for (const colName of collectionsToCheck) {
        try {
          const snapshot = await getDocs(collection(db, colName));
          data[colName] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
          data[colName] = { error: error.message };
        }
      }
      
      setCollections(data);
    };
    
    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Firebase Debug</h1>
      
      {/* Current User Info */}
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="font-bold mb-2">Current User (from localStorage):</h2>
        <pre>{JSON.stringify(userData, null, 2)}</pre>
      </div>
      
      {/* Collections Data */}
      {Object.entries(collections).map(([colName, data]) => (
        <div key={colName} className="mb-6 p-4 bg-white border rounded">
          <h2 className="font-bold mb-2">Collection: {colName}</h2>
          <pre className="text-sm overflow-auto max-h-60">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      ))}
    </div>
  );
};

export default DebugFirebase;