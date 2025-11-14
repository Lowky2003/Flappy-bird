# Flappy Bird Game with Firebase Integration

A browser-based Flappy Bird clone with Firebase Authentication and Cloud Leaderboard.

## Features

- User authentication (login/register)
- Global leaderboard with top 10 scores
- Real-time score tracking
- Responsive design
- Works offline without Firebase (local scores only)

## Running Locally

Since this game uses JavaScript modules, you need to run it through a web server (not just opening the HTML file).

### Option 1: Python (Recommended - Already Installed on Most Systems)

**Python 3:**
```bash
cd c:\Users\lowky\Desktop\flappy-bird
python -m http.server 8000
```

Then open: **http://localhost:8000**

**Python 2:**
```bash
cd c:\Users\lowky\Desktop\flappy-bird
python -m SimpleHTTPServer 8000
```

Then open: **http://localhost:8000**

### Option 2: Node.js (http-server)

If you have Node.js installed:

```bash
cd c:\Users\lowky\Desktop\flappy-bird
npx http-server -p 8000
```

Then open: **http://localhost:8000**

### Option 3: VS Code Live Server Extension

1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"
4. Game opens automatically in browser

### Option 4: PHP

If you have PHP installed:

```bash
cd c:\Users\lowky\Desktop\flappy-bird
php -S localhost:8000
```

Then open: **http://localhost:8000**

## Firebase Setup

To enable authentication and online leaderboard:

1. **Create Firebase Project**
   - Go to https://console.firebase.google.com/
   - Create a new project

2. **Enable Authentication**
   - Go to Build → Authentication
   - Click "Get Started"
   - Enable "Email/Password" provider

3. **Create Firestore Database**
   - Go to Build → Firestore Database
   - Click "Create database"
   - Start in "test mode" (change later for production)
   - Choose a location close to your users

4. **Get Firebase Config**
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps" section
   - Click the web icon (</>)
   - Copy the `firebaseConfig` object

5. **Update Configuration**
   - Open `firebase-config.js`
   - Replace the placeholder values with your Firebase config

6. **Set Firestore Security Rules**
   - Go to Firestore Database → Rules
   - Use the rules from `FIREBASE_SETUP.md`

## File Structure

```
flappy-bird/
├── index.html          # Main HTML file
├── game.js             # Game logic
├── style.css           # Styles
├── auth.js             # Authentication handler
├── firebase-init.js    # Firebase initialization
├── firebase-config.js  # Firebase credentials (UPDATE THIS!)
├── FIREBASE_SETUP.md   # Detailed Firebase setup guide
└── README.md          # This file
```

## Game Controls

- **Space** or **Click** - Flap wings
- **R** - Restart game (after game over)

## How It Works

### Without Firebase
- Game works normally
- High scores stored in browser localStorage
- No authentication required
- No online leaderboard

### With Firebase
- Login/Register screen appears
- Scores linked to user accounts
- Global leaderboard with top 10 players
- Automatic score submission

## Troubleshooting

### "Cannot use import statement outside a module"
- You must run the game through a web server
- Don't open `index.html` directly in browser
- Use one of the localhost options above

### "Firebase not configured"
- The game works without Firebase
- To enable Firebase features, follow the Firebase Setup section

### Login/Register buttons not working
- Make sure you're running on localhost
- Check browser console for errors (F12)
- Ensure Firebase credentials are configured correctly

### CORS Errors
- Must use a web server (localhost)
- Cannot run by opening file directly (file://)

## Development

To modify the game:

1. Edit files in your code editor
2. Save changes
3. Refresh browser to see updates
4. Check browser console (F12) for errors

## Credits

Created with Claude Code
