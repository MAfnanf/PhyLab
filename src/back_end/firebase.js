import { initializeApp } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCyukaoHfk85mGr1MdQiQsmrkka_t_Jcho",
  authDomain: "phylab-backend.firebaseapp.com",
  projectId: "phylab-backend",
  storageBucket: "phylab-backend.firebasestorage.app",
  messagingSenderId: "601248646261",
  appId: "1:601248646261:web:6db5211edf1271ad10e43c",
  measurementId: "G-FL02CB47WM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log("Firebase app initialized:", app);  // Add this line to check if Firebase is initialized correctly.

export const auth = getAuth(app);
export const db = getFirestore(app);
