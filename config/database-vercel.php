<?php
/**
 * Database Configuration - Police Care Interview System
 * Vercel deployment configuration with environment variables
 */

class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $charset = 'utf8mb4';
    
    public $conn;
    
    public function __construct() {
        // Vercel environment variables
        $this->host = $_ENV['DB_HOST'] ?? 'localhost';
        $this->db_name = $_ENV['DB_NAME'] ?? 'police_care_interview';
        $this->username = $_ENV['DB_USER'] ?? 'root';
        $this->password = $_ENV['DB_PASSWORD'] ?? '';
    }
    
    public function getConnection() {
        $this->conn = null;
        
        try {
            $dsn = "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=" . $this->charset;
            $this->conn = new PDO($dsn, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            $this->conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
            
            // Set timezone
            date_default_timezone_set('Asia/Bangkok');
            
        } catch(PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }
        
        return $this->conn;
    }
    
    /**
     * Initialize database tables
     */
    public function initializeTables() {
        try {
            $conn = $this->getConnection();
            
            // Create reports table
            $sql_reports = "CREATE TABLE IF NOT EXISTS reports (
                report_id VARCHAR(50) PRIMARY KEY,
                scenario_type VARCHAR(50) NOT NULL,
                scenario_title VARCHAR(255) NOT NULL,
                status ENUM('draft', 'submitted', 'reviewed', 'processing') DEFAULT 'draft',
                user_info JSON,
                location JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                submitted_at TIMESTAMP NULL,
                INDEX idx_status (status),
                INDEX idx_created_at (created_at),
                INDEX idx_report_id (report_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
            
            $conn->exec($sql_reports);
            
            // Create report_answers table
            $sql_answers = "CREATE TABLE IF NOT EXISTS report_answers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                report_id VARCHAR(50) NOT NULL,
                question_id INT NOT NULL,
                question_text TEXT NOT NULL,
                answer BOOLEAN NOT NULL,
                answer_text VARCHAR(10) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (report_id) REFERENCES reports(report_id) ON DELETE CASCADE,
                INDEX idx_report_id (report_id),
                INDEX idx_question_id (question_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
            
            $conn->exec($sql_answers);
            
            // Create scenarios table
            $sql_scenarios = "CREATE TABLE IF NOT EXISTS scenarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                scenario_key VARCHAR(50) UNIQUE NOT NULL,
                title VARCHAR(255) NOT NULL,
                icon VARCHAR(100) NOT NULL,
                color VARCHAR(50) NOT NULL,
                description TEXT,
                is_active BOOLEAN DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
            
            $conn->exec($sql_scenarios);
            
            // Create questions table
            $sql_questions = "CREATE TABLE IF NOT EXISTS questions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                scenario_key VARCHAR(50) NOT NULL,
                question_number INT NOT NULL,
                question_text TEXT NOT NULL,
                explanation TEXT,
                video_url VARCHAR(255),
                is_active BOOLEAN DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (scenario_key) REFERENCES scenarios(scenario_key) ON DELETE CASCADE,
                INDEX idx_scenario_key (scenario_key),
                INDEX idx_question_number (question_number)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
            
            $conn->exec($sql_questions);
            
            // Create audit_log table
            $sql_audit = "CREATE TABLE IF NOT EXISTS audit_log (
                id INT AUTO_INCREMENT PRIMARY KEY,
                report_id VARCHAR(50) NOT NULL,
                action VARCHAR(50) NOT NULL,
                details JSON,
                user_info JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_report_id (report_id),
                INDEX idx_action (action),
                INDEX idx_created_at (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
            
            $conn->exec($sql_audit);
            
            // Insert default scenarios
            $this->insertDefaultScenarios($conn);
            
            // Insert default questions
            $this->insertDefaultQuestions($conn);
            
            return true;
            
        } catch(PDOException $exception) {
            echo "Database initialization error: " . $exception->getMessage();
            return false;
        }
    }
    
    /**
     * Insert default scenarios
     */
    private function insertDefaultScenarios($conn) {
        $scenarios = [
            ['theft', 'แจ้งเหตุลักทรัพย์', 'fa-mask', 'orange', 'รายงานเหตุการณ์ที่เกี่ยวข้องกับการลักทรัพย์'],
            ['accident', 'อุบัติเหตุรถชน', 'fa-car-burst', 'blue', 'รายงานอุบัติเหตุทางรถยนต์'],
            ['assault', 'การทำร้ายร่างกาย', 'fa-user-injured', 'red', 'รายงานเหตุการณ์ทำร้ายร่างกาย'],
            ['fire', 'ไฟไหม้', 'fa-fire', 'red', 'รายงานเหตุการณ์ไฟไหม้'],
            ['missing', 'บุคคลสูญหาย', 'fa-person-walking', 'purple', 'รายงานบุคคลสูญหาย']
        ];
        
        $sql = "INSERT IGNORE INTO scenarios (scenario_key, title, icon, color, description) VALUES (?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        
        foreach ($scenarios as $scenario) {
            $stmt->execute([$scenario[0], $scenario[1], $scenario[2], $scenario[3]]);
        }
    }
    
    /**
     * Insert default questions
     */
    private function insertDefaultQuestions($conn) {
        $questions = [
            // Theft questions
            ['theft', 1, 'คุณเห็นหน้าคนร้ายไหม?', 'ท่ามือ: ชี้ไปที่ตา แล้วทำท่ามองหา', 'videos/theft/saw_suspect.mp4'],
            ['theft', 2, 'มีกล้องวงจรปิดไหม?', 'ท่ามือ: ทำท่ากล้องวงจรด้วยนิ้วมือ', 'videos/theft/has_cctv.mp4'],
            ['theft', 3, 'มีผู้บาดเจ็บไหม?', 'ท่ามือ: ทำท่าบาดเจ็บ จับบริเวณที่เจ็บ', 'videos/theft/is_injured.mp4'],
            ['theft', 4, 'คนร้ายใช้อาวุธไหม?', 'ท่ามือ: ทำท่าถืออาวุธ หรือทำท่าขู่อีกฝ่าย', 'videos/theft/weapon_used.mp4'],
            
            // Accident questions
            ['accident', 1, 'มีผู้บาดเจ็บไหม?', 'ท่ามือ: ทำท่าบาดเจ็บ', 'videos/accident/is_injured.mp4'],
            ['accident', 2, 'ต้องการช่วยเหลือไหม?', 'ท่ามือ: ทำท่าขอความช่วยเหลือ', 'videos/accident/needs_help.mp4'],
            ['accident', 3, 'รถสามารถเคลื่อนไหม?', 'ท่ามือ: ทำท่ารถติดขัด', 'videos/accident/car_blocked.mp4'],
            ['accident', 4, 'มีคนดูอยู่ไหม?', 'ท่ามือ: ทำท่ามองหาคน', 'videos/accident/witnesses.mp4'],
            
            // Assault questions
            ['assault', 1, 'ผู้ทำร้ายยังอยู่ในที่เกิดเหตุไหม?', 'ท่ามือ: ทำท่าชี้ไปที่เหตุการณ์', 'videos/assault/assailant_present.mp4'],
            ['assault', 2, 'ผู้ทำร้ายใช้อาวุธไหม?', 'ท่ามือ: ทำท่าถืออาวุธ', 'videos/assault/weapon_used.mp4'],
            ['assault', 3, 'มีผู้บาดเจ็บหนักไหม?', 'ท่ามือ: ทำท่าบาดเจ็บ', 'videos/assault/victims_injured.mp4'],
            
            // Fire questions
            ['fire', 1, 'ไฟลุกไหม?', 'ท่ามือ: ทำท่าไฟลุก', 'videos/fire/fire_spreading.mp4'],
            ['fire', 2, 'มีคนติดอยู่ในบริเวณไหม?', 'ท่ามือ: ทำท่าคนติดไฟ', 'videos/fire/people_trapped.mp4'],
            ['fire', 3, 'ต้องการช่วยเหลือไหม?', 'ท่ามือ: ทำท่าขอความช่วยเหลือ', 'videos/fire/needs_help.mp4'],
            
            // Missing person questions
            ['missing', 1, 'บุคคลหายไปนานเท่าไหม?', 'ท่ามือ: ทำท่าบอกเวลา', 'videos/missing/how_long_missing.mp4'],
            ['missing', 2, 'บุคคลมีลักษณะพิเศษพิเศษณ์ไหม?', 'ท่ามือ: ทำท่าบอกรุณพิเศษ', 'videos/missing/identification.mp4'],
            ['missing', 3, 'บุคคลสวมใสุของอะไรเมื่อหาย?', 'ท่ามือ: ทำท่าอธิบายสุข', 'videos/missing/last_clothing.mp4'],
            ['missing', 4, 'มีใคร่ำลัวเศษณ์ของบุคคลไหม?', 'ท่ามือ: ทำท่าบอกลักษณะ', 'videos/missing/medical_info.mp4']
        ];
        
        $sql = "INSERT IGNORE INTO questions (scenario_key, question_number, question_text, explanation, video_url) VALUES (?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        
        foreach ($questions as $question) {
            $stmt->execute([$question[0], $question[1], $question[2], $question[3]]);
        }
    }
}
?>
