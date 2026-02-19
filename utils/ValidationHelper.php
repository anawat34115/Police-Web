<?php
/**
 * Validation Helper - Police Care Interview System
 * Handles input validation
 */

class ValidationHelper {
    
    /**
     * Validate required fields
     */
    public static function validateRequired($data, $required_fields) {
        foreach ($required_fields as $field) {
            if (!isset($data[$field]) || ($data[$field] === '' || $data[$field] === null)) {
                return false;
            }
        }
        return true;
    }
    
    /**
     * Validate email format
     */
    public static function validateEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }
    
    /**
     * Validate phone number (Thai format)
     */
    public static function validatePhone($phone) {
        // Remove non-digit characters
        $phone = preg_replace('/[^0-9]/', '', $phone);
        
        // Check if it's a valid Thai phone number (9-10 digits)
        return preg_match('/^[0-9]{9,10}$/', $phone);
    }
    
    /**
     * Validate report ID format
     */
    public static function validateReportId($report_id) {
        return preg_match('/^RPT[0-9]{8}[A-F0-9]+$/', $report_id);
    }
    
    /**
     * Validate scenario type
     */
    public static function validateScenarioType($scenario_type) {
        $valid_scenarios = ['theft', 'accident', 'assault', 'fire', 'missing'];
        return in_array($scenario_type, $valid_scenarios);
    }
    
    /**
     * Sanitize input
     */
    public static function sanitize($input) {
        if (is_array($input)) {
            return array_map([self::class, 'sanitize'], $input);
        }
        return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
    }
}
?>
