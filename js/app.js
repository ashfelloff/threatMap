class SecurityGuide {
    constructor() {
        this.initializeElements();
        this.initializeState();
        this.startGuide();
        this.setupKeyboardShortcuts();
    }

    initializeElements() {
        this.narrativeText = document.querySelector('.narrative-text');
        this.accountList = document.querySelector('.account-list');
        this.input = document.getElementById('mainInput');
        this.progressBar = document.querySelector('.progress-bar');
        
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleInput();
        });
    }

    initializeState() {
        this.state = {
            step: 'intro',
            rootAccounts: [],
            currentRoot: null,
            services: new Map(),
            securityLevels: new Map()
        };

        this.securityLevels = {
            8: {
                name: 'Passless',
                description: 'The most secure option. No passwords to steal or forget.',
                details: 'Uses your device\'s built-in security (like fingerprint or face recognition) or a physical security key.',
                realExample: 'Logging into Gmail with your fingerprint or YubiKey'
            },
            7: {
                name: 'Codeless 2FA',
                description: 'Very secure. Requires your phone to approve login attempts.',
                details: 'Instead of typing codes, you just approve or deny login attempts from your phone.',
                realExample: 'Tapping "Approve" on your phone when signing into Microsoft'
            },
            6: {
                name: 'App-based 2FA',
                description: 'Highly secure. Requires a code from your phone.',
                details: 'Even if someone has your password, they can\'t log in without the code from your authenticator app.',
                realExample: 'Using Google Authenticator to get a 6-digit code'
            },
            5: {
                name: 'SMS 2FA',
                description: 'Good security, but vulnerable to phone hijacking.',
                details: 'Better than just a password, but text messages can be intercepted.',
                realExample: 'Getting a login code via text message'
            },
            4: {
                name: 'Password Manager',
                description: 'Good security. Each account has a unique, strong password.',
                details: 'You only need to remember one master password, and all your other passwords are strong and unique.',
                realExample: 'Using LastPass or 1Password to manage your passwords'
            },
            3: {
                name: 'Quality Password',
                description: 'Basic security. Password is strong but memorable.',
                details: 'Long passwords with mixed characters are harder to crack, but still vulnerable to phishing.',
                realExample: 'Using a password like "Correct-Horse-Battery-Staple!"'
            },
            2: {
                name: 'Unique Password',
                description: 'Weak security. Password is unique but too simple.',
                details: 'While it\'s good that it\'s unique, simple passwords can be easily guessed.',
                realExample: 'Using "Netflix123!" for Netflix only'
            },
            1: {
                name: 'Shared Password',
                description: 'Very risky. One breach affects all accounts.',
                details: 'If one service is compromised, all your accounts are at risk.',
                realExample: 'Using "Password123" for everything'
            }
        };

        this.narratives = {
            intro: "Ready to secure your digital life?",
            rootPrompt: "What's your main email account? (like Gmail or Outlook)",
            anotherRoot: "Any other main email accounts? (or type 'no' to continue)",
            servicesPrompt: (root) => `What services are connected to ${root}? (like Netflix, Spotify)`,
            securityPrompt: (account) => `How does ${account} handle authentication?`,
            securityExplanation: (level) => {
                const security = this.securityLevels[level];
                return `${security.name}: ${security.description}`;
            }
        };
    }

    async startGuide() {
        this.narrativeText.textContent = this.narratives.intro;
        this.input.focus();
    }

    async handleInput() {
        const input = this.input.value.trim();
        this.input.value = '';

        switch(this.state.step) {
            case 'intro':
                if (input.toLowerCase() === 'yes') {
                    document.querySelector('.credit').classList.add('hide');
                    
                    this.narrativeText.textContent = this.narratives.rootPrompt;
                    this.input.placeholder = "Type an email service...";
                    this.state.step = 'root';
                }
                break;

            case 'root':
                if (input.toLowerCase() === 'no') {
                    if (this.state.rootAccounts.length > 0) {
                        this.startServicesFlow();
                    }
                } else {
                    this.state.rootAccounts.push(input);
                    this.addAccountItem(input, 'root');
                    this.narrativeText.textContent = this.narratives.anotherRoot;
                }
                break;

            case 'services':
                if (input.toLowerCase() === 'no') {
                    const nextRoot = this.getNextRoot();
                    if (nextRoot) {
                        this.state.currentRoot = nextRoot;
                        this.narrativeText.textContent = this.narratives.servicesPrompt(nextRoot);
                    } else {
                        this.startSecurityAssessment();
                    }
                } else {
                    if (!this.state.services.has(this.state.currentRoot)) {
                        this.state.services.set(this.state.currentRoot, []);
                    }
                    this.state.services.get(this.state.currentRoot).push(input);
                    this.addAccountItem(input, 'service', this.state.currentRoot);
                }
                break;

            case 'security':
                const level = this.parseSecurityLevel(input);
                if (level) {
                    const account = this.getCurrentAccount();
                    if (account) {
                        this.setAccountSecurity(account, level);
                        this.moveToNextAccount();
                    }
                }
                break;
        }
        this.updateProgress();
    }

    addAccountItem(name, type, parent = null) {
        // Create notification
        const notification = document.createElement('div');
        notification.className = 'account-notification';
        notification.textContent = `Added ${name}${parent ? ` → ${parent}` : ''}`;
        document.body.appendChild(notification);

        // Show and hide notification
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    startServicesFlow() {
        this.state.step = 'services';
        this.state.currentRoot = this.state.rootAccounts[0];
        this.narrativeText.textContent = this.narratives.servicesPrompt(this.state.currentRoot);
        this.input.placeholder = "Type a service name or 'no' to continue";
    }

    getNextRoot() {
        const currentIndex = this.state.rootAccounts.indexOf(this.state.currentRoot);
        return this.state.rootAccounts[currentIndex + 1];
    }

    startSecurityAssessment() {
        this.state.step = 'security';
        this.state.currentAccount = 0;
        this.initializeSecurityLevelsGrid();
        document.querySelector('.security-levels-grid').style.display = 'grid';
        this.narrativeText.classList.add('security-prompt');
        this.assessNextAccount();
        this.updateProgress();
    }

    getCurrentAccount() {
        const allAccounts = [
            ...this.state.rootAccounts,
            ...Array.from(this.state.services.values()).flat()
        ];
        return allAccounts[this.state.currentAccount] || null;
    }

    async moveToNextAccount() {
        this.state.currentAccount++;
        const nextAccount = this.getCurrentAccount();
        
        if (nextAccount) {
            this.assessNextAccount();
        } else {
            document.querySelector('.security-levels-grid').style.display = 'none';
            this.narrativeText.classList.remove('security-prompt');
            this.input.style.display = 'none';
            
            const analysisSection = document.querySelector('.security-analysis');
            analysisSection.style.display = 'block';
            
            this.generateAccountMap();
            this.generateSecurityScore();
            this.setupAIHelper();
            
            this.narrativeText.textContent = "Here's your security analysis:";
        }
        this.updateProgress();
    }

    assessNextAccount() {
        const account = this.getCurrentAccount();
        if (account) {
            this.narrativeText.textContent = this.narratives.securityPrompt(account);
            this.input.placeholder = "Click a level or type 1-8";
            this.input.style.display = 'block';
        }
    }

    parseSecurityLevel(input) {
        const level = parseInt(input);
        if (level >= 1 && level <= 8) {
            return level;
        }
        return null;
    }

    setAccountSecurity(account, level) {
        this.state.securityLevels.set(account, level);
        
        // Update visual representation
        const accountElements = document.querySelectorAll('.account-item');
        accountElements.forEach(el => {
            if (el.querySelector('.account-name').textContent === account) {
                el.className = `account-item security-${level}`;
                el.style.borderLeftColor = this.securityLevels[level].color;
            }
        });
    }

    generateAccountMap() {
        const accountMap = document.querySelector('.account-map');
        let mapContent = '';
        
        this.state.rootAccounts.forEach(root => {
            const rootLevel = this.state.securityLevels.get(root);
            const rootClass = this.getSecurityClass(rootLevel);
            const threats = this.getThreats(rootLevel);
            
            mapContent += `${this.colorize(root, rootClass)}${threats}\n`;
            
            const services = this.state.services.get(root) || [];
            services.forEach(service => {
                const serviceLevel = this.state.securityLevels.get(service);
                const serviceClass = this.getSecurityClass(serviceLevel);
                const serviceThreats = this.getThreats(serviceLevel);
                
                mapContent += `├─> ${this.colorize(service, serviceClass)}${serviceThreats}\n`;
            });
            mapContent += '\n';
        });
        
        // Add threat explanations
        const threatLegend = this.generateThreatLegend();
        mapContent += '\nThreats:\n' + threatLegend;
        
        accountMap.innerHTML = mapContent;
    }

    getSecurityClass(level) {
        if (level >= 6) return 'secure';
        if (level >= 4) return 'warning';
        return 'threat';
    }

    getThreats(level) {
        const threats = {
            1: '*[Password Reuse]',
            2: '*[Weak Password]',
            3: '*[No 2FA]',
            4: '',
            5: '*[SMS Vulnerable]',
            6: '',
            7: '',
            8: ''
        };
        return threats[level] || '';
    }

    generateThreatLegend() {
        return `
*[Password Reuse] - If one service is breached, all accounts are at risk
*[Weak Password] - Vulnerable to brute force or dictionary attacks
*[No 2FA] - Single factor authentication is easily compromised
*[SMS Vulnerable] - SMS 2FA can be intercepted via SIM swapping
`.trim();
    }

    colorize(text, className) {
        return `<span class="${className}">${text}</span>`;
    }

    generateSecurityScore() {
        const scoreSection = document.querySelector('.security-score');
        const accounts = [...this.state.securityLevels.entries()];
        const totalAccounts = accounts.length;
        const averageScore = accounts.reduce((sum, [_, level]) => sum + level, 0) / totalAccounts;
        
        const vulnerableAccounts = accounts.filter(([_, level]) => level < 4).length;
        const mediumAccounts = accounts.filter(([_, level]) => level >= 4 && level < 6).length;
        const secureAccounts = accounts.filter(([_, level]) => level >= 6).length;
        
        scoreSection.innerHTML = `
            <div class="score-header">Security Score: ${averageScore.toFixed(1)}/8</div>
            <div class="score-details">
                <div class="score-item">
                    <span>Secure Accounts (Level 6-8)</span>
                    <span class="secure">${secureAccounts}</span>
                </div>
                <div class="score-item">
                    <span>Medium Risk (Level 4-5)</span>
                    <span class="warning">${mediumAccounts}</span>
                </div>
                <div class="score-item">
                    <span>High Risk (Level 1-3)</span>
                    <span class="threat">${vulnerableAccounts}</span>
                </div>
            </div>
        `;
    }

    setupAIHelper() {
        const copyButton = document.querySelector('.copy-prompt-btn');
        const exportButton = document.querySelector('.export-btn');
        
        copyButton.addEventListener('click', () => this.copyAIPrompt());
        exportButton.addEventListener('click', () => this.exportResults());
    }

    copyAIPrompt() {
        const accounts = [...this.state.securityLevels.entries()];
        const prompt = `I need help improving my digital security. Here's my current setup using the CASMM (Consumer Authentication Strength Maturity Model):

${accounts.map(([account, level]) => `${account}: Level ${level} (${this.securityLevels[level].name})`).join('\n')}

Can you help me understand:
1. What specific risks I face with my current setup
2. Step-by-step instructions to improve each account's security
3. Which accounts I should prioritize securing first

Please reference the CASMM levels (1-8) in your explanation, where:
- Level 8: Passless (WebAuthn/FIDO2)
- Level 7: Codeless 2FA (Push notifications)
- Level 6: App-based 2FA (Authenticator codes)
- Level 5: SMS 2FA
- Level 4: Password Manager
- Level 3: Quality Password
- Level 2: Unique but Simple Password
- Level 1: Shared Password`;

        navigator.clipboard.writeText(prompt)
            .then(() => {
                const btn = document.querySelector('.copy-prompt-btn');
                btn.textContent = 'Copied!';
                setTimeout(() => {
                    btn.textContent = 'Copy Analysis to Clipboard';
                }, 2000);
            });
    }

    exportResults() {
        const data = {
            timestamp: new Date().toISOString(),
            accounts: {
                root: this.state.rootAccounts,
                services: Object.fromEntries(this.state.services),
                securityLevels: Object.fromEntries(this.state.securityLevels)
            },
            score: {
                average: this.calculateAverageScore(),
                breakdown: this.getScoreBreakdown()
            }
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `security-assessment-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    calculateAverageScore() {
        const accounts = [...this.state.securityLevels.entries()];
        const totalAccounts = accounts.length;
        return accounts.reduce((sum, [_, level]) => sum + level, 0) / totalAccounts;
    }

    getScoreBreakdown() {
        const accounts = [...this.state.securityLevels.entries()];
        return {
            secure: accounts.filter(([_, level]) => level >= 6).length,
            medium: accounts.filter(([_, level]) => level >= 4 && level < 6).length,
            vulnerable: accounts.filter(([_, level]) => level < 4).length
        };
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    initializeSecurityLevelsGrid() {
        const grid = document.querySelector('.security-levels-grid');
        grid.innerHTML = '';
        
        for (let i = 8; i >= 1; i--) {
            const level = this.securityLevels[i];
            const item = document.createElement('div');
            item.className = 'security-level-item';
            item.setAttribute('data-level', i);
            item.innerHTML = `
                <div class="content-wrapper">
                    <div class="level-header">
                        <span class="level-number">${i}</span>
                        <span class="level-name">${level.name}</span>
                    </div>
                    <div class="level-details">
                        <div class="level-desc">${level.description}</div>
                        <div class="level-explanation">${level.details}</div>
                        <div class="level-example">For example: ${level.realExample}</div>
                    </div>
                </div>
            `;
            grid.appendChild(item);
            
            item.addEventListener('click', () => {
                this.handleSecuritySelection(i);
            });
        }
    }

    handleSecuritySelection(level) {
        if (this.state.step === 'security') {
            const account = this.getCurrentAccount();
            if (account) {
                this.setAccountSecurity(account, level);
                this.moveToNextAccount();
            }
        }
    }

    setupKeyboardShortcuts() {
        window.addEventListener('keydown', (e) => {
            if (this.state.step === 'security') {
                const num = parseInt(e.key);
                if (num >= 1 && num <= 8) {
                    this.handleSecuritySelection(num);
                }
            }
        });
    }

    updateProgress() {
        let progress = 0;
        
        switch(this.state.step) {
            case 'intro':
                progress = 0;
                break;
            case 'root':
                progress = 20;
                break;
            case 'services':
                progress = 40;
                break;
            case 'security':
                const total = this.state.rootAccounts.length + 
                    Array.from(this.state.services.values()).flat().length;
                const completed = this.state.securityLevels.size;
                progress = 40 + (completed / total) * 40;
                break;
            default:
                progress = 100;
        }
        
        this.progressBar.style.width = `${progress}%`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SecurityGuide();
}); 
