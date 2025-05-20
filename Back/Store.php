<?php
/* include 'Connected.php'; */
header("Access-Control-Allow-Origin: *");
error_reporting(0);
error_reporting(E_ERROR | E_PARSE);
header("content-type:text/javascript;charset=utf-8");
$link = mysqli_connect('localhost', 'root', '', 'db_store');
//$link = mysqli_connect('aliantechnology.com', 'cp615710_atc', 'Aliantechnology', "cp615710_atc_db");

if (!$link) {
    echo "Error: Unable to connect to MySQL." . PHP_EOL;
    echo "Debugging errno: " . mysqli_connect_errno() . PHP_EOL;
    echo "Debugging error: " . mysqli_connect_error() . PHP_EOL;

    exit;
}

if (!$link->set_charset("utf8")) {
    printf("Error loading character set utf8: %s\n", $link->error);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    parse_str(file_get_contents('php://input'), $_DELETE);
    foreach ($_DELETE as $key => $value) {
        $_GET[$key] = $value;
    }
}

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// สำหรับ preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$action = $_GET['action'];

if ($action == "get") {


    $token = $_GET['token'];

    $result = mysqli_query($link, "SELECT user_id, fname, lname, fnameth, lnameth, department, position, tel, email, level, server_db, username_db, password_db, name_db, status, zone FROM tb_user WHERE token = '$token' ");

    while ($row = mysqli_fetch_assoc($result)) {
        $output[] = $row;
    }

    echo json_encode($output);

    mysqli_close($link);
} else if ($action == "getall") {


    $result = mysqli_query($link, "SELECT user_id, fname, lname, fnameth, lnameth, department, position, tel, email FROM tb_user ");

    while ($row = mysqli_fetch_assoc($result)) {
        $output[] = $row;
    }

    echo json_encode($output);

    mysqli_close($link);
} else if ($action == "update") {

    $name = $_GET['name'];
    $surname = $_GET['surname'];
    $nameth = $_GET['nameth'];
    $surnameth = $_GET['surnameth'];
    $department = $_GET['department'];
    $position = $_GET['position'];
    $tel = $_GET['tel'];
    $token = $_GET['token'];




    $sql = " UPDATE `tb_user` SET fname = '$name' , lname = '$surname', fnameth = '$nameth', lnameth = '$surnameth', department = '$department', position = '$position', tel = '$tel' WHERE token = '$token' ";

    $result = mysqli_query($link, $sql);

    if ($result) {
        echo json_encode("ok");
    }

    mysqli_close($link);
} else if ($action == "getwhereuserid") {

    $id = $_GET['id'];

    $result = mysqli_query($link, "SELECT * FROM tb_user WHERE user_id = '$id' ");

    while ($row = mysqli_fetch_assoc($result)) {
        $output[] = $row;
    }

    echo json_encode($output);
    mysqli_close($link);
} else if ($action == "getstatus") {

    $id = $_GET['id'];

    $result = mysqli_query($link, "SELECT status FROM tb_user WHERE user_id = '$id' ");

    while ($row = mysqli_fetch_assoc($result)) {
        $output[] = $row;
    }

    echo json_encode($output);
    mysqli_close($link);
} else if ($action == "insertStock") {
    $date = $_GET['date'];
    $uname = $_GET['uname'];        // User column
    $serial = $_GET['serial'];      // serial_num column
    $partnum = $_GET['partnum'];    // part_num column
    $partname = $_GET['partname'];  // part_name column
    $parttype = $_GET['parttype'];  // part_type column
    $partlo = $_GET['partlo'];      // part_location column
    $qty = $_GET['qty'];            // qty column
    $storeid = $_GET['storeid'];    // store_id column
    $storename = $_GET['storename']; // store_name column
    $note = $_GET['note'];          // note column
    $status = $_GET['status'];      // status column


    $sql = "INSERT INTO `tb_log_edit`(`date`, `User`, `serial_num`, `part_num`, `part_name`, `part_type`, `part_location`,`qty`,`store_id`,`store_name`,`note`,`status`) 
            VALUES ('$date','$uname','$serial','$partnum','$partname','$parttype','$partlo','$qty','$storeid','$storename','$note','$status')";

    $result = mysqli_query($link, $sql);

    if ($result) {
        echo json_encode("ok");
    }
    mysqli_close($link);
} else if ($action == "addType") {
    // Get parameters from request
    $type_name = $_GET['type_name'];    // type_name column
    $type_prefix = $_GET['type_prefix']; // type_prefix column
    $type_detail = $_GET['type_detail']; // type_detail column

    // SQL query to insert new type
    $sql = "INSERT INTO `tb_type`(`type_name`, `type_prefix`, `type_detail`) 
            VALUES ('$type_name', '$type_prefix', '$type_detail')";

    $result = mysqli_query($link, $sql);

    if ($result) {
        echo json_encode("ok");
    }
    mysqli_close($link);
} else if ($action == "getType") {
    // SQL query to get all types
    $sql = "SELECT * FROM tb_type ORDER BY type_id ASC";
    $result = mysqli_query($link, $sql);

    if (!$result) {
        echo json_encode(null);
        mysqli_close($link);
        return;
    }

    $data = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = array(
            'type_id' => $row['type_id'],
            'type_name' => $row['type_name'],
            'type_prefix' => $row['type_prefix'],
            'type_unit' => $row['type_unit'],
            'type_detail' => $row['type_detail'],
            'gen' => $row['gen']
        );
    }

    echo json_encode($data);
    mysqli_close($link);
}// เพิ่มฟังก์ชันสำหรับจัดการ Serial Numbers

// ฟังก์ชันเพิ่ม Serial
else if ($action == "addSerial") {
    // รับค่าพารามิเตอร์จาก request
    $part_no = $_GET['part_no'];        // Part No (Serial Number)
    $part_num = $_GET['part_num'];      // Part Number
    $part_name = $_GET['part_name'];    // Part Name
    $supplier = $_GET['supplier'];      // Supplier
    $brand = $_GET['brand'];            // Brand
    $sup_serial = $_GET['sup_serial'];  // Supplier Bar Code
    $sup_part_number = $_GET['sup_part_number'];  // Supplier Bar Code
    $packsize = $_GET['packsize'];      // Pack Size
    $username = $_GET['username'];      // ชื่อผู้ใช้
    $date = $_GET['date'];              // วันที่สร้าง

    // SQL query เพื่อเพิ่มข้อมูล
    $sql = "INSERT INTO `tb_gensn`
            (`part_no`, `part_num`, `part_name`, `supplier`, `brand`, `sup_serial`, `sup_part_number`, `packsize`, `user`, `date`) 
            VALUES 
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = mysqli_prepare($link, $sql);

    if ($stmt) {
        mysqli_stmt_bind_param(
            $stmt,
            "sssssssiss",
            $part_no,
            $part_num,
            $part_name,
            $supplier,
            $brand,
            $sup_serial,
            $sup_part_number,
            $packsize,
            $username,
            $date
        );

        $result = mysqli_stmt_execute($stmt);

        if ($result) {
            echo json_encode("ok");
        } else {
            echo json_encode("error: " . mysqli_stmt_error($stmt));
        }

        mysqli_stmt_close($stmt);
    } else {
        echo json_encode("error: " . mysqli_error($link));
    }

    mysqli_close($link);
} else if ($action == "getSerials") {
    // ปรับแก้ SQL query เพื่อเปลี่ยนชื่อฟิลด์ packsize เป็น qty
    $sql = "SELECT *, packsize as qty FROM tb_gensn ORDER BY part_no DESC";
    $result = mysqli_query($link, $sql);

    if (!$result) {
        echo json_encode(null);
        mysqli_close($link);
        return;
    }

    $data = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = $row;
    }

    echo json_encode($data);
    mysqli_close($link);
}

// ฟังก์ชันค้นหา Serial
else if ($action == "searchSerials") {
    // รับค่าค้นหา
    $search = isset($_GET['search']) ? $_GET['search'] : '';

    // สร้างเงื่อนไขการค้นหา
    $searchCondition = "";
    if (!empty($search)) {
        $searchCondition = " WHERE part_no LIKE '%$search%' 
                           OR part_num LIKE '%$search%' 
                           OR part_name LIKE '%$search%' 
                           OR supplier LIKE '%$search%'
                           OR brand LIKE '%$search%'
                           OR sup_serial LIKE '%$search%'
                           OR sup_part_number LIKE '%$search'";
    }

    // SQL query เพื่อค้นหา Serial
    $sql = "SELECT * FROM tb_gensn" . $searchCondition . " ORDER BY part_no DESC";
    $result = mysqli_query($link, $sql);

    if (!$result) {
        echo json_encode(null);
        mysqli_close($link);
        return;
    }

    $data = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = $row;
    }

    if (empty($data)) {
        echo json_encode(null);
    } else {
        echo json_encode($data);
    }

    mysqli_close($link);
}

// ฟังก์ชันลบ Serial
else if ($action == "deleteSerial") {
    // รับค่า part_no (Serial Number)
    $part_no = $_GET['part_no'];

    // ตรวจสอบว่ามีการส่งค่า part_no มาหรือไม่
    if (!isset($part_no) || empty($part_no)) {
        echo json_encode(array("status" => "error", "message" => "ไม่ได้ระบุ Serial Number"));
        mysqli_close($link);
        return;
    }

    // ตรวจสอบว่ามีข้อมูลอยู่หรือไม่
    $checkSql = "SELECT * FROM tb_gensn WHERE part_no = '$part_no'";
    $checkResult = mysqli_query($link, $checkSql);

    if (mysqli_num_rows($checkResult) == 0) {
        echo json_encode(array("status" => "error", "message" => "ไม่พบข้อมูลที่ต้องการลบ"));
        mysqli_close($link);
        return;
    }

    // ทำการลบข้อมูล
    $sql = "DELETE FROM tb_gensn WHERE part_no = '$part_no'";
    $result = mysqli_query($link, $sql);

    if ($result) {
        echo json_encode(array("status" => "success", "message" => "ลบข้อมูลสำเร็จ"));
    } else {
        echo json_encode(array("status" => "error", "message" => "เกิดข้อผิดพลาดในการลบข้อมูล: " . mysqli_error($link)));
    }

    mysqli_close($link);
}

// ฟังก์ชันสำหรับดึงค่า Serial Number ล่าสุดของวันนั้น
else if ($action == "getLastSerialCount") {
    $date = $_GET['date']; // รูปแบบ YYYYMMDD

    // ตรวจสอบรูปแบบวันที่
    if (!preg_match('/^\d{8}$/', $date)) {
        echo json_encode(array("error" => "Invalid date format"));
        mysqli_close($link);
        return;
    }

    // กำหนดรูปแบบการค้นหาด้วย wildcard ที่เฉพาะเจาะจงมากขึ้น
    // สมมติว่ารูปแบบเลขซีเรียลคือ PREFIX + DATE + SEQUENCE
    $pattern = '%' . $date . '%';

    // ดึงข้อมูลจากทั้งสองตาราง

    // 1. ดึงจาก tb_stock
    $sql_stock = "SELECT serial_num FROM tb_stock WHERE serial_num LIKE ? ORDER BY serial_num DESC LIMIT 1";
    $stmt_stock = mysqli_prepare($link, $sql_stock);

    if (!$stmt_stock) {
        echo json_encode(array("error" => "Stock query: " . mysqli_error($link)));
        mysqli_close($link);
        return;
    }

    mysqli_stmt_bind_param($stmt_stock, "s", $pattern);
    mysqli_stmt_execute($stmt_stock);
    mysqli_stmt_bind_result($stmt_stock, $last_stock_serial);

    $count_stock = 0;
    if (mysqli_stmt_fetch($stmt_stock)) {
        // ดึงเลขที่ลำดับจาก Serial Number
        $count_str = substr($last_stock_serial, -4); // ดึง 4 ตัวสุดท้าย
        $count_stock = intval($count_str);
    }

    mysqli_stmt_close($stmt_stock);

    // 2. ดึงจาก tb_gensn
    $sql_gensn = "SELECT part_no FROM tb_gensn WHERE part_no LIKE ? ORDER BY part_no DESC LIMIT 1";
    $stmt_gensn = mysqli_prepare($link, $sql_gensn);

    if (!$stmt_gensn) {
        echo json_encode(array("error" => "GenSN query: " . mysqli_error($link)));
        mysqli_close($link);
        return;
    }

    mysqli_stmt_bind_param($stmt_gensn, "s", $pattern);
    mysqli_stmt_execute($stmt_gensn);
    mysqli_stmt_bind_result($stmt_gensn, $last_gensn_serial);

    $count_gensn = 0;
    if (mysqli_stmt_fetch($stmt_gensn)) {
        // ดึงเลขที่ลำดับจาก Serial Number
        $count_str = substr($last_gensn_serial, -4); // ดึง 4 ตัวสุดท้าย
        $count_gensn = intval($count_str);
    }

    mysqli_stmt_close($stmt_gensn);

    // 3. เปรียบเทียบและเลือกค่าที่มากที่สุด
    $max_count = max($count_stock, $count_gensn);

    // บันทึกค่าเพื่อการตรวจสอบ
    error_log("Date: $date, Stock count: $count_stock, GenSN count: $count_gensn, Max count: $max_count");

    echo json_encode(array("last_count" => $max_count));

    mysqli_close($link);
} else if ($action == "searchParts") {
    // รับค่า search จาก parameter
    $search = isset($_GET['search']) ? $_GET['search'] : '';

    // สร้างเงื่อนไขการค้นหา
    $searchCondition = "";
    if (!empty($search)) {
        $searchCondition = " WHERE part_num LIKE '%$search%' 
                           OR part_name LIKE '%$search%' 
                           OR part_type LIKE '%$search%' 
                           OR supplier LIKE '%$search%'
                           OR brand LIKE '%$search%'
                           OR part_detail LIKE '%$search%'";
    }

    // SQL query เพื่อค้นหาชิ้นส่วน
    $sql = "SELECT * FROM tb_part_no" . $searchCondition . " ORDER BY part_num ASC";
    $result = mysqli_query($link, $sql);

    if (!$result) {
        echo json_encode(null);
        mysqli_close($link);
        return;
    }

    $data = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = $row;
    }

    if (empty($data)) {
        echo json_encode(null);
    } else {
        echo json_encode($data);
    }

    mysqli_close($link);
} else if ($action == "searchType") {
    // Get search parameter from request
    $search = isset($_GET['search']) ? $_GET['search'] : '';

    // Build search condition
    $searchCondition = "";
    if (!empty($search)) {
        $searchCondition = " WHERE type_name LIKE '%$search%' 
                           OR type_prefix LIKE '%$search%' 
                           OR type_unit LIKE '%$search%' 
                           OR type_detail LIKE '%$search%'";
    }

    // SQL query to get types with search
    $sql = "SELECT * FROM tb_type" . $searchCondition . " ORDER BY type_id DESC";
    $result = mysqli_query($link, $sql);

    if (!$result) {
        echo json_encode(null);
        mysqli_close($link);
        return;
    }

    $data = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = array(
            'type_id' => $row['type_id'],
            'type_name' => $row['type_name'],
            'type_prefix' => $row['type_prefix'],
            'type_detail' => $row['type_detail']
        );
    }

    if (empty($data)) {
        echo json_encode(null);
    } else {
        echo json_encode($data);
    }

    mysqli_close($link);
} else if ($action == "addLo") {
    // รับค่าพารามิเตอร์จาก request
    $datetime = $_GET['datetime'];
    $location_name = $_GET['location_name'];
    $location_detail = $_GET['location_detail'];
    $store_id = $_GET['store_id'];
    $store_name = $_GET['store_name'];

    // SQL query สำหรับเพิ่มข้อมูลสถานที่ใหม่
    $sql = "INSERT INTO `tb_location`(
            `datetime`, `location_name`, `location_detail`, `store_id`, `store_name`
        ) VALUES (
            '$datetime', '$location_name', '$location_detail', '$store_id', '$store_name'
        )";

    $result = mysqli_query($link, $sql);

    if ($result) {
        echo json_encode("ok");
    } else {
        echo json_encode("error: " . mysqli_error($link));
    }
    mysqli_close($link);
} else if ($action == "getLo") {
    // SQL query เพื่อดึงข้อมูลสถานที่ทั้งหมด
    $sql = "SELECT * FROM tb_location ORDER BY location_name ASC";
    $result = mysqli_query($link, $sql);

    if (!$result) {
        echo json_encode(null);
        mysqli_close($link);
        return;
    }

    $data = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = array(
            'location_id' => $row['location_id'],
            'location_name' => $row['location_name'],
            'location_detail' => $row['location_detail'],
            'datetime' => $row['datetime'],
            'store_id' => $row['store_id'],
            'store_name' => $row['store_name']
        );
    }

    echo json_encode($data);
    mysqli_close($link);
} else if ($action == "searchLo") {
    $search = isset($_GET['search']) ? $_GET['search'] : '';

    // SQL query ค้นหาสถานที่ด้วยชื่อ, รายละเอียด หรือชื่อร้านค้า
    $sql = "SELECT * FROM tb_location 
            WHERE location_name LIKE '%$search%' 
            OR location_detail LIKE '%$search%' 
            OR location_id LIKE '%$search%'
            OR store_name LIKE '%$search%'
            ORDER BY location_id ASC";

    $result = mysqli_query($link, $sql);

    if (!$result) {
        echo json_encode(null);
        mysqli_close($link);
        return;
    }

    $data = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = array(
            'location_id' => $row['location_id'],
            'location_name' => $row['location_name'],
            'location_detail' => $row['location_detail'],
            'datetime' => $row['datetime'],
            'store_id' => $row['store_id'],
            'store_name' => $row['store_name']
        );
    }

    echo json_encode($data);
    mysqli_close($link);
} else if ($action == "addStore") {
    // รับพารามิเตอร์จากคำขอ
    $store_name = $_GET['store_name'];
    $store_detail = $_GET['store_detail'];
    $store_address = $_GET['store_address'];
    $datetime = $_GET['datetime'];

    // เพิ่มข้อมูลลงใน tb_store
    $sql = "INSERT INTO `tb_store` (
        `store_name`, 
        `store_detail`, 
        `store_address`, 
        `datetime`
    ) VALUES (
        '$store_name',
        '$store_detail',
        '$store_address',
        '$datetime'
    )";

    $result = mysqli_query($link, $sql);

    if ($result) {
        echo json_encode("ok");
    } else {
        echo json_encode("error: " . mysqli_error($link));
    }

    mysqli_close($link);
} else if ($action == "deleteLocation") {
    // รับค่า location_id จาก URL parameter
    $location_id = $_GET['location_id'];

    // ตรวจสอบว่ามีการส่งค่า location_id มาหรือไม่
    if (!isset($location_id) || empty($location_id)) {
        echo json_encode(array("status" => "error", "message" => "ไม่ได้ระบุรหัสสถานที่"));
        mysqli_close($link);
        return;
    }

    // ตรวจสอบก่อนว่ามีข้อมูลอยู่หรือไม่
    $checkSql = "SELECT * FROM tb_location WHERE location_id = '$location_id'";
    $checkResult = mysqli_query($link, $checkSql);

    if (mysqli_num_rows($checkResult) == 0) {
        echo json_encode(array("status" => "error", "message" => "ไม่พบข้อมูลสถานที่ที่ต้องการลบ"));
        mysqli_close($link);
        return;
    }

    // ตรวจสอบว่ามีข้อมูลสินค้าที่เชื่อมโยงกับสถานที่นี้หรือไม่
    $checkStockSql = "SELECT COUNT(*) as count FROM tb_stock WHERE location = '$location_id'";
    $checkStockResult = mysqli_query($link, $checkStockSql);
    $stockRow = mysqli_fetch_assoc($checkStockResult);

    if ($stockRow['count'] > 0) {
        echo json_encode(array("status" => "error", "message" => "ไม่สามารถลบสถานที่นี้ได้ เนื่องจากมีสินค้าอยู่ในสถานที่นี้"));
        mysqli_close($link);
        return;
    }

    // ทำการลบข้อมูล
    $sql = "DELETE FROM tb_location WHERE location_id = '$location_id'";
    $result = mysqli_query($link, $sql);

    if ($result) {
        echo json_encode(array("status" => "success", "message" => "ลบข้อมูลสถานที่สำเร็จ"));
    } else {
        echo json_encode(array("status" => "error", "message" => "เกิดข้อผิดพลาดในการลบข้อมูล: " . mysqli_error($link)));
    }

    mysqli_close($link);
} else if ($action == "deleteStore") {
    // รับค่า store_id จาก URL parameter
    $store_id = $_GET['store_id'];

    // ตรวจสอบว่ามีการส่งค่า store_id มาหรือไม่
    if (!isset($store_id) || empty($store_id)) {
        echo json_encode(array("status" => "error", "message" => "ไม่ได้ระบุรหัสคลัง"));
        mysqli_close($link);
        return;
    }

    // ตรวจสอบก่อนว่ามีข้อมูลอยู่หรือไม่
    $checkSql = "SELECT * FROM tb_store WHERE store_id = '$store_id'";
    $checkResult = mysqli_query($link, $checkSql);

    if (mysqli_num_rows($checkResult) == 0) {
        echo json_encode(array("status" => "error", "message" => "ไม่พบข้อมูลคลังที่ต้องการลบ"));
        mysqli_close($link);
        return;
    }

    // ตรวจสอบว่ามีข้อมูลสถานที่ที่เชื่อมโยงกับคลังนี้หรือไม่
    $checkLocationSql = "SELECT COUNT(*) as count FROM tb_location WHERE store_id = '$store_id'";
    $checkLocationResult = mysqli_query($link, $checkLocationSql);
    $locationRow = mysqli_fetch_assoc($checkLocationResult);

    if ($locationRow['count'] > 0) {
        echo json_encode(array("status" => "error", "message" => "ไม่สามารถลบคลังนี้ได้ เนื่องจากมีสถานที่ผูกกับคลังนี้"));
        mysqli_close($link);
        return;
    }

    // ทำการลบข้อมูล
    $sql = "DELETE FROM tb_store WHERE store_id = '$store_id'";
    $result = mysqli_query($link, $sql);

    if ($result) {
        echo json_encode(array("status" => "success", "message" => "ลบข้อมูลคลังสำเร็จ"));
    } else {
        echo json_encode(array("status" => "error", "message" => "เกิดข้อผิดพลาดในการลบข้อมูล: " . mysqli_error($link)));
    }

    mysqli_close($link);
} else if ($action == "getLastGen") {
    $type_id = $_GET['type_id'];

    $sql = "SELECT gen FROM tb_type WHERE type_id = ?";
    $stmt = mysqli_prepare($link, $sql);

    if ($stmt) {
        mysqli_stmt_bind_param($stmt, "i", $type_id);
        mysqli_stmt_execute($stmt);
        mysqli_stmt_bind_result($stmt, $gen);

        if (mysqli_stmt_fetch($stmt)) {
            echo json_encode(['last_gen' => $gen]);
        } else {
            echo json_encode(['last_gen' => null]);
        }

        mysqli_stmt_close($stmt);
    } else {
        echo json_encode(['last_gen' => null, 'error' => mysqli_error($link)]);
    }

    mysqli_close($link);
} else if ($action == "getLastSerial") {
    $date = $_GET['date'];

    $sql = "SELECT serial_num FROM tb_part_no
            WHERE DATE(datetime) = DATE(NOW()) 
            ORDER BY serial_num DESC LIMIT 1";

    $result = mysqli_query($link, $sql);

    if ($result && mysqli_num_rows($result) > 0) {
        $row = mysqli_fetch_assoc($result);
        echo json_encode(['last_serial' => $row['serial_num']]);
    } else {
        echo json_encode(['last_serial' => null]);
    }
    mysqli_close($link);
} else if ($action == "getStores") {
    // คำสั่ง SQL ที่แก้ไขแล้วโดยตัดการเชื่อมต่อกับตาราง location ออก
    $sql = "SELECT store_id, store_name, store_address, store_detail, datetime 
            FROM tb_store
            ORDER BY store_id ASC";

    $result = mysqli_query($link, $sql);

    if (!$result) {
        echo json_encode(null);
        mysqli_close($link);
        return;
    }

    $data = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = $row;
    }

    echo json_encode($data);
    mysqli_close($link);
} else if ($action == "searchStore") {
    $search = isset($_GET['search']) ? $_GET['search'] : '';

    // คำสั่ง SQL ค้นหาที่แก้ไขแล้วโดยตัดการอ้างอิงถึง location ออก
    $sql = "SELECT store_id, store_name, store_address, store_detail, datetime
            FROM tb_store
            WHERE store_name LIKE '%$search%' 
            OR store_id LIKE '%$search%'
            OR store_address LIKE '%$search%'
            OR store_detail LIKE '%$search%'
            ORDER BY store_id ASC";

    $result = mysqli_query($link, $sql);

    if (!$result) {
        echo json_encode(null);
        mysqli_close($link);
        return;
    }

    $data = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = $row;
    }

    echo json_encode($data);
    mysqli_close($link);
} else if ($action == "addPart") {
    // รับค่าพารามิเตอร์จาก request
    $date = $_GET['date'];
    $partname = $_GET['partname'];
    $parttype = $_GET['parttype'];
    $type_id = $_GET['type_id'];
    $supplier = $_GET['supplier'];
    $brand = $_GET['brand'];
    $min = $_GET['min'];
    $note = $_GET['note']; // จะเก็บในคอลัมน์ part_detail

    // 1. ดึงค่า gen ปัจจุบันและ prefix
    $sql_get_type = "SELECT gen, type_prefix FROM tb_type WHERE type_id = ?";
    $stmt_get_type = mysqli_prepare($link, $sql_get_type);

    if (!$stmt_get_type) {
        echo json_encode("error: " . mysqli_error($link));
        mysqli_close($link);
        return;
    }

    mysqli_stmt_bind_param($stmt_get_type, "i", $type_id);
    mysqli_stmt_execute($stmt_get_type);
    mysqli_stmt_bind_result($stmt_get_type, $current_gen, $type_prefix);

    if (!mysqli_stmt_fetch($stmt_get_type)) {
        echo json_encode("error: Type not found");
        mysqli_stmt_close($stmt_get_type);
        mysqli_close($link);
        return;
    }

    mysqli_stmt_close($stmt_get_type);

    // 2. สร้าง part_num จาก type_prefix + gen
    $part_num = $type_prefix . str_pad($current_gen, 5, "0", STR_PAD_LEFT);

    // 3. คำนวณค่า gen ใหม่
    $new_gen = $current_gen + 1;

    // 4. อัพเดทค่า gen ในตาราง tb_type
    $sql_update_gen = "UPDATE tb_type SET gen = ? WHERE type_id = ?";
    $stmt_update_gen = mysqli_prepare($link, $sql_update_gen);

    if (!$stmt_update_gen) {
        echo json_encode("error: " . mysqli_error($link));
        mysqli_close($link);
        return;
    }

    mysqli_stmt_bind_param($stmt_update_gen, "ii", $new_gen, $type_id);
    $result_update = mysqli_stmt_execute($stmt_update_gen);

    if (!$result_update) {
        echo json_encode("error: Failed to update gen");
        mysqli_stmt_close($stmt_update_gen);
        mysqli_close($link);
        return;
    }

    mysqli_stmt_close($stmt_update_gen);

    // 5. เพิ่มข้อมูลในตาราง tb_part_no (ไม่ต้องมี serial_num และ sup_serial แล้ว)
    $sql_insert = "INSERT INTO `tb_part_no`
                (`part_num`, `part_name`, `part_detail`, `part_type`, `datetime`, `min`, `supplier`, `brand`) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt_insert = mysqli_prepare($link, $sql_insert);

    if (!$stmt_insert) {
        echo json_encode("error: " . mysqli_error($link));
        mysqli_close($link);
        return;
    }

    mysqli_stmt_bind_param(
        $stmt_insert,
        "ssssssss",
        $part_num,
        $partname,
        $note,
        $parttype,
        $date,
        $min,
        $supplier,
        $brand
    );

    $result_insert = mysqli_stmt_execute($stmt_insert);

    if ($result_insert) {
        echo json_encode("ok");
    } else {
        echo json_encode("error: " . mysqli_stmt_error($stmt_insert));
    }

    mysqli_stmt_close($stmt_insert);
    mysqli_close($link);
} else if ($action == "getParts") {
    // ดึงข้อมูล parts ทั้งหมด
    $sql = "SELECT * FROM tb_part_no ORDER BY part_num ASC";
    $result = mysqli_query($link, $sql);

    if (!$result) {
        echo json_encode(null);
        mysqli_close($link);
        return;
    }

    $data = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = $row;
    }

    echo json_encode($data);
    mysqli_close($link);
    return;
} else if ($action == "deleteType") {
    $type_id = $_GET['type_id'];

    // ตรวจสอบก่อนว่ามีข้อมูลอยู่หรือไม่
    $checkSql = "SELECT * FROM tb_type WHERE type_id = '$type_id'";
    $checkResult = mysqli_query($link, $checkSql);

    if (mysqli_num_rows($checkResult) == 0) {
        echo json_encode(array("status" => "error", "message" => "ไม่พบข้อมูลที่ต้องการลบ"));
        mysqli_close($link);
        return;
    }

    // ตรวจสอบว่ามี foreign key หรือไม่
    // (เพิ่มโค้ดตรวจสอบ foreign key ตามความเหมาะสม)

    // ถ้าไม่มีปัญหา ทำการลบข้อมูล
    $sql = "DELETE FROM tb_type WHERE type_id = '$type_id'";
    $result = mysqli_query($link, $sql);

    if ($result) {
        echo json_encode(array("status" => "success", "message" => "ลบข้อมูลสำเร็จ"));
    } else {
        echo json_encode(array("status" => "error", "message" => "เกิดข้อผิดพลาดในการลบข้อมูล: " . mysqli_error($link)));
    }

    mysqli_close($link);
} else if ($action == "deletePart") {
    // รับค่า part_num จาก URL parameter
    $part_num = $_GET['part_num'];

    // ตรวจสอบว่ามีการส่งค่า part_num มาหรือไม่
    if (!isset($part_num) || empty($part_num)) {
        echo json_encode(array("status" => "error", "message" => "Missing part_num parameter"));
        mysqli_close($link);
        return;
    }

    // SQL query สำหรับลบข้อมูลชิ้นส่วน
    $sql = "DELETE FROM tb_part_no WHERE part_num = '$part_num'";
    $result = mysqli_query($link, $sql);

    if ($result) {
        // ถ้าลบสำเร็จ
        if (mysqli_affected_rows($link) > 0) {
            echo json_encode(array("status" => "success", "message" => "Part deleted successfully"));
        } else {
            // ถ้าไม่มีแถวไหนถูกลบ (อาจจะไม่พบรหัสชิ้นส่วนที่ระบุ)
            echo json_encode(array("status" => "error", "message" => "Part not found"));
        }
    } else {
        // ถ้าเกิดข้อผิดพลาดในการลบ
        echo json_encode(array("status" => "error", "message" => "Failed to delete part: " . mysqli_error($link)));
    }

    mysqli_close($link);
} else if ($action == "getLogs") {
    $sql = "SELECT * FROM tb_log_product 
            ORDER BY date DESC 
            LIMIT 1000";

    $result = mysqli_query($link, $sql);

    if (!$result) {
        echo json_encode(null);
        mysqli_close($link);
        return;
    }

    $data = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = $row;
    }

    echo json_encode($data);
    mysqli_close($link);
} else if ($action == "searchLogs") {
    $search = isset($_GET['search']) ? $_GET['search'] : '';
    $status = isset($_GET['status']) ? $_GET['status'] : '';
    $start_date = isset($_GET['start_date']) ? $_GET['start_date'] : '';
    $end_date = isset($_GET['end_date']) ? $_GET['end_date'] : '';

    // สร้างคำสั่ง SQL พื้นฐาน
    $sql = "SELECT * FROM tb_log_product WHERE 1=1";

    // เพิ่มเงื่อนไขการค้นหา
    if (!empty($search)) {
        $sql .= " AND (part_num LIKE '%$search%' 
                 OR part_name LIKE '%$search%' 
                 OR serial_num LIKE '%$search%' 
                 OR location LIKE '%$search%' 
                 OR store_name LIKE '%$search%' 
                 OR User LIKE '%$search%' 
                 OR supplier LIKE '%$search%' 
                 OR note LIKE '%$search%')";
    }

    // เพิ่มเงื่อนไขการกรองตามสถานะ
    if (!empty($status) && $status != 'all') {
        $sql .= " AND status = '$status'";
    }

    // เพิ่มเงื่อนไขการกรองตามช่วงวันที่
    if (!empty($start_date)) {
        $sql .= " AND date >= '$start_date 00:00:00'"; // เริ่มต้นของวัน
    }

    if (!empty($end_date)) {
        $sql .= " AND date <= '$end_date 23:59:59'"; // สิ้นสุดของวัน
    }

    // เรียงลำดับตามวันที่ล่าสุด
    $sql .= " ORDER BY date DESC LIMIT 1000";

    $result = mysqli_query($link, $sql);

    if (!$result) {
        echo json_encode(null);
        mysqli_close($link);
        return;
    }

    $data = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = $row;
    }

    echo json_encode($data);
    mysqli_close($link);
} else if ($action == "insertLogProduct") {
    $date = $_GET['date'];
    $uname = $_GET['uname'];
    $partnum = $_GET['partnum'];
    $partname = $_GET['partname'];
    $supplier = $_GET['supplier'];
    $qty = $_GET['qty'];
    $location = $_GET['location'];
    $storename = $_GET['storename'];
    $note = $_GET['note'];
    $status = $_GET['status'];
    $serial_num = $_GET['serial_num'] ?? '';

    // Begin transaction
    mysqli_begin_transaction($link);

    try {
        // Insert log entry with serial number
        $log_sql = "INSERT INTO `tb_log_product` 
                    (`date`, `User`, `part_num`, `part_name`, 
                     `supplier`, `part_qty`, `location`, `store_name`, 
                     `note`, `status`, `serial_num`) 
                    VALUES 
                    (?, ?, ?, ?, 
                     ?, ?, ?, ?,
                     ?, ?, ?)";

        $log_stmt = mysqli_prepare($link, $log_sql);
        mysqli_stmt_bind_param(
            $log_stmt,
            "sssssssssss",
            $date,
            $uname,
            $partnum,
            $partname,
            $supplier,
            $qty,
            $location,
            $storename,
            $note,
            $status,
            $serial_num
        );
        $log_result = mysqli_stmt_execute($log_stmt);
        // Commit transaction
        mysqli_commit($link);
        echo json_encode("ok");

    } catch (Exception $e) {
        // Rollback transaction
        mysqli_rollback($link);
        echo json_encode("error: " . $e->getMessage());
    }

    mysqli_close($link);
} else if ($action == "getItemDetails") {
    // รับพารามิเตอร์ part_num และ location
    $part_num = $_GET['part_num'];
    $location = $_GET['location'];

    // ตรวจสอบว่ามีการส่งค่า part_num และ location มาหรือไม่
    if (!isset($part_num) || !isset($location)) {
        echo json_encode(array("status" => "error", "message" => "Missing required parameters"));
        mysqli_close($link);
        return;
    }

    // คำสั่ง SQL เพื่อดึงข้อมูลรายละเอียดย่อยของสินค้า
    $sql = "SELECT * FROM tb_stock 
            WHERE part_num = ? AND location = ? 
            ORDER BY datetime DESC";

    $stmt = mysqli_prepare($link, $sql);
    mysqli_stmt_bind_param($stmt, "ss", $part_num, $location);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    $data = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = $row;
    }

    echo json_encode($data);
    mysqli_close($link);
} else if ($action == "getStockParts") {
    // วิธีที่ 1: รวมทุก column ที่ต้องการเลือกไว้ใน GROUP BY
    $sql = "SELECT tb_stock.part_num, tb_stock.part_name, tb_stock.supplier, 
            tb_stock.location, tb_stock.store_name, tb_stock.note, 
            MAX(tb_stock.datetime) as datetime, 
            SUM(tb_stock.qty) as stock_qty, 
            GROUP_CONCAT(tb_stock.serial_num) as serial_nums
            FROM tb_stock 
            WHERE tb_stock.qty > 0 
            GROUP BY tb_stock.part_num, tb_stock.location, tb_stock.part_name, 
                     tb_stock.supplier, tb_stock.store_name, tb_stock.note
            ORDER BY tb_stock.part_num";

    $result = mysqli_query($link, $sql);
    $data = array();

    while ($row = mysqli_fetch_assoc($result)) {
        // ทำให้มีโครงสร้างเหมือนเดิมเพื่อความเข้ากันได้กับโค้ดที่มีอยู่
        $row['qty'] = $row['stock_qty']; // เพิ่ม qty field ให้เหมือนเดิม
        $data[] = $row;
    }

    echo json_encode($data);
    mysqli_close($link);
} else if ($action == "getBorrowedParts") {
    $sql = "SELECT tb_borrow.*, tb_borrow.qty as borrowed_qty 
            FROM tb_borrow 
            WHERE tb_borrow.qty > 0 
            ORDER BY tb_borrow.part_num";

    $result = mysqli_query($link, $sql);
    $data = array();

    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = $row;
    }

    echo json_encode($data);
    mysqli_close($link);
} else if ($action == "getSerialsForLocation") {
    $location = $_GET['location'];

    $sql = "SELECT part_num, part_name, supplier, serial_num, qty 
            FROM tb_stock 
            WHERE location = ? AND qty > 0
            ORDER BY part_num";

    $stmt = mysqli_prepare($link, $sql);
    mysqli_stmt_bind_param($stmt, "s", $location);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    $data = array();
    while ($row = mysqli_fetch_assoc($result)) {
        // Map serial_num to part_no for compatibility with existing code
        $row['part_no'] = $row['serial_num'];
        $data[] = $row;
    }

    echo json_encode($data);
    mysqli_close($link);
} else if ($action == "updateStock") {
    // รับค่าพารามิเตอร์จาก GET request
    $date = $_GET['date'];
    $partnum = $_GET['partnum'];
    $partname = $_GET['partname'];
    $supplier = $_GET['supplier'];
    $qty = $_GET['qty'];
    $location = $_GET['location'];
    $storename = $_GET['storename'];
    $note = $_GET['note'];
    $status = $_GET['status'];
    $serial_num = $_GET['serial_num'];
    $sup_serial = $_GET['sup_serial'];
    $sup_bar = $_GET['sup_part_number'];
    $uname = $_GET['uname'];

    // เริ่มการทำธุรกรรม
    mysqli_begin_transaction($link);

    try {
        switch ($status) {
            case 'IN':
                // เพิ่มสต๊อกใหม่สำหรับแต่ละ serial โดยไม่รวม qty
                $insertSql = "INSERT INTO tb_stock (
                    datetime, part_num, part_name, supplier, 
                    qty, location, store_name, note, serial_num, sup_serial, sup_barcode
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                $stmt = mysqli_prepare($link, $insertSql);
                mysqli_stmt_bind_param(
                    $stmt,
                    "sssssssssss",
                    $date,
                    $partnum,
                    $partname,
                    $supplier,
                    $qty,
                    $location,
                    $storename,
                    $note,
                    $serial_num,
                    $sup_serial,
                    $sup_bar
                );

                // เรียก execute เพียงครั้งเดียว
                $executeResult = mysqli_stmt_execute($stmt);

                if (!$executeResult) {
                    throw new Exception("Error in stock operation: " . mysqli_error($link));
                }

                // ลบ serial ออกจาก tb_gensn
                if (!empty($serial_num)) {
                    // ดึงข้อมูล packsize จาก tb_gensn
                    $getSizeSql = "SELECT packsize FROM tb_gensn WHERE part_no = ?";
                    $getSizeStmt = mysqli_prepare($link, $getSizeSql);
                    mysqli_stmt_bind_param($getSizeStmt, "s", $serial_num);
                    mysqli_stmt_execute($getSizeStmt);
                    $sizeResult = mysqli_stmt_get_result($getSizeStmt);

                    if ($sizeRow = mysqli_fetch_assoc($sizeResult)) {
                        $packsize = $sizeRow['packsize'];

                        // คำนวณ packsize ที่เหลือหลังจากหักลบกับ quantity
                        $remaining = $packsize - $qty;

                        if ($remaining == 0) {
                            // กรณีหักลบแล้วเท่ากับ 0 ให้ลบข้อมูลออกจาก tb_gensn
                            $deleteSql = "DELETE FROM tb_gensn WHERE part_no = ?";
                            $deleteStmt = mysqli_prepare($link, $deleteSql);
                            mysqli_stmt_bind_param($deleteStmt, "s", $serial_num);
                            $deleteResult = mysqli_stmt_execute($deleteStmt);

                            // ตรวจสอบผลลัพธ์การลบ
                            if (!$deleteResult) {
                                throw new Exception("Error deleting serial number from tb_gensn: " . mysqli_error($link));
                            }
                        } else if ($remaining > 0) {
                            // กรณีหักลบแล้วมากกว่า 0 ให้อัพเดต packsize ใหม่
                            $updateSizeSql = "UPDATE tb_gensn SET packsize = ? WHERE part_no = ?";
                            $updateSizeStmt = mysqli_prepare($link, $updateSizeSql);
                            mysqli_stmt_bind_param($updateSizeStmt, "is", $remaining, $serial_num);
                            $updateSizeResult = mysqli_stmt_execute($updateSizeStmt);

                            // ตรวจสอบผลลัพธ์การอัพเดต
                            if (!$updateSizeResult) {
                                throw new Exception("Error updating packsize in tb_gensn: " . mysqli_error($link));
                            }
                        } else {
                            // กรณีหักลบแล้วน้อยกว่า 0 (จำนวนที่นำเข้ามากกว่า packsize ที่มีอยู่)
                            throw new Exception("Error: Quantity exceeds available packsize for serial number: " . $serial_num);
                        }
                    } else {
                        // กรณีไม่พบข้อมูล serial_num ใน tb_gensn
                        throw new Exception("Error: Serial number not found in tb_gensn: " . $serial_num);
                    }
                }

                break;

            case 'OUT':
                // อัพเดตสต๊อกและลบถ้าจำนวนเป็น 0
                $updateSql = "UPDATE tb_stock SET 
                    datetime = ?,
                    part_name = ?,
                    supplier = ?,
                    qty = qty - ?,
                    store_name = ?,
                    note = ?
                    WHERE part_num = ? AND location = ? 
                    AND serial_num = ? AND qty >= ?";
                $stmt = mysqli_prepare($link, $updateSql);
                mysqli_stmt_bind_param(
                    $stmt,
                    "sssisssssi",
                    $date,
                    $partname,
                    $supplier,
                    $qty,
                    $storename,
                    $note,
                    $partnum,
                    $location,
                    $serial_num,
                    $qty
                );
                mysqli_stmt_execute($stmt);

                if (mysqli_affected_rows($link) == 0) {
                    throw new Exception("Insufficient stock quantity or invalid serial number");
                }

                // ลบถ้าจำนวนเป็น 0
                $deleteSql = "DELETE FROM tb_stock 
                              WHERE part_num = ? AND location = ? 
                              AND serial_num = ? AND qty <= 0";
                $stmt = mysqli_prepare($link, $deleteSql);
                mysqli_stmt_bind_param($stmt, "sss", $partnum, $location, $serial_num);
                mysqli_stmt_execute($stmt);
                break;

            case 'Borrow':
                // อัพเดตสต๊อกสำหรับการยืม
                $updateSql = "UPDATE tb_stock SET 
                    datetime = ?,
                    part_name = ?,
                    supplier = ?,
                    qty = qty - ?,
                    store_name = ?,
                    note = ?
                    WHERE part_num = ? AND location = ? 
                    AND serial_num = ? AND qty >= ?";
                $stmt = mysqli_prepare($link, $updateSql);
                mysqli_stmt_bind_param(
                    $stmt,
                    "sssisssssi",
                    $date,
                    $partname,
                    $supplier,
                    $qty,
                    $storename,
                    $note,
                    $partnum,
                    $location,
                    $serial_num,
                    $qty
                );
                mysqli_stmt_execute($stmt);

                if (mysqli_affected_rows($link) == 0) {
                    throw new Exception("Insufficient stock quantity or invalid serial number");
                }

                // ลบถ้าจำนวนเป็น 0
                $deleteSql = "DELETE FROM tb_stock 
                            WHERE part_num = ? AND location = ? 
                            AND serial_num = ? AND qty <= 0";
                $stmt = mysqli_prepare($link, $deleteSql);
                mysqli_stmt_bind_param($stmt, "sss", $partnum, $location, $serial_num);
                mysqli_stmt_execute($stmt);

                $checkSql = "SELECT qty FROM tb_borrow WHERE serial_num = ? AND location = ? AND user = ?";
                $checkStmt = mysqli_prepare($link, $checkSql);
                mysqli_stmt_bind_param($checkStmt, "sss", $serial_num, $location, $uname);
                mysqli_stmt_execute($checkStmt);

                // แก้ตรงนี้:
                mysqli_stmt_store_result($checkStmt);
                if (mysqli_stmt_num_rows($checkStmt) > 0) {
                    // มีข้อมูล -> อัพเดต
                    mysqli_stmt_bind_result($checkStmt, $existingQty);
                    mysqli_stmt_fetch($checkStmt);
                    $newQty = $existingQty + $qty;

                    $updateSql = "UPDATE tb_borrow SET qty = ? WHERE serial_num = ? AND location = ? AND user = ?";
                    $updateStmt = mysqli_prepare($link, $updateSql);
                    mysqli_stmt_bind_param($updateStmt, "isss", $newQty, $serial_num, $location, $uname);
                    mysqli_stmt_execute($updateStmt);
                } else {
                    // ไม่มีข้อมูล -> insert
                    $borrowSql = "INSERT INTO tb_borrow (datetime, part_num, part_name, supplier, qty, location, store_name, note, serial_num, sup_serial, sup_barcode, user) 
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                    $insertStmt = mysqli_prepare($link, $borrowSql);
                    mysqli_stmt_bind_param($insertStmt, "ssssssssssss", $date, $partnum, $partname, $supplier, $qty, $location, $storename, $note, $serial_num, $sup_serial, $sup_barcode, $uname);
                    mysqli_stmt_execute($insertStmt);
                }

                break;

            case 'RETURN':
                // อัพเดตสต๊อกสำหรับการคืน
                $updateStockSql = "UPDATE tb_stock SET 
                    datetime = ?,
                    part_name = ?,
                    supplier = ?,
                    qty = qty + ?,
                    store_name = ?,
                    note = ?
                    WHERE part_num = ? AND location = ? 
                    AND serial_num = ?";
                $stmt = mysqli_prepare($link, $updateStockSql);
                mysqli_stmt_bind_param(
                    $stmt,
                    "ssssissss",
                    $date,
                    $partname,
                    $supplier,
                    $qty,
                    $storename,
                    $note,
                    $partnum,
                    $location,
                    $serial_num
                );
                mysqli_stmt_execute($stmt);

                if (mysqli_affected_rows($link) == 0) {
                    // ถ้าไม่มีสต๊อก ให้สร้างรายการใหม่
                    $insertSql = "INSERT INTO tb_stock (
                        datetime, part_num, part_name, supplier,
                        qty, location, store_name, note, serial_num, sup_serial, sup_barcode
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                    $stmt = mysqli_prepare($link, $insertSql);
                    mysqli_stmt_bind_param(
                        $stmt,
                        "sssssssssss",
                        $date,
                        $partnum,
                        $partname,
                        $supplier,
                        $qty,
                        $location,
                        $storename,
                        $note,
                        $serial_num,
                        $sup_serial,
                        $sup_bar,
                        
                    );
                    mysqli_stmt_execute($stmt);
                }

                // อัพเดตตาราง tb_borrow
                $updateBorrowSql = "UPDATE tb_borrow SET 
                    qty = qty - ?
                    WHERE part_num = ?
                    AND serial_num = ? AND qty >= ? AND user = ?" ;
                $stmt = mysqli_prepare($link, $updateBorrowSql);
                mysqli_stmt_bind_param(
                    $stmt,
                    "issis",
                    $qty,
                    $partnum,
                    $serial_num,
                    $qty,
                    $uname
                );
                mysqli_stmt_execute($stmt);

                if (mysqli_affected_rows($link) == 0) {
                    throw new Exception("Invalid return quantity or item not borrowed");
                }

                // ลบรายการที่มีจำนวนเป็น 0
                $deleteBorrowSql = "DELETE FROM tb_borrow 
                                    WHERE part_num = ?  
                                    AND serial_num = ? AND qty <= 0 AND user = ?";
                $stmt = mysqli_prepare($link, $deleteBorrowSql);
                mysqli_stmt_bind_param($stmt, "sss", $partnum, $serial_num, $uname);
                mysqli_stmt_execute($stmt);
                break;

            default:
                throw new Exception("Invalid status");
        }

        if ($status != 'IN') {
            mysqli_stmt_execute($stmt);
        }
        mysqli_commit($link);
        echo json_encode("ok");

    } catch (Exception $e) {
        mysqli_rollback($link);
        echo json_encode("error: " . $e->getMessage());
    }

    mysqli_close($link);
} else {
    echo json_encode("fail");
    mysqli_close($link);
}
