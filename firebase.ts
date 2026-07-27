
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCxT32NHzwYLhcwm53b4g2wudkTrLo6uZE",
  authDomain: "masalabox-8c4e1.firebaseapp.com",
  databaseURL: "https://masalabox-8c4e1-default-rtdb.firebaseio.com",
  projectId: "masalabox-8c4e1",
  storageBucket: "masalabox-8c4e1.firebasestorage.app",
  messagingSenderId: "62100586695",
  appId: "1:62100586695:web:2bc0d1814107c03df67ee2",
  measurementId: "G-QTXG8R88MF"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
export default app;
