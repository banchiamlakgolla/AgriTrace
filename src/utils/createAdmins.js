// Run this ONCE to create 3 admins
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAWEdWLCRHLs2PsMfpd893YuABFvBHSUpY",
  authDomain: "agritrace-71e26.firebaseapp.com",
  projectId: "agritrace-71e26",
  storageBucket: "agritrace-71e26.firebasestorage.app",
  messagingSenderId: "312934010372",
  appId: "1:312934010372:web:edfc0a8f28de250cdf6f51",
  measurementId: "G-7VJZRZL8MY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const createAdmins = async () => {
 
  const admins = [
    {
      uid: 'oF3LwHtYsVS5Go9P3r5K1wzrQYf2', // Get from Firebase Console
      email: 'abel1@gmail.com',
      fullName: 'Abel1',
      role: 'Admin 🛡️',
      adminLevel: 'super'
    },
    {
      uid: 'h6TInSZV7XR7YfsS9hOm4uVzjo62',
      email: 'abel2@gmail.com',
      fullName: 'Abel2',
      role: 'Admin 🛡️',
      adminLevel: 'standard'
    },
    {
      uid: 'qzgyPJGyvDNZ7tVEKEIreUvFaWp2',
      email: 'abel3@gmail.com',
      fullName: 'Abel3',
      role: 'Admin 🛡️',
      adminLevel: 'standard'
    }
  ];

  try {
    for (const admin of admins) {
      const adminData = {
        uid: admin.uid,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
        adminLevel: admin.adminLevel,
        createdAt: new Date().toISOString(),
        isActive: true,
        permissions: {
          canApproveFarmers: true,
          canApproveExporters: true,
          canValidateProducts: true,
          canViewAllData: true,
          canManageUsers: admin.adminLevel === 'super',
          canViewSystemLogs: true,
          canManageBlockchain: admin.adminLevel === 'super'
        },
        status: 'active'
      };

      await setDoc(doc(db, 'users', admin.uid), adminData);
      console.log(`✅ Admin created: ${admin.email}`);
    }
    
    console.log('🎉 All 3 admins created successfully!');
    process.exit(0); // Exit successfully
  } catch (error) {
    console.error('❌ Error creating admins:', error);
    process.exit(1); // Exit with error
  }
};

createAdmins();