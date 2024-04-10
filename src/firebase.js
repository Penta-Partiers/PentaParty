// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getEnvOrExit } from './config.js';
import { getFirestore } from 'firebase/firestore';

// Read env file for firebase credentials
const firebaseConfig = {
  apiKey: getEnvOrExit("REACT_APP_FIREBASE_API_KEY"),
  authDomain: getEnvOrExit("REACT_APP_FIREBASE_AUTH_DOMAIN"),
  projectId: getEnvOrExit("REACT_APP_FIREBASE_PROJECT_ID"),
  storageBucket: getEnvOrExit("REACT_APP_FIREBASE_STORAGE_BUCKEY"),
  messagingSenderId: getEnvOrExit("REACT_APP_FIREBASE_MESSAGING_SENDER_ID"),
  appId: getEnvOrExit("REACT_APP_FIREBASE_APP_ID"),
  measurementId: getEnvOrExit("REACT_APP_FIREBASE_MEASUREMENT_ID"),
};
 
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
export const googleProvider = new GoogleAuthProvider();
