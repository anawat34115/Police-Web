<?php
/**
 * Response Helper - Police Care Interview System
 * Standardized API response format
 */

class ResponseHelper {
    
    /**
     * Send success response
     */
    public static function success($data = null, $status_code = 200) {
        http_response_code($status_code);
        
        $response = [
            'success' => true,
            'timestamp' => date('Y-m-d H:i:s'),
            'data' => $data
        ];
        
        echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit();
    }
    
    /**
     * Send error response
     */
    public static function error($message, $status_code = 400, $error_code = null) {
        http_response_code($status_code);
        
        $response = [
            'success' => false,
            'timestamp' => date('Y-m-d H:i:s'),
            'error' => [
                'message' => $message,
                'code' => $error_code ?: 'ERROR_' . $status_code
            ]
        ];
        
        // Add validation errors if available
        if (isset($GLOBALS['validation_errors'])) {
            $response['error']['validation_errors'] = $GLOBALS['validation_errors'];
        }
        
        echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit();
    }
    
    /**
     * Send paginated response
     */
    public static function paginated($data, $pagination, $status_code = 200) {
        http_response_code($status_code);
        
        $response = [
            'success' => true,
            'timestamp' => date('Y-m-d H:i:s'),
            'data' => $data,
            'pagination' => $pagination
        ];
        
        echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit();
    }
    
    /**
     * Send validation error response
     */
    public static function validationError($errors) {
        $GLOBALS['validation_errors'] = $errors;
        self::error('Validation failed', 422, 'VALIDATION_ERROR');
    }
    
    /**
     * Send not found response
     */
    public static function notFound($message = 'Resource not found') {
        self::error($message, 404, 'NOT_FOUND');
    }
    
    /**
     * Send unauthorized response
     */
    public static function unauthorized($message = 'Unauthorized access') {
        self::error($message, 401, 'UNAUTHORIZED');
    }
    
    /**
     * Send forbidden response
     */
    public static function forbidden($message = 'Access forbidden') {
        self::error($message, 403, 'FORBIDDEN');
    }
    
    /**
     * Send server error response
     */
    public static function serverError($message = 'Internal server error') {
        self::error($message, 500, 'SERVER_ERROR');
    }
    
    /**
     * Send method not allowed response
     */
    public static function methodNotAllowed($message = 'Method not allowed') {
        self::error($message, 405, 'METHOD_NOT_ALLOWED');
    }
}
?>
