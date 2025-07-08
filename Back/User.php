<?php
// ✅ ตั้งค่า CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=utf-8");
//sever_db localhost username_db root password_db null
// ✅ ตอบ preflight ก่อนทำอย่างอื่น
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
//UserId = atc/ปดว/0001
// ✅ Debug log
error_log("Request Method: " . $_SERVER['REQUEST_METHOD']);
error_log("GET params: " . print_r($_GET, true));

// ✅ รับ input
$json_input = json_decode(file_get_contents('php://input'), true);
error_log("JSON input: " . print_r($json_input, true));

// ✅ รับ action จาก GET, POST หรือ JSON
$action = $_GET['action'] ?? $_POST['action'] ?? ($json_input['action'] ?? '');
error_log("Action received: " . $action);

// ✅ ตรวจว่าได้ action มาหรือไม่
if (empty($action)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'status' => 'error',
        'message' => 'Action parameter is required',
        'debug' => [
            'method' => $_SERVER['REQUEST_METHOD'],
            'get' => $_GET,
            'post' => $_POST,
            'json_input' => $json_input
        ]
    ]);
    exit;
}

// ✅ เชื่อมต่อฐานข้อมูล
try {
    $host = 'localhost';
    $dbname = 'db_atc_crm';
    $username = 'root';
    $password = '';
    
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

// ✅ เรียกฟังก์ชันตาม action
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

    case 'delete':
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
            'message' => 'Invalid or missing action parameter: ' . $action
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
                    id,
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
            (user_id,username,password,fname, lname, fnameth, lnameth, tel, email,department,position, level, server_db, username_db,name_db, status, zone, token ) 
            VALUES 
            (:user_id,:username,:password,:fname, :lname, :fnameth, :lnameth, :tel, :email, :department,:position,  :level, :server_db, :username_db,:name_db, :status, :zone, :token)");

        $stmt->execute([
            ':user_id' => trim($input['user_id'] ?? ''),
            ':fname' => trim($input['fname'] ?? ''),
            ':lname' => trim($input['lname'] ?? ''),
            ':fnameth' => trim($input['fnameth'] ?? ''),
            ':lnameth' => trim($input['lnameth'] ?? ''),
            ':tel' => trim($input['tel'] ?? ''),
            ':email' => trim($input['email'] ?? ''),
            ':department' => trim($input['department'] ?? ''),
            ':position' => trim($input['position'] ?? ''),
            ':level' => $level,
            ':server_db' => trim($input['server_db'] ?? ''),
            ':username' => trim($input['username'] ?? ''),
            ':password' => trim($input['password'] ?? ''),
            ':username_db' => trim($input['username_db'] ?? ''),
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
function updateUser($pdo) {
    try {
        // Handle both JSON input and GET parameters for backward compatibility
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            // Handle GET parameters (legacy support)
            $input = [
                'id' => $_GET['id'] ?? '',
                'fname' => $_GET['fname'] ?? '',
                'lname' => $_GET['lname'] ?? '',
                'fnameth' => $_GET['fnameth'] ?? '',
                'lnameth' => $_GET['lnameth'] ?? '',
                'department' => $_GET['department'] ?? '',
                'position' => $_GET['position'] ?? '',
                'tel' => $_GET['tel'] ?? '',
                'email' => $_GET['email'] ?? '',
                'level' => $_GET['level'] ?? '',
                'server_db' => $_GET['server_db'] ?? '',
                'username_db' => $_GET['username_db'] ?? '',
                'password_db' => $_GET['password_db'] ?? '',
                'name_db' => $_GET['name_db'] ?? '',
                'status' => $_GET['status'] ?? '',
                'zone' => $_GET['zone'] ?? '',
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
        } elseif (isset($input['id']) && $input['id'] !== '') {
            $where_field = 'id'; // ✅ ใช้ id เป็น primary key
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
        $stmt = $pdo->prepare("SELECT id FROM tb_user WHERE $where_field = :value");
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
            'position', 'tel', 'email', 'level', 'server_db','password', 
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

// Function to update user


function deleteUser($pdo) {
    try {
        // Log สำหรับ debug
        error_log("Delete function called");
        error_log("Request method: " . $_SERVER['REQUEST_METHOD']);
        
        // รับข้อมูลจาก JSON body
        $input = json_decode(file_get_contents('php://input'), true);
        error_log("Input data: " . print_r($input, true));
        
        // รับ user_id จาก input
        if (!$input) {
            error_log("No JSON input, trying GET parameters");
            $id = $_GET['$id'];
        } else {
            $id = $input['id'];
        }
        
        error_log("User ID to delete: " . $id);
        
        // ตรวจสอบว่า user_id ไม่ว่าง
        if (empty($id)) {
            error_log("User ID is empty");
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'กรุณาระบุ User ID ที่ต้องการลบ'
            ]);
            return;
        }

        // ตรวจสอบว่าผู้ใช้มีอยู่จริงหรือไม่
        $stmtCheck = $pdo->prepare("SELECT id FROM tb_user WHERE id = :id");
        $stmtCheck->execute([':id' => $id]);
        $user = $stmtCheck->fetch();
        
        error_log("User found: " . print_r($user, true));

        if (!$user) {
            error_log("User not found");
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'ไม่พบผู้ใช้ที่มี User ID นี้ในระบบ'
            ]);
            return;
        }

        // ลบผู้ใช้
        $stmtDelete = $pdo->prepare("DELETE FROM tb_user WHERE id = :id");
        $deleteResult = $stmtDelete->execute([':id' => $id]);
        
        error_log("Delete result: " . ($deleteResult ? 'success' : 'failed'));
        error_log("Rows affected: " . $stmtDelete->rowCount());

        if ($stmtDelete->rowCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => "ลบผู้ใช้ที่มี User ID '$id' สำเร็จ"
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'ไม่สามารถลบผู้ใช้ได้'
            ]);
        }

    } catch (PDOException $e) {
        error_log("PDO Error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'เกิดข้อผิดพลาดในการลบผู้ใช้: ' . $e->getMessage()
        ]);
    } catch (Exception $e) {
        error_log("General Error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'เกิดข้อผิดพลาด: ' . $e->getMessage()
        ]);
    }
}


?>
