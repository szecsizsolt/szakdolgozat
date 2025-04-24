import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDP8RTvhLOvtV4Qtqbc7vdtcA3M3_CUtmE",
  authDomain: "online-bookstore-6341d.firebaseapp.com",
  projectId: "online-bookstore-6341d",
  storageBucket: "online-bookstore-6341d.appspot.com",
  messagingSenderId: "180606883041",
  appId: "1:180606883041:web:be71ad2244cb688b2c6648"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
