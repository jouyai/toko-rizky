import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC0t5xX22E0EkeqQSHiMLfWpsUy34VfKbg",
  authDomain: "ecom-dang.firebaseapp.com",
  projectId: "ecom-dang",
  storageBucket: "ecom-dang.firebasestorage.app",
  messagingSenderId: "624249605908",
  appId: "1:624249605908:web:038ac2c4d704380769fc01",
  measurementId: "G-MQEWJVG62W"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);