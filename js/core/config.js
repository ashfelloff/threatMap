const CONFIG = {
    // Application Settings
    APP_NAME: 'Digital Security Mapper',
    VERSION: '1.0.0',
    DEBUG: true,
    
    // Canvas Settings
    CANVAS: {
        NODE_RADIUS: 30,
        NODE_SPACING: 120,
        FORCE_STRENGTH: -400,
        FORCE_DISTANCE: 100,
        ANIMATION_DURATION: 300
    },
    
    // Security Levels
    SECURITY_LEVELS: {
        PASSLESS: {
            id: 'passless',
            name: 'Passless Authentication',
            level: 8,
            color: '#15803d'
        },
        CODELESS_2FA: {
            id: 'codeless2fa',
            name: 'Codeless 2FA',
            level: 7,
            color: '#16a34a'
        },
        APP_2FA: {
            id: 'app2fa',
            name: 'App-based 2FA',
            level: 6,
            color: '#059669'
        },
        SMS_2FA: {
            id: 'sms2fa',
            name: 'SMS 2FA',
            level: 5,
            color: '#0d9488'
        },
        PASSWORD_MANAGER: {
            id: 'passman',
            name: 'Password Manager',
            level: 4,
            color: '#0891b2'
        },
        QUALITY_PASSWORD: {
            id: 'qualpass',
            name: 'Quality Password',
            level: 3,
            color: '#0284c7'
        },
        SIMPLE_PASSWORD: {
            id: 'simplepass',
            name: 'Simple Password',
            level: 2,
            color: '#4f46e5'
        },
        SHARED_PASSWORD: {
            id: 'sharedpass',
            name: 'Shared Password',
            level: 1,
            color: '#7c3aed'
        }
    },

    // Account Types
    ACCOUNT_TYPES: {
        ROOT: {
            id: 'root',
            name: 'Root Account',
            description: 'Main identity provider'
        },
        LINKED: {
            id: 'linked',
            name: 'Linked Account',
            description: 'Connected to root account'
        },
        SERVICE: {
            id: 'service',
            name: 'Service',
            description: 'Connected service or application'
        }
    },

    // Common Services
    COMMON_SERVICES: {
        GMAIL: {
            id: 'gmail',
            name: 'Gmail',
            type: 'root',
            icon: '📧'
        },
        MICROSOFT: {
            id: 'microsoft',
            name: 'Microsoft',
            type: 'root',
            icon: '🪟'
        },
        APPLE: {
            id: 'apple',
            name: 'Apple ID',
            type: 'root',
            icon: '🍎'
        },
        STEAM: {
            id: 'steam',
            name: 'Steam',
            type: 'service',
            icon: '🎮'
        },
        NETFLIX: {
            id: 'netflix',
            name: 'Netflix',
            type: 'service',
            icon: '🎬'
        },
        SPOTIFY: {
            id: 'spotify',
            name: 'Spotify',
            type: 'service',
            icon: '🎵'
        }
    },

    // Security Recommendations
    SECURITY_RECOMMENDATIONS: {
        ENABLE_2FA: {
            id: 'enable2fa',
            title: 'Enable Two-Factor Authentication',
            priority: 'high'
        },
        USE_PASSWORD_MANAGER: {
            id: 'usepassman',
            title: 'Use a Password Manager',
            priority: 'high'
        },
        UNIQUE_PASSWORDS: {
            id: 'uniquepass',
            title: 'Use Unique Passwords',
            priority: 'medium'
        },
        REGULAR_REVIEW: {
            id: 'regreview',
            title: 'Regular Security Review',
            priority: 'low'
        }
    }
};

// Freeze the configuration to prevent modifications
Object.freeze(CONFIG); 