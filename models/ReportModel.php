<?php
/**
 * Report Model - Police Care Interview System
 * Handles all database operations for reports
 */

class ReportModel {
    private $conn;
    private $table_name = "reports";
    private $answers_table = "report_answers";
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    /**
     * Create new report
     */
    public function create($data) {
        try {
            // Generate unique report ID
            $report_id = 'RPT' . date('Ymd') . strtoupper(uniqid());
            
            // Start transaction
            $this->conn->beginTransaction();
            
            // Insert main report
            $sql = "INSERT INTO " . $this->table_name . " 
                    (report_id, scenario_type, scenario_title, status, user_info, location) 
                    VALUES (?, ?, ?, 'draft', ?, ?)";
            
            $stmt = $this->conn->prepare($sql);
            $user_info = isset($data['user_info']) ? json_encode($data['user_info']) : null;
            $location = isset($data['location']) ? json_encode($data['location']) : null;
            
            $stmt->execute([
                $report_id,
                $data['scenario_type'],
                $data['scenario_title'],
                $user_info,
                $location
            ]);
            
            // Insert answers
            if (isset($data['answers']) && is_array($data['answers'])) {
                foreach ($data['answers'] as $answer) {
                    // Convert boolean to integer for MySQL BOOLEAN compatibility
                    $answer_value = $answer['answer'] ? 1 : 0;
                    
                    $sql_answer = "INSERT INTO " . $this->answers_table . " 
                                  (report_id, question_id, question_text, answer, answer_text) 
                                  VALUES (?, ?, ?, ?, ?)";
                    
                    $stmt_answer = $this->conn->prepare($sql_answer);
                    $stmt_answer->execute([
                        $report_id,
                        $answer['question_id'],
                        $answer['question_text'],
                        $answer_value,  // Use integer 0/1 instead of boolean
                        $answer['answer_text']
                    ]);
                }
            }
            
            // Log audit
            $this->logAudit($report_id, 'create', $data);
            
            // Commit transaction
            $this->conn->commit();
            
            // Return created report
            return $this->getById($report_id);
            
        } catch (Exception $e) {
            $this->conn->rollback();
            error_log("Create report error: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get report by ID
     */
    public function getById($report_id) {
        try {
            $sql = "SELECT r.*, 
                           GROUP_CONCAT(
                               CONCAT(ra.question_id, ':', ra.question_text, ':', ra.answer, ':', ra.answer_text) 
                               SEPARATOR '|'
                           ) as answers_data
                    FROM " . $this->table_name . " r
                    LEFT JOIN " . $this->answers_table . " ra ON r.report_id = ra.report_id
                    WHERE r.report_id = ?
                    GROUP BY r.report_id";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$report_id]);
            
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($row) {
                // Parse answers
                $answers = [];
                if ($row['answers_data']) {
                    $answer_parts = explode('|', $row['answers_data']);
                    foreach ($answer_parts as $part) {
                        $answer_data = explode(':', $part);
                        if (count($answer_data) >= 4) {
                            $answers[] = [
                                'question_id' => $answer_data[0],
                                'question_text' => $answer_data[1],
                                'answer' => $answer_data[2] === '1',
                                'answer_text' => $answer_data[3]
                            ];
                        }
                    }
                }
                
                return [
                    'report_id' => $row['report_id'],
                    'scenario_type' => $row['scenario_type'],
                    'scenario_title' => $row['scenario_title'],
                    'status' => $row['status'],
                    'user_info' => $row['user_info'] ? json_decode($row['user_info'], true) : null,
                    'location' => $row['location'] ? json_decode($row['location'], true) : null,
                    'answers' => $answers,
                    'created_at' => $row['created_at'],
                    'updated_at' => $row['updated_at'],
                    'submitted_at' => $row['submitted_at']
                ];
            }
            
            return null;
            
        } catch (Exception $e) {
            error_log("Get report error: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Get all reports with pagination
     */
    public function getAll($page = 1, $limit = 10, $status = null) {
        try {
            $offset = ($page - 1) * $limit;
            
            $sql = "SELECT r.report_id, r.scenario_title, r.status, 
                           COUNT(ra.id) as answer_count,
                           r.created_at, r.submitted_at
                    FROM " . $this->table_name . " r
                    LEFT JOIN " . $this->answers_table . " ra ON r.report_id = ra.report_id";
            
            $params = [];
            
            if ($status) {
                $sql .= " WHERE r.status = ?";
                $params[] = $status;
            }
            
            $sql .= " GROUP BY r.report_id 
                     ORDER BY r.created_at DESC 
                     LIMIT ? OFFSET ?";
            
            $params[] = $limit;
            $params[] = $offset;
            
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            
            $reports = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Get total count
            $count_sql = "SELECT COUNT(DISTINCT report_id) as total FROM " . $this->table_name;
            if ($status) {
                $count_sql .= " WHERE status = ?";
            }
            
            $count_stmt = $this->conn->prepare($count_sql);
            $count_stmt->execute($status ? [$status] : []);
            $total = $count_stmt->fetch(PDO::FETCH_ASSOC)['total'];
            
            return [
                'reports' => $reports,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $total,
                    'pages' => ceil($total / $limit)
                ]
            ];
            
        } catch (Exception $e) {
            error_log("Get all reports error: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Update report
     */
    public function update($report_id, $data) {
        try {
            $this->conn->beginTransaction();
            
            // Build update query
            $sql = "UPDATE " . $this->table_name . " SET ";
            $updates = [];
            $params = [];
            
            if (isset($data['status'])) {
                $updates[] = "status = ?";
                $params[] = $data['status'];
                
                if ($data['status'] === 'submitted') {
                    $updates[] = "submitted_at = CURRENT_TIMESTAMP";
                }
            }
            
            if (isset($data['user_info'])) {
                $updates[] = "user_info = ?";
                $params[] = json_encode($data['user_info']);
            }
            
            if (isset($data['location'])) {
                $updates[] = "location = ?";
                $params[] = json_encode($data['location']);
            }
            
            if (empty($updates)) {
                $this->conn->rollback();
                return false;
            }
            
            $sql .= implode(', ', $updates) . " WHERE report_id = ?";
            $params[] = $report_id;
            
            $stmt = $this->conn->prepare($sql);
            $success = $stmt->execute($params);
            
            // Update answers if provided
            if ($success && isset($data['answers']) && is_array($data['answers'])) {
                // Delete existing answers
                $delete_sql = "DELETE FROM " . $this->answers_table . " WHERE report_id = ?";
                $delete_stmt = $this->conn->prepare($delete_sql);
                $delete_stmt->execute([$report_id]);
                
                // Insert new answers
                foreach ($data['answers'] as $answer) {
                    $insert_sql = "INSERT INTO " . $this->answers_table . " 
                                  (report_id, question_id, question_text, answer, answer_text) 
                                  VALUES (?, ?, ?, ?, ?)";
                    
                    $insert_stmt = $this->conn->prepare($insert_sql);
                    $insert_stmt->execute([
                        $report_id,
                        $answer['question_id'],
                        $answer['question_text'],
                        $answer['answer'],
                        $answer['answer_text']
                    ]);
                }
            }
            
            // Log audit
            $this->logAudit($report_id, 'update', $data);
            
            $this->conn->commit();
            
            return $this->getById($report_id);
            
        } catch (Exception $e) {
            $this->conn->rollback();
            error_log("Update report error: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Delete report
     */
    public function delete($report_id) {
        try {
            $this->conn->beginTransaction();
            
            // Delete answers (will cascade due to foreign key)
            $sql = "DELETE FROM " . $this->table_name . " WHERE report_id = ?";
            $stmt = $this->conn->prepare($sql);
            $success = $stmt->execute([$report_id]);
            
            if ($success) {
                $this->logAudit($report_id, 'delete', ['report_id' => $report_id]);
            }
            
            $this->conn->commit();
            
            return $success;
            
        } catch (Exception $e) {
            $this->conn->rollback();
            error_log("Delete report error: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get statistics
     */
    public function getStatistics() {
        try {
            $sql = "SELECT status, COUNT(*) as count 
                    FROM " . $this->table_name . " 
                    GROUP BY status";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->execute();
            
            $stats = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Get total reports
            $total_sql = "SELECT COUNT(*) as total FROM " . $this->table_name;
            $total_stmt = $this->conn->prepare($total_sql);
            $total_stmt->execute();
            $total = $total_stmt->fetch(PDO::FETCH_ASSOC)['total'];
            
            // Get today's reports
            $today_sql = "SELECT COUNT(*) as today FROM " . $this->table_name . " 
                         WHERE DATE(created_at) = CURDATE()";
            $today_stmt = $this->conn->prepare($today_sql);
            $today_stmt->execute();
            $today = $today_stmt->fetch(PDO::FETCH_ASSOC)['today'];
            
            return [
                'total' => $total,
                'today' => $today,
                'by_status' => $stats
            ];
            
        } catch (Exception $e) {
            error_log("Get statistics error: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Log audit trail
     */
    private function logAudit($report_id, $action, $details) {
        try {
            $sql = "INSERT INTO audit_log (report_id, action, details, ip_address, user_agent) 
                    VALUES (?, ?, ?, ?, ?)";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([
                $report_id,
                $action,
                json_encode($details),
                $_SERVER['REMOTE_ADDR'] ?? null,
                $_SERVER['HTTP_USER_AGENT'] ?? null
            ]);
            
        } catch (Exception $e) {
            error_log("Audit log error: " . $e->getMessage());
        }
    }
}
?>
