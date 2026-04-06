
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA-CC1rbMiUzhaGXclen8nhvd0A5IGdVp0",
  authDomain: "noon-to-moon.firebaseapp.com",
  databaseURL: "https://noon-to-moon-default-rtdb.firebaseio.com",
  projectId: "noon-to-moon",
  storageBucket: "noon-to-moon.firebasestorage.app",
  messagingSenderId: "463718515822",
  appId: "1:463718515822:web:76e4dba2c2ba287b8c927f",
  measurementId: "G-S8QF41YC97"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export default app;
