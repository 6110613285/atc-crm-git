<?php

// ✅ ตั้งค่า CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=utf-8");

// ✅ ตอบ preflight ก่อนทำอย่างอื่น
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

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
    // Database configuration
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

    case 'createUserWithAutoId':
    case 'createauto':
        createUserWithAutoId($pdo);
        break;

    case 'findUserByUserId':
    case 'finduser':
        findUserByUserId($pdo);
        break;

    case 'updateUser':
    case 'update':
        updateUser($pdo);
        break;

    case 'deleteUser':
    case 'delete':
        deleteUser($pdo);
        break;

    case 'updateUserStatus':
    case 'updatestatus':
        updateUserStatus($pdo);
        break;
    
    case 'search':
    case 'searchUser':
        searchUser($pdo);
        break;
   
    case 'saveUser':
    case 'save':
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
                    username,
                    password,
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
                    token,
                    Roleuser,
                    permissions
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
function searchUser($pdo) {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || !isset($input['search'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid or missing search parameter']);
        return;
    }
    $search = $input['search'];
    $likeSearch = "%$search%";

    $sql = "SELECT * FROM tb_user WHERE
        fname LIKE ? OR
        lname LIKE ? OR
        fnameth LIKE ? OR
        lnameth LIKE ? OR
        department LIKE ? OR
        position LIKE ? OR
        level LIKE ?
    ";

    $stmt = $pdo->prepare($sql);
    try {
        $stmt->execute([$likeSearch, $likeSearch, $likeSearch, $likeSearch, $likeSearch, $likeSearch, $likeSearch]);
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($data);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}function saveUser($pdo) {
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
                                zone,
                                Roleuser,
                                permissions
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

        // แก้ไข: ตรวจสอบให้แน่ใจว่าจำนวนพารามิเตอร์ใน SQL ตรงกับจำนวนที่ส่งใน execute
        // เพิ่มคอลัมน์ permissions เข้าไปใน INSERT statement
        $stmt = $pdo->prepare("INSERT INTO tb_user 
            (user_id,username,password,fname, lname, fnameth, lnameth, tel, email,department,
            position, level, server_db, username_db,name_db, password_db, status, zone, token, Roleuser, permissions )
        VALUES 
            (:user_id,:username,:password,:fname, :lname, :fnameth, :lnameth, :tel, :email, :department,
            :position,  :level, :server_db, :username_db,:name_db, :password_db, :status, :zone, :token, :Roleuser, :permissions )");

        $stmt->execute([
            ':user_id' => trim($input['user_id'] ?? ''),
            ':fname' => trim($input['fname'] ?? ''),
            ':lname' => trim($input['lname'] ?? ''),
            ':fnameth' => trim($input['fnameth'] ?? ''),
            ':lnameth' => trim($input['lnameth'] ?? ''),
            ':department' => trim($input['department'] ?? ''),
            ':position' => trim($input['position'] ?? ''),
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
            ':password_db' => trim($input['password_db'] ?? ''),
            ':status' => $status,
            ':zone' => trim($input['zone'] ?? ''),
            ':token' => $input['token'],
            ':Roleuser' => trim($input['Roleuser'] ?? ''),
            ':permissions' => trim($input['permissions'] ?? '') // ตรวจสอบให้แน่ใจว่าพารามิเตอร์นี้ถูกต้อง
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
        $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

        if (!isset($input['id']) || empty($input['id'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'User ID is required for update'
            ]);
            return;
        }

        // Validate ENUM values
        $validLevels = ['user', 'admin'];
        $validStatuses = ['activation', '0'];

        // Clean and validate level
        $level = isset($input['level']) && in_array($input['level'], $validLevels) ? $input['level'] : null;
        // Clean and validate status
        $status = isset($input['status']) && in_array($input['status'], $validStatuses) ? $input['status'] : null;

        $sql = "UPDATE tb_user SET ";
        $params = [':id' => $input['id']];
        $fields = [];

        if (isset($input['username'])) { $fields[] = "username = :username"; $params[':username'] = trim($input['username']); }
        if (isset($input['password'])) { $fields[] = "password = :password"; $params[':password'] = trim($input['password']); }
        if (isset($input['fname'])) { $fields[] = "fname = :fname"; $params[':fname'] = trim($input['fname']); }
        if (isset($input['lname'])) { $fields[] = "lname = :lname"; $params[':lname'] = trim($input['lname']); }
        if (isset($input['fnameth'])) { $fields[] = "fnameth = :fnameth"; $params[':fnameth'] = trim($input['fnameth']); }
        if (isset($input['lnameth'])) { $fields[] = "lnameth = :lnameth"; $params[':lnameth'] = trim($input['lnameth']); }
        if (isset($input['tel'])) { $fields[] = "tel = :tel"; $params[':tel'] = trim($input['tel']); }
        if (isset($input['email'])) { $fields[] = "email = :email"; $params[':email'] = trim($input['email']); }
        if (isset($input['department'])) { $fields[] = "department = :department"; $params[':department'] = trim($input['department']); }
        if (isset($input['position'])) { $fields[] = "position = :position"; $params[':position'] = trim($input['position']); }
        if ($level !== null) { $fields[] = "level = :level"; $params[':level'] = $level; }
        if (isset($input['server_db'])) { $fields[] = "server_db = :server_db"; $params[':server_db'] = trim($input['server_db']); }
        if (isset($input['username_db'])) { $fields[] = "username_db = :username_db"; $params[':username_db'] = trim($input['username_db']); }
        if (isset($input['name_db'])) { $fields[] = "name_db = :name_db"; $params[':name_db'] = trim($input['name_db']); }
        if ($status !== null) { $fields[] = "status = :status"; $params[':status'] = $status; }
        if (isset($input['zone'])) { $fields[] = "zone = :zone"; $params[':zone'] = trim($input['zone']); }
        if (isset($input['token'])) { $fields[] = "token = :token"; $params[':token'] = $input['token']; }
        if (isset($input['Roleuser'])) { // Added Roleuser update
            $fields[] = "Roleuser = :Roleuser";
            $params[':Roleuser'] = trim($input['Roleuser']);
        }


        if (empty($fields)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'No fields to update'
            ]);
            return;
        }
        
       $sql .= implode(", ", $fields) . " WHERE id = :id";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        if ($stmt->rowCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'User updated successfully'
            ]);
        } else {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'User not found or no changes made'
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
        $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $id = $input['id'] ?? 0;
        
        if (empty($id)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'status' => 'error',
                'message' => 'User ID is required for deletion'
            ]);
            return;
        }

        $stmt = $pdo->prepare("DELETE FROM tb_user WHERE id = :id");
        $stmt->execute([':id' => $id]);

        if ($stmt->rowCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'User deleted successfully'
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
            'message' => 'Error deleting user: ' . $e->getMessage()
        ]);
    }
}
// Function to update user status only
function updateUserStatus($pdo) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        $id = $input['id'] ?? 0;
        $status = $input['status'] ?? '';

        if (empty($id) || empty($status)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'User ID and status are required'
            ]);
            return;
        }
        
        $validStatuses = ['active', 'inactive', 'suspended', 'pending', 'activation'];
        if (!in_array($status, $validStatuses)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid status value'
            ]);
            return;
        }

        $stmt = $pdo->prepare("UPDATE tb_user SET status = :status WHERE id = :id");
        $stmt->execute([':status' => $status, ':id' => $id]);
        
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

// Helper function to generate a unique user ID
function createUniqueUserId($pdo, $department, $position) {
    try {
        $deptCode = strtoupper(substr($department, 0, 3));
        $posCode = strtoupper(substr($position, 0, 3));

        $sql = "SELECT user_id FROM tb_user WHERE department = :department AND position = :position ORDER BY user_id DESC LIMIT 1";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':department' => $department, ':position' => $position]);
        $lastUserId = $stmt->fetchColumn();

        $nextNumber = 1;
        if ($lastUserId) {
            preg_match('/(\d+)$/', $lastUserId, $matches);
            if (isset($matches[1])) {
                $nextNumber = (int)$matches[1] + 1;
            } else {
                $nextNumber = 1;
            }
        } else {
            $nextNumber = 1;
        }

        return $deptCode . '/' . $posCode . '/' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);

    } catch (Exception $e) {
        return null;
    }
}

// ตัวอย่างการใช้งานในฟังก์ชัน createUser
function createUserWithAutoId($pdo, $userData) {
    try {
        // สร้าง User ID อัตโนมัติหากไม่ได้ระบุมา
        if (empty($userData['user_id'])) {
            $userData['user_id'] = createUniqueUserId(
                $pdo,
                $userData['department'] ?? '',
                $userData['position'] ?? ''
            );
        }

        // ตรวจสอบว่า User ID ไม่ซ้ำ
        if (isUserIdExists($pdo, $userData['user_id'])) {
            throw new Exception('User ID นี้มีในระบบแล้ว');
        }

        // ตรวจสอบรูปแบบ User ID
        if (!validateUserIdFormat($userData['user_id'])) {
            throw new Exception('รูปแบบ User ID ไม่ถูกต้อง');
        }

        return $userData;

    } catch (Exception $e) {
        throw new Exception('Error in createUserWithAutoId: ' . $e->getMessage());
    }
}

// ฟังก์ชันค้นหา User จาก User ID
function findUserByUserId($pdo, $userId) {
    try {
        $stmt = $pdo->prepare("SELECT * FROM tb_user WHERE user_id = :user_id");
        $stmt->execute([':user_id' => $userId]);
        return $stmt->fetch();
    } catch (Exception $e) {
        throw new Exception('Error in findUserByUserId: ' . $e->getMessage());
    }
}

// ฟังก์ชันตรวจสอบว่า User ID มีอยู่ในระบบแล้วหรือยัง
function isUserIdExists($pdo, $userId) {
    try {
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM tb_user WHERE user_id = :user_id");
        $stmt->execute([':user_id' => $userId]);
        return $stmt->fetchColumn() > 0;
    } catch (Exception $e) {
        throw new Exception('Error in isUserIdExists: ' . $e->getMessage());
    }
}

// ฟังก์ชันตรวจสอบรูปแบบ User ID
function validateUserIdFormat($userId) {
    return preg_match('/^[A-Z]{3}\/[A-Z]{3}\/\d{4}$/', $userId);
}
?>
