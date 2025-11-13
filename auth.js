// Authentication and Leaderboard Management
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

import {
    collection,
    addDoc,
    query,
    orderBy,
    limit,
    getDocs,
    where,
    updateDoc,
    doc
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Wait for Firebase to be initialized
let auth, db;
let currentUser = null;
let isAuthMode = 'login'; // 'login' or 'register'

// Wait for Firebase initialization
function waitForFirebase() {
    return new Promise((resolve) => {
        const checkFirebase = setInterval(() => {
            if (window.firebaseAuth && window.firebaseDB) {
                auth = window.firebaseAuth;
                db = window.firebaseDB;
                clearInterval(checkFirebase);
                resolve();
            }
        }, 100);
    });
}

// Initialize after Firebase is loaded
waitForFirebase().then(() => {
    initializeAuth();
});

function initializeAuth() {
    // DOM Elements
    const authModal = document.getElementById('authModal');
    const leaderboardModal = document.getElementById('leaderboardModal');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const leaderboardBtn = document.getElementById('leaderboardBtn');
    const authForm = document.getElementById('authForm');
    const toggleAuthLink = document.getElementById('toggleAuth');
    const closeBtn = document.querySelector('.close');
    const closeLeaderboardBtn = document.querySelector('.close-leaderboard');
    const userInfo = document.getElementById('userInfo');
    const userEmail = document.getElementById('userEmail');

    // Auth state observer
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            loginBtn.style.display = 'none';
            userInfo.style.display = 'flex';
            userEmail.textContent = user.email;
            window.currentUser = user;
        } else {
            currentUser = null;
            loginBtn.style.display = 'block';
            userInfo.style.display = 'none';
            window.currentUser = null;
        }
    });

    // Event Listeners
    loginBtn.addEventListener('click', () => {
        authModal.style.display = 'block';
        isAuthMode = 'login';
        updateAuthModal();
    });

    logoutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
            showMessage('Logged out successfully!', 'success');
        } catch (error) {
            showError('Error logging out: ' + error.message);
        }
    });

    leaderboardBtn.addEventListener('click', () => {
        leaderboardModal.style.display = 'block';
        loadLeaderboard();
    });

    closeBtn.addEventListener('click', () => {
        authModal.style.display = 'none';
        clearAuthForm();
    });

    closeLeaderboardBtn.addEventListener('click', () => {
        leaderboardModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === authModal) {
            authModal.style.display = 'none';
            clearAuthForm();
        }
        if (e.target === leaderboardModal) {
            leaderboardModal.style.display = 'none';
        }
    });

    toggleAuthLink.addEventListener('click', (e) => {
        e.preventDefault();
        isAuthMode = isAuthMode === 'login' ? 'register' : 'login';
        updateAuthModal();
        clearAuthForm();
    });

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            if (isAuthMode === 'register') {
                await createUserWithEmailAndPassword(auth, email, password);
                showMessage('Account created successfully!', 'success');
                authModal.style.display = 'none';
            } else {
                await signInWithEmailAndPassword(auth, email, password);
                showMessage('Logged in successfully!', 'success');
                authModal.style.display = 'none';
            }
            clearAuthForm();
        } catch (error) {
            let errorMessage = 'An error occurred';

            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'Email already in use';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password should be at least 6 characters';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address';
                    break;
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    errorMessage = 'Invalid email or password';
                    break;
                case 'auth/invalid-credential':
                    errorMessage = 'Invalid credentials';
                    break;
                default:
                    errorMessage = error.message;
            }

            showError(errorMessage);
        }
    });
}

function updateAuthModal() {
    const authTitle = document.getElementById('authTitle');
    const authSubmit = document.getElementById('authSubmit');
    const toggleText = document.getElementById('toggleText');
    const toggleAuth = document.getElementById('toggleAuth');

    if (isAuthMode === 'login') {
        authTitle.textContent = 'Login';
        authSubmit.textContent = 'Login';
        toggleText.textContent = "Don't have an account?";
        toggleAuth.textContent = 'Register';
    } else {
        authTitle.textContent = 'Register';
        authSubmit.textContent = 'Register';
        toggleText.textContent = 'Already have an account?';
        toggleAuth.textContent = 'Login';
    }
}

function clearAuthForm() {
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    document.getElementById('authError').style.display = 'none';
}

function showError(message) {
    const errorDiv = document.getElementById('authError');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function showMessage(message, type) {
    // You can implement a toast notification here
    console.log(`${type}: ${message}`);
}

// Save score to Firestore
async function saveScore(score) {
    if (!currentUser) {
        console.log('User not logged in, score not saved to leaderboard');
        return;
    }

    if (!db) {
        console.error('Firestore not initialized');
        return;
    }

    try {
        // Check if user already has a score
        const scoresRef = collection(db, 'scores');
        const q = query(scoresRef, where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            // Update existing score if new score is higher
            const existingDoc = querySnapshot.docs[0];
            const existingScore = existingDoc.data().score;

            if (score > existingScore) {
                await updateDoc(doc(db, 'scores', existingDoc.id), {
                    score: score,
                    email: currentUser.email,
                    timestamp: new Date()
                });
                console.log('Score updated!');
            }
        } else {
            // Add new score
            await addDoc(collection(db, 'scores'), {
                userId: currentUser.uid,
                email: currentUser.email,
                score: score,
                timestamp: new Date()
            });
            console.log('Score saved!');
        }
    } catch (error) {
        console.error('Error saving score:', error);
    }
}

// Load leaderboard
async function loadLeaderboard() {
    const leaderboardList = document.getElementById('leaderboardList');
    leaderboardList.innerHTML = '<div class="loading">Loading...</div>';

    if (!db) {
        leaderboardList.innerHTML = '<div class="no-scores">Database not connected. Please configure Firebase.</div>';
        return;
    }

    try {
        const scoresRef = collection(db, 'scores');
        const q = query(scoresRef, orderBy('score', 'desc'), limit(10));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            leaderboardList.innerHTML = '<div class="no-scores">No scores yet. Be the first!</div>';
            return;
        }

        let html = '';
        let rank = 1;

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const topClass = rank <= 3 ? `top-${rank}` : '';
            const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';

            html += `
                <div class="leaderboard-item ${topClass}">
                    <div class="leaderboard-rank">${medal || rank}</div>
                    <div class="leaderboard-info">
                        <div class="leaderboard-email">${data.email}</div>
                    </div>
                    <div class="leaderboard-score">${data.score}</div>
                </div>
            `;
            rank++;
        });

        leaderboardList.innerHTML = html;
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        leaderboardList.innerHTML = '<div class="no-scores">Error loading leaderboard. Please try again.</div>';
    }
}

// Export functions for use in game.js
window.saveScore = saveScore;
window.loadLeaderboard = loadLeaderboard;
