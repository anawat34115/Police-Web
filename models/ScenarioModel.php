<?php
/**
 * Scenario Model - Police Care Interview System
 * Handles all database operations for scenarios
 */

class ScenarioModel {
    private $conn;
    private $table_name = "scenarios";
    private $questions_table = "questions";
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    /**
     * Get all active scenarios
     */
    public function getAll() {
        try {
            $sql = "SELECT * FROM " . $this->table_name . " 
                    WHERE is_active = TRUE 
                    ORDER BY id ASC";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch (Exception $e) {
            error_log("Get scenarios error: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get scenario by ID with questions
     */
    public function getByIdWithQuestions($scenario_key) {
        try {
            // Get scenario
            $sql = "SELECT * FROM " . $this->table_name . " 
                    WHERE scenario_key = ? AND is_active = TRUE";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$scenario_key]);
            
            $scenario = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($scenario) {
                // Get questions
                $questions_sql = "SELECT * FROM " . $this->questions_table . " 
                                WHERE scenario_key = ? AND is_active = TRUE 
                                ORDER BY question_number ASC";
                
                $questions_stmt = $this->conn->prepare($questions_sql);
                $questions_stmt->execute([$scenario_key]);
                
                $scenario['questions'] = $questions_stmt->fetchAll(PDO::FETCH_ASSOC);
            }
            
            return $scenario;
            
        } catch (Exception $e) {
            error_log("Get scenario with questions error: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Get scenario by ID
     */
    public function getById($scenario_key) {
        try {
            $sql = "SELECT * FROM " . $this->table_name . " 
                    WHERE scenario_key = ? AND is_active = TRUE";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$scenario_key]);
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
            
        } catch (Exception $e) {
            error_log("Get scenario error: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Get questions for a scenario
     */
    public function getQuestions($scenario_key) {
        try {
            $sql = "SELECT * FROM " . $this->questions_table . " 
                    WHERE scenario_key = ? AND is_active = TRUE 
                    ORDER BY question_number ASC";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$scenario_key]);
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch (Exception $e) {
            error_log("Get questions error: " . $e->getMessage());
            return [];
        }
    }
}
?>
