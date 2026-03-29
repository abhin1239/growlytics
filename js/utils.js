/**
 * Utility Functions
 */
const Utils = {
    /**
     * Format date to locale string
     */
    formatDate(dateStr, options = {}) {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            ...options
        });
    },

    /**
     * Calculate age from date of birth
     */
    calculateAge(dob) {
        const today = new Date();
        const birthDate = new Date(dob);

        let years = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth() - birthDate.getMonth();
        let days = today.getDate() - birthDate.getDate();

        if (days < 0) {
            months--;
            days += 30;
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        return { years, months, days };
    },

    /**
     * Format age as readable string
     */
    formatAge(dob) {
        const age = this.calculateAge(dob);
        if (age.years > 0) {
            return `${age.years}y ${age.months}m`;
        } else if (age.months > 0) {
            return `${age.months}m ${age.days}d`;
        }
        return `${age.days} days`;
    },

    /**
     * Calculate age in months
     */
    ageInMonths(dob) {
        const age = this.calculateAge(dob);
        return age.years * 12 + age.months;
    },

    /**
     * Show loading overlay
     */
    showLoading() {
        document.getElementById('loading-overlay')?.classList.remove('hidden');
    },

    /**
     * Hide loading overlay
     */
    hideLoading() {
        document.getElementById('loading-overlay')?.classList.add('hidden');
    },

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        // Remove existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;

        // Add toast styles if not already added
        if (!document.getElementById('toast-styles')) {
            const styles = document.createElement('style');
            styles.id = 'toast-styles';
            styles.textContent = `
                .toast {
                    position: fixed;
                    bottom: 2rem;
                    right: 2rem;
                    padding: 1rem 1.5rem;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    z-index: 10000;
                    animation: slideIn 0.3s ease;
                    max-width: 400px;
                }
                .toast button {
                    background: none;
                    border: none;
                    color: inherit;
                    font-size: 1.25rem;
                    cursor: pointer;
                    opacity: 0.7;
                }
                .toast button:hover { opacity: 1; }
                .toast-success { background: #059669; color: white; }
                .toast-error { background: #dc2626; color: white; }
                .toast-warning { background: #d97706; color: white; }
                .toast-info { background: #2563eb; color: white; }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => toast.remove(), 5000);
    },

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Validate email format
     */
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    /**
     * Validate phone number (Indian format)
     */
    isValidPhone(phone) {
        return /^[6-9]\d{9}$/.test(phone);
    },

    /**
     * Generate random ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Get status badge HTML
     */
    getStatusBadge(status) {
        const statusMap = {
            'Normal': 'success',
            'Completed': 'success',
            'Borderline': 'warning',
            'Pending': 'warning',
            'MAM': 'warning',
            'Moderate Acute Malnutrition': 'warning',
            'Deficient': 'danger',
            'Overdue': 'danger',
            'SAM': 'danger',
            'Severe Acute Malnutrition': 'danger',
            'Critical': 'danger'
        };

        const type = statusMap[status] || 'info';
        return `<span class="badge badge-${type}">${this.escapeHtml(status)}</span>`;
    },

    /**
     * Calculate BMI
     */
    calculateBMI(weightKg, heightCm) {
        if (!weightKg || !heightCm || heightCm === 0) return null;
        const heightM = heightCm / 100;
        return (weightKg / (heightM * heightM)).toFixed(2);
    },

    /**
     * Store data in localStorage
     */
    store(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Storage error:', e);
        }
    },

    /**
     * Retrieve data from localStorage
     */
    retrieve(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('Retrieval error:', e);
            return null;
        }
    },

    /**
     * Remove data from localStorage
     */
    remove(key) {
        localStorage.removeItem(key);
    },

    /**
     * Clear all localStorage
     */
    clearStorage() {
        localStorage.clear();
    }
};

// Make Utils available globally
window.Utils = Utils;
