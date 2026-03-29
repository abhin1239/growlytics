/**
 * Configuration Constants
 */
const CONFIG = {
    API_BASE_URL: 'http://localhost:5000/api',
    APP_NAME: 'GROWLYTICS',
    VERSION: '1.0.0',

    // Session timeout in milliseconds (30 minutes)
    SESSION_TIMEOUT: 30 * 60 * 1000,

    // Roles
    ROLES: {
        PARENT: 'parent',
        HEALTH_CENTER: 'health_center',
        WHO: 'who'
    },

    // Alert thresholds
    VACCINATION_ALERT_DAYS: 30,

    // Malnutrition categories
    NUTRITION_STATUS: {
        NORMAL: 'Normal',
        MAM: 'Moderate Acute Malnutrition',
        SAM: 'Severe Acute Malnutrition',
        OVERWEIGHT: 'Overweight',
        OBESE: 'Obese'
    },

    // Blood parameter status
    BLOOD_STATUS: {
        NORMAL: 'Normal',
        BORDERLINE: 'Borderline',
        DEFICIENT: 'Deficient',
        ELEVATED: 'Elevated',
        CRITICAL: 'Critical'
    },

    // Kerala regions
    REGIONS: [
        'Thiruvananthapuram',
        'Kollam',
        'Pathanamthitta',
        'Alappuzha',
        'Kottayam',
        'Idukki',
        'Ernakulam',
        'Thrissur',
        'Palakkad',
        'Malappuram',
        'Kozhikode',
        'Wayanad',
        'Kannur',
        'Kasaragod'
    ]
};

// Make config immutable
Object.freeze(CONFIG);
Object.freeze(CONFIG.ROLES);
Object.freeze(CONFIG.NUTRITION_STATUS);
Object.freeze(CONFIG.BLOOD_STATUS);
Object.freeze(CONFIG.REGIONS);
