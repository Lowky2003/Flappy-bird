// Authentication UI handler
import { FirebaseService } from './firebase-init.js';

// Show/hide forms
function showLoginForm() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('forgotPasswordForm').classList.add('hidden');
}

function showRegisterForm() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
    document.getElementById('forgotPasswordForm').classList.add('hidden');
}

function showForgotPasswordForm() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('forgotPasswordForm').classList.remove('hidden');
}

// Initialize event listeners when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    console.log('Auth.js: DOM loaded, setting up event listeners');

    // Login handler
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const errorEl = document.getElementById('loginError');

            try {
                errorEl.textContent = '';
                if (!email || !password) {
                    errorEl.textContent = 'Please enter email and password';
                    return;
                }
                await FirebaseService.login(email, password);
            } catch (error) {
                errorEl.textContent = getErrorMessage(error.code);
            }
        });
    }

    // Register handler
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const displayName = document.getElementById('registerName').value;
            const errorEl = document.getElementById('registerError');

            try {
                errorEl.textContent = '';
                if (!displayName) {
                    errorEl.textContent = 'Please enter a display name';
                    return;
                }
                if (!email || !password) {
                    errorEl.textContent = 'Please enter email and password';
                    return;
                }
                if (password.length < 6) {
                    errorEl.textContent = 'Password must be at least 6 characters';
                    return;
                }
                await FirebaseService.register(email, password, displayName);
            } catch (error) {
                errorEl.textContent = getErrorMessage(error.code);
            }
        });
    }

    // Logout handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await FirebaseService.logout();
            } catch (error) {
                console.error('Logout failed:', error);
            }
        });
    }

    // Toggle forms
    const showRegisterLink = document.getElementById('showRegister');
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            showRegisterForm();
        });
    }

    const showLoginLink = document.getElementById('showLogin');
    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            showLoginForm();
        });
    }

    // Show forgot password form
    const showForgotPasswordLink = document.getElementById('showForgotPassword');
    if (showForgotPasswordLink) {
        showForgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            showForgotPasswordForm();
        });
    }

    // Back to login from forgot password
    const backToLoginLink = document.getElementById('backToLogin');
    if (backToLoginLink) {
        backToLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            showLoginForm();
        });
    }

    // Password reset handler
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const email = document.getElementById('resetEmail').value;
            const errorEl = document.getElementById('resetError');
            const successEl = document.getElementById('resetSuccess');

            try {
                errorEl.textContent = '';
                successEl.textContent = '';

                if (!email) {
                    errorEl.textContent = 'Please enter your email address';
                    return;
                }

                await FirebaseService.resetPassword(email);
                successEl.textContent = 'Password reset email sent! Check your inbox.';
                document.getElementById('resetEmail').value = '';

                // Automatically return to login after 3 seconds
                setTimeout(() => {
                    showLoginForm();
                    successEl.textContent = '';
                }, 3000);
            } catch (error) {
                errorEl.textContent = getErrorMessage(error.code);
            }
        });
    }

    console.log('Auth.js: Event listeners set up successfully');
});

// Error message helper
function getErrorMessage(code) {
    switch (code) {
        case 'auth/email-already-in-use':
            return 'Email already in use. Please login instead.';
        case 'auth/invalid-email':
            return 'Invalid email address.';
        case 'auth/user-not-found':
            return 'No account found with this email.';
        case 'auth/wrong-password':
            return 'Incorrect password.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters.';
        case 'auth/invalid-credential':
            return 'Invalid email or password.';
        case 'auth/missing-email':
            return 'Please enter your email address.';
        case 'auth/too-many-requests':
            return 'Too many attempts. Please try again later.';
        default:
            return 'An error occurred. Please try again.';
    }
}
