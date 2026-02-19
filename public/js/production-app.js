/**
 * Production Interview App - Police Care System v3.0
 * Production-ready application with API integration
 */

class ProductionInterviewApp {
    constructor() {
        this.api = new APIService();
        this.state = new StateManager();
        this.ui = new UIManager();
        this.session = null;
        this.currentReport = null;
        
        this.initialize();
    }

    async initialize() {
        console.log('🚀 Police Care Interview System v3.0 Production');
        
        try {
            // Check API health
            await this.checkAPIHealth();
            
            // Load scenarios
            await this.loadScenarios();
            
            // Show start view
            this.showStartView();
            
            // Setup error handling
            this.setupErrorHandling();
            
            console.log('✅ Production app ready');
            
        } catch (error) {
            console.error('❌ Initialization failed:', error);
            this.showError('ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่ภายหลัง');
        }
    }

    async checkAPIHealth() {
        try {
            const response = await this.api.get('/health');
            if (!response.success) {
                throw new Error('API health check failed');
            }
            this.updateConnectionStatus(true);
        } catch (error) {
            this.updateConnectionStatus(false);
            throw error;
        }
    }

    async loadScenarios() {
        try {
            const response = await this.api.get('/scenarios');
            if (response.success) {
                this.state.set('scenarios', response.data);
                console.log('📋 Scenarios loaded:', response.data.length);
            } else {
                throw new Error('Failed to load scenarios');
            }
        } catch (error) {
            console.error('❌ Failed to load scenarios:', error);
            throw error;
        }
    }

    showStartView() {
        const scenarios = this.state.get('scenarios') || [];
        
        const content = `
            <div class="max-w-4xl mx-auto">
                <div class="bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div class="mb-8">
                        <div class="w-24 h-24 bg-police-red rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-hands text-white text-3xl"></i>
                        </div>
                        <h1 class="text-3xl font-bold text-gray-900 mb-4">ระบบสัมภาษณ์อัตโนมัติ</h1>
                        <p class="text-gray-600 text-lg mb-8">
                            ระบบจะถามคำถามผ่านภาษามือ และสร้างใบแจ้งความให้โดยอัตโนมัติ<br>
                            <span class="text-police-red font-bold">กรุณาใช้ท่ามือตามที่ล่ามแสดง</span>
                        </p>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${scenarios.map(scenario => this.renderScenarioCard(scenario)).join('')}
                    </div>
                </div>
            </div>
        `;
        
        this.ui.render('appContainer', content);
    }

    renderScenarioCard(scenario) {
        return `
            <button onclick="app.startInterview('${scenario.scenario_key}')" class="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-police-red hover:bg-red-50 transition text-center group">
                <div class="w-16 h-16 mx-auto bg-${scenario.color}-100 rounded-full flex items-center justify-center text-${scenario.color}-600 mb-4 group-hover:bg-${scenario.color}-200 transition">
                    <i class="fas ${scenario.icon} text-2xl"></i>
                </div>
                <h3 class="font-bold text-gray-900 mb-2">${scenario.title}</h3>
                <p class="text-sm text-gray-500">คำถาม ${scenario.questions?.length || 4} ข้อ</p>
            </button>
        `;
    }

    async startInterview(scenarioKey) {
        try {
            this.showLoading('กำลังเริ่มการสัมภาษณ์...');
            
            // Start interview session
            const response = await this.api.post('/interview/start', {
                scenario_type: scenarioKey
            });
            
            if (response.success) {
                this.session = response.data;
                this.state.set('currentScenario', scenarioKey);
                this.state.set('answers', []);
                
                // Load scenario details
                const scenarioResponse = await this.api.get(`/scenarios/${scenarioKey}`);
                if (scenarioResponse.success) {
                    this.state.set('scenarioDetails', scenarioResponse.data);
                    this.showInterviewView();
                }
            } else {
                throw new Error('Failed to start interview');
            }
            
        } catch (error) {
            console.error('❌ Failed to start interview:', error);
            this.showError('ไม่สามารถเริ่มการสัมภาษณ์ได้ กรุณาลองใหม่');
        }
    }

    showInterviewView() {
        const scenario = this.state.get('scenarioDetails');
        const answers = this.state.get('answers') || [];
        const currentQuestionIndex = answers.length;
        
        if (!scenario || !scenario.questions || currentQuestionIndex >= scenario.questions.length) {
            this.showSummaryView();
            return;
        }
        
        const currentQuestion = scenario.questions[currentQuestionIndex];
        
        const content = `
            <div class="max-w-4xl mx-auto">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Video Section -->
                    <div class="lg:col-span-2">
                        <div class="bg-white rounded-2xl shadow-xl p-6">
                            <div class="video-container mb-6">
                                <div class="bg-black rounded-xl aspect-video flex items-center justify-center">
                                    <div class="text-center text-white">
                                        <i class="fas fa-video text-6xl mb-4 opacity-50"></i>
                                        <p class="text-lg font-medium">กำลังเชื่อมต่อกับล่ามภาษามือ...</p>
                                        <div class="flex justify-center gap-2 mt-4">
                                            <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                            <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
                                            <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Current Question -->
                            <div class="bg-gray-50 rounded-xl p-6 mb-6">
                                <div class="flex items-center gap-3 mb-3">
                                    <span class="bg-police-red text-white text-xs font-bold px-3 py-1 rounded-full">คำถามที่ ${currentQuestionIndex + 1}</span>
                                    <span class="text-sm text-gray-500">ประเภท: ${scenario.title}</span>
                                </div>
                                <h2 class="text-2xl font-bold text-gray-900 mb-4">${currentQuestion.question_text}</h2>
                                <p class="text-gray-600">กรุณาตอบด้วยท่ามือ หรือกดปุ่มด้านล่าง</p>
                            </div>

                            <!-- Response Buttons -->
                            <div class="grid grid-cols-3 gap-4">
                                <button onclick="app.answerYes()" class="bg-green-500 hover:bg-green-600 text-white py-6 rounded-xl font-bold transition transform hover:scale-105">
                                    <i class="fas fa-check-circle text-2xl mb-2"></i>
                                    ใช่
                                </button>
                                <button onclick="app.answerNo()" class="bg-red-500 hover:bg-red-600 text-white py-6 rounded-xl font-bold transition transform hover:scale-105">
                                    <i class="fas fa-times-circle text-2xl mb-2"></i>
                                    ไม่ใช่
                                </button>
                                <button onclick="app.showHelp()" class="bg-blue-500 hover:bg-blue-600 text-white py-6 rounded-xl font-bold transition transform hover:scale-105 pulse-help">
                                    <i class="fas fa-question-circle text-2xl mb-2"></i>
                                    ไม่เข้าใจท่า
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Sidebar -->
                    <div class="space-y-6">
                        <!-- Progress -->
                        <div class="bg-white rounded-2xl shadow-xl p-6">
                            <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <i class="fas fa-tasks text-police-red"></i>
                                ความคืบหน้า
                            </h3>
                            ${this.renderProgress(currentQuestionIndex + 1, scenario.questions.length)}
                        </div>

                        <!-- Collected Info -->
                        <div class="bg-white rounded-2xl shadow-xl p-6">
                            <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <i class="fas fa-clipboard-list text-police-red"></i>
                                ข้อมูลที่เก็บได้
                            </h3>
                            ${this.renderCollectedInfo(answers)}
                        </div>

                        <!-- Emergency Contact -->
                        <div class="bg-red-50 border border-red-200 rounded-2xl p-6">
                            <h3 class="font-bold text-red-800 mb-3 flex items-center gap-2">
                                <i class="fas fa-phone-alt"></i>
                                ติดต่อฉุกเฉิน
                            </h3>
                            <div class="space-y-2">
                                <button onclick="app.callEmergency('191')" class="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition">
                                    <i class="fas fa-phone mr-2"></i> โทร 191 (ตำรวจ)
                                </button>
                                <button onclick="app.callEmergency('1414')" class="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition">
                                    <i class="fas fa-hands mr-2"></i> โทร 1414 (ล่ามภาษามือ)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.ui.render('appContainer', content);
    }

    async answerYes() {
        await this.submitAnswer(true);
    }

    async answerNo() {
        await this.submitAnswer(false);
    }

    async submitAnswer(answer) {
        try {
            const answers = this.state.get('answers') || [];
            const scenario = this.state.get('scenarioDetails');
            const currentQuestionIndex = answers.length;
            const currentQuestion = scenario.questions[currentQuestionIndex];
            
            // Validate session exists
            if (!this.session || !this.session.session_id) {
                // Create session if it doesn't exist
                const sessionResponse = await this.api.post('/interview/start', {
                    scenario_type: this.state.get('currentScenario')
                });
                
                if (sessionResponse.success) {
                    this.session = sessionResponse.data;
                } else {
                    throw new Error('Failed to create session');
                }
            }
            
            // Submit answer to API
            const response = await this.api.put('/interview/answer', {
                session_id: this.session.session_id,
                question_id: currentQuestion.id,
                answer: answer
            });
            
            if (response.success) {
                // Add to local state
                answers.push({
                    question_id: currentQuestion.id,
                    question_text: currentQuestion.question_text,
                    answer: answer,
                    answer_text: answer ? 'ใช่' : 'ไม่ใช่',
                    timestamp: new Date().toISOString()
                });
                
                this.state.set('answers', answers);
                
                // Show next question or summary
                this.showInterviewView();
                
            } else {
                throw new Error('Failed to submit answer');
            }
            
        } catch (error) {
            console.error('❌ Failed to submit answer:', error);
            this.showError('ไม่สามารถบันทึกคำตอบได้ กรุณาลองใหม่');
        }
    }

    showHelp() {
        const answers = this.state.get('answers') || [];
        const scenario = this.state.get('scenarioDetails');
        const currentQuestionIndex = answers.length;
        const currentQuestion = scenario.questions[currentQuestionIndex];
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        overlay.innerHTML = `
            <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div class="text-center mb-8">
                    <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-hands text-blue-600 text-3xl"></i>
                    </div>
                    <h2 class="text-3xl font-bold text-gray-900 mb-4">เรียนรู้ท่ามือสำหรับคำถามนี้</h2>
                    <p class="text-gray-600 text-lg mb-2">คำถาม: "${currentQuestion.question_text}"</p>
                    <p class="text-gray-500">เรียนรู้ท่ามือ แล้วลองตอบคำถามใหม่อีกครั้ง</p>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    ${this.renderSignCards()}
                </div>
                
                <!-- Practice Buttons -->
                <div class="flex justify-center gap-4 mb-6">
                    <button onclick="app.practiceAnswerFromModal('yes')" class="bg-green-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-600 transition">
                        <i class="fas fa-thumbs-up mr-2"></i> ฉันพร้อมตอบ "ใช่"
                    </button>
                    <button onclick="app.practiceAnswerFromModal('no')" class="bg-red-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-600 transition">
                        <i class="fas fa-thumbs-down mr-2"></i> ฉันพร้อมตอบ "ไม่ใช่"
                    </button>
                </div>
                
                <!-- Close Button -->
                <div class="text-center">
                    <button onclick="this.closest('.fixed').remove()" class="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-bold hover:bg-gray-300 transition">
                        <i class="fas fa-times mr-2"></i> ปิด
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
    }

    async practiceAnswerFromModal(answer) {
        // Close modal first
        const modal = document.querySelector('.fixed.inset-0');
        if (modal) {
            modal.remove();
        }
        
        // Submit answer
        const booleanAnswer = answer === 'yes';
        await this.submitAnswer(booleanAnswer);
    }

    renderProgress(current, total) {
        const progress = (current / total) * 100;
        return `
            <div class="space-y-3">
                <div class="flex justify-between text-sm mb-2">
                    <span>ความคืบหน้า</span>
                    <span>${current}/${total}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-police-red h-2 rounded-full transition-all duration-300" style="width: ${progress}%"></div>
                </div>
            </div>
        `;
    }

    renderCollectedInfo(answers) {
        if (answers.length === 0) {
            return '<div class="text-gray-500">ยังไม่มีข้อมูล...</div>';
        }

        return answers.map(answer => `
            <div class="flex items-center gap-2 mb-2">
                <span class="font-bold text-sm">${answer.question_text}:</span>
                <span class="${answer.answer ? 'text-green-600' : 'text-red-600'} font-bold text-sm">${answer.answer_text}</span>
            </div>
        `).join('');
    }

    renderSignCards() {
        return `
            <!-- ท่ามือ "ใช่" -->
            <div class="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                <div class="text-center mb-4">
                    <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i class="fas fa-thumbs-up text-white text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-green-800 mb-2">ท่ามือ "ใช่"</h3>
                </div>
                <div class="space-y-3">
                    <div class="bg-white rounded-lg p-4">
                        <p class="text-sm font-medium text-gray-700 mb-2">วิธีทำ:</p>
                        <p class="text-sm text-gray-600">กำมือขึ้น หัวแม่มือชี้ขึ้น เหมือนกำลังจะให้คะแนน "Good"</p>
                    </div>
                    <div class="bg-yellow-50 rounded-lg p-4">
                        <p class="text-sm font-medium text-yellow-800 mb-2">💡 จุดสำคัญ:</p>
                        <ul class="text-sm text-gray-600 space-y-1">
                            <li>• หัวแม่มือชี้ขึ้นอย่างชัดเจน</li>
                            <li>• นิ้วอื่นๆ กำอยู่</li>
                            <li>• ทำท่ามือที่ระดับหน้าอก</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <!-- ท่ามือ "ไม่ใช่" -->
            <div class="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                <div class="text-center mb-4">
                    <div class="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i class="fas fa-thumbs-down text-white text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-red-800 mb-2">ท่ามือ "ไม่ใช่"</h3>
                </div>
                <div class="space-y-3">
                    <div class="bg-white rounded-lg p-4">
                        <p class="text-sm font-medium text-gray-700 mb-2">วิธีทำ:</p>
                        <p class="text-sm text-gray-600">กำมือลง หัวแม่มือชี้ลง เหมือนกำลังจะให้คะแนน "Not Good"</p>
                    </div>
                    <div class="bg-yellow-50 rounded-lg p-4">
                        <p class="text-sm font-medium text-yellow-800 mb-2">💡 จุดสำคัญ:</p>
                        <ul class="text-sm text-gray-600 space-y-1">
                            <li>• หัวแม่มือชี้ลงอย่างชัดเจน</li>
                            <li>• นิ้วอื่นๆ กำอยู่</li>
                            <li>• ทำท่ามือที่ระดับหน้าอก</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    async showSummaryView() {
        const scenario = this.state.get('scenarioDetails');
        const answers = this.state.get('answers') || [];
        
        const content = `
            <div class="max-w-4xl mx-auto">
                <div class="bg-white rounded-2xl shadow-xl p-8">
                    <div class="text-center mb-8">
                        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-check-circle text-green-600 text-3xl"></i>
                        </div>
                        <h1 class="text-3xl font-bold text-gray-900 mb-4">สรุปข้อมูลการแจ้งความ</h1>
                        <p class="text-gray-600 text-lg">ระบบได้รวบรวมข้อมูลเป็นใบแจ้งความ กรุณาตรวจสอบความถูกต้อง</p>
                    </div>
                    
                    <!-- Report Content -->
                    <div class="bg-gray-50 rounded-xl p-6 mb-6">
                        <div class="space-y-3">
                            <div class="flex justify-between py-2 border-b">
                                <span class="font-bold">ประเภทเหตุการณ์:</span>
                                <span>${scenario.title}</span>
                            </div>
                            <div class="flex justify-between py-2 border-b">
                                <span class="font-bold">เวลาแจ้ง:</span>
                                <span>${new Date().toLocaleString('th-TH')}</span>
                            </div>
                            ${answers.map(answer => `
                                <div class="flex justify-between py-2 border-b">
                                    <span class="font-bold">${answer.question_text}:</span>
                                    <span class="${answer.answer ? 'text-green-600' : 'text-red-600'} font-bold">${answer.answer_text}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button onclick="app.clearAllData()" class="bg-gray-200 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-300 transition">
                            <i class="fas fa-trash-alt mr-2"></i>
                            ลบข้อมูลทั้งหมด
                        </button>
                        <button onclick="app.editReport()" class="bg-gray-200 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-300 transition">
                            <i class="fas fa-edit mr-2"></i>
                            แก้ไขข้อมูล
                        </button>
                        <button onclick="app.submitReport()" class="bg-police-red text-white py-4 rounded-xl font-bold hover:bg-red-800 transition">
                            <i class="fas fa-paper-plane mr-2"></i>
                            ส่งใบแจ้งความ
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        this.ui.render('appContainer', content);
    }

    async submitReport() {
        try {
            this.showLoading('กำลังส่งข้อมูล...');
            
            const scenario = this.state.get('scenarioDetails');
            const answers = this.state.get('answers') || [];
            
            // Validate that we have answers
            if (!answers || answers.length === 0) {
                this.showError('กรุณาตอบคำถามอย่างน้อย 1 ข้อก่อนส่ง');
                return;
            }
            
            const reportData = {
                scenario_type: this.state.get('currentScenario'),
                scenario_title: scenario.title,
                answers: answers,
                user_info: {
                    ip_address: await this.getUserIP(),
                    user_agent: navigator.userAgent,
                    timestamp: new Date().toISOString()
                }
            };
            
            const response = await this.api.post('/reports', reportData);
            
            if (response.success) {
                this.currentReport = response.data;
                this.showSuccess('ส่งใบแจ้งความเรียบร้อยแล้ว! เจ้าหน้าที่ตำรวจจะดำเนินการต่อไป');
                
                // Show completion summary instead of auto-clearing
                this.showCompletionSummary();
            } else {
                throw new Error('Failed to submit report');
            }
            
        } catch (error) {
            console.error('❌ Failed to submit report:', error);
            this.showError('ไม่สามารถส่งข้อมูลได้ กรุณาลองใหม่');
        }
    }

    showCompletionSummary() {
        const scenario = this.state.get('scenarioDetails');
        const answers = this.state.get('answers') || [];
        
        const content = `
            <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <div class="max-w-lg mx-auto">
                    <!-- Success Animation Card -->
                    <div class="bg-white rounded-3xl shadow-2xl p-6 mb-4">
                        <div class="text-center mb-6">
                            <div class="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-4 animate-pulse">
                                <i class="fas fa-check text-white text-4xl"></i>
                            </div>
                            <h2 class="text-2xl font-bold text-gray-900 mb-2">ส่งข้อมูลเรียบร้อย!</h2>
                            <p class="text-gray-600 text-sm">เจ้าหน้าที่ตำรวจจะดำเนินการต่อไป</p>
                        </div>
                        
                        <!-- Summary Card -->
                        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 mb-6">
                            <h3 class="font-bold text-gray-900 mb-4 text-lg">📋 สรุปข้อมูลที่แจ้ง</h3>
                            <div class="space-y-3">
                                <div class="flex justify-between items-center bg-white rounded-xl p-3">
                                    <span class="text-gray-600 text-sm">📂 ประเภทคดี:</span>
                                    <span class="font-semibold text-sm">${scenario.title}</span>
                                </div>
                                <div class="flex justify-between items-center bg-white rounded-xl p-3">
                                    <span class="text-gray-600 text-sm">❓ จำนวนคำถาม:</span>
                                    <span class="font-semibold text-sm">${answers.length} ข้อ</span>
                                </div>
                                <div class="flex justify-between items-center bg-white rounded-xl p-3">
                                    <span class="text-gray-600 text-sm">🕐 เวลาที่แจ้ง:</span>
                                    <span class="font-semibold text-sm">${new Date().toLocaleTimeString('th-TH', {hour: '2-digit', minute: '2-digit'})}</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Action Buttons -->
                        <div class="space-y-3">
                            <button onclick="app.startNewReport()" class="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 rounded-2xl font-bold hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 shadow-lg">
                                <i class="fas fa-plus-circle mr-2"></i>
                                แจ้งความใหม่
                            </button>
                            <button onclick="app.goHome()" class="w-full bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 py-4 rounded-2xl font-bold hover:from-gray-300 hover:to-gray-400 transition-all transform hover:scale-105 shadow-lg">
                                <i class="fas fa-home mr-2"></i>
                                กลับหน้าหลัก
                            </button>
                        </div>
                    </div>
                    
                    <!-- Additional Info -->
                    <div class="bg-white/80 backdrop-blur rounded-2xl p-4 text-center">
                        <p class="text-xs text-gray-500">
                            <i class="fas fa-shield-alt mr-1"></i>
                            ข้อมูลของคุณปลอดภัยและเป็นความลับ
                        </p>
                    </div>
                </div>
            </div>
        `;
        
        this.ui.render('appContainer', content);
    }

    startNewReport() {
        this.state.reset();
        this.session = null;
        this.currentReport = null;
        this.showStartView();
    }

    goHome() {
        this.state.reset();
        this.session = null;
        this.currentReport = null;
        this.showStartView();
    }

    clearAllData() {
        if (confirm('คุณต้องการลบข้อมูลทั้งหมดใช่ไหม? ข้อมูลที่กรอกไปจะหายไปทั้งหมด')) {
            this.state.reset();
            this.session = null;
            this.currentReport = null;
            this.showStartView();
        }
    }

    editReport() {
        this.state.set('answers', []);
        this.showInterviewView();
    }

    callEmergency(number) {
        if (confirm(`คุณต้องการโทรหมายเลข ${number} ใช่ไหม?`)) {
            window.location.href = `tel:${number}`;
        }
    }

    exit() {
        if (confirm('คุณต้องการออกจากระบบสัมภาษณ์ใช่ไหม? ข้อมูลที่กรอกไปจะไม่ถูกบันทึก')) {
            window.location.href = '../index.html';
        }
    }

    // UI Helper methods
    showLoading(message = 'กำลังโหลด...') {
        const content = `
            <div class="flex items-center justify-center min-h-[60vh]">
                <div class="text-center">
                    <div class="loading-spinner mx-auto mb-4"></div>
                    <p class="text-gray-600">${message}</p>
                </div>
            </div>
        `;
        this.ui.render('appContainer', content);
    }

    showError(message) {
        this.ui.showToast('error', 'ข้อผิดพลาด', message);
    }

    showSuccess(message) {
        this.ui.showToast('success', 'สำเร็จ', message);
    }

    updateConnectionStatus(isOnline) {
        const statusElement = document.getElementById('connectionStatus');
        if (statusElement) {
            if (isOnline) {
                statusElement.innerHTML = `
                    <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span class="text-gray-600">Online</span>
                `;
            } else {
                statusElement.innerHTML = `
                    <div class="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span class="text-gray-600">Offline</span>
                `;
            }
        }
    }

    async getUserIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return 'unknown';
        }
    }

    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('🔥 Global Error:', event.error);
            this.showError('เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่');
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('🔥 Unhandled Promise Rejection:', event.reason);
            this.showError('เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่');
        });
    }
}

// API Service
class APIService {
    constructor() {
        // Determine base URL based on current environment
        const isProduction = window.location.hostname.includes('police-care.test');
        this.baseURL = isProduction ? '/api' : '../api';
    }

    async get(endpoint) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`);
            return await response.json();
        } catch (error) {
            console.error('API GET Error:', error);
            throw error;
        }
    }

    async post(endpoint, data) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('API POST Error:', error);
            throw error;
        }
    }

    async put(endpoint, data) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('API PUT Error:', error);
            throw error;
        }
    }
}

// State Manager
class StateManager {
    constructor() {
        this.data = {
            scenarios: null,
            currentScenario: null,
            scenarioDetails: null,
            answers: []
        };
    }

    get(key) {
        return this.data[key];
    }

    set(key, value) {
        this.data[key] = value;
    }

    reset() {
        this.data = {
            scenarios: this.data.scenarios,
            currentScenario: null,
            scenarioDetails: null,
            answers: []
        };
    }
}

// UI Manager
class UIManager {
    render(containerId, content) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = content;
        }
    }

    showToast(type, title, message) {
        const toast = document.getElementById('toast');
        const toastIcon = document.getElementById('toastIcon');
        const toastTitle = document.getElementById('toastTitle');
        const toastMessage = document.getElementById('toastMessage');

        if (type === 'success') {
            toastIcon.innerHTML = '<i class="fas fa-check-circle text-green-500 text-xl"></i>';
        } else if (type === 'error') {
            toastIcon.innerHTML = '<i class="fas fa-exclamation-circle text-red-500 text-xl"></i>';
        }

        toastTitle.textContent = title;
        toastMessage.textContent = message;

        toast.classList.remove('hidden');
        toast.classList.add('fade-in');

        setTimeout(() => {
            toast.classList.add('hidden');
        }, 5000);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ProductionInterviewApp();
    
    // Make methods globally accessible
    window.startInterview = (scenarioKey) => window.app.startInterview(scenarioKey);
    window.answerYes = () => window.app.answerYes();
    window.answerNo = () => window.app.answerNo();
    window.showHelp = () => window.app.showHelp();
    window.startNewReport = () => window.app.startNewReport();
    window.goHome = () => window.app.goHome();
    window.practiceAnswerFromModal = (answer) => window.app.practiceAnswerFromModal(answer);
    window.practiceAnswer = (answer) => window.app.practiceAnswer(answer);
    window.clearAllData = () => window.app.clearAllData();
    window.editReport = () => window.app.editReport();
    window.submitReport = () => window.app.submitReport();
    window.exit = () => window.app.exit();
    window.callEmergency = (number) => window.app.callEmergency(number);
    
    console.log('🎉 Police Care Interview System v3.0 Production Ready!');
});
