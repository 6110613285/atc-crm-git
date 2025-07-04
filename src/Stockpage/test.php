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

// Function to update user
function updateUser($pdo) {
    try {
        // Handle both JSON input and GET parameters for backward compatibility
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            // Handle GET parameters (legacy support)
            $input = [
                'id' => $_GET['id'] ?? '',
                'fname' => $_GET['name'] ?? '',
                'lname' => $_GET['surname'] ?? '',
                'fnameth' => $_GET['nameth'] ?? '',
                'lnameth' => $_GET['surnameth'] ?? '',
                'department' => $_GET['department'] ?? '',
                'position' => $_GET['position'] ?? '',
                'tel' => $_GET['tel'] ?? '',
                'token' => $_GET['token'] ?? '',
                'username' => $_GET['username'] ?? '',
                'password' => $_GET['password'] ?? ''

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
            $where_field = 'id';  // เปลี่ยนจาก user_id เป็น id
            $where_value = $input['id'];
        } else {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'ID or token is required'
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
            'username', 'fname', 'lname', 'fnameth', 'lnameth', 'department', 
            'position', 'tel', 'email', 'level', 'server_db',
            'username_db', 'password_db', 'name_db', 'status', 'zone'
        ];
        
        foreach ($allowed_fields as $field) {
            if (isset($input[$field]) && $input[$field] !== '') {
                // จัดการ password แยกต่างหาก
                if ($field === 'password') {
                    $update_fields[] = "password = :password";
                    $params[":password"] = password_hash($input['password'], PASSWORD_DEFAULT);
                } else {
                    $update_fields[] = "$field = :$field";
                    $params[":$field"] = $input[$field];
                }
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

// ฟังก์ชันสำหรับสร้าง User ID อัตโนมัติ
function generateUserId($pdo, $department = '', $position = '') {
    try {
        // ตัวอย่างรูปแบบ User ID: atc/ปดว/0001
        // หรือสามารถปรับเปลี่ยนตามความต้องการ
        
        // วิธีที่ 1: สร้างจากแผนก + ตำแหน่ง + เลขรันนิ่ง
        $prefix = strtolower(substr($department, 0, 3)); // 3 ตัวอักษรแรกของแผนก
        $positionCode = strtolower(substr($position, 0, 3)); // 3 ตัวอักษรแรกของตำแหน่ง
        
        // หาเลขลำดับถัดไป
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM tb_user WHERE user_id LIKE :pattern");
        $pattern = $prefix . '/' . $positionCode . '/%';
        $stmt->execute([':pattern' => $pattern]);
        $result = $stmt->fetch();
        $nextNumber = $result['count'] + 1;
        
        // สร้าง User ID
        $userId = $prefix . '/' . $positionCode . '/' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
        
        return $userId;
        
    } catch (Exception $e) {
        // หากเกิดข้อผิดพลาด ให้สร้าง ID แบบสุ่ม
        return 'user/' . date('Y') . '/' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
    }
}

// ฟังก์ชันตรวจสอบว่า User ID ซ้ำหรือไม่
function isUserIdExists($pdo, $userId) {
    try {
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM tb_user WHERE user_id = :user_id");
        $stmt->execute([':user_id' => $userId]);
        $result = $stmt->fetch();
        
        return $result['count'] > 0;
        
    } catch (Exception $e) {
        return false;
    }
}

// ฟังก์ชันสร้าง User ID ที่ไม่ซ้ำ
function createUniqueUserId($pdo, $department = '', $position = '') {
    $maxAttempts = 10;
    $attempts = 0;
    
    do {
        $userId = generateUserId($pdo, $department, $position);
        $attempts++;
        
        if (!isUserIdExists($pdo, $userId)) {
            return $userId;
        }
        
        // หากซ้ำ ให้เพิ่มเลขสุ่มต่อท้าย
        if ($attempts >= $maxAttempts) {
            $userId .= '_' . rand(100, 999);
        }
        
    } while ($attempts < $maxAttempts && isUserIdExists($pdo, $userId));
    
    return $userId;
}

// ฟังก์ชันตรวจสอบรูปแบบ User ID
function validateUserIdFormat($userId) {
    // ตรวจสอบว่าเป็นรูปแบบที่ถูกต้องหรือไม่
    // ตัวอย่าง: atc/ปดว/0001 หรือ abc/def/1234
    $pattern = '/^[a-zA-Z0-9ก-๙]{1,10}\/[a-zA-Z0-9ก-๙]{1,10}\/\d{4}$/u';
    return preg_match($pattern, $userId);
}

// ฟังก์ชันดึง User ID ถัดไปสำหรับแผนกและตำแหน่งที่กำหนด
function getNextUserIdForDepartmentAndPosition($pdo, $department, $position) {
    try {
        // สร้างรหัสแผนกและตำแหน่ง
        $deptCode = generateDepartmentCode($department);
        $posCode = generatePositionCode($position);
        
        // หาเลขลำดับสูงสุดในรูปแบบนี้
        $stmt = $pdo->prepare("
            SELECT user_id 
            FROM tb_user 
            WHERE user_id LIKE :pattern 
            ORDER BY user_id DESC 
            LIMIT 1
        ");
        
        $pattern = $deptCode . '/' . $posCode . '/%';
        $stmt->execute([':pattern' => $pattern]);
        $result = $stmt->fetch();
        
        if ($result) {
            // แยกเลขลำดับจาก user_id ที่มีอยู่
            $parts = explode('/', $result['user_id']);
            if (count($parts) >= 3) {
                $lastNumber = intval($parts[2]);
                $nextNumber = $lastNumber + 1;
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
        return false;
    }
}


?>
<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// เชื่อมต่อฐานข้อมูล (คุณต้องมีโค้ดส่วนนี้อยู่แล้ว)
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "your_database_name"; // <-- เปลี่ยนเป็นชื่อฐานข้อมูลของคุณ

$conn = new mysqli($servername, $servername, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]));
}

$action = $_SERVER['REQUEST_METHOD'] === 'POST' ? $_POST['action'] ?? null : $_GET['action'] ?? null;

// รับข้อมูล JSON สำหรับ POST requests
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $data !== null) {
    $action = $data['action'] ?? $action;
}


switch ($action) {
    case 'getUsers':
        $sql = "SELECT id, username, fname, lname, fnameth, lnameth, email, tel, department, position, level, status, permissions FROM users"; // <-- เพิ่ม permissions field
        $result = $conn->query($sql);

        $users = [];
        if ($result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                $users[] = $row;
            }
        }
        echo json_encode($users);
        break;

    case 'add':
        $username = $conn->real_escape_string($data['username']);
        $password = password_hash($conn->real_escape_string($data['password']), PASSWORD_DEFAULT);
        $fname = $conn->real_escape_string($data['fname'] ?? '');
        $lname = $conn->real_escape_string($data['lname'] ?? '');
        $fnameth = $conn->real_escape_string($data['fnameth'] ?? '');
        $lnameth = $conn->real_escape_string($data['lnameth'] ?? '');
        $email = $conn->real_escape_string($data['email'] ?? '');
        $tel = $conn->real_escape_string($data['tel'] ?? '');
        $department = $conn->real_escape_string($data['department'] ?? '');
        $position = $conn->real_escape_string($data['position'] ?? '');
        $level = $conn->real_escape_string($data['level'] ?? 'user');
        $status = $conn->real_escape_string($data['status'] ?? 'pending');
        $permissions = $conn->real_escape_string($data['permissions'] ?? '{"allowedRoutes":[]}'); // รับ permissions field

        // ตรวจสอบ username ซ้ำ
        $check_sql = "SELECT id FROM users WHERE username = '$username'";
        $check_result = $conn->query($check_sql);
        if ($check_result->num_rows > 0) {
            echo json_encode(["success" => false, "message" => "Username นี้มีผู้ใช้งานแล้ว"]);
            exit();
        }

        $sql = "INSERT INTO users (username, password, fname, lname, fnameth, lnameth, email, tel, department, position, level, status, permissions) VALUES ('$username', '$password', '$fname', '$lname', '$fnameth', '$lnameth', '$email', '$tel', '$department', '$position', '$level', '$status', '$permissions')"; // <-- เพิ่ม permissions

        if ($conn->query($sql) === TRUE) {
            echo json_encode(["success" => true, "message" => "เพิ่มผู้ใช้ใหม่สำเร็จ"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error: " . $sql . "<br>" . $conn->error]);
        }
        break;

    case 'update':
        $id = $conn->real_escape_string($data['id']);
        $username = $conn->real_escape_string($data['username']);
        $fname = $conn->real_escape_string($data['fname'] ?? '');
        $lname = $conn->real_escape_string($data['lname'] ?? '');
        $fnameth = $conn->real_escape_string($data['fnameth'] ?? '');
        $lnameth = $conn->real_escape_string($data['lnameth'] ?? '');
        $email = $conn->real_escape_string($data['email'] ?? '');
        $tel = $conn->real_escape_string($data['tel'] ?? '');
        $department = $conn->real_escape_string($data['department'] ?? '');
        $position = $conn->real_escape_string($data['position'] ?? '');
        $level = $conn->real_escape_string($data['level'] ?? 'user');
        $status = $conn->real_escape_string($data['status'] ?? 'pending');
        $permissions = $conn->real_escape_string($data['permissions'] ?? '{"allowedRoutes":[]}'); // รับ permissions field

        $password_update = "";
        if (isset($data['password']) && !empty($data['password'])) {
            $password = password_hash($conn->real_escape_string($data['password']), PASSWORD_DEFAULT);
            $password_update = ", password = '$password'";
        }
        
        // ตรวจสอบ username ซ้ำ (ยกเว้นตัวเอง)
        $check_sql = "SELECT id FROM users WHERE username = '$username' AND id != '$id'";
        $check_result = $conn->query($check_sql);
        if ($check_result->num_rows > 0) {
            echo json_encode(["success" => false, "message" => "Username นี้มีผู้ใช้งานอื่นแล้ว"]);
            exit();
        }

        $sql = "UPDATE users SET username='$username', fname='$fname', lname='$lname', fnameth='$fnameth', lnameth='$lnameth', email='$email', tel='$tel', department='$department', position='$position', level='$level', status='$status', permissions='$permissions'{$password_update} WHERE id='$id'"; // <-- เพิ่ม permissions

        if ($conn->query($sql) === TRUE) {
            echo json_encode(["success" => true, "message" => "อัปเดตผู้ใช้สำเร็จ"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error: " . $sql . "<br>" . $conn->error]);
        }
        break;

    case 'delete':
        $id = $conn->real_escape_string($data['id']);
        $sql = "DELETE FROM users WHERE id='$id'";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["success" => true, "message" => "ลบผู้ใช้สำเร็จ"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error: " . $sql . "<br>" . $conn->error]);
        }
        break;
        
    case 'search':
        $searchTerm = $conn->real_escape_string($_GET['search']);
        $sql = "SELECT id, username, fname, lname, fnameth, lnameth, email, tel, department, position, level, status, permissions FROM users WHERE username LIKE '%$searchTerm%' OR fname LIKE '%$searchTerm%' OR lname LIKE '%$searchTerm%' OR fnameth LIKE '%$searchTerm%' OR lnameth LIKE '%$searchTerm%' OR email LIKE '%$searchTerm%'";
        $result = $conn->query($sql);
        
        $users = [];
        if ($result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                $users[] = $row;
            }
        }
        echo json_encode($users);
        break;

    case 'updatePermissions': // เพิ่ม case สำหรับอัปเดต permissions โดยเฉพาะ
        $id = $conn->real_escape_string($data['id']);
        $permissions = $conn->real_escape_string($data['permissions'] ?? '{"allowedRoutes":[]}');

        $sql = "UPDATE users SET permissions='$permissions' WHERE id='$id'";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["success" => true, "message" => "อัปเดตสิทธิ์สำเร็จ"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error updating permissions: " . $conn->error]);
        }
        break;

    default:
        echo json_encode(["success" => false, "message" => "Invalid action."]);
        break;
}

$conn->close();
?>