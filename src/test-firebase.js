// Create a file: src/test-firebase.js
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

async function testFirebase() {
  console.log("🧪 Testing Firebase connection...");
  
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    console.log("✅ Connected! Users:", snapshot.size);
    return true;
  } catch (error) {
    console.error("❌ Failed:", error.message);
    return false;
  }
}

// Run test
testFirebase();