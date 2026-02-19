/**
 * Controllers - Police Care Interview System
 * จัดการ Logic และ User Interactions
 */

class InterviewController {
    constructor() {
        this.state = window.framework.state;
        this.events = window.framework.events;
        this.dataStore = window.dataStore;
        this.views = window.views;
        
        this.initializeEventListeners();
    }

    // Initialize event listeners
    initializeEventListeners() {
        this.events.on('app:ready', () => {
            this.showStartView();
        });

        this.events.on('interview:start', (scenarioId) => {
            this.startInterview(scenarioId);
        });

        this.events.on('interview:answer', (answer) => {
            this.handleAnswer(answer);
        });

        this.events.on('interview:help', () => {
            this.showHelpView();
        });

        this.events.on('interview:practice', (answer) => {
            this.handlePracticeAnswer(answer);
        });

        this.events.on('interview:next', () => {
            this.nextQuestion();
        });

        this.events.on('interview:summary', () => {
            this.showSummaryView();
        });

        this.events.on('interview:clear', () => {
            this.clearAllData();
        });

        this.events.on('interview:edit', () => {
            this.editReport();
        });

        this.events.on('interview:submit', () => {
            this.submitReport();
        });

        this.events.on('interview:exit', () => {
            this.exit();
        });

        this.events.on('interview:emergency', (number) => {
            this.callEmergency(number);
        });
    }

    // Show start view
    showStartView() {
        this.state.set('currentView', 'start');
        this.views.start.render();
        this.views.start.show();
        this.hideOtherViews('start');
    }

    // Start interview
    startInterview(scenarioId) {
        const scenario = this.dataStore.getScenario(scenarioId);
        if (!scenario) {
            console.error('❌ Scenario not found:', scenarioId);
            return;
        }

        // Reset state
        this.state.set('currentScenario', scenario);
        this.state.set('currentQuestionIndex', 0);
        this.state.set('reportHistory', []);
        this.state.set('currentView', 'interview');

        // Show interview view
        this.views.interview.render(scenario, 0, []);
        this.views.interview.show();
        this.hideOtherViews('interview');

        console.log('🎬 Interview started:', scenario.title);
    }

    // Handle answer
    handleAnswer(answer) {
        const scenario = this.state.get('currentScenario');
        const questionIndex = this.state.get('currentQuestionIndex');
        const question = scenario.getCurrentQuestion(questionIndex);

        if (!question) return;

        // Add answer to history
        const answerModel = new AnswerModel(
            question.id,
            question.text,
            answer,
            new Date().toISOString()
        );

        const history = this.state.get('reportHistory');
        history.push(answerModel);
        this.state.set('reportHistory', history);

        console.log('✅ Answer recorded:', answerModel.getAnswerText());

        // Check if has more questions
        if (questionIndex + 1 < scenario.getTotalQuestions()) {
            this.nextQuestion();
        } else {
            this.events.emit('interview:summary');
        }
    }

    // Handle practice answer
    handlePracticeAnswer(answer) {
        const booleanAnswer = answer === 'yes';
        this.events.emit('interview:answer', booleanAnswer);
    }

    // Move to next question
    nextQuestion() {
        const currentIndex = this.state.get('currentQuestionIndex');
        const newIndex = currentIndex + 1;
        this.state.set('currentQuestionIndex', newIndex);

        const scenario = this.state.get('currentScenario');
        const history = this.state.get('reportHistory');

        // Re-render interview view
        this.views.interview.render(scenario, newIndex, history);
        
        console.log('➡️ Next question:', newIndex + 1);
    }

    // Show help view
    showHelpView() {
        const scenario = this.state.get('currentScenario');
        const questionIndex = this.state.get('currentQuestionIndex');
        const question = scenario.getCurrentQuestion(questionIndex);

        if (!question) return;

        this.state.set('currentView', 'signHelp');
        this.views.signHelp.render(question);
        this.views.signHelp.show();
        this.hideOtherViews('signHelp');

        console.log('📚 Help view shown for question:', question.text);
    }

    // Show summary view
    showSummaryView() {
        const scenario = this.state.get('currentScenario');
        const history = this.state.get('reportHistory');
        
        const report = new ReportModel(scenario, history);
        
        this.state.set('currentView', 'summary');
        this.views.summary.render(report);
        this.views.summary.show();
        this.hideOtherViews('summary');

        console.log('📋 Summary view shown');
    }

    // Clear all data
    clearAllData() {
        if (confirm('คุณต้องการลบข้อมูลทั้งหมดใช่ไหม? ข้อมูลที่กรอกไปจะหายไปทั้งหมด')) {
            // Reset state
            this.state.reset();
            
            // Show start view
            this.showStartView();
            
            console.log('🗑️ All data cleared');
        }
    }

    // Edit report
    editReport() {
        // Reset to scenario selection
        this.state.set('currentView', 'start');
        this.state.set('currentScenario', null);
        this.state.set('currentQuestionIndex', 0);
        this.state.set('reportHistory', []);
        
        this.showStartView();
        
        console.log('✏️ Edit mode activated');
    }

    // Submit report
    submitReport() {
        const scenario = this.state.get('currentScenario');
        const history = this.state.get('reportHistory');
        
        const report = new ReportModel(scenario, history);
        const reportData = report.submit();

        // Save to localStorage (for demo)
        this.dataStore.saveToLocalStorage('lastReport', reportData);

        // In real app, send to server
        // fetch('/api/reports', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(reportData)
        // });

        console.log('📤 Report submitted:', reportData);
        alert('ส่งใบแจ้งความเรียบร้อยแล้ว! เจ้าหน้าที่ตำรวจจะดำเนินการต่อไป');
        
        // Return to start
        this.showStartView();
    }

    // Exit application
    exit() {
        if (confirm('คุณต้องการออกจากระบบสัมภาษณ์ใช่ไหม? ข้อมูลที่กรอกไปจะไม่ถูกบันทึก')) {
            console.log('👋 Exiting application');
            window.location.href = 'index.html';
        }
    }

    // Call emergency
    callEmergency(number) {
        if (confirm(`คุณต้องการโทรหมายเลข ${number} ใช่ไหม?`)) {
            window.location.href = `tel:${number}`;
        }
    }

    // Hide other views
    hideOtherViews(currentView) {
        const allViews = ['start', 'interview', 'signHelp', 'summary'];
        allViews.forEach(view => {
            if (view !== currentView) {
                this.views[view].hide();
            }
        });
    }

    // Get current state for debugging
    getDebugInfo() {
        return {
            currentView: this.state.get('currentView'),
            currentScenario: this.state.get('currentScenario')?.title,
            questionIndex: this.state.get('currentQuestionIndex'),
            totalQuestions: this.state.get('currentScenario')?.getTotalQuestions(),
            answersCount: this.state.get('reportHistory')?.length
        };
    }
}

// Global controller instance
window.controller = new InterviewController();
