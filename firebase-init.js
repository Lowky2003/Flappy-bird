// Firebase initialization and helper functions
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs, where } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import firebaseConfig from './firebase-config.js';

// Check if Firebase is configured
const isFirebaseConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY";

// Initialize Firebase only if configured
let app = null;
let db = null;
let auth = null;
let firebaseEnabled = false;
let currentUser = null;

if (isFirebaseConfigured) {
    try {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
        firebaseEnabled = true;
        console.log('Firebase initialized successfully');
    } catch (error) {
        console.error('Firebase initialization error:', error);
        firebaseEnabled = false;
    }
} else {
    console.warn('Firebase not configured. Please update firebase-config.js with your credentials.');
}

// Firebase Helper Functions
export const FirebaseService = {
    // Authentication methods
    async register(email, password, displayName) {
        if (!firebaseEnabled) {
            throw new Error('Firebase not configured');
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: displayName });
            currentUser = userCredential.user;
            console.log('User registered:', displayName);
            return userCredential.user;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },

    async login(email, password) {
        if (!firebaseEnabled) {
            throw new Error('Firebase not configured');
        }
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            currentUser = userCredential.user;
            console.log('User logged in:', userCredential.user.email);
            return userCredential.user;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    async logout() {
        if (!firebaseEnabled) return;
        try {
            await signOut(auth);
            currentUser = null;
            console.log('User logged out');
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    },

    async resetPassword(email) {
        if (!firebaseEnabled) {
            throw new Error('Firebase not configured');
        }
        try {
            await sendPasswordResetEmail(auth, email);
            console.log('Password reset email sent to:', email);
            return true;
        } catch (error) {
            console.error('Password reset error:', error);
            throw error;
        }
    },

    getCurrentUser() {
        return currentUser;
    },

    isLoggedIn() {
        return currentUser !== null;
    },

    // Add a new score to the leaderboard
    async addScore(playerName, score) {
        if (!firebaseEnabled) {
            console.log('Firebase not enabled. Score not saved:', playerName, score);
            return null;
        }
        if (!currentUser) {
            console.log('User not logged in. Score not saved.');
            return null;
        }
        try {
            const docRef = await addDoc(collection(db, 'leaderboard'), {
                userId: currentUser.uid,
                playerName: playerName || currentUser.displayName || 'Anonymous',
                score: score,
                timestamp: new Date().toISOString()
            });
            console.log('Score added with ID: ', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Error adding score: ', error);
            return null;
        }
    },

    // Get user's personal best score
    async getUserBestScore() {
        if (!firebaseEnabled || !currentUser) return 0;
        try {
            const q = query(
                collection(db, 'leaderboard'),
                where('userId', '==', currentUser.uid),
                orderBy('score', 'desc'),
                limit(1)
            );
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                return querySnapshot.docs[0].data().score;
            }
            return 0;
        } catch (error) {
            console.error('Error getting user best score:', error);
            return 0;
        }
    },

    // Get top 10 scores from leaderboard (best score per user)
    async getTopScores(limitCount = 10) {
        if (!firebaseEnabled) {
            return [];
        }
        try {
            // Get all scores, sorted by score descending
            const q = query(
                collection(db, 'leaderboard'),
                orderBy('score', 'desc')
            );
            const querySnapshot = await getDocs(q);

            // Group by userId and keep only the best score per user
            const userBestScores = new Map();
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const userId = data.userId;

                // If this user isn't in the map yet, or this score is higher, add/update it
                if (!userBestScores.has(userId)) {
                    userBestScores.set(userId, {
                        id: doc.id,
                        ...data
                    });
                }
            });

            // Convert map to array and sort by score descending
            const scores = Array.from(userBestScores.values())
                .sort((a, b) => b.score - a.score)
                .slice(0, limitCount);

            return scores;
        } catch (error) {
            console.error('Error getting scores: ', error);
            return [];
        }
    },

    // Get the global high score
    async getGlobalHighScore() {
        if (!firebaseEnabled) {
            return null;
        }
        try {
            const scores = await this.getTopScores(1);
            return scores.length > 0 ? scores[0].score : 0;
        } catch (error) {
            console.error('Error getting global high score: ', error);
            return null;
        }
    },

    // Update leaderboard display
    async updateLeaderboardDisplay() {
        const leaderboardList = document.getElementById('leaderboardList');

        if (!firebaseEnabled) {
            leaderboardList.innerHTML = '<li style="color: #ffeb3b;">Firebase not configured</li><li style="font-size: 0.9em;">See FIREBASE_SETUP.md</li>';
            return;
        }

        const scores = await this.getTopScores(10);

        if (scores.length === 0) {
            leaderboardList.innerHTML = '<li>No scores yet. Be the first!</li>';
            return;
        }

        leaderboardList.innerHTML = scores.map((score, index) =>
            `<li>${score.playerName}: ${score.score}</li>`
        ).join('');
    },

    // Update global high score display
    async updateGlobalHighScoreDisplay() {
        const globalHighScoreElement = document.getElementById('globalHighScore');
        if (!globalHighScoreElement) return;

        if (!firebaseEnabled) {
            globalHighScoreElement.textContent = '-';
            globalHighScoreElement.title = 'Firebase not configured';
            return;
        }

        const globalHighScore = await this.getGlobalHighScore();
        if (globalHighScore !== null) {
            globalHighScoreElement.textContent = globalHighScore;
        } else {
            globalHighScoreElement.textContent = '-';
        }
    }
};

// Auth state observer
if (firebaseEnabled) {
    onAuthStateChanged(auth, (user) => {
        currentUser = user;
        if (user) {
            console.log('User is signed in:', user.email);
            // Show game UI, hide auth UI
            document.getElementById('authContainer')?.classList.add('hidden');
            document.getElementById('gameContainer')?.classList.remove('hidden');
            document.getElementById('userInfo').textContent = `Welcome, ${user.displayName || user.email}!`;
            // Update displays
            FirebaseService.updateGlobalHighScoreDisplay();
            FirebaseService.updateLeaderboardDisplay();
        } else {
            console.log('User is signed out');
            // Show auth UI, hide game UI
            document.getElementById('authContainer')?.classList.remove('hidden');
            document.getElementById('gameContainer')?.classList.add('hidden');
        }
    });
}

// Initialize displays on load
window.addEventListener('load', async () => {
    if (!firebaseEnabled) {
        // If Firebase is not configured, show game without auth
        document.getElementById('authContainer')?.classList.add('hidden');
        document.getElementById('gameContainer')?.classList.remove('hidden');
    }
    await FirebaseService.updateGlobalHighScoreDisplay();
    await FirebaseService.updateLeaderboardDisplay();
});

export { db, auth };
