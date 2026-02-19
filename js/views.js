/**
 * Views - Police Care Interview System
 * จัดการการแสดงผล UI แต่ละหน้า
 */

class BaseView {
    constructor(containerId) {
        this.containerId = containerId;
        this.element = document.getElementById(containerId);
    }

    // Render content to container
    render(content) {
        if (this.element) {
            this.element.innerHTML = content;
        }
    }

    // Show view
    show() {
        if (this.element) {
            this.element.classList.remove('hidden');
        }
    }

    // Hide view
    hide() {
        if (this.element) {
            this.element.classList.add('hidden');
        }
    }

    // Clear content
    clear() {
        if (this.element) {
            this.element.innerHTML = '';
        }
    }
}

/**
 * Start View - หน้าเริ่มต้น
 */
class StartView extends BaseView {
    constructor() {
        super('appContainer');
    }

    render() {
        const scenarios = window.dataStore.getAllScenarios();
        
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
        
        super.render(content);
    }

    renderScenarioCard(scenario) {
        return `
            <button onclick="app.startInterview('${scenario.id}')" class="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-police-red hover:bg-red-50 transition text-center group">
                <div class="w-16 h-16 mx-auto bg-${scenario.color}-100 rounded-full flex items-center justify-center text-${scenario.color}-600 mb-4 group-hover:bg-${scenario.color}-200 transition">
                    <i class="fas ${scenario.icon} text-2xl"></i>
                </div>
                <h3 class="font-bold text-gray-900 mb-2">${scenario.title}</h3>
                <p class="text-sm text-gray-500">คำถาม ${scenario.getTotalQuestions()} ข้อ</p>
            </button>
        `;
    }
}

/**
 * Interview View - หน้าสัมภาษณ์
 */
class InterviewView extends BaseView {
    constructor() {
        super('appContainer');
    }

    render(scenario, questionIndex, answers) {
        const question = scenario.getCurrentQuestion(questionIndex);
        if (!question) return;

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
                                    <span class="bg-police-red text-white text-xs font-bold px-3 py-1 rounded-full">คำถามที่ ${questionIndex + 1}</span>
                                    <span class="text-sm text-gray-500">ประเภท: ${scenario.title}</span>
                                </div>
                                <h2 class="text-2xl font-bold text-gray-900 mb-4">${question.text}</h2>
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
                            ${this.renderProgress(questionIndex + 1, scenario.getTotalQuestions())}
                        </div>

                        <!-- Collected Info -->
                        <div class="bg-white rounded-2xl shadow-xl p-6">
                            <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <i class="fas fa-clipboard-list text-police-red"></i>
                                ข้อมูลที่เก็บได้
                            </h3>
                            ${this.renderCollectedInfo(scenario, answers)}
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
        
        super.render(content);
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

    renderCollectedInfo(scenario, answers) {
        if (answers.length === 0) {
            return '<div class="text-gray-500">ยังไม่มีข้อมูล...</div>';
        }

        return answers.map(answer => `
            <div class="flex items-center gap-2 mb-2">
                <span class="font-bold text-sm">${answer.questionText}:</span>
                <span class="${answer.getAnswerColor()} font-bold text-sm">${answer.getAnswerText()}</span>
            </div>
        `).join('');
    }
}

/**
 * Sign Help View - หน้าสอนภาษามือ
 */
class SignHelpView extends BaseView {
    constructor() {
        super('appContainer');
    }

    render(question) {
        const content = `
            <div class="max-w-4xl mx-auto">
                <div class="bg-white rounded-2xl shadow-xl p-8">
                    <div class="text-center mb-8">
                        <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-hands text-blue-600 text-3xl"></i>
                        </div>
                        <h2 class="text-3xl font-bold text-gray-900 mb-4">เรียนรู้ท่ามือสำหรับคำถามนี้</h2>
                        <p class="text-gray-600 text-lg mb-2">คำถาม: "${question.text}"</p>
                        <p class="text-gray-500">เรียนรู้ท่ามือ แล้วลองตอบคำถามใหม่อีกครั้ง</p>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        ${this.renderSignCards()}
                    </div>
                    
                    <!-- Practice Buttons -->
                    <div class="flex justify-center gap-4">
                        <button onclick="app.practiceAnswer('yes')" class="bg-green-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-600 transition">
                            <i class="fas fa-thumbs-up mr-2"></i> ฉันพร้อมตอบ "ใช่"
                        </button>
                        <button onclick="app.practiceAnswer('no')" class="bg-red-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-600 transition">
                            <i class="fas fa-thumbs-down mr-2"></i> ฉันพร้อมตอบ "ไม่ใช่"
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        super.render(content);
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
}

/**
 * Summary View - หน้าสรุป
 */
class SummaryView extends BaseView {
    constructor() {
        super('appContainer');
    }

    render(report) {
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
                                <span>${report.scenario}</span>
                            </div>
                            <div class="flex justify-between py-2 border-b">
                                <span class="font-bold">เวลาแจ้ง:</span>
                                <span>${new Date().toLocaleString('th-TH')}</span>
                            </div>
                            ${report.answers.map(answer => `
                                <div class="flex justify-between py-2 border-b">
                                    <span class="font-bold">${answer.questionText}:</span>
                                    <span class="${answer.getAnswerColor()} font-bold">${answer.getAnswerText()}</span>
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
        
        super.render(content);
    }
}

// Global view instances
window.views = {
    start: new StartView(),
    interview: new InterviewView(),
    signHelp: new SignHelpView(),
    summary: new SummaryView()
};
