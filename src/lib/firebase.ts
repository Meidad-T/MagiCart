
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyD4of7Cv83E0hLD7WmUw_bwN2fI2AXRZBU",
  authDomain: "magicart-d27b7.firebaseapp.com",
  projectId: "magicart-d27b7",
  storageBucket: "magicart-d27b7.firebasestorage.app",
  messagingSenderId: "731145279702",
  appId: "1:731145279702:web:114fe3f6a22faaf26c1177",
  measurementId: "G-3E57NSC63N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
