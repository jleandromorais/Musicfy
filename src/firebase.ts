// firebase.ts (configuração crítica)
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAF2JDsunU6CEEmEo0E5Iy7udkLPzJ0AJE",
  authDomain: "phonemodel-d22ae.firebaseapp.com",
  projectId: "phonemodel-d22ae",
  storageBucket: "phonemodel-d22ae.appspot.com", // Verifique esse valor!
  messagingSenderId: "1016806348368",
  appId: "1:1016806348368:web:1fae2130219a5fa8bc6355",
  measurementId: "G-HZFK98CNQQ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);