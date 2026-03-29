/**
 * Main Application Controller
 */
const App = {
    currentPage: null,

    /**
     * Initialize the application
     */
    async init() {
        console.log(`${CONFIG.APP_NAME} v${CONFIG.VERSION} initializing...`);

        // Check authentication
        const isAuthenticated = Auth.init();

        // Handle initial navigation
        if (isAuthenticated) {
            this.navigateToDashboard();
        } else {
            this.navigate('login');
        }
    },

    /**
     * Navigate to a page
     */
    navigate(page, params = {}) {
        this.currentPage = page;
        const app = document.getElementById('app');

        switch (page) {
            case 'login':
                app.innerHTML = Auth.renderLoginPage();
                Auth.initLoginForm();
                break;

            case 'register':
                app.innerHTML = Auth.renderRegisterPage();
                Auth.initRegisterForm();
                break;

            case 'dashboard':
                this.renderDashboard();
                break;

            case 'children':
                this.renderChildrenPage();
                break;

            case 'add-child':
                this.renderAddChildPage();
                break;

            case 'child-profile':
                this.renderChildProfilePage(params.id);
                break;

            case 'growth-entry':
                this.renderGrowthEntryPage(params.id);
                break;

            case 'blood-report':
                this.renderBloodReportPage(params.id);
                break;

            case 'analytics':
                this.renderChildrenPage(); // Reuse children page for WHO analytics
                break;

            case 'reports':
                this.renderReportsPage();
                break;

            case 'vaccinations':
                this.renderVaccinationsPage(params.id);
                break;

            case 'nutrition':
                this.renderNutritionPage(params.id);
                break;

            case 'alerts':
                this.renderAlertsPage();
                break;

            case 'user-profile':
                this.renderUserProfilePage();
                break;

            default:
                this.navigate('login');
        }
    },

    /**
     * Navigate to role-appropriate dashboard
     */
    navigateToDashboard() {
        const role = Auth.getRole();

        switch (role) {
            case CONFIG.ROLES.PARENT:
                this.navigate('dashboard');
                break;
            case CONFIG.ROLES.HEALTH_CENTER:
                this.renderHealthCenterDashboard();
                break;
            case CONFIG.ROLES.WHO:
                this.renderWhoDashboard();
                break;
            default:
                this.navigate('login');
        }
    },

    /**
     * Render sidebar navigation
     */
    renderSidebar(activePage = '') {
        const user = Auth.getUser();
        const role = user?.role;

        let navItems = '';

        const profileLink = `
            <li class="sidebar-item">
                <a href="#" class="sidebar-link ${activePage === 'user-profile' ? 'active' : ''}" 
                   onclick="App.navigate('user-profile')">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                    </svg>
                    My Profile
                </a>
            </li>
        `;

        if (role === CONFIG.ROLES.PARENT) {
            navItems = `
                <li class="sidebar-item">
                    <a href="#" class="sidebar-link ${activePage === 'dashboard' ? 'active' : ''}" 
                       onclick="App.navigate('dashboard')">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                        </svg>
                        Dashboard
                    </a>
                </li>
                <li class="sidebar-item">
                    <a href="#" class="sidebar-link ${activePage === 'children' ? 'active' : ''}" 
                       onclick="App.navigate('children')">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                        My Children
                    </a>
                </li>
                <li class="sidebar-item">
                    <a href="#" class="sidebar-link ${activePage === 'alerts' ? 'active' : ''}" 
                       onclick="App.navigate('alerts')">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                        </svg>
                        Alerts
                    </a>
                </li>
                ${profileLink}
            `;
        } else if (role === CONFIG.ROLES.HEALTH_CENTER) {
            navItems = `
                <li class="sidebar-item">
                    <a href="#" class="sidebar-link ${activePage === 'dashboard' ? 'active' : ''}" 
                       onclick="App.navigateToDashboard()">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                        </svg>
                        Dashboard
                    </a>
                </li>
                <li class="sidebar-item">
                    <a href="#" class="sidebar-link ${activePage === 'children' ? 'active' : ''}" 
                       onclick="App.navigate('children')">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                        </svg>
                        Regional Children
                    </a>
                </li>
                <li class="sidebar-item">
                    <a href="#" class="sidebar-link ${activePage === 'reports' ? 'active' : ''}" 
                       onclick="App.navigate('reports')">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                        </svg>
                        Reports
                    </a>
                </li>
                ${profileLink}
            `;
        } else if (role === CONFIG.ROLES.WHO) {
            navItems = `
                <li class="sidebar-item">
                    <a href="#" class="sidebar-link ${activePage === 'dashboard' ? 'active' : ''}" 
                       onclick="App.navigateToDashboard()">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                        </svg>
                        Dashboard
                    </a>
                </li>
                <li class="sidebar-item">
                    <a href="#" class="sidebar-link ${activePage === 'analytics' ? 'active' : ''}" 
                       onclick="App.navigate('analytics')">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
                            <line x1="6" y1="20" x2="6" y2="14"/>
                        </svg>
                        Analytics
                    </a>
                </li>
                ${profileLink}
            `;
        }

        return `
            <aside class="sidebar">
                <div class="sidebar-brand">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28" style="color: var(--primary)">
                        <path d="M12 2a3 3 0 0 0-3 3v1a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                        <path d="M19 9H5a2 2 0 0 0-2 2v1a7 7 0 0 0 7 7h4a7 7 0 0 0 7-7v-1a2 2 0 0 0-2-2z"/>
                    </svg>
                    <span>Vaccination & Nutrition Tracker</span>
                </div>
                
                <nav>
                    <ul class="sidebar-nav">
                        ${navItems}
                    </ul>
                </nav>
                
                <div style="position: absolute; bottom: 1.5rem; left: 1.5rem; right: 1.5rem;">
                    <div class="card" style="padding: 1rem;">
                        <div class="d-flex align-center gap-1">
                            <div class="user-avatar">${user?.name?.charAt(0).toUpperCase() || 'U'}</div>
                            <div>
                                <div style="font-weight: 500; font-size: 0.9rem;">${Utils.escapeHtml(user?.name || 'User')}</div>
                                <div class="text-muted" style="font-size: 0.75rem;">${user?.role?.replace('_', ' ').toUpperCase()}</div>
                            </div>
                        </div>
                        <button onclick="Auth.logout()" class="btn btn-secondary btn-sm btn-block mt-3">
                            Logout
                        </button>
                    </div>
                </div>
            </aside>
        `;
    },

    /**
     * Render Parent Dashboard
     */
    async renderDashboard() {
        const app = document.getElementById('app');

        app.innerHTML = `
            ${this.renderSidebar('dashboard')}
            <main class="main-content">
                <h1>Welcome, ${Utils.escapeHtml(Auth.getUser()?.name || 'Parent')}!</h1>
                <p class="text-muted mb-4">Here's an overview of your children's health status.</p>
                
                <div id="dashboard-content">
                    <div class="d-flex align-center justify-between">
                        <div class="spinner"></div>
                        <span class="text-muted">Loading dashboard...</span>
                    </div>
                </div>
            </main>
        `;

        // Load dashboard data
        try {
            const data = await API.dashboard.getParentStats();
            this.renderDashboardContent(data);
        } catch (error) {
            document.getElementById('dashboard-content').innerHTML = `
                <div class="alert alert-danger">
                    Failed to load dashboard: ${Utils.escapeHtml(error.message)}
                </div>
            `;
        }
    },

    /**
     * Render dashboard content
     */
    renderDashboardContent(data) {
        const container = document.getElementById('dashboard-content');
        if (!container) return;

        const stats = data.stats || {};
        const children = data.children || [];
        const alerts = data.alerts || [];

        container.innerHTML = `
            <!-- Stats Grid -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon primary">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                        </svg>
                    </div>
                    <div class="stat-content">
                        <h3>${stats.totalChildren || 0}</h3>
                        <p>Registered Children</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon success">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                            <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                    </div>
                    <div class="stat-content">
                        <h3>${stats.healthyChildren || 0}</h3>
                        <p>Healthy Children</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon warning">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                    </div>
                    <div class="stat-content">
                        <h3>${stats.pendingVaccinations || 0}</h3>
                        <p>Pending Vaccinations</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon danger">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                        </svg>
                    </div>
                    <div class="stat-content">
                        <h3>${alerts.length || 0}</h3>
                        <p>Active Alerts</p>
                    </div>
                </div>
            </div>

            <!-- Overdue Vaccinations Alert Section -->
            ${(data.overdue_vaccinations && data.overdue_vaccinations.length > 0) ? `
                <div class="card mb-4">
                    <div class="card-header bg-danger-light">
                        <h3 class="card-title text-danger-dark">💉 Pending & Overdue Vaccinations</h3>
                        <span class="badge badge-danger">${data.overdue_vaccinations.length} pending</span>
                    </div>
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Child Name</th>
                                    <th>Parent Phone</th>
                                    <th>Vaccine</th>
                                    <th>Status</th>
                                    <th>Due Date</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.overdue_vaccinations.map(item => `
                                    <tr>
                                        <td><strong>${Utils.escapeHtml(item.child_name || 'N/A')}</strong></td>
                                        <td>${Utils.escapeHtml(item.parent_phone || 'N/A')}</td>
                                        <td>${Utils.escapeHtml(item.vaccine_name)}</td>
                                        <td>
                                            <span class="badge ${item.vax_status === 'Delayed' ? 'badge-danger' : 'badge-warning'}">
                                                ${item.vax_status}
                                            </span>
                                        </td>
                                        <td class="${item.vax_status === 'Delayed' ? 'text-danger' : ''}">${Utils.formatDate(item.due_date)}</td>
                                        <td>
                                            <button onclick="App.navigate('vaccinations', {id: ${item.child_id}})" class="btn btn-sm btn-secondary">View</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            ` : ''}

            <!-- Children List -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">👶 My Children</h3>
                    <button onclick="App.navigate('add-child')" class="btn btn-primary btn-sm">
                        + Add Child
                    </button>
                </div>
                
                ${children.length === 0 ? `
                    <div class="text-center" style="padding: 3rem;">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" width="64" height="64" style="color: var(--text-muted); margin-bottom: 1rem;">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M8 15h8"/>
                            <circle cx="9" cy="9" r="1"/><circle cx="15" cy="9" r="1"/>
                        </svg>
                        <h4>No children registered yet</h4>
                        <p class="text-muted">Add your first child to start tracking their health.</p>
                        <button onclick="App.navigate('add-child')" class="btn btn-primary mt-3">
                            Add Your First Child
                        </button>
                    </div>
                ` : `
                    <div class="grid grid-3">
                        ${children.map(child => `
                            <div class="card" style="cursor: pointer;" onclick="App.navigate('child-profile', {id: ${child.id}})">
                                <div class="d-flex align-center gap-2 mb-3">
                                    <div class="user-avatar" style="width: 56px; height: 56px; font-size: 1.5rem;">
                                        ${child.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 style="margin: 0;">${Utils.escapeHtml(child.name)}</h4>
                                        <span class="text-muted">${Utils.formatAge(child.dob)} • ${child.gender}</span>
                                    </div>
                                </div>
                                <div class="d-flex justify-between align-center">
                                    ${Utils.getStatusBadge(child.nutritionStatus || 'Normal')}
                                    <span class="text-muted" style="font-size: 0.75rem;">
                                        ${child.pending_vaccinations || 0} vaccines pending
                                    </span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        `;
    },

    /**
     * Render Children List Page
     */
    async renderChildrenPage() {
        const app = document.getElementById('app');

        app.innerHTML = `
            ${this.renderSidebar('children')}
            <main class="main-content">
                <div class="d-flex justify-between align-center mb-4">
                    <h1>My Children</h1>
                    <button onclick="App.navigate('add-child')" class="btn btn-primary">
                        + Add Child
                    </button>
                </div>
                
                <div id="children-list">
                    <div class="d-flex align-center gap-2">
                        <div class="spinner"></div>
                        <span class="text-muted">Loading children...</span>
                    </div>
                </div>
            </main>
        `;

        // Load children
        try {
            const response = await API.children.getAll();
            this.renderChildrenList(response.children || []);
        } catch (error) {
            document.getElementById('children-list').innerHTML = `
                <div class="alert alert-danger">
                    Failed to load children: ${Utils.escapeHtml(error.message)}
                </div>
            `;
        }
    },

    /**
     * Render children list content
     */
    renderChildrenList(children) {
        const container = document.getElementById('children-list');
        if (!container) return;

        if (children.length === 0) {
            container.innerHTML = `
                <div class="card text-center" style="padding: 3rem;">
                    <h3>No children registered</h3>
                    <p class="text-muted">Start by adding your first child.</p>
                    <button onclick="App.navigate('add-child')" class="btn btn-primary mt-3">
                        Add Child
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Age</th>
                            <th>Gender</th>
                            <th>Nutrition Status</th>
                            <th>Vaccinations</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${children.map(child => `
                            <tr>
                                <td>
                                    <div class="d-flex align-center gap-1">
                                        <div class="user-avatar" style="width: 36px; height: 36px; font-size: 0.9rem;">
                                            ${child.name.charAt(0).toUpperCase()}
                                        </div>
                                        <strong>${Utils.escapeHtml(child.name)}</strong>
                                    </div>
                                </td>
                                <td>${Utils.formatAge(child.dob)}</td>
                                <td>${child.gender}</td>
                                <td>${Utils.getStatusBadge(child.nutritionStatus || 'Normal')}</td>
                                <td>
                                    <span class="text-muted">${child.completed_vaccinations || 0}/${child.total_vaccinations || 0}</span>
                                </td>
                                <td>
                                    <button onclick="App.navigate('child-profile', {id: ${child.id}})" 
                                            class="btn btn-sm btn-secondary">
                                        View
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    /**
     * Render Add Child Page
     */
    async renderAddChildPage() {
        const app = document.getElementById('app');

        app.innerHTML = `
            ${this.renderSidebar('children')}
            <main class="main-content">
                <div class="container-md">
                    <h1 class="mb-4">Add New Child</h1>
                    
                    <div class="card">
                        <form id="add-child-form">
                            <div class="grid grid-2">
                                <div class="form-group">
                                    <label class="form-label" for="child-name">Child's Name *</label>
                                    <input type="text" id="child-name" name="name" class="form-control" 
                                           placeholder="Enter child's full name" required>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label" for="child-dob">Date of Birth *</label>
                                    <input type="date" id="child-dob" name="dob" class="form-control" 
                                           max="${new Date().toISOString().split('T')[0]}" required>
                                </div>
                            </div>
                            
                            <div class="grid grid-2">
                                <div class="form-group">
                                    <label class="form-label" for="child-gender">Gender *</label>
                                    <select id="child-gender" name="gender" class="form-control" required>
                                        <option value="">Select gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label" for="child-blood-group">Blood Group</label>
                                    <select id="child-blood-group" name="blood_group" class="form-control">
                                        <option value="">Select blood group</option>
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label" for="child-allergies">Known Allergies</label>
                                <textarea id="child-allergies" name="allergies" class="form-control" 
                                          rows="2" placeholder="e.g., Milk, Peanuts, Gluten (leave empty if none)"></textarea>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label" for="child-conditions">Medical Conditions</label>
                                <textarea id="child-conditions" name="medical_conditions" class="form-control" 
                                          rows="2" placeholder="e.g., Asthma, Diabetes (leave empty if none)"></textarea>
                            </div>

                            <!-- Vaccination Checklist -->
                            <div class="vax-checklist-section mt-4 pt-4 border-top">
                                <h3 class="h5 mb-3">Vaccination History</h3>
                                <p class="text-muted small mb-3">Mark vaccinations the child has already received.</p>
                                <div id="vax-history-container" class="border rounded">
                                    <div class="p-4 text-center text-muted">Loading schedule...</div>
                                </div>
                            </div>
                            
                            <div id="add-child-actions" class="d-flex gap-2 mt-4">
                                <button type="submit" class="btn btn-success">
                                    Save Child
                                </button>
                                <button type="button" onclick="App.navigate('children')" class="btn btn-secondary">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        `;

        // Fetch vaccination schedule to show in form
        let vaxSchedule = [];
        try {
            const response = await API.vaccinations.getSchedule();
            vaxSchedule = response.schedules || [];

            const vaxContainer = document.getElementById('vax-history-container');
            if (vaxContainer) {
                vaxContainer.innerHTML = vaxSchedule.map(vax => `
                    <div class="vax-check-item d-flex justify-between align-center p-2 border-bottom">
                        <div>
                            <div class="fw-medium">${Utils.escapeHtml(vax.vaccine_name)}</div>
                            <small class="text-muted">${vax.dose || ''} (${vax.age_weeks ? vax.age_weeks + 'w' : vax.age_months ? vax.age_months + 'm' : vax.age_years + 'y'})</small>
                        </div>
                        <div class="d-flex gap-2">
                            <label class="btn-check-label">
                                <input type="radio" name="vax-${vax.id}" value="completed" class="vax-radio">
                                <span>Completed</span>
                            </label>
                            <label class="btn-check-label">
                                <input type="radio" name="vax-${vax.id}" value="pending" class="vax-radio" checked>
                                <span>Pending</span>
                            </label>
                        </div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Failed to load vax schedule:', error);
        }

        // Form handler
        document.getElementById('add-child-form').addEventListener('submit', async (e) => {
            e.preventDefault();

            // Collect vaccination statuses
            const vaccinations = [];
            vaxSchedule.forEach(vax => {
                const selected = document.querySelector(`input[name="vax-${vax.id}"]:checked`);
                if (selected) {
                    vaccinations.push({
                        schedule_id: vax.id,
                        status: selected.value
                    });
                }
            });

            const formData = {
                name: document.getElementById('child-name').value.trim(),
                dob: document.getElementById('child-dob').value,
                gender: document.getElementById('child-gender').value,
                blood_group: document.getElementById('child-blood-group').value,
                allergies: document.getElementById('child-allergies').value.trim(),
                medical_conditions: document.getElementById('child-conditions').value.trim(),
                vaccinations: vaccinations
            };

            try {
                Utils.showLoading();
                await API.children.create(formData);
                Utils.showToast('Child added successfully!', 'success');
                App.navigate('children');
            } catch (error) {
                Utils.showToast(error.message || 'Failed to add child', 'error');
            } finally {
                Utils.hideLoading();
            }
        });
    },

    /**
     * Render Child Profile Page
     */
    async renderChildProfilePage(childId) {
        const app = document.getElementById('app');

        app.innerHTML = `
            ${this.renderSidebar('children')}
            <main class="main-content">
                <div id="child-profile-content">
                    <div class="d-flex align-center gap-2">
                        <div class="spinner"></div>
                        <span class="text-muted">Loading profile...</span>
                    </div>
                </div>
            </main>
        `;

        try {
            const response = await API.children.getById(childId);
            this.renderChildProfile(response.child);
        } catch (error) {
            document.getElementById('child-profile-content').innerHTML = `
                <div class="alert alert-danger">
                    Failed to load child profile: ${Utils.escapeHtml(error.message)}
                </div>
                <button onclick="App.navigate('children')" class="btn btn-secondary mt-3">
                    Back to Children
                </button>
            `;
        }
    },

    /**
     * Render child profile content
     */
    renderChildProfile(child) {
        const container = document.getElementById('child-profile-content');
        if (!container) return;

        container.innerHTML = `
            <div class="d-flex justify-between align-center mb-4">
                <div class="d-flex align-center gap-2">
                    <button onclick="App.navigate('children')" class="btn btn-secondary btn-sm">
                        ← Back
                    </button>
                    <h1 style="margin: 0;">${Utils.escapeHtml(child.name)}</h1>
                    ${Utils.getStatusBadge(child.nutritionStatus || 'Normal')}
                </div>
            </div>
            
            <!-- Profile Header -->
            <div class="card mb-4">
                <div class="d-flex gap-3">
                    <div class="user-avatar" style="width: 80px; height: 80px; font-size: 2rem;">
                        ${child.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 style="margin: 0 0 0.5rem 0;">${Utils.escapeHtml(child.name)}</h2>
                        <p class="text-muted" style="margin: 0;">
                            ${Utils.formatAge(child.dob)} • ${child.gender} 
                            ${child.blood_group ? `• Blood Group: ${child.blood_group}` : ''}
                        </p>
                        <p class="text-muted" style="margin: 0.5rem 0 0 0; font-size: 0.875rem;">
                            DOB: ${Utils.formatDate(child.dob)} <br>
                            ${child.parent_phone ? `Parent Phone: <strong>${Utils.escapeHtml(child.parent_phone)}</strong>` : ''}
                        </p>
                        ${child.allergies ? `
                            <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem;">
                                <strong>Allergies:</strong> ${Utils.escapeHtml(child.allergies)}
                            </p>
                        ` : ''}
                    </div>
                </div>
            </div>
            
            <!-- Quick Actions -->
            <div class="stats-grid mb-4">
                <div class="card" style="cursor: pointer;" onclick="App.navigate('growth-entry', {id: ${child.id}})">
                    <div class="d-flex align-center gap-2">
                        <div class="stat-icon primary">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="20" x2="12" y2="4"/>
                                <polyline points="6 10 12 4 18 10"/>
                            </svg>
                        </div>
                        <div>
                            <h4 style="margin: 0;">Add Growth Data</h4>
                            <span class="text-muted">Height & Weight</span>
                        </div>
                    </div>
                </div>
                
                <div class="card" style="cursor: pointer;" onclick="App.navigate('blood-report', {id: ${child.id}})">
                    <div class="d-flex align-center gap-2">
                        <div class="stat-icon danger">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 2.69l.94 1.06a16.4 16.4 0 0 1 3.33 6A8 8 0 1 1 5.73 9.75a16.4 16.4 0 0 1 3.33-6L12 2.69z"/>
                            </svg>
                        </div>
                        <div>
                            <h4 style="margin: 0;">Blood Report</h4>
                            <span class="text-muted">Add & Analyze</span>
                        </div>
                    </div>
                </div>
                
                <div class="card" style="cursor: pointer;" onclick="App.navigate('vaccinations', {id: ${child.id}})">
                    <div class="d-flex align-center gap-2">
                        <div class="stat-icon success">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                            </svg>
                        </div>
                        <div>
                            <h4 style="margin: 0;">Vaccinations</h4>
                            <span class="text-muted">${child.completedVaccinations || 0}/${child.totalVaccinations || 0} completed</span>
                        </div>
                    </div>
                </div>
                
                <div class="card" style="cursor: pointer;" onclick="App.navigate('nutrition', {id: ${child.id}})">
                    <div class="d-flex align-center gap-2">
                        <div class="stat-icon warning">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
                                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
                                <line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/>
                                <line x1="14" y1="1" x2="14" y2="4"/>
                            </svg>
                        </div>
                        <div>
                            <h4 style="margin: 0;">Nutrition Plan</h4>
                            <span class="text-muted">View Recommendations</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Growth History -->
            <div class="card mb-4">
                <div class="card-header">
                    <h3 class="card-title">📈 Recent Growth Records</h3>
                </div>
                ${child.growthRecords && child.growthRecords.length > 0 ? `
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Height (cm)</th>
                                    <th>Weight (kg)</th>
                                    <th>BMI</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${child.growthRecords.slice(0, 5).map(record => `
                                    <tr>
                                        <td>${Utils.formatDate(record.recorded_date)}</td>
                                        <td>${record.height_cm}</td>
                                        <td>${record.weight_kg}</td>
                                        <td>${Utils.calculateBMI(record.weight_kg, record.height_cm)}</td>
                                        <td>${Utils.getStatusBadge(record.assessment_result || 'Normal')}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : `
                    <p class="text-muted text-center" style="padding: 2rem;">
                        No growth records yet. 
                        <a href="#" onclick="App.navigate('growth-entry', {id: ${child.id}})">Add first record</a>
                    </p>
                `}
            </div>
        `;
    },

    /**
     * Render Health Center Dashboard
     */
    async renderHealthCenterDashboard() {
        const app = document.getElementById('app');
        const user = Auth.getUser();

        app.innerHTML = `
            ${this.renderSidebar('dashboard')}
            <main class="main-content">
                <h1>Health Center Dashboard</h1>
                <p class="text-muted mb-4">Region: ${Utils.escapeHtml(user?.region || 'All')}</p>
                
                <div id="hc-dashboard-content">
                    <div class="d-flex align-center gap-2">
                        <div class="spinner"></div>
                        <span class="text-muted">Loading regional data...</span>
                    </div>
                </div>
            </main>
        `;

        // Load HC dashboard data
        try {
            const data = await API.dashboard.getHealthCenterStats();
            this.renderHCDashboardContent(data);
        } catch (error) {
            document.getElementById('hc-dashboard-content').innerHTML = `
                <div class="alert alert-danger">
                    Failed to load dashboard: ${Utils.escapeHtml(error.message)}
                </div>
            `;
        }
    },

    /**
     * Render HC Dashboard Content
     */
    renderHCDashboardContent(data) {
        const container = document.getElementById('hc-dashboard-content');
        if (!container) return;

        const stats = data.stats || {};

        container.innerHTML = `
            <div class="stats-grid mb-4">
                <div class="stat-card">
                    <div class="stat-icon primary">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                        </svg>
                    </div>
                    <div class="stat-content">
                        <h3>${stats.totalChildren || 0}</h3>
                        <p>Total Children</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon warning">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        </svg>
                    </div>
                    <div class="stat-content">
                        <h3>${stats.malnourishedChildren || 0}</h3>
                        <p>Malnourished</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon danger">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                    </div>
                    <div class="stat-content">
                        <h3>${stats.overdueVaccinations || 0}</h3>
                        <p>Overdue Vaccinations</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon success">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                        </svg>
                    </div>
                    <div class="stat-content">
                        <h3>${stats.bloodDeficiencies || 0}</h3>
                        <p>Blood Deficiencies</p>
                    </div>
                </div>
            </div>
            
            <!-- Overdue Vaccinations Alert Section -->
            ${data.overdue_vaccinations && data.overdue_vaccinations.length > 0 ? `
                <div class="card mb-4">
                    <div class="card-header bg-danger-light">
                        <h3 class="card-title text-danger-dark">💉 Overdue & Upcoming Vaccinations</h3>
                        <span class="badge badge-danger">${data.overdue_vaccinations.length} pending</span>
                    </div>
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Child Name</th>
                                    <th>Parent Phone</th>
                                    <th>Vaccine</th>
                                    <th>Status</th>
                                    <th>Due Date</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.overdue_vaccinations.map(item => `
                                    <tr>
                                        <td>
                                            <strong>${Utils.escapeHtml(item.child_name || 'N/A')}</strong>
                                            <div class="small text-muted">${Utils.escapeHtml(item.parent_name || '')}</div>
                                        </td>
                                        <td>${Utils.escapeHtml(item.parent_phone || 'N/A')}</td>
                                        <td>${Utils.escapeHtml(item.vaccine_name)}</td>
                                        <td>
                                            <span class="badge ${item.vax_status === 'Delayed' ? 'badge-danger' : 'badge-warning'}">
                                                ${item.vax_status}
                                            </span>
                                        </td>
                                        <td class="${item.vax_status === 'Delayed' ? 'text-danger' : ''}">${Utils.formatDate(item.due_date)}</td>
                                        <td>
                                            <button onclick="App.navigate('child-profile', {id: ${item.child_id}})" class="btn btn-sm btn-secondary">View</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            ` : ''}

            <div class="alert alert-info">
                <strong>Read-Only Access:</strong> As a Health Center, you can view regional data but cannot modify individual records.
            </div>
        `;
    },

    /**
     * Render WHO Dashboard
     */
    async renderWhoDashboard() {
        const app = document.getElementById('app');

        app.innerHTML = `
            ${this.renderSidebar('dashboard')}
            <main class="main-content">
                <h1>WHO Dashboard</h1>
                <p class="text-muted mb-4">State-wide analytics and oversight</p>
                
                <div id="who-dashboard-content">
                    <div class="d-flex align-center gap-2">
                        <div class="spinner"></div>
                        <span class="text-muted">Loading state-wide data...</span>
                    </div>
                </div>
            </main>
        `;

        try {
            const data = await API.dashboard.getWhoStats();
            this.renderWhoDashboardContent(data);
        } catch (error) {
            document.getElementById('who-dashboard-content').innerHTML = `
                <div class="alert alert-danger">
                    Failed to load dashboard: ${Utils.escapeHtml(error.message)}
                </div>
            `;
        }
    },

    /**
     * Render WHO Dashboard Content
     */
    renderWhoDashboardContent(data) {
        const container = document.getElementById('who-dashboard-content');
        if (!container) return;

        const stats = data.stats || {};

        container.innerHTML = `
            <div class="stats-grid mb-4">
                <div class="stat-card">
                    <div class="stat-icon primary">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                        </svg>
                    </div>
                    <div class="stat-content">
                        <h3>${stats.totalChildren || 0}</h3>
                        <p>Total Children (All Regions)</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon success">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                            <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                    </div>
                    <div class="stat-content">
                        <h3>${stats.vaccinationRate || 0}%</h3>
                        <p>Vaccination Rate</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon warning">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        </svg>
                    </div>
                    <div class="stat-content">
                        <h3>${stats.malnutritionRate || 0}%</h3>
                        <p>Malnutrition Rate</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon danger">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                        </svg>
                    </div>
                    <div class="stat-content">
                        <h3>${stats.criticalCases || 0}</h3>
                        <p>Critical Cases</p>
                    </div>
                </div>
            </div>
            
            <!-- Overdue Vaccinations Alert Section -->
            ${data.overdue_vaccinations && data.overdue_vaccinations.length > 0 ? `
                <div class="card mb-4">
                    <div class="card-header bg-danger-light">
                        <h3 class="card-title text-danger-dark">🚨 State-wide Pending & Overdue Vaccinations</h3>
                        <span class="badge badge-danger">${data.overdue_vaccinations.length} pending</span>
                    </div>
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Child Name</th>
                                    <th>Location</th>
                                    <th>Vaccine</th>
                                    <th>Status</th>
                                    <th>Due Date</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.overdue_vaccinations.map(item => `
                                    <tr>
                                        <td>
                                            <strong>${Utils.escapeHtml(item.child_name || 'N/A')}</strong>
                                            <div class="small text-muted">Parent: ${Utils.escapeHtml(item.parent_name || 'N/A')}</div>
                                        </td>
                                        <td><span class="text-primary">${Utils.escapeHtml(item.district || 'N/A')}</span></td>
                                        <td>${Utils.escapeHtml(item.vaccine_name)}</td>
                                        <td>
                                            <span class="badge ${item.vax_status === 'Delayed' ? 'badge-danger' : 'badge-warning'}">
                                                ${item.vax_status}
                                            </span>
                                        </td>
                                        <td class="${item.vax_status === 'Delayed' ? 'text-danger' : ''}">${Utils.formatDate(item.due_date)}</td>
                                        <td>
                                            <button onclick="App.navigate('child-profile', {id: ${item.child_id}})" class="btn btn-sm btn-secondary">View</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            ` : ''}
            
            <div class="alert alert-info">
                <strong>Read-Only Access:</strong> As WHO, you have oversight access to all regional data for analytics purposes.
            </div>
        `;
    },

    /**
     * Render Growth Entry Page
     */
    async renderGrowthEntryPage(childId) {
        const app = document.getElementById('app');

        app.innerHTML = `
            ${this.renderSidebar('children')}
            <main class="main-content">
                <div class="d-flex align-center gap-2">
                    <div class="spinner"></div>
                    <span class="text-muted">Loading...</span>
                </div>
            </main>
        `;

        try {
            const response = await API.children.getById(childId);
            const child = response.child;

            app.innerHTML = `
                ${this.renderSidebar('children')}
                <main class="main-content">
                    ${Pages.renderGrowthEntry(child)}
                </main>
            `;

            Pages.initGrowthForm(child);
        } catch (error) {
            Utils.showToast(error.message || 'Failed to load', 'error');
            this.navigate('children');
        }
    },

    /**
     * Render Blood Report Page
     */
    async renderBloodReportPage(childId) {
        const app = document.getElementById('app');

        app.innerHTML = `
            ${this.renderSidebar('children')}
            <main class="main-content">
                <div class="d-flex align-center gap-2">
                    <div class="spinner"></div>
                    <span class="text-muted">Loading...</span>
                </div>
            </main>
        `;

        try {
            const [childResponse, bloodResponse] = await Promise.all([
                API.children.getById(childId),
                API.blood.getByChildId(childId)
            ]);

            const child = childResponse.child;
            const reports = bloodResponse.reports || [];

            app.innerHTML = `
                ${this.renderSidebar('children')}
                <main class="main-content">
                    ${Pages.renderBloodReport(child, reports)}
                </main>
            `;

            Pages.initBloodForm(child, reports);
        } catch (error) {
            Utils.showToast(error.message || 'Failed to load', 'error');
            this.navigate('children');
        }
    },

    /**
     * Render Vaccinations Page
     */
    async renderVaccinationsPage(childId) {
        const app = document.getElementById('app');

        app.innerHTML = `
            ${this.renderSidebar('children')}
            <main class="main-content">
                <div class="d-flex align-center gap-2">
                    <div class="spinner"></div>
                    <span class="text-muted">Loading vaccinations...</span>
                </div>
            </main>
        `;

        try {
            const [childResponse, vaxResponse] = await Promise.all([
                API.children.getById(childId),
                API.vaccinations.getByChildId(childId)
            ]);

            const child = childResponse.child;
            const vaccinations = vaxResponse.vaccinations || [];

            app.innerHTML = `
                ${this.renderSidebar('children')}
                <main class="main-content">
                    ${Pages.renderVaccinations(child, vaccinations)}
                </main>
            `;
        } catch (error) {
            Utils.showToast(error.message || 'Failed to load', 'error');
            this.navigate('children');
        }
    },

    /**
     * Render Nutrition Page
     */
    async renderNutritionPage(childId) {
        const app = document.getElementById('app');

        app.innerHTML = `
            ${this.renderSidebar('children')}
            <main class="main-content">
                <div class="d-flex align-center gap-2">
                    <div class="spinner"></div>
                    <span class="text-muted">Loading nutrition plans...</span>
                </div>
            </main>
        `;

        try {
            const [childResponse, nutritionResponse] = await Promise.all([
                API.children.getById(childId),
                API.nutrition.getRecommendations(childId)
            ]);

            const child = childResponse.child;
            const recommendations = nutritionResponse.recommendations || {};

            app.innerHTML = `
                ${this.renderSidebar('children')}
                <main class="main-content">
                    ${Pages.renderNutrition(child, recommendations)}
                </main>
            `;
        } catch (error) {
            Utils.showToast(error.message || 'Failed to load', 'error');
            this.navigate('children');
        }
    },

    /**
     * Render Alerts Page
     */
    async renderAlertsPage() {
        const app = document.getElementById('app');

        app.innerHTML = `
            ${this.renderSidebar('alerts')}
            <main class="main-content">
                <h1>Alerts & Notifications</h1>
                <p class="text-muted mb-4">Stay updated on your children's health status</p>
                
                <div id="alerts-content">
                    <div class="d-flex align-center gap-2">
                        <div class="spinner"></div>
                        <span class="text-muted">Loading alerts...</span>
                    </div>
                </div>
            </main>
        `;

        try {
            const response = await API.alerts.getAll();
            const alerts = response.alerts || [];
            const overdue_vaccinations = response.overdue_vaccinations || [];

            const container = document.getElementById('alerts-content');
            let contentHtml = '';

            // 1. Overdue Vaccinations Section (from live records)
            if (overdue_vaccinations.length > 0) {
                contentHtml += `
                    <div class="card shadow-sm border-0 overflow-hidden mb-4">
                        <div class="card-header bg-danger-light" style="border-bottom: 1px solid rgba(220,53,69,0.15);">
                            <h3 class="card-title text-danger-dark mb-0 fw-bold">💉 Pending & Overdue Vaccinations</h3>
                        </div>
                        <div class="table-container">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Child Name</th>
                                        <th>Vaccine</th>
                                        <th>Status</th>
                                        <th>Due Date</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${overdue_vaccinations.map(item => `
                                        <tr>
                                            <td><strong>${Utils.escapeHtml(item.child_name || 'N/A')}</strong></td>
                                            <td>${Utils.escapeHtml(item.vaccine_name)}</td>
                                            <td>
                                                <span class="badge ${item.vax_status === 'Delayed' ? 'badge-danger' : 'badge-warning'}">
                                                    ${item.vax_status}
                                                </span>
                                            </td>
                                            <td class="${item.vax_status === 'Delayed' ? 'text-danger' : ''}">${Utils.formatDate(item.due_date)}</td>
                                            <td>
                                                <button onclick="App.navigate('child-profile', {id: ${item.child_id}})" class="btn btn-sm btn-secondary">View</button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            }

            if (contentHtml === '') {
                contentHtml = `
                    <div class="card text-center" style="padding: 3rem;">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" width="64" height="64" style="color: var(--success); margin: 0 auto 1rem;">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                            <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                        <h3>All Clear!</h3>
                        <p class="text-muted">No pending alerts at the moment.</p>
                    </div>
                `;
            }
            container.innerHTML = contentHtml;
        } catch (error) {
            document.getElementById('alerts-content').innerHTML = `
                <div class="alert alert-danger">
                    Failed to load alerts: ${Utils.escapeHtml(error.message)}
                </div>
            `;
        }
    },

    /**
     * Render User Profile Page
     */
    async renderUserProfilePage() {
        const app = document.getElementById('app');
        let user = Auth.getUser();

        // Refresh user data from API to ensure we have the latest (including phone)
        try {
            const response = await API.auth.getProfile();
            if (response.success) {
                user = response.user;
                Auth.updateUser(user);
            }
        } catch (error) {
            console.error('Failed to refresh profile:', error);
        }

        app.innerHTML = `
            ${this.renderSidebar('user-profile')}
            <main class="main-content">
                <div class="container-md">
                    <h1 class="mb-4">My Profile</h1>
                    
                    <div class="card mb-4">
                        <div class="d-flex align-center gap-3">
                            <div class="user-avatar" style="width: 80px; height: 80px; font-size: 2rem;">
                                ${user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 style="margin: 0;">${Utils.escapeHtml(user.name)}</h2>
                                <p class="text-muted" style="margin: 0.5rem 0 0 0;">
                                    ${user.role.replace('_', ' ').toUpperCase()}
                                    ${user.region ? `• ${Utils.escapeHtml(user.region)}` : ''}
                                </p>
                            </div>
                        </div>
                        
                        <hr class="my-4">
                        
                        <div class="grid grid-2">
                            <div>
                                <label class="text-muted">Username</label>
                                <p><strong>${Utils.escapeHtml(user.username)}</strong></p>
                            </div>
                            <div>
                                <label class="text-muted">Email</label>
                                <p><strong>${Utils.escapeHtml(user.email || 'Not provided')}</strong></p>
                            </div>
                            <div>
                                <label class="text-muted">Phone</label>
                                <p><strong>${Utils.escapeHtml(user.phone || 'Not provided')}</strong></p>
                            </div>
                            <div>
                                <label class="text-muted">Region</label>
                                <p><strong>${Utils.escapeHtml(user.region || 'Global')}</strong></p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card" style="border-left: 4px solid var(--danger);">
                        <h3 class="text-danger">Danger Zone</h3>
                        <p class="text-muted mb-4">
                            Deleting your account is permanent. 
                            ${user.role === 'parent'
                ? 'All data associated with your children (growth records, vaccinations, etc.) will also be permanently deleted.'
                : 'Your account access will be revoked immediately.'}
                        </p>
                        
                        <button onclick="Auth.confirmDeleteAccount()" class="btn btn-danger">
                            Delete My Account
                        </button>
                    </div>
                </div>
            </main>
        `;
    },

    /**
     * Dismiss an alert
     */
    async dismissAlert(alertId) {
        try {
            await API.alerts.dismiss(alertId);
            Utils.showToast('Alert dismissed', 'success');
            this.renderAlertsPage();
        } catch (error) {
            Utils.showToast(error.message || 'Failed to dismiss', 'error');
        }
    },

    /**
     * Render Reports Page (Health Center)
     */
    async renderReportsPage() {
        const app = document.getElementById('app');
        const user = Auth.getUser();

        app.innerHTML = `
            ${this.renderSidebar('reports')}
            <main class="main-content">
                <h1>Health Center Reports</h1>
                <p class="text-muted mb-4">Detailed health reports for ${Utils.escapeHtml(user?.region || 'your region')}</p>
                
                <div id="reports-content">
                    <div class="d-flex align-center gap-2">
                        <div class="spinner"></div>
                        <span class="text-muted">Generating reports...</span>
                    </div>
                </div>
            </main>
        `;

        try {
            const data = await API.dashboard.getHealthCenterReports();
            this.renderReportsContent(data.reports);
        } catch (error) {
            document.getElementById('reports-content').innerHTML = `
                <div class="alert alert-danger">
                    Failed to load reports: ${Utils.escapeHtml(error.message)}
                </div>
            `;
        }
    },

    /**
     * Render reports content
     */
    renderReportsContent(reports) {
        const container = document.getElementById('reports-content');
        if (!container) return;

        const { malnourished, overdue_vaccinations, blood_deficiencies } = reports;

        container.innerHTML = `
            <!-- Malnutrition Report -->
            <div class="card mb-4">
                <div class="card-header bg-warning-light">
                    <h3 class="card-title text-warning-dark">⚠️ Malnutrition Cases</h3>
                    <span class="badge badge-warning">${malnourished.length} cases</span>
                </div>
                ${malnourished.length === 0 ? '<p class="text-muted p-3">No malnutrition cases found.</p>' : `
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Child Name</th>
                                    <th>Parent Phone</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${malnourished.map(child => `
                                    <tr>
                                        <td>${Utils.escapeHtml(child.name)}</td>
                                        <td>${Utils.escapeHtml(child.parent_phone || 'N/A')}</td>
                                        <td><span class="badge badge-warning">${child.assessment_result}</span></td>
                                        <td>
                                            <button onclick="App.navigate('child-profile', {id: ${child.id}})" class="btn btn-sm btn-secondary">View</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>

            <!-- Overdue Vaccinations Report -->
            <div class="card mb-4">
                <div class="card-header bg-danger-light">
                    <h3 class="card-title text-danger-dark">💉 Overdue Vaccinations</h3>
                    <span class="badge badge-danger">${overdue_vaccinations.length} pending</span>
                </div>
                ${overdue_vaccinations.length === 0 ? '<p class="text-muted p-3">No overdue vaccinations.</p>' : `
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Child Name</th>
                                    <th>Parent Phone</th>
                                    <th>Vaccine</th>
                                    <th>Due Date</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${overdue_vaccinations.map(item => `
                                    <tr>
                                        <td>${Utils.escapeHtml(item.name)}</td>
                                        <td>${Utils.escapeHtml(item.parent_phone || 'N/A')}</td>
                                        <td>${Utils.escapeHtml(item.vaccine_name)}</td>
                                        <td class="text-danger">${Utils.formatDate(item.alert_start_date || item.due_date)}</td>
                                        <td>
                                            <button onclick="App.navigate('child-profile', {id: ${item.id}})" class="btn btn-sm btn-secondary">View</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>

            <!-- Blood Deficiencies Report -->
            <div class="card mb-4">
                <div class="card-header bg-info-light">
                    <h3 class="card-title text-info-dark">🩸 Blood Deficiencies</h3>
                    <span class="badge badge-info">${blood_deficiencies.length} cases</span>
                </div>
                ${blood_deficiencies.length === 0 ? '<p class="text-muted p-3">No deficiency cases found.</p>' : `
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Child Name</th>
                                    <th>Parent Phone</th>
                                    <th>Issues</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${blood_deficiencies.map(child => `
                                    <tr>
                                        <td>${Utils.escapeHtml(child.name)}</td>
                                        <td>${Utils.escapeHtml(child.parent_phone || 'N/A')}</td>
                                        <td>${Utils.escapeHtml(child.analysis_result).substring(0, 50)}...</td>
                                        <td>
                                            <button onclick="App.navigate('child-profile', {id: ${child.id}})" class="btn btn-sm btn-secondary">View</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        `;
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());

// Make App available globally
window.App = App;
