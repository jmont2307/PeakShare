// Import the appropriate Firebase modules for React Native
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later
const firebaseConfig = {
  apiKey: "AIzaSyCXa2Tbu1a-5qB-PIuUUPNF_kPLCqWk7yA",
  authDomain: "peakshare-fe51b.firebaseapp.com",
  projectId: "peakshare-fe51b",
  storageBucket: "peakshare-fe51b.firebasestorage.app",
  messagingSenderId: "65188809207",
  appId: "1:65188809207:web:181339d40dcfe40a2946f2",
  measurementId: "G-SBJHV1DBXJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Development mode check
const isLocalhost = 
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1';

// Connect to emulators in development mode
if (process.env.NODE_ENV === 'development' || isLocalhost) {
  console.log('Using Firebase emulators for local development');
  
  // Connect to Auth emulator
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    console.log('Connected to Auth emulator');
  } catch (e) {
    console.warn('Could not connect to Auth emulator. Using production Auth.', e);
  }
  
  // Connect to Firestore emulator
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('Connected to Firestore emulator');
  } catch (e) {
    console.warn('Could not connect to Firestore emulator. Using production Firestore.', e);
  }
  
  // Connect to Storage emulator
  try {
    connectStorageEmulator(storage, 'localhost', 9199);
    console.log('Connected to Storage emulator');
  } catch (e) {
    console.warn('Could not connect to Storage emulator. Using production Storage.', e);
  }
} else {
  console.log('Using production Firebase services');
}

// Initialize Analytics conditionally (may not work in React Native without additional setup)
let analytics = null;
(async () => {
  if (await isSupported() && !isLocalhost) {
    analytics = getAnalytics(app);
  }
})();

export { auth, db, storage, analytics };
export default app;