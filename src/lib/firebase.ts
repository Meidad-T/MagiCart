
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyD4of7Cv83E0hLD7WmUw_bwN2fI2AXRZBU",
  authDomain: "magicart-d27b7.firebaseapp.com",
  projectId: "magicart-d27b7",
  storageBucket: "magicart-d27b7.firebasestorage.app",
  messagingSenderId: "731145279702",
  appId: "1:731145279702:web:4d4086d6955e31536c1177",
  measurementId: "G-7S0NKE4M24"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
