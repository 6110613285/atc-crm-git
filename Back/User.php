<?php
/* include 'Connected.php'; */
// header("Access-Control-Allow-Origin: *");
// error_reporting(0);
// error_reporting(E_ERROR | E_PARSE);
// header("content-type:text/javascript;charset=utf-8");
// $link = mysqli_connect('localhost', 'root', '', 'db_atc_crm');
// //$link = mysqli_connect('aliantechnology.com', 'cp615710_atc', 'Aliantechnology', "cp615710_atc_db");

// if (!$link) {
//     echo "Error: Unable to connect to MySQL." . PHP_EOL;
//     echo "Debugging errno: " . mysqli_connect_errno() . PHP_EOL;
//     echo "Debugging error: " . mysqli_connect_error() . PHP_EOL;

//     exit;
// }

// if (!$link->set_charset("utf8")) {
//     printf("Error loading character set utf8: %s\n", $link->error);
//     exit();
// }

// $action = $_GET['action'];

// if ($action == "getwheretoken") {


//     $token = $_GET['token'];

//     $result = mysqli_query($link, "SELECT user_id, fname, lname, fnameth, lnameth, department, position, tel, email, level, server_db, username_db, password_db, name_db, status, zone FROM tb_user WHERE token = '$token' ");

//     while ($row = mysqli_fetch_assoc($result)) {
//         $output[] = $row;
//     }

//     echo json_encode($output);

//     mysqli_close($link);
// } else if ($action == "getall") {


//     $result = mysqli_query($link, "SELECT user_id, fname, lname, fnameth, lnameth, department, position, tel, email FROM tb_user ");

//     while ($row = mysqli_fetch_assoc($result)) {
//         $output[] = $row;
//     }

//     echo json_encode($output);

//     mysqli_close($link);
// } else if ($action == "getsales") {


//     $result = mysqli_query($link, "SELECT user_id, fname, lname, fnameth, lnameth FROM tb_user WHERE position = 'Sales' OR position = 'Sales Engineer' OR position = 'Newsale' ");

//     while ($row = mysqli_fetch_assoc($result)) {
//         $output[] = $row;
//     }

//     echo json_encode($output);

//     mysqli_close($link);
// } else if ($action == "update") {

//     $name = $_GET['name'];
//     $surname = $_GET['surname'];
//     $nameth = $_GET['nameth'];
//     $surnameth = $_GET['surnameth'];
//     $department = $_GET['department'];
//     $position = $_GET['position'];
//     $tel = $_GET['tel'];
//     $token = $_GET['token'];




//     $sql = " UPDATE `tb_user` SET fname = '$name' , lname = '$surname', fnameth = '$nameth', lnameth = '$surnameth', department = '$department', position = '$position', tel = '$tel' WHERE token = '$token' ";

//     $result = mysqli_query($link, $sql);

//     if ($result) {
//         echo json_encode("ok");
//     }

//     mysqli_close($link);
// } else if ($action == "getwhereuserid") {

//     $id = $_GET['id'];

//     $result = mysqli_query($link, "SELECT * FROM tb_user WHERE user_id = '$id' ");

//     while ($row = mysqli_fetch_assoc($result)) {
//         $output[] = $row;
//     }

//     echo json_encode($output);
//     mysqli_close($link);
// } else if ($action == "getstatus") {

//     $id = $_GET['id'];

//     $result = mysqli_query($link, "SELECT status FROM tb_user WHERE user_id = '$id' ");

//     while ($row = mysqli_fetch_assoc($result)) {
//         $output[] = $row;
//     }

//     echo json_encode($output);
//     mysqli_close($link);
// } else {
//     echo json_encode("fail");
//     mysqli_close($link);
// }

// Database connection
error_reporting(E_ALL);
ini_set('display_errors', 0); // ปิด display เพื่อไม่ให้ HTML error แสดง
ini_set('log_errors', 1);
ini_set('html_errors', 0); // ปิด HTML format

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=utf-8");
header('Content-Type: application/json');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

try {
    // Database configuration
    $host = 'localhost';
    $dbname = 'db_atc_crm';
    $username = 'root';
    $password = '';
    
    // For production, uncomment and use these credentials:
    // $host = 'aliantechnology.com';
    // $username = 'cp615710_atc';
    // $password = 'Aliantechnology';
    // $dbname = 'cp615710_atc_db';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed: ' . $e->getMessage()
    ]);
    exit;
}

    error_log("Request Method: " . $_SERVER['REQUEST_METHOD']);
error_log("GET params: " . print_r($_GET, true));

// Get action parameter
    $action = $_GET['action'] ?? $_POST['action'] ?? '';

if (empty($action)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'status' => 'error',
        'message' => 'Action parameter is required',
        'debug' => [
            'method' => $_SERVER['REQUEST_METHOD'],
            'get' => $_GET,
            'post' => $_POST
        ]
    ]);
    exit;
}

    // Route requests based on action
    switch ($action) {
        case 'getUsers':
        case 'getall':
            getUsers($pdo);
            break;
        
        case 'getUser':
        case 'getwhereuserid':
            getUser($pdo);
            break;
            
        case 'getUserByToken':
        case 'getwheretoken':
            getUserByToken($pdo);
            break;
            
        case 'getSales':
        case 'getsales':
            getSalesUsers($pdo);
            break;
            
        case 'getUserStatus':
        case 'getstatus':
            getUserStatus($pdo);
            break;
        
        case 'createUser':
            createUser($pdo);
            break;
        
        case 'updateUser':
        case 'update':
            updateUser($pdo);
            break;
        
        case 'deleteUser':
            deleteUser($pdo);
            break;
        
        case 'updateUserStatus':
            updateUserStatus($pdo);
            break;
        
        case 'saveUser':
            saveUser($pdo);
            break;

        default:
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid or missing action parameter'
            ]);
            break;
    }

// Function to get all users with optional filtering
function getUsers($pdo) {
    try {
        $search = $_GET['search'] ?? '';
        $status = $_GET['status'] ?? '';
        $level = $_GET['level'] ?? '';
        $department = $_GET['department'] ?? '';
        $position = $_GET['position'] ?? '';
        
        $sql = "SELECT 
                    user_id,
                    fname,
                    lname,
                    fnameth,
                    lnameth,
                    department,
                    position,
                    tel,
                    email,
                    level,
                    server_db,
                    username_db,
                    password_db,
                    name_db,
                    status,
                    zone,
                    token
                FROM tb_user 
                WHERE 1=1";
        
        $params = [];
        
        // Add search filter
        if (!empty($search)) {
            $sql .= " AND (fname LIKE :search 
                         OR lname LIKE :search 
                         OR fnameth LIKE :search
                         OR lnameth LIKE :search 
                         OR department LIKE :search
                         OR position LIKE :search
                         OR email LIKE :search)";
            $params[':search'] = "%$search%";
        }
        
        // Add filters
        if (!empty($status)) {
            $sql .= " AND status = :status";
            $params[':status'] = $status;
        }
        
        if (!empty($level)) {
            $sql .= " AND level = :level";
            $params[':level'] = $level;
        }
        
        if (!empty($department)) {
            $sql .= " AND department = :department";
            $params[':department'] = $department;
        }
        
        if (!empty($position)) {
            $sql .= " AND position = :position";
            $params[':position'] = $position;
        }
        
        $sql .= " ORDER BY user_id DESC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $users = $stmt->fetchAll();
        
        echo json_encode($users);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error fetching users: ' . $e->getMessage()
        ]);
    }
}

function saveUser($pdo) {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid JSON input'
        ]);
        return;
    }

    if (isset($input['id']) && !empty($input['id'])) {
        // ถ้ามี id แปลว่า update
        $_POST = $input; // เพื่อใช้ฟังก์ชัน updateUser ของเดิม
        updateUser($pdo);
    } else {
        // ถ้าไม่มี id แปลว่า create
        $_POST = $input;
        createUser($pdo);
    }
}

// Function to get single user by ID
function getUser($pdo) {
    try {
        $id = $_GET['id'] ?? 0;
        
        if (empty($id)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'User ID is required'
            ]);
            return;
        }
        
        $stmt = $pdo->prepare("SELECT * FROM tb_user WHERE user_id = :id");
        $stmt->execute([':id' => $id]);
        $user = $stmt->fetch();
        
        if ($user) {
            echo json_encode([$user]); // Return as array for compatibility
        } else {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'User not found'
            ]);
        }
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error fetching user: ' . $e->getMessage()
        ]);
    }
}

// Function to get user by token
function getUserByToken($pdo) {
    try {
        $token = $_GET['token'] ?? '';
        
        if (empty($token)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Token is required'
            ]);
            return;
        }
        
        $stmt = $pdo->prepare("SELECT 
                                user_id, 
                                fname, 
                                lname, 
                                fnameth, 
                                lnameth, 
                                department, 
                                position, 
                                tel, 
                                email, 
                                level, 
                                server_db, 
                                username_db, 
                                password_db, 
                                name_db, 
                                status, 
                                zone 
                              FROM tb_user 
                              WHERE token = :token");
        $stmt->execute([':token' => $token]);
        $user = $stmt->fetch();
        
        if ($user) {
            echo json_encode([$user]); // Return as array for compatibility
        } else {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'User not found'
            ]);
        }
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error fetching user: ' . $e->getMessage()
        ]);
    }
}

// Function to get sales users
function getSalesUsers($pdo) {
    try {
        $stmt = $pdo->prepare("SELECT 
                                user_id, 
                                fname, 
                                lname, 
                                fnameth, 
                                lnameth 
                              FROM tb_user 
                              WHERE position IN ('Sales', 'Sales Engineer', 'Newsale')");
        $stmt->execute();
        $users = $stmt->fetchAll();
        
        echo json_encode($users);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error fetching sales users: ' . $e->getMessage()
        ]);
    }
}

// Function to get user status
function getUserStatus($pdo) {
    try {
        $id = $_GET['id'] ?? 0;
        
        if (empty($id)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'User ID is required'
            ]);
            return;
        }
        
        $stmt = $pdo->prepare("SELECT status FROM tb_user WHERE user_id = :id");
        $stmt->execute([':id' => $id]);
        $result = $stmt->fetch();
        
        if ($result) {
            echo json_encode([$result]); // Return as array for compatibility
        } else {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'User not found'
            ]);
        }
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error fetching user status: ' . $e->getMessage()
        ]);
    }
}

// Function to create new user
function createUser($pdo) {
    try {
        $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

        // $required_fields = ['fname', 'lname', 'department', 'position'];
        // foreach ($required_fields as $field) {
        //     if (empty($input[$field])) {
        //         http_response_code(400);
        //         echo json_encode([
        //             'success' => false,
        //             'message' => "Field '$field' is required"
        //         ]);
        //         return;
        //     }
        // }

        // Generate token if not provided
        if (empty($input['token'])) {
            $input['token'] = bin2hex(random_bytes(16));
        }

        // Validate ENUM values
        $validLevels = ['user', 'admin'];
        $validStatuses = ['activation', '0'];

        // Clean and validate level
        $level = isset($input['level']) && in_array($input['level'], $validLevels) 
                ? $input['level'] 
                : 'user'; // default to 'user'

        // Clean and validate status  
        $status = isset($input['status']) && in_array($input['status'], $validStatuses)
                ? $input['status']
                : 'activation'; // default to 'activation'

        $stmt = $pdo->prepare("INSERT INTO tb_user 
            (fname, lname, fnameth, lnameth, department, position, tel, email, level, server_db, username_db, password_db, name_db, status, zone, token) 
            VALUES 
            (:fname, :lname, :fnameth, :lnameth, :department, :position, :tel, :email, :level, :server_db, :username_db, :password_db, :name_db, :status, :zone, :token)");

        $stmt->execute([
            ':fname' => trim($input['fname'] ?? ''),
            ':lname' => trim($input['lname'] ?? ''),
            ':fnameth' => trim($input['fnameth'] ?? ''),
            ':lnameth' => trim($input['lnameth'] ?? ''),
            ':department' => trim($input['department'] ?? ''),
            ':position' => trim($input['position'] ?? ''),
            ':tel' => trim($input['tel'] ?? ''),
            ':email' => trim($input['email'] ?? ''),
            ':level' => $level,
            ':server_db' => trim($input['server_db'] ?? ''),
            ':username_db' => trim($input['username_db'] ?? ''),
            ':password_db' => trim($input['password_db'] ?? ''),
            ':name_db' => trim($input['name_db'] ?? ''),
            ':status' => $status,
            ':zone' => trim($input['zone'] ?? ''),
            ':token' => $input['token']
        ]);

        echo json_encode([
            'success' => true,
            'message' => 'User created successfully',
            'id' => $pdo->lastInsertId(),
            'token' => $input['token']
        ]);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error creating user: ' . $e->getMessage()
        ]);
    }
}


// Function to update user
function updateUser($pdo) {
    try {
        // Handle both JSON input and GET parameters for backward compatibility
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            // Handle GET parameters (legacy support)
            $input = [
                'id' => $_GET['name'] ?? '',
                'user_id' => $_GET['name'] ?? '',
                'fname' => $_GET['name'] ?? '',
                'lname' => $_GET['surname'] ?? '',
                'fnameth' => $_GET['nameth'] ?? '',
                'lnameth' => $_GET['surnameth'] ?? '',
                'department' => $_GET['department'] ?? '',
                'position' => $_GET['position'] ?? '',
                'tel' => $_GET['tel'] ?? '',
                'token' => $_GET['token'] ?? ''
            ];
            $update_by_token = true;
        } else {
            $update_by_token = false;
        }
        
        // Determine update criteria
        if ($update_by_token && !empty($input['token'])) {
            $where_field = 'token';
            $where_value = $input['token'];
        } elseif (!empty($input['id'])) {
            $where_field = 'user_id';
            $where_value = $input['id'];
        } else {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'User ID or token is required'
            ]);
            return;
        }
        
        // Check if user exists
        $stmt = $pdo->prepare("SELECT user_id FROM tb_user WHERE $where_field = :value");
        $stmt->execute([':value' => $where_value]);
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'User not found'
            ]);
            return;
        }
        
        // Build update query dynamically
        $update_fields = [];
        $params = [':where_value' => $where_value];
        
        $allowed_fields = [
            'fname', 'lname', 'fnameth', 'lnameth', 'department', 
            'position', 'tel', 'email', 'level', 'server_db', 
            'username_db', 'password_db', 'name_db', 'status', 'zone'
        ];
        
        foreach ($allowed_fields as $field) {
            if (isset($input[$field]) && $input[$field] !== '') {
                $update_fields[] = "$field = :$field";
                $params[":$field"] = $input[$field];
            }
        }
        
        if (empty($update_fields)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'No fields to update'
            ]);
            return;
        }
        
        $sql = "UPDATE tb_user SET " . implode(', ', $update_fields) . " WHERE $where_field = :where_value";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        
        if ($update_by_token) {
            echo json_encode("ok"); // Legacy response format
        } else {
            echo json_encode([
                'success' => true,
                'message' => 'User updated successfully'
            ]);
        }
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error updating user: ' . $e->getMessage()
        ]);
    }
}
// Function to delete user
function deleteUser($pdo) {
    try {
        // รับ user_id จาก URL parameter ก่อน เพราะ frontend ส่งมาทาง GET parameter
        $id = $_GET['user_id'] ?? $_GET['id'] ?? '';
        
        // ถ้าไม่มีใน GET ลองหาใน POST และ JSON input
        if (empty($id)) {
            $input = json_decode(file_get_contents('php://input'), true);
            $id = $input['id'] ?? $input['user_id'] ?? 
                  $_POST['id'] ?? $_POST['user_id'] ?? '';
        }
        
        if (empty($id)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'status' => 'error',
                'message' => 'User ID is required'
            ]);
            return;
        }
        
        // ตรวจสอบว่าผู้ใช้มีอยู่จริง
        $stmt = $pdo->prepare("SELECT user_id FROM tb_user WHERE user_id = :id");
        $stmt->execute([':id' => $id]);
        
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'status' => 'error',
                'message' => 'User not found'
            ]);
            return;
        }
        
        // ลบผู้ใช้
        $stmt = $pdo->prepare("DELETE FROM tb_user WHERE user_id = :id");
        $stmt->execute([':id' => $id]);
        
        // ตรวจสอบว่าลบสำเร็จ
        if ($stmt->rowCount() > 0) {
            echo json_encode([
                'success' => true,
                'status' => 'success',
                'message' => 'ลบข้อมูลผู้ใช้เรียบร้อยแล้ว',
                'deleted_user_id' => $id
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'status' => 'error',
                'message' => 'ไม่สามารถลบข้อมูลผู้ใช้ได้'
            ]);
        }
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'status' => 'error',
            'message' => 'Error deleting user: ' . $e->getMessage()
        ]);
    }
}
// Function to update user status only
function updateUserStatus($pdo) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (empty($input['id']) || !isset($input['status'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'User ID and status are required'
            ]);
            return;
        }
        
        $allowed_statuses = ['active', 'inactive', 'suspended'];
        if (!in_array($input['status'], $allowed_statuses)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid status. Allowed values: ' . implode(', ', $allowed_statuses)
            ]);
            return;
        }
        
        $stmt = $pdo->prepare("UPDATE tb_user SET status = :status WHERE user_id = :id");
        $stmt->execute([
            ':status' => $input['status'],
            ':id' => $input['id']
        ]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'User status updated successfully'
            ]);
        } else {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'User not found'
            ]);
        }
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error updating user status: ' . $e->getMessage()
        ]);
    }


}
?>
