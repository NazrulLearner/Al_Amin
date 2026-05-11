import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';  // ✅ Add this

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAYagd9ZjrIxIWwMADGnd3tjWvQQeiLSzw",
  authDomain: "al-amin-somity-8dd36.firebaseapp.com",
  projectId: "al-amin-somity-8dd36",
  storageBucket: "al-amin-somity-8dd36.firebasestorage.app",
  messagingSenderId: "975543852418",
  appId: "1:975543852418:web:095f6e72b7409606dd839b",
  measurementId: "G-3BFMCSR5NF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const functions = getFunctions(app);  // ✅ Export functions instance

export default app;