/**
 * Main Application - Police Care Interview System
 * จัดการการทำงานหลักของแอปพลิเคชัน
 */

class PoliceCareApp {
    constructor() {
        this.framework = window.framework;
        this.state = this.framework.state;
        this.events = this.framework.events;
        this.controller = window.controller;
        
        this.initialize();
    }

    // Initialize application
    initialize() {
        console.log('🚀 Police Care Interview System v2.0');
        console.log('📋 MVC Architecture Loaded');
        
        // Initialize framework
        this.framework.init();
        
        // Set up global error handling
        this.setupErrorHandling();
        
        // Set up keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Load saved data if exists
        this.loadSavedData();
        
        console.log('✅ Application ready');
    }

    // Setup error handling
    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('🔥 Global Error:', event.error);
            this.events.emit('app:error', event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('🔥 Unhandled Promise Rejection:', event.reason);
            this.events.emit('app:error', event.reason);
        });
    }

    // Setup keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // ESC - Exit current view
            if (event.key === 'Escape') {
                this.exit();
            }
            
            // Number keys - Quick answers (only in interview view)
            if (this.state.get('currentView') === 'interview') {
                if (event.key === '1') {
                    this.answerYes();
                } else if (event.key === '2') {
                    this.answerNo();
                } else if (event.key === '3') {
                    this.showHelp();
                }
            }
            
            // Ctrl+Z - Undo (in development)
            if (event.ctrlKey && event.key === 'z') {
                event.preventDefault();
                console.log('🔄 Debug: Undo last action');
            }
        });
    }

    // Load saved data
    loadSavedData() {
        const savedReport = this.framework.dataStore.loadFromLocalStorage('lastReport');
        if (savedReport) {
            console.log('📂 Found saved report:', savedReport);
            // Optionally restore previous session
            // this.restoreSession(savedReport);
        }
    }

    // Public API methods
    startInterview(scenarioId) {
        this.events.emit('interview:start', scenarioId);
    }

    answerYes() {
        this.events.emit('interview:answer', true);
    }

    answerNo() {
        this.events.emit('interview:answer', false);
    }

    showHelp() {
        this.events.emit('interview:help');
    }

    practiceAnswer(answer) {
        this.events.emit('interview:practice', answer);
    }

    nextQuestion() {
        this.events.emit('interview:next');
    }

    clearAllData() {
        this.events.emit('interview:clear');
    }

    editReport() {
        this.events.emit('interview:edit');
    }

    submitReport() {
        this.events.emit('interview:submit');
    }

    exit() {
        this.events.emit('interview:exit');
    }

    callEmergency(number) {
        this.events.emit('interview:emergency', number);
    }

    // Debug methods
    getDebugInfo() {
        return this.controller.getDebugInfo();
    }

    // Restore session (optional feature)
    restoreSession(savedReport) {
        if (confirm('พบข้อมูลการแจ้งความที่บันทึกไว้ ต้องการคืนค่าหรือไม่?')) {
            console.log('🔄 Restoring previous session');
            // Logic to restore session would go here
        }
    }

    // Performance monitoring
    logPerformance() {
        if (performance.memory) {
            const memory = performance.memory;
            console.log('💾 Memory Usage:', {
                used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
                total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
                limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB'
            });
        }
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Create global app instance
    window.app = new PoliceCareApp();
    
    // Make app methods globally accessible
    window.startInterview = (scenarioId) => window.app.startInterview(scenarioId);
    window.answerYes = () => window.app.answerYes();
    window.answerNo = () => window.app.answerNo();
    window.showHelp = () => window.app.showHelp();
    window.practiceAnswer = (answer) => window.app.practiceAnswer(answer);
    window.clearAllData = () => window.app.clearAllData();
    window.editReport = () => window.app.editReport();
    window.submitReport = () => window.app.submitReport();
    window.exit = () => window.app.exit();
    window.callEmergency = (number) => window.app.callEmergency(number);
    
    // Development helpers
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.debug = {
            getState: () => window.app.getDebugInfo(),
            logPerformance: () => window.app.logPerformance()
        };
        
        console.log('🛠️ Development mode enabled');
        console.log('💡 Debug commands available:');
        console.log('  - debug.getState() - Show current state');
        console.log('  - debug.logPerformance() - Show performance info');
    }
    
    console.log('🎉 Police Care Interview System Ready!');
});
