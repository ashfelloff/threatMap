import store from '../core/store.js';
import eventBus from '../core/events.js';
import { CONFIG } from '../core/config.js';

class SecurityService {
    constructor() {
        this.store = store;
        this.eventBus = eventBus;
    }

    analyzeAccount(accountId) {
        const account = this.store.getState('accounts').get(accountId);
        if (!account) return null;

        const securityLevel = CONFIG.SECURITY_LEVELS[account.securityLevel.toUpperCase()];
        const recommendations = this.generateRecommendations(account);
        
        return {
            accountId,
            securityScore: this.calculateSecurityScore(account),
            securityLevel,
            recommendations,
            lastAnalyzed: Date.now()
        };
    }

    calculateSecurityScore(account) {
        const baseScore = CONFIG.SECURITY_LEVELS[account.securityLevel.toUpperCase()].level * 12.5;
        let modifiers = 0;

        // Add modifiers based on various factors
        if (account.type === 'root') modifiers -= 10;
        if (this.hasConnectedAccounts(account.id)) modifiers -= 5;

        return Math.max(0, Math.min(100, baseScore + modifiers));
    }

    hasConnectedAccounts(accountId) {
        const connections = this.store.getState('connections');
        return Array.from(connections.values()).some(
            conn => conn.source === accountId || conn.target === accountId
        );
    }

    generateRecommendations(account) {
        const recommendations = [];
        const securityLevel = CONFIG.SECURITY_LEVELS[account.securityLevel.toUpperCase()];

        if (securityLevel.level < 6) {
            recommendations.push(CONFIG.SECURITY_RECOMMENDATIONS.ENABLE_2FA);
        }

        if (securityLevel.level < 4) {
            recommendations.push(CONFIG.SECURITY_RECOMMENDATIONS.USE_PASSWORD_MANAGER);
        }

        if (account.securityLevel === 'sharedpass') {
            recommendations.push(CONFIG.SECURITY_RECOMMENDATIONS.UNIQUE_PASSWORDS);
        }

        return recommendations;
    }

    generateSecurityReport() {
        const accounts = this.store.getState('accounts');
        const analyses = new Map();

        for (const [id, account] of accounts) {
            analyses.set(id, this.analyzeAccount(id));
        }

        const report = {
            timestamp: Date.now(),
            overallScore: this.calculateOverallScore(analyses),
            accountAnalyses: analyses,
            globalRecommendations: this.generateGlobalRecommendations(analyses)
        };

        this.eventBus.emit('security:reportGenerated', report);
        return report;
    }

    calculateOverallScore(analyses) {
        const scores = Array.from(analyses.values()).map(analysis => analysis.securityScore);
        return scores.reduce((sum, score) => sum + score, 0) / scores.length;
    }

    generateGlobalRecommendations(analyses) {
        const recommendations = new Set();
        
        for (const analysis of analyses.values()) {
            analysis.recommendations.forEach(rec => recommendations.add(rec));
        }

        return Array.from(recommendations);
    }
}

export default new SecurityService(); 