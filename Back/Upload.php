<?php
/* include 'Connected.php'; */
header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Database connection
$link = mysqli_connect('localhost', 'root', '', 'db_store');
//$link = mysqli_connect('aliantechnology.com', 'cp615710_atc', 'Aliantechnology', "cp615710_atc_db");

if (!$link) {
    echo json_encode([
        "status" => "error", 
        "message" => "Database connection failed: " . mysqli_connect_error()
    ]);
    exit;
}

if (!$link->set_charset("utf8")) {
    echo json_encode([
        "status" => "error", 
        "message" => "Error loading character set utf8: " . $link->error
    ]);
    exit;
}

// Handle DELETE requests
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    parse_str(file_get_contents('php://input'), $_DELETE);
    foreach ($_DELETE as $key => $value) {
        $_GET[$key] = $value;
    }
}

// Get action parameter
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Handle POST requests (file upload)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Check if file and part_num are provided
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK && isset($_POST['part_num'])) {
        
        $image = $_FILES['image'];
        $partNum = mysqli_real_escape_string($link, $_POST['part_num']);
        
        // Validate file type
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        $fileType = mime_content_type($image['tmp_name']);
        
        if (!in_array($fileType, $allowedTypes)) {
            echo json_encode([
                "status" => "error", 
                "message" => "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."
            ]);
            exit;
        }
        
        // Validate file size (max 5MB)
        $maxSize = 5 * 1024 * 1024; // 5MB
        if ($image['size'] > $maxSize) {
            echo json_encode([
                "status" => "error", 
                "message" => "File size exceeds 5MB limit."
            ]);
            exit;
        }
        
        // Generate unique filename to prevent conflicts
        $fileExtension = pathinfo($image['name'], PATHINFO_EXTENSION);
        $uniqueName = uniqid() . '_' . time() . '.' . $fileExtension;
        
        $uploadDir = __DIR__ . '/uploads/';
        $uploadPath = $uploadDir . $uniqueName;
        
        // Create upload directory if it doesn't exist
        if (!is_dir($uploadDir)) {
            if (!mkdir($uploadDir, 0755, true)) {
                echo json_encode([
                    "status" => "error", 
                    "message" => "Failed to create upload directory."
                ]);
                exit;
            }
        }
        
        // Move uploaded file
        if (move_uploaded_file($image['tmp_name'], $uploadPath)) {
            $relativePath = 'uploads/' . $uniqueName;
            
            // Update database using prepared statement
            $stmt = $link->prepare("UPDATE tb_part_no SET picture = ? WHERE part_num = ?");
            
            if ($stmt) {
                $stmt->bind_param("ss", $relativePath, $partNum);
                
                if ($stmt->execute()) {
                    if ($stmt->affected_rows > 0) {
                        echo json_encode([
                            "status" => "success", 
                            "message" => "File uploaded and database updated successfully.",
                            "path" => $relativePath
                        ]);
                    } else {
                        // File uploaded but no database record was updated
                        // Remove the uploaded file
                        unlink($uploadPath);
                        echo json_encode([
                            "status" => "error", 
                            "message" => "Part number not found in database."
                        ]);
                    }
                } else {
                    // Remove uploaded file if database update fails
                    unlink($uploadPath);
                    echo json_encode([
                        "status" => "error", 
                        "message" => "Database update failed: " . $stmt->error
                    ]);
                }
                
                $stmt->close();
            } else {
                // Remove uploaded file if statement preparation fails
                unlink($uploadPath);
                echo json_encode([
                    "status" => "error", 
                    "message" => "Database query preparation failed: " . $link->error
                ]);
            }
        } else {
            echo json_encode([
                "status" => "error", 
                "message" => "Failed to move uploaded file."
            ]);
        }
    } else {
        $errorMessage = "Missing required data: ";
        if (!isset($_FILES['image'])) {
            $errorMessage .= "image file, ";
        } elseif ($_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            $errorMessage .= "image upload error (" . $_FILES['image']['error'] . "), ";
        }
        if (!isset($_POST['part_num'])) {
            $errorMessage .= "part_num, ";
        }
        
        echo json_encode([
            "status" => "error", 
            "message" => rtrim($errorMessage, ", ")
        ]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET' && $action) {
    // Handle other GET actions here
    echo json_encode([
        "status" => "info", 
        "message" => "GET action '$action' not implemented yet."
    ]);
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE' && $action) {
    // Handle DELETE actions here
    echo json_encode([
        "status" => "info", 
        "message" => "DELETE action '$action' not implemented yet."
    ]);
} else {
    echo json_encode([
        "status" => "error", 
        "message" => "Invalid request method or missing action parameter."
    ]);
}

$link->close();
?>