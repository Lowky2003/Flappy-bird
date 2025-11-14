// Firebase Configuration
// Replace this with your actual Firebase config from Firebase Console

const firebaseConfig = {
  apiKey: "AIzaSyBuCSGAJhHCTiF42dzBSmVZsAtXLsG7rxc",
  authDomain: "flappy-bird-971bd.firebaseapp.com",
  projectId: "flappy-bird-971bd",
  storageBucket: "flappy-bird-971bd.firebasestorage.app",
  messagingSenderId: "944734300024",
  appId: "1:944734300024:web:ed8e0a12c606eff0ac8a8d",
  measurementId: "G-RYH4XN9FDL"
};

// Instructions to get your Firebase config:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project or select an existing one
// 3. Click on the gear icon (Project Settings)
// 4. Scroll down to "Your apps" section
// 5. Click the "</>" (Web) icon to add a web app
// 6. Register your app with a nickname (e.g., "Flappy Bird")
// 7. Copy the firebaseConfig object and replace the values above
// 8. In Firebase Console, go to "Build" > "Firestore Database"
// 9. Click "Create database" and start in "test mode" (change rules later)
// 10. Create a collection called "leaderboard"

export default firebaseConfig;
