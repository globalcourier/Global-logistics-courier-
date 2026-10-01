// ============================================================
//  FIREBASE CONFIGURATION
//  Replace the values below with YOUR own Firebase project keys
//  See README.md for step-by-step instructions
// ============================================================

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Export for use in other files
const db = firebase.firestore();
// auth is only needed in admin.html (loaded there)
