/**
 * Authentication Module
 */
const Auth = {
    currentUser: null,

    /**
     * Initialize authentication state
     */
    init() {
        this.currentUser = Utils.retrieve('user');
        return this.isAuthenticated();
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!this.currentUser && !!Utils.retrieve('auth_token');
    },

    /**
     * Get current user
     */
    getUser() {
        return this.currentUser;
    },

    /**
     * Update current user data
     */
    updateUser(userData) {
        this.currentUser = userData;
        Utils.store('user', userData);
    },

    /**
     * Get user role
     */
    getRole() {
        return this.currentUser?.role || null;
    },

    /**
     * Login user
     */
    async login(username, password) {
        try {
            Utils.showLoading();
            const response = await API.auth.login(username, password);

            if (response.success) {
                this.currentUser = response.user;
                Utils.store('user', response.user);
                Utils.store('auth_token', response.token);
                Utils.showToast('Login successful!', 'success');
                return true;
            }
            return false;
        } catch (error) {
            Utils.showToast(error.message || 'Login failed', 'error');
            return false;
        } finally {
            Utils.hideLoading();
        }
    },

    /**
     * Register new user
     */
    async register(userData) {
        try {
            Utils.showLoading();
            const response = await API.auth.register(userData);

            if (response.success) {
                Utils.showToast('Registration successful! Please login.', 'success');
                return true;
            }
            return false;
        } catch (error) {
            Utils.showToast(error.message || 'Registration failed', 'error');
            return false;
        } finally {
            Utils.hideLoading();
        }
    },

    /**
     * Logout user
     */
    logout() {
        this.currentUser = null;
        Utils.remove('user');
        Utils.remove('auth_token');
        Utils.showToast('Logged out successfully', 'info');
        App.navigate('login');
    },

    /**
     * Check if user has specific role
     */
    hasRole(role) {
        return this.currentUser?.role === role;
    },

    /**
     * Check if user is parent
     */
    isParent() {
        return this.hasRole(CONFIG.ROLES.PARENT);
    },

    /**
     * Check if user is health center
     */
    isHealthCenter() {
        return this.hasRole(CONFIG.ROLES.HEALTH_CENTER);
    },

    /**
     * Check if user is WHO
     */
    isWho() {
        return this.hasRole(CONFIG.ROLES.WHO);
    },

    /**
     * Render login page
     */
    renderLoginPage() {
        return `
            <div class="auth-page">
                <div class="auth-container">
                    <div class="auth-card">
                        <div class="auth-header">
                            <div class="auth-logo">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M12 2a3 3 0 0 0-3 3v1a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                                    <path d="M19 9H5a2 2 0 0 0-2 2v1a7 7 0 0 0 7 7h4a7 7 0 0 0 7-7v-1a2 2 0 0 0-2-2z"/>
                                    <path d="M12 19v3"/>
                                </svg>
                            </div>
                            <h1 class="auth-title">GROWLYTICS</h1>
                            <p class="auth-subtitle">Monitor your child's health and nutrition</p>
                        </div>

                        <form id="login-form">
                            <div class="form-group">
                                <label class="form-label" for="username">Username</label>
                                <input type="text" id="username" name="username" class="form-control" 
                                       placeholder="Enter your username" required autocomplete="username">
                            </div>

                            <div class="form-group">
                                <label class="form-label" for="password">Password</label>
                                <input type="password" id="password" name="password" class="form-control" 
                                       placeholder="Enter your password" required autocomplete="current-password">
                            </div>

                            <button type="submit" class="btn btn-primary btn-block btn-lg">
                                Sign In
                            </button>
                        </form>

                        <div class="auth-divider">or</div>

                        <button onclick="App.navigate('register')" class="btn btn-secondary btn-block">
                            Create New Account
                        </button>

                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render registration page
     */
    renderRegisterPage() {
        const regionOptions = CONFIG.REGIONS.map(r =>
            `<option value="${r}">${r}</option>`
        ).join('');

        return `
            <div class="auth-page">
                <div class="auth-container">
                    <div class="auth-card">
                        <div class="auth-header">
                            <div class="auth-logo">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                                    <circle cx="9" cy="7" r="4"/>
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                </svg>
                            </div>
                            <h1 class="auth-title">Create Account</h1>
                            <p class="auth-subtitle">Join to track child health and nutrition</p>
                        </div>

                        <form id="register-form">
                            <div class="form-group">
                                <label class="form-label" for="reg-role">Account Type</label>
                                <select id="reg-role" name="role" class="form-control" onchange="Auth.toggleAdminCode()" required>
                                    <option value="parent">Parent</option>
                                    <option value="health_center">Health Center</option>
                                    <option value="who">WHO Representative</option>
                                </select>
                            </div>

                            <div id="admin-code-group" class="form-group" style="display: none;">
                                <label class="form-label" for="admin-code">Registration Code</label>
                                <input type="password" id="admin-code" name="admin_code" class="form-control" 
                                       placeholder="Required for non-parent accounts">
                            </div>

                            <div class="form-group">
                                <label class="form-label" for="reg-name">Full Name</label>
                                <input type="text" id="reg-name" name="name" class="form-control" 
                                       placeholder="Enter your full name" required>
                            </div>

                            <div class="form-group">
                                <label class="form-label" for="reg-username">Username</label>
                                <input type="text" id="reg-username" name="username" class="form-control" 
                                       placeholder="Choose a username" required minlength="4">
                            </div>

                            <div class="form-group">
                                <label class="form-label" for="reg-email">Email</label>
                                <input type="email" id="reg-email" name="email" class="form-control" 
                                       placeholder="Enter your email" required>
                            </div>

                            <div class="form-group">
                                <label class="form-label" for="reg-phone">Phone Number</label>
                                <input type="tel" id="reg-phone" name="phone" class="form-control" 
                                       placeholder="Enter 10-digit mobile number" pattern="[6-9][0-9]{9}" required>
                            </div>

                            <div class="form-group">
                                <label class="form-label" for="reg-region">Region</label>
                                <select id="reg-region" name="region" class="form-control" required>
                                    <option value="">Select your region</option>
                                    ${regionOptions}
                                </select>
                                <small class="text-muted" id="region-help">Required for Parents and Health Centers</small>
                            </div>

                            <div class="form-group">
                                <label class="form-label" for="reg-password">Password</label>
                                <input type="password" id="reg-password" name="password" class="form-control" 
                                       placeholder="Create a password" required minlength="6">
                            </div>

                            <div class="form-group">
                                <label class="form-label" for="reg-confirm">Confirm Password</label>
                                <input type="password" id="reg-confirm" name="confirm" class="form-control" 
                                       placeholder="Confirm your password" required>
                            </div>

                            <button type="submit" class="btn btn-success btn-block btn-lg">
                                Create Account
                            </button>
                        </form>

                        <div class="auth-footer">
                            <p>Already have an account? <a href="#" onclick="App.navigate('login')">Sign In</a></p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Toggle Admin Code visibility
     */
    toggleAdminCode() {
        const role = document.getElementById('reg-role').value;
        const codeGroup = document.getElementById('admin-code-group');
        const regionHelp = document.getElementById('region-help');
        const regionSelect = document.getElementById('reg-region');

        if (role !== 'parent') {
            codeGroup.style.display = 'block';
            document.getElementById('admin-code').required = true;
        } else {
            codeGroup.style.display = 'none';
            document.getElementById('admin-code').required = false;
        }

        if (role === 'who') {
            regionSelect.required = false;
            regionHelp.textContent = "Optional for WHO representatives";
        } else {
            regionSelect.required = true;
            regionHelp.textContent = "Required for Parents and Health Centers";
        }
    },

    /**
     * Initialize login form handler
     */
    initLoginForm() {
        const form = document.getElementById('login-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const username = document.getElementById('username').value.trim();
                const password = document.getElementById('password').value;

                const success = await this.login(username, password);
                if (success) {
                    App.navigateToDashboard();
                }
            });
        }
    },

    /**
     * Confirm and delete account
     */
    confirmDeleteAccount() {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.')) {
            // Double confirmation
            if (confirm('Please confirm again: Do you really want to delete your account?')) {
                this.deleteAccount();
            }
        }
    },

    /**
     * Execute account deletion
     */
    async deleteAccount() {
        try {
            Utils.showLoading();
            await API.auth.deleteAccount();
            Utils.showToast('Account deleted successfully', 'success');
            this.logout();
        } catch (error) {
            Utils.showToast(error.message || 'Failed to delete account', 'error');
        } finally {
            Utils.hideLoading();
        }
    },

    /**
     * Initialize register form handler
     */
    initRegisterForm() {
        const form = document.getElementById('register-form');
        if (form) {
            // Initial toggle check
            this.toggleAdminCode();

            form.addEventListener('submit', async (e) => {
                e.preventDefault();

                const name = document.getElementById('reg-name').value.trim();
                const username = document.getElementById('reg-username').value.trim();
                const email = document.getElementById('reg-email').value.trim();
                const phone = document.getElementById('reg-phone').value.trim();
                const region = document.getElementById('reg-region').value;
                const password = document.getElementById('reg-password').value;
                const confirm = document.getElementById('reg-confirm').value;
                const role = document.getElementById('reg-role').value;
                const adminCode = document.getElementById('admin-code').value.trim();

                // Validation
                if (password !== confirm) {
                    Utils.showToast('Passwords do not match', 'error');
                    return;
                }

                if (!Utils.isValidEmail(email)) {
                    Utils.showToast('Please enter a valid email', 'error');
                    return;
                }

                if (!Utils.isValidPhone(phone)) {
                    Utils.showToast('Please enter a valid 10-digit phone number', 'error');
                    return;
                }

                const success = await this.register({
                    name,
                    username,
                    email,
                    phone,
                    region,
                    password,
                    role,
                    admin_code: adminCode
                });

                if (success) {
                    App.navigate('login');
                }
            });
        }
    }
};

// Make Auth available globally
window.Auth = Auth;
