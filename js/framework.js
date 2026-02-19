/**
 * MVC Framework Core - Police Care Interview System
 * จัดการ State, Events, และ Routing
 */

class MVCFramework {
    constructor() {
        this.state = new StateManager();
        this.events = new EventBus();
        this.router = new Router();
        this.validator = new Validator();
    }

    // Initialize application
    init() {
        console.log('🚀 MVC Framework Initialized');
        this.events.emit('app:ready');
    }

    // Component helper
    createElement(tag, className = '', content = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content) element.innerHTML = content;
        return element;
    }

    // Safe DOM manipulation
    render(container, content) {
        const element = document.getElementById(container);
        if (element) {
            element.innerHTML = content;
        }
    }

    // Show/hide elements
    show(id) {
        const element = document.getElementById(id);
        if (element) element.classList.remove('hidden');
    }

    hide(id) {
        const element = document.getElementById(id);
        if (element) element.classList.add('hidden');
    }

    // Toggle visibility
    toggle(id) {
        const element = document.getElementById(id);
        if (element) element.classList.toggle('hidden');
    }
}

/**
 * State Manager - จัดการข้อมูลแอปพลิเคชัน
 */
class StateManager {
    constructor() {
        this.data = {
            currentView: 'start',
            currentScenario: null,
            currentQuestionIndex: 0,
            reportHistory: [],
            scenarios: null
        };
        this.listeners = new Map();
    }

    // Get state
    get(key) {
        return this.data[key];
    }

    // Set state
    set(key, value) {
        const oldValue = this.data[key];
        this.data[key] = value;
        
        // Notify listeners
        if (this.listeners.has(key)) {
            this.listeners.get(key).forEach(callback => {
                callback(value, oldValue);
            });
        }
        
        console.log(`📊 State Updated: ${key} =`, value);
    }

    // Subscribe to state changes
    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, []);
        }
        this.listeners.get(key).push(callback);
    }

    // Reset all state
    reset() {
        this.data = {
            currentView: 'start',
            currentScenario: null,
            currentQuestionIndex: 0,
            reportHistory: [],
            scenarios: this.data.scenarios
        };
        console.log('🔄 State Reset');
    }

    // Get current question
    getCurrentQuestion() {
        if (!this.data.currentScenario) return null;
        return this.data.currentScenario.questions[this.data.currentQuestionIndex];
    }

    // Add answer to history
    addAnswer(answer) {
        const question = this.getCurrentQuestion();
        if (question) {
            this.data.reportHistory.push({
                questionId: question.id,
                questionText: question.text,
                answer: answer,
                timestamp: new Date().toISOString()
            });
            this.set('reportHistory', this.data.reportHistory);
        }
    }

    // Move to next question
    nextQuestion() {
        this.set('currentQuestionIndex', this.data.currentQuestionIndex + 1);
    }

    // Check if has more questions
    hasMoreQuestions() {
        if (!this.data.currentScenario) return false;
        return this.data.currentQuestionIndex < this.data.currentScenario.questions.length;
    }
}

/**
 * Event Bus - จัดการสื่อสารระหว่าง components
 */
class EventBus {
    constructor() {
        this.events = new Map();
    }

    // Subscribe to event
    on(event, callback) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event).push(callback);
    }

    // Emit event
    emit(event, data = null) {
        if (this.events.has(event)) {
            this.events.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`❌ Event Error (${event}):`, error);
                }
            });
        }
        console.log(`📡 Event Emitted: ${event}`, data);
    }

    // Unsubscribe from event
    off(event, callback) {
        if (this.events.has(event)) {
            const callbacks = this.events.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }
}

/**
 * Router - จัดการการเปลี่ยนหน้า
 */
class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
    }

    // Define route
    route(path, handler) {
        this.routes.set(path, handler);
    }

    // Navigate to route
    navigate(path, data = null) {
        if (this.routes.has(path)) {
            const handler = this.routes.get(path);
            this.currentRoute = path;
            handler(data);
            console.log(`🧭 Route: ${path}`, data);
        } else {
            console.error(`❌ Route not found: ${path}`);
        }
    }

    // Get current route
    getCurrentRoute() {
        return this.currentRoute;
    }
}

/**
 * Validator - ตรวจสอบข้อมูล
 */
class Validator {
    // Validate email
    email(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Validate phone
    phone(phone) {
        const re = /^[0-9]{10}$/;
        return re.test(phone);
    }

    // Validate required
    required(value) {
        return value !== null && value !== undefined && value.toString().trim() !== '';
    }

    // Validate answer
    answer(answer) {
        return typeof answer === 'boolean' || answer === 'yes' || answer === 'no';
    }

    // Sanitize input
    sanitize(input) {
        return input.toString().trim();
    }
}

// Global framework instance
window.framework = new MVCFramework();
