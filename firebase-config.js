// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBblODoNoIy38d_qwxWaiOX_4KYyEwB4RA",
  authDomain: "global-logistics-deliveries.firebaseapp.com",
  projectId: "global-logistics-deliveries",
  storageBucket: "global-logistics-deliveries.firebasestorage.app",
  messagingSenderId: "582450915606",
  appId: "1:582450915606:web:fd7e83ccc323c74e678837",
  measurementId: "G-PK0J5LNYJX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
