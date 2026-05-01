// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "aiinterview-666ce.firebaseapp.com",
  projectId: "aiinterview-666ce",
  storageBucket: "aiinterview-666ce.firebasestorage.app",
  messagingSenderId: "116752294610",
  appId: "1:116752294610:web:576b4f21fc3cfb0041830b",
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
