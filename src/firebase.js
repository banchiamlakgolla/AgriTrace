// src/firebase.js - WITH EMULATOR SUPPORT
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAWEdWLCRHLs2PsMfpd893YuABFvBHSUpY",
  authDomain: "agritrace-71e26.firebaseapp.com",
  projectId: "agritrace-71e26",
  storageBucket: "agritrace-71e26.appspot.com",
  messagingSenderId: "312934010372",
  appId: "1:312934010372:web:edfc0a8f28de250cdf6f51",
  measurementId: "G-7VJZRZL8MY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);


// 🔧 ADD THESE LINES - Connect to Authentication Emulator
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
 // connectAuthEmulator(auth, "http://127.0.0.1:9099");
  console.log("🔐 Connected to Firebase Auth Emulator");
  connectStorageEmulator(storage, 'localhost', 9199);
  console.log("🔥 Connected to Firebase Storage Emulator");
}
// Connect to Storage Emulator when running locally
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  connectStorageEmulator(storage, 'localhost', 9199);
  console.log("🔥 Connected to Firebase Storage Emulator");
}

export { auth, db, storage, firebaseConfig };
export default app;