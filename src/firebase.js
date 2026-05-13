import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
 
// ⚠️  REPLACE EVERYTHING BELOW WITH YOUR OWN FIREBASE CONFIG
// (See setup instructions in the README)
const firebaseConfig = {
  apiKey: "AIzaSyBW792j6jTNWV28NwCRL_hXE3R0VAd4GTw",
  authDomain: "home-schedule-8ffda.firebaseapp.com",
  databaseURL: "https://home-schedule-8ffda-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "home-schedule-8ffda",
  storageBucket: "home-schedule-8ffda.firebasestorage.app",
  messagingSenderId: "993160216866",
  appId: "1:993160216866:web:c0e1961f17dd8230d1657b"
};
 
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
