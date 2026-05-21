import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDKMZ0fk1JlemG2latkJqx5Y4y4OBqwv4U",
  authDomain: "toko-rizky-ef952.firebaseapp.com",
  projectId: "toko-rizky-ef952",
  storageBucket: "toko-rizky-ef952.firebasestorage.app",
  messagingSenderId: "446526359406",
  appId: "1:446526359406:web:1ba07e297203d5d4bb637f",
  measurementId: "G-B2103D3HJ8"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);