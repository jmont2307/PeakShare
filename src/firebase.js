// Import the appropriate Firebase modules for React Native
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later
// Replace with your actual Firebase config when deploying
const firebaseConfig = {
  apiKey: "AIzaSyBPeakShareAPIKeyPlaceholder",
  authDomain: "peakshare-app.firebaseapp.com",
  projectId: "peakshare-app",
  storageBucket: "peakshare-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
export default app;