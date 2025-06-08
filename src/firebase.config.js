// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAF2JDsunU6CEEmEo0E5Iy7udkLPzJ0AJE",
  authDomain: "phonemodel-d22ae.firebaseapp.com",
  projectId: "phonemodel-d22ae",
  storageBucket: "phonemodel-d22ae.firebasestorage.app",
  messagingSenderId: "1016806348368",
  appId: "1:1016806348368:web:1fae2130219a5fa8bc6355",
  measurementId: "G-HZFK98CNQQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export { auth };