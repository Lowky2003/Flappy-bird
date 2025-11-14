# Firebase Integration Setup Guide

This guide will help you set up Firebase for your Flappy Bird game to enable cloud-based leaderboards.

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** (or select an existing project)
3. Enter a project name (e.g., "Flappy Bird")
4. Follow the setup wizard (you can disable Google Analytics if you don't need it)
5. Click **"Create project"**

## Step 2: Register Your Web App

1. In your Firebase project dashboard, click the **</>** (web) icon to add a web app
2. Enter an app nickname (e.g., "Flappy Bird Web")
3. **Do NOT check** "Also set up Firebase Hosting" (unless you want to use it)
4. Click **"Register app"**
5. Copy the `firebaseConfig` object that appears

## Step 3: Update Firebase Configuration

1. Open `firebase-config.js` in your project
2. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};
```

## Step 4: Set Up Firestore Database

1. In the Firebase Console, go to **"Build"** → **"Firestore Database"**
2. Click **"Create database"**
3. Select **"Start in test mode"** (for development - change later for production)
4. Choose a Cloud Firestore location (select one closest to your users)
5. Click **"Enable"**

## Step 5: Configure Firestore Security Rules (Important!)

For production, update your Firestore security rules:

1. In Firestore Database, go to the **"Rules"** tab
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read leaderboard
    match /leaderboard/{document=**} {
      allow read: if true;
      allow write: if request.resource.data.score is number
                   && request.resource.data.score >= 0
                   && request.resource.data.score <= 10000
                   && request.resource.data.playerName is string
                   && request.resource.data.playerName.size() <= 50;
    }
  }
}
```

3. Click **"Publish"**

## Step 6: Test Your Integration

1. Open `index.html` in a web browser
2. You should see "Loading..." in the leaderboard, then it should update
3. Play the game and get a score
4. When game over, you'll be prompted for your name
5. Check the Firebase Console → Firestore Database to see your score added

## Features Included

- **Local High Score**: Stored in browser localStorage
- **Global Leaderboard**: Top 10 scores from all players
- **Player Names**: Players can enter their name for the leaderboard
- **Real-time Updates**: Leaderboard updates after each game
- **Global High Score**: Shows the best score across all players

## Troubleshooting

### CORS Errors
- Make sure you're running the game from a web server (not just opening the HTML file)
- Use a local server like `python -m http.server` or VS Code Live Server

### "Loading..." Never Changes
- Check the browser console for errors
- Verify your Firebase config is correct
- Make sure Firestore database is created and enabled

### Scores Not Saving
- Check Firestore security rules allow writes
- Check browser console for permission errors
- Verify your internet connection

## Running Locally

To test locally with a web server:

```bash
# Python 3
python -m http.server 8000

# Node.js (install http-server globally first)
npx http-server

# VS Code
# Install "Live Server" extension and click "Go Live"
```

Then open `http://localhost:8000` in your browser.

## Next Steps (Optional Enhancements)

- Add Firebase Authentication for user accounts
- Add timestamps to show when scores were achieved
- Add difficulty levels with separate leaderboards
- Add achievements and badges
- Add social sharing features
