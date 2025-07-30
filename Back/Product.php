<?php
/* include 'Connected.php'; */
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=utf-8");

// Enable error logging but disable display to prevent HTML output
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Database connection function
function connectDatabase() {
    try {
        $host = 'localhost';
        $dbname = 'db_store';
        $username = 'root';
        $password = '';

        // Log connection attempt for debugging
        error_log("Attempting to connect to database: $host, user: $username, db: $dbname");

        $link = mysqli_connect($host, $username, $password, $dbname);

        if (!$link) {
            error_log("Database connection failed: " . mysqli_connect_error());
            jsonResponse(array(
                'success' => false,
                'message' => 'Unable to connect to MySQL',
                'error' => mysqli_connect_error(),
                'debug' => array(
                    'host' => $host,
                    'username' => $username,
                    'dbname' => $dbname
                )
            ), 500);
        }

        if (!$link->set_charset("utf8")) {
            error_log("Failed to set charset: " . $link->error);
            mysqli_close($link);
            jsonResponse(array(
                'success' => false,
                'message' => 'Error loading character set utf8',
                'error' => $link->error
            ), 500);
        }

        error_log("Database connection successful");
        return $link;

    } catch (Exception $e) {
        error_log("Database connection exception: " . $e->getMessage());
        jsonResponse(array(
            'success' => false,
            'message' => 'Database connection failed',
            'error' => $e->getMessage()
        ), 500);
    }
}

// JSON response function
function jsonResponse($data, $httpCode = 200) {
    // Clean any previous output
    if (ob_get_level()) {
        ob_clean();
    }
    
    http_response_code($httpCode);
    
    // Log response for debugging
    error_log("JSON Response: " . json_encode($data));
    
    echo json_encode($data);
    exit;
}

// Connect to database
$link = connectDatabase();

$action = $_GET['action'] ?? '';

// Replace switch-case with if-else structure
if ($action == "get") {
    $sort = $_GET['sort'] ?? 'ASC';
    $sort = ($sort === 'DESC') ? 'DESC' : 'ASC'; // Validate sort parameter
    
    $result = mysqli_query($link, "SELECT * FROM tb_product ORDER BY pd_id $sort");
    
    if (!$result) {
        mysqli_close($link);
        jsonResponse(array(
            'success' => false,
            'message' => 'Database query failed',
            'error' => mysqli_error($link)
        ), 500);
    }
    
    $output = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $output[] = $row;
    }
    
    mysqli_close($link);
    jsonResponse($output);
    
} elseif ($action == "getmodelipc") {
    $sort = $_GET['sort'] ?? 'ASC';
    $sort = ($sort === 'DESC') ? 'DESC' : 'ASC';
    
    $result = mysqli_query($link, "SELECT * FROM tb_model_ipc ORDER BY model_name $sort");
    
    if (!$result) {
        mysqli_close($link);
        jsonResponse(array(
            'success' => false,
            'message' => 'Database query failed',
            'error' => mysqli_error($link)
        ), 500);
    }
    
    $output = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $output[] = $row;
    }
    
    mysqli_close($link);
    jsonResponse($output);
    
} elseif ($action == "getmodelipcdetail") {
    $sort = $_GET['sort'] ?? 'ASC';
    $sort = ($sort === 'DESC') ? 'DESC' : 'ASC';
    $id = $_GET['id'] ?? '';
    
    if (empty($id)) {
        mysqli_close($link);
        jsonResponse(array(
            'success' => false,
            'message' => 'ID parameter is required'
        ), 400);
    }
    
    $id = mysqli_real_escape_string($link, $id);
    $result = mysqli_query($link, "SELECT * FROM tb_product_category WHERE model_id = '$id' ORDER BY model_type $sort");
    
    if (!$result) {
        mysqli_close($link);
        jsonResponse(array(
            'success' => false,
            'message' => 'Database query failed',
            'error' => mysqli_error($link)
        ), 500);
    }
    
    $output = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $output[] = $row;
    }
    
    mysqli_close($link);
    jsonResponse($output);
    
} elseif ($action == "insert") {
    $productId = $_GET['productId'] ?? '';
    $name = $_GET['name'] ?? '';
    $nameth = $_GET['nameth'] ?? '';
    $description = $_GET['description'] ?? '';
    $price = $_GET['price'] ?? '';
    $sellPrice = $_GET['sellPrice'] ?? '';
    $user = $_GET['user'] ?? '';
    
    // Validate required fields
    if (empty($productId) || empty($name) || empty($price)) {
        mysqli_close($link);
        jsonResponse(array(
            'success' => false,
            'message' => 'Required fields are missing'
        ), 400);
    }
    
    // Escape all inputs
    $productId = mysqli_real_escape_string($link, $productId);
    $name = mysqli_real_escape_string($link, $name);
    $nameth = mysqli_real_escape_string($link, $nameth);
    $description = mysqli_real_escape_string($link, $description);
    $price = mysqli_real_escape_string($link, $price);
    $sellPrice = mysqli_real_escape_string($link, $sellPrice);
    $user = mysqli_real_escape_string($link, $user);
    
    $sql = "INSERT INTO `tb_product`(`pd_id`, `pd_name`, `pd_name_th`, `pd_description`, `pd_price`, `pd_sellprice`, `pd_user`) 
            VALUES ('$productId','$name','$nameth','$description','$price','$sellPrice','$user')";
    
    $result = mysqli_query($link, $sql);
    
    if ($result) {
        mysqli_close($link);
        jsonResponse(array(
            'success' => true, 
            'message' => 'Product inserted successfully'
        ));
    } else {
        mysqli_close($link);
        jsonResponse(array(
            'success' => false, 
            'message' => 'Failed to insert product', 
            'error' => mysqli_error($link)
        ), 500);
    }
    
} elseif ($action == "getwherepdid") {
    $id = $_GET['id'] ?? '';
    
    if (empty($id)) {
        mysqli_close($link);
        jsonResponse(array(
            'success' => false,
            'message' => 'ID parameter is required'
        ), 400);
    }
    
    $id = mysqli_real_escape_string($link, $id);
    $result = mysqli_query($link, "SELECT * FROM tb_product WHERE pd_id = '$id'");
    
    if (!$result) {
        mysqli_close($link);
        jsonResponse(array(
            'success' => false,
            'message' => 'Database query failed',
            'error' => mysqli_error($link)
        ), 500);
    }
    
    $output = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $output[] = $row;
    }
    
    mysqli_close($link);
    jsonResponse($output);
    
} elseif ($action == "getqoitem") {
    $qo_id = $_GET['id'] ?? '';
    
    if (empty($qo_id)) {
        mysqli_close($link);
        jsonResponse(array(
            'success' => false,
            'message' => 'ID parameter is required'
        ), 400);
    }
    
    $qo_id = mysqli_real_escape_string($link, $qo_id);
    $result = mysqli_query($link, "SELECT * FROM tb_qo_item t1 LEFT JOIN tb_product t2 ON t1.pd_id = t2.pd_id WHERE t1.qo_id = '$qo_id'");
    
    if (!$result) {
        mysqli_close($link);
        jsonResponse(array(
            'success' => false,
            'message' => 'Database query failed',
            'error' => mysqli_error($link)
        ), 500);
    }
    
    $output = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $output[] = $row;
    }
    
    mysqli_close($link);
    jsonResponse($output);

}elseif ($action == "CreateSerial") {
    try {
        error_log("CreateSerial action started");

        $rawInput = file_get_contents('php://input');
        error_log("Raw input: " . $rawInput);

        if (empty($rawInput)) {
            throw new Exception('No POST data received');
        }

        $input = json_decode($rawInput, true);

        if (!is_array($input)) {
            throw new Exception('Invalid input: expected array of serial data');
        }

        if (count($input) === 0) {
            throw new Exception('No serial data provided');
        }

        mysqli_begin_transaction($link); // 🔐 Begin transaction

        $dateStr = date("ymd");

        // 🔍 หา SN ล่าสุดที่มี date ในวันเดียวกัน โดยเช็ค 8 หลักท้าย (YYYYMMDD + 4 หลักเลข counter)
        // Format: {ModelCode}{DisplayCode}{YYYYMMDD}{XXXX}
        $query = "SELECT SN FROM tb_snproduct 
                  WHERE RIGHT(SN, 12) LIKE '{$dateStr}____'
                  ORDER BY RIGHT(SN, 4) DESC LIMIT 1";
        $result = mysqli_query($link, $query);
        $currentCounter = 0;

        if ($result && $row = mysqli_fetch_assoc($result)) {
            $lastSN = $row['SN'];
            $lastCounterStr = substr($lastSN, -4); // 4 หลักท้าย
            if (is_numeric($lastCounterStr)) {
                $currentCounter = (int)$lastCounterStr;
            }
        }

        $created = [];

        foreach ($input as $item) {
            foreach (['Model', 'Display', 'Cpu', 'Ram', 'SSD'] as $field) {
                if (!isset($item[$field]) || trim($item[$field]) === '') {
                    throw new Exception("Missing or empty required field: $field");
                }
            }

            $model = mysqli_real_escape_string($link, trim($item['Model']));
            $display = mysqli_real_escape_string($link, trim($item['Display']));
            $cpu = mysqli_real_escape_string($link, trim($item['Cpu']));
            $ram = mysqli_real_escape_string($link, trim($item['Ram']));
            $ssd = mysqli_real_escape_string($link, trim($item['SSD']));

            // สร้าง model และ display code สำหรับ item นี้
            $modelCode = strtoupper(preg_replace("/[^A-Z0-9]/i", "", $model));
            $displayFormatted = preg_replace("/[^\d.]/", "", $display);
            $displayFormatted = str_replace(".", "0", $displayFormatted);

            // 🔑 เพิ่ม counter ทีละ 1 สำหรับแต่ละ item
            $currentCounter++;
            $counterStr = str_pad($currentCounter, 4, "0", STR_PAD_LEFT);
            $serialID = "{$modelCode}{$displayFormatted}{$dateStr}{$counterStr}";

            // 🔍 กันซ้ำอีกครั้ง
            $checkQuery = "SELECT SN FROM tb_snproduct WHERE SN = '$serialID'";
            $checkResult = mysqli_query($link, $checkQuery);
            if (mysqli_num_rows($checkResult) > 0) {
                throw new Exception("Duplicate Serial Number detected: $serialID");
            }

            // 💾 insert
            $insertQuery = "INSERT INTO tb_snproduct (SN, Model, Display, Cpu, Ram, SSD) 
                            VALUES ('$serialID', '$model', '$display', '$cpu', '$ram', '$ssd')";
            $insertResult = mysqli_query($link, $insertQuery);
            if (!$insertResult) {
                throw new Exception('Failed to insert SN: ' . mysqli_error($link));
            }

            $created[] = [
                'SN' => $serialID,
                'Model' => $model,
                'Display' => $display,
                'Cpu' => $cpu,
                'Ram' => $ram,
                'SSD' => $ssd,
            ];
        }

        mysqli_commit($link);
        mysqli_close($link);

        jsonResponse([
            'success' => true,
            'message' => count($created) . ' serial(s) created successfully',
            'data' => $created
        ]);

    } catch (Exception $e) {
        mysqli_rollback($link);
        error_log("CreateSerial error: " . $e->getMessage());
        mysqli_close($link);
        jsonResponse([
            'success' => false,
            'message' => $e->getMessage()
        ], 400);
    }
}

elseif ($action == "GetNextSerial") {
    try {
        error_log("GetNextSerial action started");

        $rawInput = file_get_contents('php://input');
        error_log("Raw input: " . $rawInput);

        if (empty($rawInput)) {
            throw new Exception('No POST data received');
        }

        $input = json_decode($rawInput, true);

        if (!isset($input['model']) || !isset($input['display'])) {
            throw new Exception('Model and Display are required');
        }

        $model = trim($input['model']);
        $display = trim($input['display']);
        $qty = isset($input['qty']) ? (int)$input['qty'] : 1;

        if (empty($model) || empty($display)) {
            throw new Exception('Model and Display cannot be empty');
        }

        if ($qty < 1) {
            throw new Exception('Quantity must be greater than 0');
        }

        // 🔒 ใช้ transaction เพื่อความปลอดภัย
        mysqli_begin_transaction($link);

        try {
            $dateStr = date("ymd");

            // 🔍 หา SN ล่าสุดที่มี date pattern อยู่ท้าย SN (ไม่ใช่กลาง string)
            // Format: {ModelCode}{DisplayCode}{YYYYMMDD}{XXXX}
            // ใช้ RIGHT() เพื่อให้แน่ใจว่าเป็น 12 หลักท้าย (8 หลัก date + 4 หลัก counter)
            $query = "SELECT SN FROM tb_snproduct 
                      WHERE RIGHT(SN, 12) LIKE '{$dateStr}____'
                      ORDER BY CAST(RIGHT(SN, 4) AS UNSIGNED) DESC 
                      LIMIT 1 FOR UPDATE"; // 🔒 Lock row สำหรับ transaction

            $result = mysqli_query($link, $query);
            $currentCounter = 0;

            if ($result && $row = mysqli_fetch_assoc($result)) {
                $lastSN = $row['SN'];
                $lastCounterStr = substr($lastSN, -4); // 4 หลักท้าย
                if (is_numeric($lastCounterStr)) {
                    $currentCounter = (int)$lastCounterStr;
                }
                error_log("Found last SN: {$lastSN}, counter: {$currentCounter}");
            } else {
                error_log("No previous SN found for today, starting from 0");
            }

            // สร้าง model และ display code
            $modelCode = strtoupper(preg_replace("/[^A-Z0-9]/i", "", $model));
            $displayFormatted = preg_replace("/[^\d.]/", "", $display);
            $displayFormatted = str_replace(".", "0", $displayFormatted);

            // คำนวณ counter ถัดไป
            $nextCounter = $currentCounter + 1;
            $counterStr = str_pad($nextCounter, 4, "0", STR_PAD_LEFT);
            $nextSerial = "{$modelCode}{$displayFormatted}{$dateStr}{$counterStr}";

            // 🔍 Double-check ว่า serial ที่จะแนะนำไม่ซ้ำ
            $checkQuery = "SELECT SN FROM tb_snproduct WHERE SN = ? FOR UPDATE";
            $stmt = mysqli_prepare($link, $checkQuery);
            mysqli_stmt_bind_param($stmt, "s", $nextSerial);
            mysqli_stmt_execute($stmt);
            $checkResult = mysqli_stmt_get_result($stmt);

            if (mysqli_num_rows($checkResult) > 0) {
                // ถ้าซ้ำ ให้หา counter ใหม่
                error_log("Serial {$nextSerial} already exists, finding next available");
                
                $findNextQuery = "SELECT SN FROM tb_snproduct 
                                  WHERE RIGHT(SN, 12) LIKE '{$dateStr}____'
                                  ORDER BY CAST(RIGHT(SN, 4) AS UNSIGNED) DESC 
                                  LIMIT 1 FOR UPDATE";
                $findResult = mysqli_query($link, $findNextQuery);
                
                if ($findResult && $findRow = mysqli_fetch_assoc($findResult)) {
                    $currentCounter = (int)substr($findRow['SN'], -4);
                }
                
                $nextCounter = $currentCounter + 1;
                $counterStr = str_pad($nextCounter, 4, "0", STR_PAD_LEFT);
                $nextSerial = "{$modelCode}{$displayFormatted}{$dateStr}{$counterStr}";
            }

            mysqli_stmt_close($stmt);
            
            // 🔒 Commit transaction
            mysqli_commit($link);
            
            error_log("Generated next serial: {$nextSerial}");

        } catch (Exception $e) {
            mysqli_rollback($link);
            throw $e;
        }

        mysqli_close($link);

        jsonResponse([
            'success' => true,
            'data' => [
                'nextSerial' => $nextSerial,
                'lastCounter' => $currentCounter,
                'nextCounter' => $nextCounter,
                'qty' => $qty,
                'modelCode' => $modelCode,
                'displayCode' => $displayFormatted,
                'dateStr' => $dateStr
            ]
        ]);

    } catch (Exception $e) {
        error_log("GetNextSerial error: " . $e->getMessage());
        if (isset($link)) {
            mysqli_close($link);
        }
        jsonResponse([
            'success' => false,
            'message' => $e->getMessage()
        ], 400);
    }
}

else {
    // Default case - Invalid action or no action specified
    mysqli_close($link);
    jsonResponse(array(
        'success' => false,
        'message' => 'Invalid action or no action specified'
    ), 400);


}

?>