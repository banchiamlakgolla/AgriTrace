// src/utils/createAuthAdmins.js
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

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

const createAuthAccounts = async () => {
  const admins = [
    { email: 'abel1@gmail.com', password: '12345678' },
    { email: 'abel2@gmail.com', password: '12345678' },
    { email: 'abel3@gmail.com', password: '12345678' }
  ];

  try {
    for (const admin of admins) {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        admin.email, 
        admin.password
      );
      
      console.log(`✅ Auth account created for: ${admin.email}`);
      console.log(`   UID: ${userCredential.user.uid}`);
    }
    
    console.log('🎉 All auth accounts created!');
    console.log('⚠️ IMPORTANT: Copy the UIDs above and update your createAdmins.js script');
    
  } catch (error) {
    console.error('❌ Error:', error.code, error.message);
  }
};

createAuthAccounts();