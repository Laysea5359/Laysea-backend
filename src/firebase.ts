import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDKKn2j9BLJPIcsGroc_7ZvRMqz5ylgBAQ",
  authDomain: "laysea-entertain-backend.firebaseapp.com",
  projectId: "laysea-entertain-backend",
  storageBucket: "laysea-entertain-backend.firebasestorage.app",
  messagingSenderId: "200885089744",
  appId: "1:200885089744:web:3a8f82bf67f713ac78b5d5",
  measurementId: "G-NSWXYDHPEJ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;