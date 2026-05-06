
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: "AIzaSyDI5ujaNYPB0KJ-h_MPSdVIqrup-6AL2ow",
  authDomain: "cloudincidenttracker.firebaseapp.com",
  projectId: "cloudincidenttracker",
  storageBucket: "cloudincidenttracker.firebasestorage.app",
  messagingSenderId: "10665824183",
  appId: "1:10665824183:web:30ab0abb4f8836ef6fe232"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);