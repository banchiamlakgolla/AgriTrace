// src/utils/recreateAdminDocs.js
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAWEdWLCRHLs2PsMfpd893YuABFvBHSUpY",
  authDomain: "agritrace-71e26.firebaseapp.com",
  projectId: "agritrace-71e26",
  storageBucket: "agritrace-71e26.appspot.com",
  messagingSenderId: "312934010372",
  appId: "1:312934010372:web:edfc0a8f28de250cdf6f51",
  measurementId: "G-7VJZRZL8MY"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function recreateDocuments() {
  const admins = [
    { 
      email: 'abel1@gmail.com', 
      password: '12345678', 
      uid: 'oF3LwHtYsVS5Go9P3r5K1wzrQYf2',
      fullName: 'Abel1',
      level: 'super'
    },
    { 
      email: 'abel2@gmail.com', 
      password: '12345678', 
      uid: 'h6TInSZV7XR7YfsS9hOm4uVzjo62',
      fullName: 'Abel2', 
      level: 'standard'
    },
    { 
      email: 'abel3@gmail.com', 
      password: '12345678', 
      uid: 'qzgyPJGyvDNZ7tVEKEIreUvFaWp2',
      fullName: 'Abel3',
      level: 'standard'
    }
  ];

  for (const admin of admins) {
    console.log(`\n🔧 Recreating document for: ${admin.email}`);
    
    try {
      // Verify auth works
      await signInWithEmailAndPassword(auth, admin.email, admin.password);
      console.log('   ✅ Auth verified');
      
      // Create/replace document
      const adminData = {
        uid: admin.uid,
        email: admin.email,
        fullName: admin.fullName,
        role: 'Admin 🛡️',
        adminLevel: admin.level,
        createdAt: new Date().toISOString(),
        isActive: true,
        permissions: {
          canApproveFarmers: true,
          canApproveExporters: true,
          canValidateProducts: true,
          canViewAllData: true,
          canManageUsers: admin.level === 'super',
          canViewSystemLogs: true,
          canManageBlockchain: admin.level === 'super'
        },
        status: 'active'
      };
      
      await setDoc(doc(db, 'users', admin.uid), adminData);
      console.log('   ✅ Document created with correct structure');
      
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n🎉 All documents recreated!');
  console.log('\n📋 Test login now:');
  console.log('1. Go to http://localhost:3000/login');
  console.log('2. Use email: abel1@gmail.com');
  console.log('3. Password: 12345678');
}

recreateDocuments().catch(console.error);