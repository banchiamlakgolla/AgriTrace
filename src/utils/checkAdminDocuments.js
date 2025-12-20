// src/utils/checkAdminDocuments.js
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

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

async function checkDocuments() {
  const admins = [
    { email: 'abel1@gmail.com', password: '12345678', uid: 'oF3LwHtYsVS5Go9P3r5K1wzrQYf2' },
    { email: 'abel2@gmail.com', password: '12345678', uid: 'h6TInSZV7XR7YfsS9hOm4uVzjo62' },
    { email: 'abel3@gmail.com', password: '12345678', uid: 'qzgyPJGyvDNZ7tVEKEIreUvFaWp2' }
  ];

  for (const admin of admins) {
    console.log(`\n📋 Checking: ${admin.email}`);
    console.log(`   UID: ${admin.uid}`);
    
    try {
      // 1. Check auth login
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        admin.email, 
        admin.password
      );
      console.log('   ✅ Auth login works');
      
      // 2. Check Firestore document
      const docRef = doc(db, 'users', admin.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        console.log('   ✅ Firestore document exists');
        console.log('   📄 Document data:', JSON.stringify(docSnap.data(), null, 2));
        
        // Check critical fields
        const data = docSnap.data();
        console.log('\n   🔍 Critical fields check:');
        console.log(`      - role: ${data.role || 'MISSING'}`);
        console.log(`      - email: ${data.email || 'MISSING'}`);
        console.log(`      - adminLevel: ${data.adminLevel || 'MISSING'}`);
        console.log(`      - isActive: ${data.isActive || 'MISSING'}`);
        
      } else {
        console.log('   ❌ Firestore document does NOT exist!');
        console.log('   Creating it now...');
        
        // Create the document
        const adminData = {
          uid: admin.uid,
          email: admin.email,
          fullName: admin.email.split('@')[0],
          role: 'Admin 🛡️',
          adminLevel: admin.email.includes('abel1') ? 'super' : 'standard',
          createdAt: new Date().toISOString(),
          isActive: true,
          permissions: {
            canApproveFarmers: true,
            canApproveExporters: true,
            canValidateProducts: true,
            canViewAllData: true,
            canManageUsers: admin.email.includes('abel1'),
            canViewSystemLogs: true,
            canManageBlockchain: admin.email.includes('abel1')
          },
          status: 'active'
        };
        
        await setDoc(docRef, adminData);
        console.log('   ✅ Created Firestore document');
      }
      
    } catch (error) {
      console.error(`   ❌ Error: ${error.code}`);
      console.error(`   Message: ${error.message}`);
    }
  }
}

checkDocuments().catch(console.error);