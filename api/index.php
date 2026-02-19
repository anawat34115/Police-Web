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
try {
    // Initialize database
    $database = new Database();
    $db = $database->getConnection();
    // Check if running on Vercel
    $isVercel = isset($_SERVER['VERCEL']);
    $dbConfig = $isVercel ? 'database-vercel.php' : 'database.php';

    // Include database configuration
    require_once __DIR__ . "/../config/{$dbConfig}";

    // Include models and helpers
    require_once __DIR__ . '/../models/ReportModel.php';
    require_once __DIR__ . '/../models/ScenarioModel.php';
    require_once __DIR__ . '/../middleware/AuthMiddleware.php';
    require_once __DIR__ . '/../utils/ResponseHelper.php';
    require_once __DIR__ . '/../utils/ValidationHelper.php';

    // Initialize database
    $database = new Database();
    $db = $database->getConnection();

    // Initialize models
    $reportModel = new ReportModel($db);
    $scenarioModel = new ScenarioModel($db);

    // Get request path
    $request_uri = $_SERVER['REQUEST_URI'];
    $path_parts = explode('/', trim($request_uri, '/'));

    // Remove 'api' from path if present
    if ($path_parts[0] === 'api') {
        array_shift($path_parts);
    }

    // Route requests
    try {
        switch ($_SERVER['REQUEST_METHOD']) {
            case 'GET':
                if (empty($path_parts[0])) {
                    // API health check
                    ResponseHelper::success(['message' => 'Police Care API is running', 'version' => '1.0.0']);
                } elseif ($path_parts[0] === 'health') {
                    // Health check endpoint
                    ResponseHelper::success(['status' => 'healthy', 'timestamp' => date('Y-m-d H:i:s')]);
                } elseif ($path_parts[0] === 'scenarios') {
                    if (isset($path_parts[1])) {
                        // Get specific scenario
                        $scenario = $scenarioModel->getById($path_parts[1]);
                        if ($scenario) {
                            ResponseHelper::success($scenario);
                        } else {
                            ResponseHelper::notFound('Scenario not found');
                        }
                    } else {
                        // Get all scenarios
                        $scenarios = $scenarioModel->getAll();
                        ResponseHelper::success($scenarios);
                    }
                } elseif ($path_parts[0] === 'reports') {
                    // Get reports (with pagination)
                    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
                    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
                    $status = isset($_GET['status']) ? $_GET['status'] : null;
                    
                    $reports = $reportModel->getAll($page, $limit, $status);
                    ResponseHelper::success($reports);
                }
                break;
                
            case 'POST':
                if ($path_parts[0] === 'scenarios') {
                    // Create new scenario
                    $data = json_decode(file_get_contents('php://input'), true);
                    $scenario = $scenarioModel->create($data);
                    if ($scenario) {
                        ResponseHelper::success($scenario, 201);
                    } else {
                        ResponseHelper::error('Failed to create scenario', 500);
                    }
                } elseif ($path_parts[0] === 'reports') {
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
                } elseif ($path_parts[0] === 'interview' && isset($path_parts[1]) && $path_parts[1] === 'start') {
                    // Start interview session
                    $data = json_decode(file_get_contents('php://input'), true);
                    
                    if (!isset($data['scenario_type'])) {
                        ResponseHelper::error('Scenario type is required', 400);
                        return;
                    }
                    
                    // Generate session ID
                    $session_id = 'interview_' . uniqid();
                    $session_data = [
                        'session_id' => $session_id,
                        'scenario_type' => $data['scenario_type'],
                        'started_at' => date('Y-m-d H:i:s'),
                        'status' => 'active'
                    ];
                    
                    ResponseHelper::success($session_data, 201);
                }
                break;
                
            case 'PUT':
                if ($path_parts[0] === 'interview' && isset($path_parts[1]) && $path_parts[1] === 'answer') {
                    // Submit interview answer
                    $data = json_decode(file_get_contents('php://input'), true);
                    
                    $required = ['session_id', 'question_id', 'answer'];
                    if (!ValidationHelper::validateRequired($data, $required)) {
                        ResponseHelper::error('Missing required fields', 400);
                        return;
                    }
                    
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
                
            case 'DELETE':
                if (isset($path_parts[1]) && $path_parts[0] === 'reports') {
                    // Delete report
                    $result = $reportModel->delete($path_parts[1]);
                    if ($result) {
                        ResponseHelper::success(['message' => 'Report deleted successfully']);
                    } else {
                        ResponseHelper::error('Failed to delete report', 500);
                    }
                }
                break;
                
            default:
                ResponseHelper::methodNotAllowed();
                break;
        }
    } catch (Exception $e) {
        ResponseHelper::serverError('Internal server error: ' . $e->getMessage());
    }
} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    ResponseHelper::error('Internal server error', 500);
}

/**
 * Handle scenarios endpoints
 */
function handleScenarios($method, $db, $path_parts) {
    // ... (rest of the code remains the same)
                ResponseHelper::success(['status' => 'healthy', 'timestamp' => date('Y-m-d H:i:s')]);
            } elseif ($path_parts[0] === 'scenarios') {
                if (isset($path_parts[1])) {
                    // Get specific scenario
                    $scenario = $scenarioModel->getById($path_parts[1]);
                    if ($scenario) {
                        ResponseHelper::success($scenario);
                    } else {
                        ResponseHelper::notFound('Scenario not found');
                    }
                } else {
                    // Get all scenarios
                    $scenarios = $scenarioModel->getAll();
                    ResponseHelper::success($scenarios);
                }
            } elseif ($path_parts[0] === 'reports') {
                // Get reports (with pagination)
                $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
                $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
                $status = isset($_GET['status']) ? $_GET['status'] : null;
                
                $reports = $reportModel->getAll($page, $limit, $status);
                ResponseHelper::success($reports);
            }
            break;
            
        case 'POST':
            if ($path_parts[0] === 'scenarios') {
                // Create new scenario
                $data = json_decode(file_get_contents('php://input'), true);
                $scenario = $scenarioModel->create($data);
                if ($scenario) {
                    ResponseHelper::success($scenario, 201);
                } else {
                    ResponseHelper::error('Failed to create scenario', 500);
                }
            } elseif ($path_parts[0] === 'reports') {
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
            } elseif ($path_parts[0] === 'interview' && isset($path_parts[1]) && $path_parts[1] === 'start') {
                // Start interview session
                $data = json_decode(file_get_contents('php://input'), true);
                
                if (!isset($data['scenario_type'])) {
                    ResponseHelper::error('Scenario type is required', 400);
                    return;
                }
                
                // Generate session ID
                $session_id = 'interview_' . uniqid();
                $session_data = [
                    'session_id' => $session_id,
                    'scenario_type' => $data['scenario_type'],
                    'started_at' => date('Y-m-d H:i:s'),
                    'status' => 'active'
                ];
                
                ResponseHelper::success($session_data, 201);
            }
            break;
            
        case 'PUT':
            if ($path_parts[0] === 'interview' && isset($path_parts[1]) && $path_parts[1] === 'answer') {
                // Submit interview answer
                $data = json_decode(file_get_contents('php://input'), true);
                
                $required = ['session_id', 'question_id', 'answer'];
                if (!ValidationHelper::validateRequired($data, $required)) {
                    ResponseHelper::error('Missing required fields', 400);
                    return;
                }
                
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
            
        case 'DELETE':
            if (isset($path_parts[1]) && $path_parts[0] === 'reports') {
                // Delete report
                $result = $reportModel->delete($path_parts[1]);
                if ($result) {
                    ResponseHelper::success(['message' => 'Report deleted successfully']);
                } else {
                    ResponseHelper::error('Failed to delete report', 500);
                }
            }
            break;
            
        default:
            ResponseHelper::methodNotAllowed();
            break;
    }
} catch (Exception $e) {
    ResponseHelper::serverError('Internal server error: ' . $e->getMessage());
}
?>
