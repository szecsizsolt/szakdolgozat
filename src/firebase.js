// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Firebase konfiguráció
const firebaseConfig = {
  apiKey: "AIzaSyA0ltAS6Y-33u5bgyOUcRPG0n28QkjeG-w",
  authDomain: "online-bookstore-1dd4c.firebaseapp.com",
  projectId: "online-bookstore-1dd4c",
  storageBucket: "online-bookstore-1dd4c.firebasestorage.app",
  messagingSenderId: "91349897021",
  appId: "1:91349897021:web:b2e4bdf0809bd403f5ff54",
  measurementId: "G-8R24ZHZ8FH"
};

// Inicializálás
const app = initializeApp(firebaseConfig);

// ✅ Ezeket exportáld, hogy máshol használhasd
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
