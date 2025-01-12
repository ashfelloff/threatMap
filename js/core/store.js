class Store {
    constructor() {
        this.state = {
            accounts: new Map(),
            connections: new Map(),
            securityLevels: new Map(),
            selectedNode: null,
            draggedItem: null
        };
        
        this.listeners = new Map();
    }

    // State Management
    getState(key) {
        return this.state[key];
    }

    setState(key, value) {
        this.state[key] = value;
        this.notify(key);
    }

    // Account Management
    addAccount(account) {
        const accounts = this.state.accounts;
        accounts.set(account.id, account);
        this.setState('accounts', accounts);
    }

    removeAccount(accountId) {
        const accounts = this.state.accounts;
        accounts.delete(accountId);
        this.setState('accounts', accounts);
    }

    // Connection Management
    addConnection(sourceId, targetId) {
        const connections = this.state.connections;
        const key = `${sourceId}-${targetId}`;
        connections.set(key, { source: sourceId, target: targetId });
        this.setState('connections', connections);
    }

    // Observer Pattern
    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(callback);
    }

    unsubscribe(key, callback) {
        if (this.listeners.has(key)) {
            this.listeners.get(key).delete(callback);
        }
    }

    notify(key) {
        if (this.listeners.has(key)) {
            this.listeners.get(key).forEach(callback => callback(this.state[key]));
        }
    }
}

const store = new Store();
export default store; 