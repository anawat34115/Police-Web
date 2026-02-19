/**
 * Data Models - Police Care Interview System
 * จัดการข้อมูลและ Business Logic
 */

/**
 * Scenario Model - ข้อมูลสถานการณ์
 */
class ScenarioModel {
    constructor(data) {
        this.id = data.id;
        this.title = data.title;
        this.icon = data.icon;
        this.color = data.color;
        this.questions = data.questions.map(q => new QuestionModel(q));
    }

    // Get current question
    getCurrentQuestion(index) {
        return this.questions[index] || null;
    }

    // Get total questions
    getTotalQuestions() {
        return this.questions.length;
    }

    // Get questions with answers
    getQuestionsWithAnswers(answers) {
        return this.questions.map((question, index) => ({
            ...question,
            answer: answers[index] || null
        }));
    }

    // Convert to JSON
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            icon: this.icon,
            color: this.color,
            questions: this.questions.map(q => q.toJSON())
        };
    }
}

/**
 * Question Model - ข้อมูลคำถาม
 */
class QuestionModel {
    constructor(data) {
        this.id = data.id;
        this.text = data.text;
        this.explain = data.explain;
        this.videoUrl = data.videoUrl;
    }

    // Convert to JSON
    toJSON() {
        return {
            id: this.id,
            text: this.text,
            explain: this.explain,
            videoUrl: this.videoUrl
        };
    }
}

/**
 * Answer Model - ข้อมูลคำตอบ
 */
class AnswerModel {
    constructor(questionId, questionText, answer, timestamp) {
        this.questionId = questionId;
        this.questionText = questionText;
        this.answer = answer;
        this.timestamp = timestamp || new Date().toISOString();
    }

    // Get answer text
    getAnswerText() {
        return this.answer ? 'ใช่' : 'ไม่ใช่';
    }

    // Get answer color
    getAnswerColor() {
        return this.answer ? 'text-green-600' : 'text-red-600';
    }

    // Convert to JSON
    toJSON() {
        return {
            questionId: this.questionId,
            questionText: this.questionText,
            answer: this.answer,
            timestamp: this.timestamp
        };
    }
}

/**
 * Report Model - ข้อมูลรายงาน
 */
class ReportModel {
    constructor(scenario, answers, timestamp) {
        this.scenario = scenario;
        this.answers = answers;
        this.timestamp = timestamp || new Date().toISOString();
        this.status = 'draft';
    }

    // Get summary text
    getSummaryText() {
        const yesAnswers = this.answers.filter(a => a.answer);
        const summaryItems = yesAnswers.map(a => a.questionText);
        
        return `ผู้แจ้งความประสงค์แจ้งเหตุ ${this.scenario.title}`;
        
        if (summaryItems.length > 0) {
            return `${this.getSummaryText()}, โดย: ${summaryItems.join(', ')}`;
        }
        
        return this.getSummaryText();
    }

    // Convert to JSON
    toJSON() {
        return {
            scenario: this.scenario.title,
            answers: this.answers.map(a => a.toJSON()),
            timestamp: this.timestamp,
            status: this.status,
            summary: this.getSummaryText()
        };
    }

    // Submit report
    submit() {
        this.status = 'submitted';
        return this.toJSON();
    }
}

/**
 * Data Store - จัดการข้อมูลถาวร
 */
class DataStore {
    constructor() {
        this.scenarios = this.loadScenarios();
    }

    // Load scenarios data
    loadScenarios() {
        return {
            theft: new ScenarioModel({
                id: 'theft',
                title: 'แจ้งเหตุลักทรัพย์',
                icon: 'fa-mask',
                color: 'orange',
                questions: [
                    { 
                        id: 1, 
                        text: "คุณเห็นหน้าคนร้ายไหม?", 
                        explain: "ท่ามือ: ชี้ไปที่ตา แล้วทำท่ามองหา",
                        videoUrl: "videos/theft/saw_suspect.mp4"
                    },
                    { 
                        id: 2, 
                        text: "มีกล้องวงจรปิดไหม?", 
                        explain: "ท่ามือ: ทำท่ากล้องวงจรด้วยนิ้วมือ",
                        videoUrl: "videos/theft/has_cctv.mp4"
                    },
                    { 
                        id: 3, 
                        text: "มีผู้บาดเจ็บไหม?", 
                        explain: "ท่ามือ: ทำท่าบาดเจ็บ จับบริเวณที่เจ็บ",
                        videoUrl: "videos/theft/is_injured.mp4"
                    },
                    { 
                        id: 4, 
                        text: "คนร้ายใช้อาวุธไหม?", 
                        explain: "ท่ามือ: ทำท่าถืออาวุธ หรือทำท่าขู่อีกฝ่าย",
                        videoUrl: "videos/theft/weapon_used.mp4"
                    }
                ]
            }),
            accident: new ScenarioModel({
                id: 'accident',
                title: 'อุบัติเหตุรถชน',
                icon: 'fa-car-burst',
                color: 'blue',
                questions: [
                    { 
                        id: 1, 
                        text: "มีผู้บาดเจ็บไหม?", 
                        explain: "ท่ามือ: ทำท่าบาดเจ็บ จับบริเวณที่เจ็บ",
                        videoUrl: "videos/accident/has_injury.mp4"
                    },
                    { 
                        id: 2, 
                        text: "รถเสียหายหนักไหม?", 
                        explain: "ท่ามือ: ทำท่ารถพัง หรือทำท่าชนแรง",
                        videoUrl: "videos/accident/vehicle_damage.mp4"
                    },
                    { 
                        id: 3, 
                        text: "เป็นรถชนแล้วหนีไหม?", 
                        explain: "ท่ามือ: ทำท่ารถวิ่งหนี",
                        videoUrl: "videos/accident/hit_and_run.mp4"
                    },
                    { 
                        id: 4, 
                        text: "ต้องการรถพยาบาลไหม?", 
                        explain: "ท่ามือ: ทำท่าเรียกรถพยาบาล",
                        videoUrl: "videos/accident/need_ambulance.mp4"
                    }
                ]
            }),
            assault: new ScenarioModel({
                id: 'assault',
                title: 'การทำร้ายร่างกาย',
                icon: 'fa-user-injured',
                color: 'red',
                questions: [
                    { 
                        id: 1, 
                        text: "ต้องการความช่วยเหลือทางการแพทย์ไหม?", 
                        explain: "ท่ามือ: ทำท่าเรียกหมอ หรือจับบริเวณที่เจ็บ",
                        videoUrl: "videos/assault/needs_medical.mp4"
                    },
                    { 
                        id: 2, 
                        text: "มีอาวุธประกอบภัยไหม?", 
                        explain: "ท่ามือ: ทำท่าถืออาวุธ หรือทำท่าขู่อีกฝ่าย",
                        videoUrl: "videos/assault/weapon_involved.mp4"
                    },
                    { 
                        id: 3, 
                        text: "มีผู้ก่อเหตุหลายคนไหม?", 
                        explain: "ท่ามือ: ชี้นิ้วหลายๆ แล้วทำท่าทำร้าย",
                        videoUrl: "videos/assault/multiple_attackers.mp4"
                    },
                    { 
                        id: 4, 
                        text: "มีพยานเห็นเหตุการณ์ไหม?", 
                        explain: "ท่ามือ: ชี้ไปรอบๆ แล้วทำท่ามองเห็น",
                        videoUrl: "videos/assault/witness_present.mp4"
                    }
                ]
            }),
            fire: new ScenarioModel({
                id: 'fire',
                title: 'ไฟไหม้',
                icon: 'fa-fire',
                color: 'red',
                questions: [
                    { 
                        id: 1, 
                        text: "มีคนติดอยู่ในอาคารไหม?", 
                        explain: "ท่ามือ: ทำท่าคนติดอยู่ และทำท่าไฟ",
                        videoUrl: "videos/fire/people_trapped.mp4"
                    },
                    { 
                        id: 2, 
                        text: "เป็นอาคารพักอาศัยไหม?", 
                        explain: "ท่ามือ: ทำท่าบ้าน และทำท่าไฟ",
                        videoUrl: "videos/fire/building_type.mp4"
                    },
                    { 
                        id: 3, 
                        text: "มีเสียงระเบิดไหม?", 
                        explain: "ท่ามือ: ทำท่าระเบิด ปิดหูและทำท่าเสียงดัง",
                        videoUrl: "videos/fire/explosion.mp4"
                    },
                    { 
                        id: 4, 
                        text: "ต้องการรถดับเพลิงไหม?", 
                        explain: "ท่ามือ: ทำท่ารถดับเพลิง",
                        videoUrl: "videos/fire/need_fire_truck.mp4"
                    }
                ]
            }),
            missing: new ScenarioModel({
                id: 'missing',
                title: 'บุคคลสูญหาย',
                icon: 'fa-person-walking',
                color: 'purple',
                questions: [
                    { 
                        id: 1, 
                        text: "เป็นเด็กสูญหายไหม?", 
                        explain: "ท่ามือ: ทำท่าเด็ก และทำท่าหายไป",
                        videoUrl: "videos/missing/child_missing.mp4"
                    },
                    { 
                        id: 2, 
                        text: "มีโรคประจำตัวไหม?", 
                        explain: "ท่ามือ: ทำท่าป่วย หรือทำท่ากินยา",
                        videoUrl: "videos/missing/medical_condition.mp4"
                    },
                    { 
                        id: 3, 
                        text: "เห็นครั้งสุดท้ายเมื่อเมื่อไหร่?", 
                        explain: "ท่ามือ: ทำท่าดูนาฬิกา และทำท่ามองหา",
                        videoUrl: "videos/missing/last_seen.mp4"
                    },
                    { 
                        id: 4, 
                        text: "มีความต้องการพิเศษพิเศษไหม?", 
                        explain: "ท่ามือ: ทำท่าต้องการความช่วยเหลือพิเศษ",
                        videoUrl: "videos/missing/special_needs.mp4"
                    }
                ]
            })
        };
    }

    // Get scenario by ID
    getScenario(id) {
        return this.scenarios[id] || null;
    }

    // Get all scenarios
    getAllScenarios() {
        return Object.values(this.scenarios);
    }

    // Save data to localStorage
    saveToLocalStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('❌ Save Error:', error);
        }
    }

    // Load data from localStorage
    loadFromLocalStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('❌ Load Error:', error);
            return null;
        }
    }
}

// Global data store instance
window.dataStore = new DataStore();
