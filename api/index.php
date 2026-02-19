<?php
/**
 * API Router - Police Care Interview System
 * RESTful API for interview system
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include required files
require_once '../config/database.php';
require_once '../models/ReportModel.php';
require_once '../models/ScenarioModel.php';
require_once '../middleware/AuthMiddleware.php';
require_once '../utils/ResponseHelper.php';
require_once '../utils/ValidationHelper.php';

// Get request method and path
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path_parts = explode('/', trim($path, '/'));

// Remove 'api' from path
array_shift($path_parts);

try {
    // Initialize database
    $database = new Database();
    $db = $database->getConnection();
    
    // Route requests
    switch ($path_parts[0]) {
        case 'scenarios':
            handleScenarios($method, $db, $path_parts);
            break;
            
        case 'reports':
            handleReports($method, $db, $path_parts);
            break;
            
        case 'interview':
            handleInterview($method, $db, $path_parts);
            break;
            
        case 'health':
            ResponseHelper::success(['status' => 'healthy', 'timestamp' => date('Y-m-d H:i:s')]);
            break;
            
        default:
            ResponseHelper::error('Endpoint not found', 404);
            break;
    }
    
} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    ResponseHelper::error('Internal server error', 500);
}

/**
 * Handle scenarios endpoints
 */
function handleScenarios($method, $db, $path_parts) {
    $scenarioModel = new ScenarioModel($db);
    
    switch ($method) {
        case 'GET':
            if (isset($path_parts[1])) {
                // Get specific scenario with questions
                $scenario = $scenarioModel->getByIdWithQuestions($path_parts[1]);
                if ($scenario) {
                    ResponseHelper::success($scenario);
                } else {
                    ResponseHelper::error('Scenario not found', 404);
                }
            } else {
                // Get all scenarios
                $scenarios = $scenarioModel->getAll();
                ResponseHelper::success($scenarios);
            }
            break;
            
        default:
            ResponseHelper::error('Method not allowed', 405);
            break;
    }
}

/**
 * Handle reports endpoints
 */
function handleReports($method, $db, $path_parts) {
    $reportModel = new ReportModel($db);
    
    switch ($method) {
        case 'GET':
            if (isset($path_parts[1])) {
                // Get specific report
                $report = $reportModel->getById($path_parts[1]);
                if ($report) {
                    ResponseHelper::success($report);
                } else {
                    ResponseHelper::error('Report not found', 404);
                }
            } else {
                // Get all reports with pagination
                $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
                $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
                $status = isset($_GET['status']) ? $_GET['status'] : null;
                
                $reports = $reportModel->getAll($page, $limit, $status);
                ResponseHelper::success($reports);
            }
            break;
            
        case 'POST':
            // Create new report
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validate required fields
            $required = ['scenario_type', 'scenario_title', 'answers'];
            if (!ValidationHelper::validateRequired($data, $required)) {
                ResponseHelper::error('Missing required fields', 400);
                return;
            }
            
            $report = $reportModel->create($data);
            if ($report) {
                ResponseHelper::success($report, 201);
            } else {
                ResponseHelper::error('Failed to create report', 500);
            }
            break;
            
        case 'PUT':
            if (!isset($path_parts[1])) {
                ResponseHelper::error('Report ID required', 400);
                return;
            }
            
            $data = json_decode(file_get_contents('php://input'), true);
            $report = $reportModel->update($path_parts[1], $data);
            
            if ($report) {
                ResponseHelper::success($report);
            } else {
                ResponseHelper::error('Failed to update report', 500);
            }
            break;
            
        case 'DELETE':
            if (!isset($path_parts[1])) {
                ResponseHelper::error('Report ID required', 400);
                return;
            }
            
            $success = $reportModel->delete($path_parts[1]);
            if ($success) {
                ResponseHelper::success(['message' => 'Report deleted successfully']);
            } else {
                ResponseHelper::error('Failed to delete report', 500);
            }
            break;
            
        default:
            ResponseHelper::error('Method not allowed', 405);
            break;
    }
}

/**
 * Handle interview endpoints
 */
function handleInterview($method, $db, $path_parts) {
    switch ($method) {
        case 'POST':
            if (isset($path_parts[1]) && $path_parts[1] === 'start') {
                // Start new interview session
                $data = json_decode(file_get_contents('php://input'), true);
                
                if (!isset($data['scenario_type'])) {
                    ResponseHelper::error('Scenario type required', 400);
                    return;
                }
                
                $session_id = uniqid('interview_', true);
                $session_data = [
                    'session_id' => $session_id,
                    'scenario_type' => $data['scenario_type'],
                    'started_at' => date('Y-m-d H:i:s'),
                    'status' => 'active'
                ];
                
                // Store session in cache or database
                // For demo, we'll return session data
                ResponseHelper::success($session_data);
            }
            break;
            
        case 'PUT':
            if (isset($path_parts[1]) && $path_parts[1] === 'answer') {
                // Submit interview answer
                $data = json_decode(file_get_contents('php://input'), true);
                
                $required = ['session_id', 'question_id', 'answer'];
                if (!ValidationHelper::validateRequired($data, $required)) {
                    ResponseHelper::error('Missing required fields', 400);
                    return;
                }
                
                // Process answer
                $answer_data = [
                    'session_id' => $data['session_id'],
                    'question_id' => $data['question_id'],
                    'answer' => $data['answer'],
                    'answer_text' => $data['answer'] ? 'ใช่' : 'ไม่ใช่',
                    'timestamp' => date('Y-m-d H:i:s')
                ];
                
                ResponseHelper::success($answer_data);
            }
            break;
            
        case 'GET':
            if (isset($path_parts[1])) {
                // Get interview session
                $session_id = $path_parts[1];
                // Retrieve session data
                ResponseHelper::success(['session_id' => $session_id, 'status' => 'active']);
            }
            break;
            
        default:
            ResponseHelper::error('Method not allowed', 405);
            break;
    }
}
?>
