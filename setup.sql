-- Police Care Interview System Database Setup
-- Production-ready SQL script

-- Create database
CREATE DATABASE IF NOT EXISTS police_care_interview 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE police_care_interview;

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id VARCHAR(50) UNIQUE NOT NULL,
    scenario_type VARCHAR(100) NOT NULL,
    scenario_title VARCHAR(255) NOT NULL,
    status ENUM('draft', 'submitted', 'processing', 'completed', 'cancelled') DEFAULT 'draft',
    user_info JSON,
    location JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP NULL,
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_report_id (report_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create report_answers table
CREATE TABLE IF NOT EXISTS report_answers (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create scenarios table
CREATE TABLE IF NOT EXISTS scenarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    scenario_key VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    icon VARCHAR(100) NOT NULL,
    color VARCHAR(50) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_scenario_key (scenario_key),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    scenario_key VARCHAR(50) NOT NULL,
    question_number INT NOT NULL,
    question_text TEXT NOT NULL,
    explanation TEXT,
    video_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (scenario_key) REFERENCES scenarios(scenario_key) ON DELETE CASCADE,
    UNIQUE KEY unique_scenario_question (scenario_key, question_number),
    INDEX idx_scenario_key (scenario_key),
    INDEX idx_question_number (question_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create audit_log table
CREATE TABLE IF NOT EXISTS audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_report_id (report_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default scenarios
INSERT IGNORE INTO scenarios (scenario_key, title, icon, color, description) VALUES
('theft', 'แจ้งเหตุลักทรัพย์', 'fa-mask', 'orange', 'รายงานเหตุการณ์ที่เกี่ยวข้องกับการลักทรัพย์'),
('accident', 'อุบัติเหตุรถชน', 'fa-car-burst', 'blue', 'รายงานอุบัติเหตุทางรถยนต์'),
('assault', 'การทำร้ายร่างกาย', 'fa-user-injured', 'red', 'รายงานเหตุการณ์ทำร้ายร่างกาย'),
('fire', 'ไฟไหม้', 'fa-fire', 'red', 'รายงานเหตุการณ์ไฟไหม้'),
('missing', 'บุคคลสูญหาย', 'fa-person-walking', 'purple', 'รายงานบุคคลสูญหาย');

-- Insert default questions for theft scenario
INSERT IGNORE INTO questions (scenario_key, question_number, question_text, explanation, video_url) VALUES
('theft', 1, 'คุณเห็นหน้าคนร้ายไหม?', 'ท่ามือ: ชี้ไปที่ตา แล้วทำท่ามองหา', 'videos/theft/saw_suspect.mp4'),
('theft', 2, 'มีกล้องวงจรปิดไหม?', 'ท่ามือ: ทำท่ากล้องวงจรด้วยนิ้วมือ', 'videos/theft/has_cctv.mp4'),
('theft', 3, 'มีผู้บาดเจ็บไหม?', 'ท่ามือ: ทำท่าบาดเจ็บ จับบริเวณที่เจ็บ', 'videos/theft/is_injured.mp4'),
('theft', 4, 'คนร้ายใช้อาวุธไหม?', 'ท่ามือ: ทำท่าถืออาวุธ หรือทำท่าขู่อีกฝ่าย', 'videos/theft/weapon_used.mp4');

-- Insert default questions for accident scenario
INSERT IGNORE INTO questions (scenario_key, question_number, question_text, explanation, video_url) VALUES
('accident', 1, 'มีผู้บาดเจ็บไหม?', 'ท่ามือ: ทำท่าบาดเจ็บ จับบริเวณที่เจ็บ', 'videos/accident/has_injury.mp4'),
('accident', 2, 'รถเสียหายหนักไหม?', 'ท่ามือ: ทำท่ารถพัง หรือทำท่าชนแรง', 'videos/accident/vehicle_damage.mp4'),
('accident', 3, 'เป็นรถชนแล้วหนีไหม?', 'ท่ามือ: ทำท่ารถวิ่งหนี', 'videos/accident/hit_and_run.mp4'),
('accident', 4, 'ต้องการรถพยาบาลไหม?', 'ท่ามือ: ทำท่าเรียกรถพยาบาล', 'videos/accident/need_ambulance.mp4');

-- Insert default questions for assault scenario
INSERT IGNORE INTO questions (scenario_key, question_number, question_text, explanation, video_url) VALUES
('assault', 1, 'ต้องการความช่วยเหลือทางการแพทย์ไหม?', 'ท่ามือ: ทำท่าเรียกหมอ หรือจับบริเวณที่เจ็บ', 'videos/assault/needs_medical.mp4'),
('assault', 2, 'มีอาวุธประกอบภัยไหม?', 'ท่ามือ: ทำท่าถืออาวุธ หรือทำท่าขู่อีกฝ่าย', 'videos/assault/weapon_involved.mp4'),
('assault', 3, 'มีผู้ก่อเหตุหลายคนไหม?', 'ท่ามือ: ชี้นิ้วหลายๆ แล้วทำท่าทำร้าย', 'videos/assault/multiple_attackers.mp4'),
('assault', 4, 'มีพยานเห็นเหตุการณ์ไหม?', 'ท่ามือ: ชี้ไปรอบๆ แล้วทำท่ามองเห็น', 'videos/assault/witness_present.mp4');

-- Insert default questions for fire scenario
INSERT IGNORE INTO questions (scenario_key, question_number, question_text, explanation, video_url) VALUES
('fire', 1, 'มีคนติดอยู่ในอาคารไหม?', 'ท่ามือ: ทำท่าคนติดอยู่ และทำท่าไฟ', 'videos/fire/people_trapped.mp4'),
('fire', 2, 'เป็นอาคารพักอาศัยไหม?', 'ท่ามือ: ทำท่าบ้าน และทำท่าไฟ', 'videos/fire/building_type.mp4'),
('fire', 3, 'มีเสียงระเบิดไหม?', 'ท่ามือ: ทำท่าระเบิด ปิดหูและทำท่าเสียงดัง', 'videos/fire/explosion.mp4'),
('fire', 4, 'ต้องการรถดับเพลิงไหม?', 'ท่ามือ: ทำท่ารถดับเพลิง', 'videos/fire/need_fire_truck.mp4');

-- Insert default questions for missing scenario
INSERT IGNORE INTO questions (scenario_key, question_number, question_text, explanation, video_url) VALUES
('missing', 1, 'เป็นเด็กสูญหายไหม?', 'ท่ามือ: ทำท่าเด็ก และทำท่าหายไป', 'videos/missing/child_missing.mp4'),
('missing', 2, 'มีโรคประจำตัวไหม?', 'ท่ามือ: ทำท่าป่วย หรือทำท่ากินยา', 'videos/missing/medical_condition.mp4'),
('missing', 3, 'เห็นครั้งสุดท้ายเมื่อเมื่อไหร่?', 'ท่ามือ: ทำท่าดูนาฬิกา และทำท่ามองหา', 'videos/missing/last_seen.mp4'),
('missing', 4, 'มีความต้องการพิเศษพิเศษไหม?', 'ท่ามือ: ทำท่าต้องการความช่วยเหลือพิเศษ', 'videos/missing/special_needs.mp4');

-- Create views for reporting
CREATE OR REPLACE VIEW report_summary AS
SELECT 
    r.report_id,
    r.scenario_title,
    r.status,
    COUNT(ra.id) as answer_count,
    r.created_at,
    r.submitted_at
FROM reports r
LEFT JOIN report_answers ra ON r.report_id = ra.report_id
GROUP BY r.report_id;

-- Create stored procedure for statistics
DELIMITER //
CREATE PROCEDURE GetDailyStats()
BEGIN
    SELECT 
        DATE(created_at) as report_date,
        COUNT(*) as total_reports,
        SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as submitted_reports,
        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing_reports
    FROM reports
    WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    GROUP BY DATE(created_at)
    ORDER BY report_date DESC;
END //
DELIMITER ;

-- Create trigger for audit logging
DELIMITER //
CREATE TRIGGER reports_audit_insert
AFTER INSERT ON reports
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (report_id, action, details, ip_address, user_agent)
    VALUES (NEW.report_id, 'create', JSON_OBJECT('scenario', NEW.scenario_title), NULL, NULL);
END //
DELIMITER ;

-- Grant permissions (adjust as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON police_care_interview.* TO 'police_care_user'@'localhost' IDENTIFIED BY 'secure_password';
-- FLUSH PRIVILEGES;

-- Show database info
SELECT 'Database setup completed successfully!' as message;
SELECT COUNT(*) as scenarios_count FROM scenarios;
SELECT COUNT(*) as questions_count FROM questions;
