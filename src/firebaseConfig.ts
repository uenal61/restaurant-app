import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // NEU

const firebaseConfig = {
  apiKey: "AIzaSyA8uFodUshXn3W-GeGVTrkXgnorLIOkLzI",
  authDomain: "fridaysdining-17d92.firebaseapp.com",
  projectId: "fridaysdining-17d92",
  storageBucket: "fridaysdining-17d92.firebasestorage.app",
  messagingSenderId: "839177231863",
  appId: "1:839177231863:web:eaa342d8a0ddb4d67162f2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // NEU
