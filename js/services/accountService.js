import store from '../core/store.js';
import eventBus from '../core/events.js';
import { CONFIG } from '../core/config.js';

class AccountService {
    constructor() {
        this.store = store;
        this.eventBus = eventBus;
    }

    createAccount(data) {
        const account = {
            id: crypto.randomUUID(),
            name: data.name,
            type: data.type,
            icon: data.icon || this.getDefaultIcon(data.type),
            securityLevel: data.securityLevel || 'simplepass',
            parentId: data.parentId || null,
            created: Date.now(),
            lastUpdated: Date.now()
        };

        this.store.addAccount(account);
        this.eventBus.emit('account:created', account);
        return account;
    }

    updateAccount(id, data) {
        const accounts = this.store.getState('accounts');
        const account = accounts.get(id);
        
        if (!account) return null;

        const updatedAccount = {
            ...account,
            ...data,
            lastUpdated: Date.now()
        };

        accounts.set(id, updatedAccount);
        this.store.setState('accounts', accounts);
        this.eventBus.emit('account:updated', updatedAccount);
        
        return updatedAccount;
    }

    deleteAccount(id) {
        const accounts = this.store.getState('accounts');
        const account = accounts.get(id);
        
        if (!account) return false;

        // Remove connections
        const connections = this.store.getState('connections');
        for (const [key, connection] of connections) {
            if (connection.source === id || connection.target === id) {
                connections.delete(key);
            }
        }

        accounts.delete(id);
        this.store.setState('accounts', accounts);
        this.store.setState('connections', connections);
        this.eventBus.emit('account:deleted', id);
        
        return true;
    }

    getDefaultIcon(type) {
        switch (type) {
            case 'root': return '🔑';
            case 'linked': return '🔗';
            case 'service': return '⚡';
            default: return '📱';
        }
    }
}

export default new AccountService(); 