<?php
/* include 'Connected.php'; */
header("Access-Control-Allow-Origin: *");
error_reporting(0);
error_reporting(E_ERROR | E_PARSE);
header("content-type:text/javascript;charset=utf-8");
header('Content-Type: application/json; charset=utf-8');
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
} else if ($action == "getSuppliers") {
    // ดึงชื่อซัพพลายเออร์ที่ไม่ซ้ำกันจากตาราง tb_part_no, tb_gensn, และ tb_stock
    $sql = "SELECT DISTINCT supplier as name FROM (
                SELECT supplier FROM tb_part_no WHERE supplier IS NOT NULL AND supplier != ''
                UNION 
                SELECT supplier FROM tb_gensn WHERE supplier IS NOT NULL AND supplier != ''
                UNION 
                SELECT supplier FROM tb_stock WHERE supplier IS NOT NULL AND supplier != ''
            ) AS combined_suppliers
            ORDER BY name ASC";

    $result = mysqli_query($link, $sql);

    if (mysqli_num_rows($result) > 0) {
        $suppliers = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $suppliers[] = $row;
        }
        echo json_encode($suppliers);
    } else {
        echo json_encode(null);
    }

    mysqli_close($link);
} else if ($action == "updateLocation") {
    // รับค่าจาก POST request
    $location_id = $_POST['location_id'];
    $location_name = $_POST['location_name'];
    $location_detail = $_POST['location_detail'] ?? '';
    $store_id = $_POST['store_id'];

    // สร้างคำสั่ง SQL
    $sql = "UPDATE `tb_location` SET 
            location_name = '$location_name', 
            location_detail = '$location_detail',
            store_id = '$store_id'
            WHERE location_id = '$location_id'";

    // ทำการ query
    $result = mysqli_query($link, $sql);

    // ส่งผลลัพธ์
    if ($result) {
        echo json_encode([
            'status' => 'success',
            'message' => 'อัปเดตข้อมูลสถานที่จัดเก็บสำเร็จ'
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => mysqli_error($link)
        ]);
    }

    mysqli_close($link);
} else if ($action == "updateStore") {
    // รับค่าจาก POST request
    $store_id = $_POST['store_id'];
    $store_name = $_POST['store_name'];
    $store_address = $_POST['store_address'] ?? '';
    $store_detail = $_POST['store_detail'] ?? '';

    // สร้างคำสั่ง SQL
    $sql = "UPDATE `tb_store` SET 
            store_name = '$store_name', 
            store_address = '$store_address',
            store_detail = '$store_detail'
            WHERE store_id = '$store_id'";

    // ทำการ query
    $result = mysqli_query($link, $sql);

    // ส่งผลลัพธ์
    if ($result) {
        echo json_encode([
            'status' => 'success',
            'message' => 'อัปเดตข้อมูลคลังสินค้าสำเร็จ'
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => mysqli_error($link)
        ]);
    }

    mysqli_close($link);
} else if ($action == "updateType") {
    // รับค่าจาก POST request
    $type_id = $_POST['type_id'];
    $type_name = $_POST['type_name'];
    $type_prefix = $_POST['type_prefix'];
    $type_detail = $_POST['type_detail'] ?? '';
    $type_unit = $_POST['type_unit'] ?? '';

    $sql = "UPDATE `tb_type` SET 
            type_name = '$type_name', 
            type_prefix = '$type_prefix', 
            type_detail = '$type_detail',
            type_unit = '$type_unit'
            WHERE type_id = '$type_id'";


    $result = mysqli_query($link, $sql);


    if ($result) {
        echo json_encode([
            'status' => 'success',
            'message' => 'อัปเดตข้อมูลสำเร็จ'
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => mysqli_error($link)
        ]);
    }
    mysqli_close($link);
} // เพิ่มฟังก์ชัน updatePart ใน Store.php
else if ($action == "updatePart") {
    // รับค่าจาก POST request
    $part_num = $_POST['part_num'];
    $part_name = $_POST['part_name'];
    $part_type = $_POST['part_type'];
    $supplier = $_POST['supplier'] ?? '';
    $brand = $_POST['brand'] ?? '';
    $min = $_POST['min'] ?? '0';
    $part_detail = $_POST['part_detail'] ?? '';

    // สร้างคำสั่ง SQL
    $sql = "UPDATE `tb_part_no` SET 
            part_name = '$part_name', 
            part_type = '$part_type',
            supplier = '$supplier',
            brand = '$brand',
            min = '$min',
            part_detail = '$part_detail'
            WHERE part_num = '$part_num'";

    // ทำการ query
    $result = mysqli_query($link, $sql);

    // ส่งผลลัพธ์
    if ($result) {
        echo json_encode([
            'status' => 'success',
            'message' => 'อัปเดตข้อมูลชิ้นส่วนสำเร็จ'
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => mysqli_error($link)
        ]);
    }

    mysqli_close($link);
}

// เพิ่มฟังก์ชัน updateSerial ใน Store.php
else if ($action == "updateSerial") {
    // รับค่าจาก POST request
    $part_no = $_POST['part_no'];
    $part_num = $_POST['part_num'];
    $supplier = $_POST['supplier'] ?? '';
    $brand = $_POST['brand'] ?? '';
    $sup_serial = $_POST['sup_serial'] ?? '';
    $sup_part_number = $_POST['sup_part_number'] ?? '';
    $packsize = $_POST['packsize'] ?? '1';

    // ดึงข้อมูล part_name จาก tb_part_no เพื่อใช้อัปเดต
    $get_name_sql = "SELECT part_name FROM tb_part_no WHERE part_num = '$part_num'";
    $name_result = mysqli_query($link, $get_name_sql);
    $part_name = "";

    if ($name_result && mysqli_num_rows($name_result) > 0) {
        $name_row = mysqli_fetch_assoc($name_result);
        $part_name = $name_row['part_name'];
    }

    // สร้างคำสั่ง SQL
    $sql = "UPDATE `tb_gensn` SET 
            part_num = '$part_num', 
            part_name = '$part_name',
            supplier = '$supplier',
            brand = '$brand',
            sup_serial = '$sup_serial',
            sup_part_number = '$sup_part_number',
            packsize = '$packsize'
            WHERE part_no = '$part_no'";

    // ทำการ query
    $result = mysqli_query($link, $sql);

    // ส่งผลลัพธ์
    if ($result) {
        echo json_encode([
            'status' => 'success',
            'message' => 'อัปเดตข้อมูลซีเรียลนัมเบอร์สำเร็จ'
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => mysqli_error($link)
        ]);
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
} else if ($action == "getLastSerialCount") {
    $date = $_GET['date']; // รูปแบบ YYYYMMDD

    // ตรวจสอบรูปแบบวันที่
    if (!preg_match('/^\d{8}$/', $date)) {
        echo json_encode(array("error" => "Invalid date format"));
        mysqli_close($link);
        return;
    }

    // กำหนดรูปแบบการค้นหาด้วย wildcard ที่เฉพาะเจาะจงมากขึ้น
    $pattern = '%' . $date . '%';

    // ดึงข้อมูลจากทั้งสองตาราง

    // 1. ดึงจาก tb_stock - แก้ไขให้เรียงโดยไม่สนใจ 2 ตัวอักษรแรก
    $sql_stock = "SELECT serial_num FROM tb_stock WHERE serial_num LIKE ? 
                 ORDER BY SUBSTRING(serial_num, 3) DESC LIMIT 1";
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
    $sql_gensn = "SELECT part_no FROM tb_gensn WHERE part_no LIKE ? 
                 ORDER BY SUBSTRING(part_no, 3) DESC LIMIT 1";
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
} else if ($action == "getSerialInfo") {
    $serial_num = $_GET['serial_num'];

    // ตรวจสอบว่ามีการส่งค่า serial_num มาหรือไม่
    if (!isset($serial_num) || empty($serial_num)) {
        echo json_encode(array("status" => "error", "message" => "ไม่ได้ระบุ Serial Number"));
        mysqli_close($link);
        return;
    }

    // ค้นหาข้อมูล Serial จากตาราง tb_stock
    $sql = "SELECT 
                part_num, 
                part_name, 
                supplier, 
                location, 
                store_name, 
                qty, 
                sup_serial, 
                sup_barcode,
                serial_num,
                datetime
            FROM tb_stock 
            WHERE serial_num = ? AND qty > 0
            ORDER BY datetime DESC";

    $stmt = mysqli_prepare($link, $sql);

    if (!$stmt) {
        echo json_encode(array("status" => "error", "message" => "Database error: " . mysqli_error($link)));
        mysqli_close($link);
        return;
    }

    mysqli_stmt_bind_param($stmt, "s", $serial_num);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    $data = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = $row;
    }

    if (empty($data)) {
        // ถ้าไม่พบใน tb_stock ให้ลองหาใน tb_gensn (Serial ที่ยังไม่ได้นำเข้าคลัง)
        $sql_gensn = "SELECT 
                        part_num, 
                        part_name, 
                        supplier, 
                        '' as location,
                        '' as store_name,
                        packsize as qty, 
                        sup_serial, 
                        sup_part_number as sup_barcode,
                        part_no as serial_num,
                        date as datetime
                    FROM tb_gensn 
                    WHERE part_no = ?
                    ORDER BY date DESC";

        $stmt_gensn = mysqli_prepare($link, $sql_gensn);

        if ($stmt_gensn) {
            mysqli_stmt_bind_param($stmt_gensn, "s", $serial_num);
            mysqli_stmt_execute($stmt_gensn);
            $result_gensn = mysqli_stmt_get_result($stmt_gensn);

            while ($row = mysqli_fetch_assoc($result_gensn)) {
                $row['status'] = 'not_in_stock'; // แมร์คว่ายังไม่ได้เข้าคลัง
                $data[] = $row;
            }
            mysqli_stmt_close($stmt_gensn);
        }
    }

    echo json_encode($data);
    mysqli_stmt_close($stmt);
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
} else if ($action == "getStock") {
    // ดึงข้อมูล parts ทั้งหมด
    $sql = "SELECT * FROM tb_stock ORDER BY datetime ASC";
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
} else if ($action == "getOutItems") {
    // ดึงรายการที่ OUT แล้วยังไม่ได้คืน
    $sql = "SELECT DISTINCT 
                l1.part_num,
                l1.part_name, 
                l1.supplier,
                l1.location,
                l1.store_name,
                l1.serial_num,
                l1.User as user,
                l1.part_qty as qty,
                l1.date as datetime,
                l1.note
            FROM tb_log_product l1
            WHERE l1.status = 'OUT'
            AND NOT EXISTS (
                SELECT 1 FROM tb_log_product l2 
                WHERE l2.serial_num = l1.serial_num 
                AND l2.part_num = l1.part_num
                AND l2.status = 'Return'
                AND l2.date > l1.date
            )
            ORDER BY l1.date DESC";

    $result = mysqli_query($link, $sql);
    $data = array();

    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = $row;
    }

    echo json_encode($data);
    mysqli_close($link);
} else if ($action == "getBucket") {
    //ตะกร้า
    $sql = "SELECT * FROM tb_bucket ORDER BY UID ASC";
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

} else if ($action == 'addBucket') {
    // สร้าง BucketID อัตโนมัติ
    $sql = "SELECT MAX(CAST(SUBSTRING(BucketID, 1) AS UNSIGNED)) as max_id FROM tb_bucket";
    $result = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($result);
    $nextId = str_pad(($row['max_id'] + 1), 2, '0', STR_PAD_LEFT);


} else if ($action == "deleteBucket") {
    // รับค่า part_num จาก URL parameter
    $uid = $_GET['uid'];

    // ตรวจสอบว่ามีการส่งค่า part_num มาหรือไม่
    if (!isset($uid) || empty($uid)) {
        echo json_encode(array("status" => "error", "message" => "Missing uid parameter"));
        mysqli_close($link);
        return;
    }

    // SQL query สำหรับลบข้อมูลชิ้นส่วน
    $sql = "DELETE FROM tb_bucket WHERE uid = '$uid'";
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

} else if ($action === 'saveBucket') {
    // Get parameters

    $PO = $_GET['PO'] ?? '';
    $QO = $_GET['QO'] ?? '';
    $CUSTOMER = $_GET['CUSTOMER'] ?? '';
    $BucketID = $_GET['BucketID'] ?? '';
    $USERID = $_GET['USERID'] ?? '';
    $USERNAME = $_GET['USERNAME'] ?? '';
    $Partname = $_GET['Partname'] ?? '';
    $QTY = $_GET['QTY'] ?? '';
    $status = $_GET['status'] ?? '';
    $datetime = $_GET['datetime'] ?? '';
    $Note = $_GET['Note'] ?? '';

    // Validate and truncate data to prevent "Data too long" errors
    // Adjust these lengths based on your actual column definitions

    $PO = substr($PO, 0, 100);
    $QO = substr($QO, 0, 100); // Adjust this length as needed
    $CUSTOMER = substr($CUSTOMER, 0, 255);
    $BucketID = substr($BucketID, 0, 50);
    $USERID = substr($USERID, 0, 50);
    $USERNAME = substr($USERNAME, 0, 100);
    $Partname = substr($Partname, 0, 255);
    $QTY = substr($QTY, 0, 20);
    $status = substr($status, 0, 50);
    $datetime = substr($datetime, 0, 50);
    $Note = substr($Note, 0, 1000);

    // Use prepared statements to prevent SQL injection
    $sql = "INSERT INTO tb_bucket 
            ( PO, QO, CUSTOMER, BucketID, USERID, USERNAME, Partname, QTY, status, datetime, Note)
            VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = mysqli_prepare($link, $sql);

    if ($stmt) {
        mysqli_stmt_bind_param(
            $stmt,
            "sssssssssss",
            $PO,
            $QO,
            $CUSTOMER,
            $BucketID,
            $USERID,
            $USERNAME,
            $Partname,
            $QTY,
            $status,
            $datetime,
            $Note
        );

        $result = mysqli_stmt_execute($stmt);

        if ($result) {
            echo json_encode(["status" => "success", "message" => "Data saved successfully"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to save data: " . mysqli_error($link)]);
        }

        mysqli_stmt_close($stmt);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to prepare statement: " . mysqli_error($link)]);
    }

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

            //img
            case 'getPartImages':
                if (isset($_GET['part_num'])) {
                    $partNum = $_GET['part_num'];

                    try {
                        // Query ดึงรูปภาพจากฐานข้อมูล
                        $stmt = $pdo->prepare("SELECT * FROM part_images WHERE part_num = ? ORDER BY created_at DESC");
                        $stmt->execute([$partNum]);
                        $images = $stmt->fetchAll(PDO::FETCH_ASSOC);

                        // ตรวจสอบว่าไฟล์รูปภาพยังอยู่ในระบบหรือไม่
                        $validImages = [];
                        foreach ($images as $image) {
                            $filePath = __DIR__ . '/atc-crm-api/uploads/' . $image['filename'];
                            if (file_exists($filePath)) {
                                $validImages[] = [
                                    'id' => $image['id'],
                                    'filename' => $image['filename'],
                                    'description' => $image['description'],
                                    'url' => $_SERVER['REQUEST_SCHEME'] . '://' . $_SERVER['HTTP_HOST'] . '/atc-crm-api/uploads/' . $image['filename'],
                                    'created_at' => $image['created_at']
                                ];
                            }
                        }

                        echo json_encode([
                            'status' => 'success',
                            'images' => $validImages,
                            'total' => count($validImages)
                        ]);

                    } catch (PDOException $e) {
                        echo json_encode([
                            'status' => 'error',
                            'message' => 'Database error: ' . $e->getMessage()
                        ]);
                    }
                } else {
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Part number is required'
                    ]);
                }
                break;

            case 'uploadPartImage':
                if (isset($_POST['part_num']) && isset($_FILES['image'])) {
                    $partNum = $_POST['part_num'];
                    $description = $_POST['description'] ?? '';

                    // ตรวจสอบไฟล์
                    $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
                    $maxSize = 5 * 1024 * 1024; // 5MB

                    $file = $_FILES['image'];

                    if (!in_array($file['type'], $allowedTypes)) {
                        echo json_encode([
                            'status' => 'error',
                            'message' => 'Invalid file type. Only JPG, PNG, GIF allowed.'
                        ]);
                        break;
                    }

                    if ($file['size'] > $maxSize) {
                        echo json_encode([
                            'status' => 'error',
                            'message' => 'File too large. Maximum size is 5MB.'
                        ]);
                        break;
                    }

                    // สร้างชื่อไฟล์ใหม่
                    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
                    $filename = $partNum . '_' . time() . '_' . uniqid() . '.' . $extension;
                    $uploadPath = __DIR__ . '../uploads/' . $filename;

                    // สร้างโฟลเดอร์ถ้ายังไม่มี
                    $uploadDir = __DIR__ . '../uploads/';
                    if (!is_dir($uploadDir)) {
                        mkdir($uploadDir, 0755, true);
                    }

                    if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
                        try {
                            // บันทึกข้อมูลในฐานข้อมูล
                            $stmt = $pdo->prepare("INSERT INTO part_images (part_num, filename, description, created_at) VALUES (?, ?, ?, NOW())");
                            $stmt->execute([$partNum, $filename, $description]);

                            echo json_encode([
                                'status' => 'success',
                                'message' => 'Image uploaded successfully',
                                'filename' => $filename
                            ]);

                        } catch (PDOException $e) {
                            // ลบไฟล์ถ้าบันทึกฐานข้อมูลไม่สำเร็จ
                            unlink($uploadPath);
                            echo json_encode([
                                'status' => 'error',
                                'message' => 'Database error: ' . $e->getMessage()
                            ]);
                        }
                    } else {
                        echo json_encode([
                            'status' => 'error',
                            'message' => 'Failed to upload file'
                        ]);
                    }
                } else {
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Part number and image file are required'
                    ]);
                }
                break;

            case 'deletePartImage':
                if (isset($_GET['image_id'])) {
                    $imageId = $_GET['image_id'];

                    try {
                        // ดึงข้อมูลรูปภาพ
                        $stmt = $pdo->prepare("SELECT filename FROM part_images WHERE id = ?");
                        $stmt->execute([$imageId]);
                        $image = $stmt->fetch(PDO::FETCH_ASSOC);

                        if ($image) {
                            // ลบไฟล์
                            $filePath = __DIR__ . '../uploads/' . $image['filename'];
                            if (file_exists($filePath)) {
                                unlink($filePath);
                            }

                            // ลบข้อมูลจากฐานข้อมูล
                            $stmt = $pdo->prepare("DELETE FROM part_images WHERE id = ?");
                            $stmt->execute([$imageId]);

                            echo json_encode([
                                'status' => 'success',
                                'message' => 'Image deleted successfully'
                            ]);
                        } else {
                            echo json_encode([
                                'status' => 'error',
                                'message' => 'Image not found'
                            ]);
                        }

                    } catch (PDOException $e) {
                        echo json_encode([
                            'status' => 'error',
                            'message' => 'Database error: ' . $e->getMessage()
                        ]);
                    }
                } else {
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Image ID is required'
                    ]);
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
                // ดึง return_type เพื่อดูว่าเป็นการคืนประเภทไหน
                $return_type = $_GET['return_type'] ?? 'BORROW';

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
                $updateStmt = mysqli_prepare($link, $updateStockSql); // เปลี่ยนเป็น $updateStmt
                mysqli_stmt_bind_param(
                    $updateStmt,
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
                mysqli_stmt_execute($updateStmt);

                if (mysqli_affected_rows($link) == 0) {
                    // ถ้าไม่มีสต๊อก ให้สร้างรายการใหม่
                    $insertSql = "INSERT INTO tb_stock (
        datetime, part_num, part_name, supplier,
        qty, location, store_name, note, serial_num, sup_serial, sup_barcode
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                    $insertStmt = mysqli_prepare($link, $insertSql); // เปลี่ยนเป็น $insertStmt
                    mysqli_stmt_bind_param(
                        $insertStmt,
                        "ssssissssss",
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
                    mysqli_stmt_execute($insertStmt);
                }

                // จัดการ tb_borrow เฉพาะกรณี BORROW เท่านั้น
                if ($return_type === 'BORROW') {
                    // อัพเดตตาราง tb_borrow
                    $updateBorrowSql = "UPDATE tb_borrow SET 
        qty = qty - ?
        WHERE part_num = ?
        AND serial_num = ? AND qty >= ? AND user = ?";
                    $borrowStmt = mysqli_prepare($link, $updateBorrowSql); // เปลี่ยนเป็น $borrowStmt
                    mysqli_stmt_bind_param(
                        $borrowStmt,
                        "issis",
                        $qty,
                        $partnum,
                        $serial_num,
                        $qty,
                        $uname
                    );
                    mysqli_stmt_execute($borrowStmt);

                    if (mysqli_affected_rows($link) == 0) {
                        throw new Exception("Invalid return quantity or item not borrowed");
                    }

                    // ลบรายการที่มีจำนวนเป็น 0
                    $deleteBorrowSql = "DELETE FROM tb_borrow 
                WHERE part_num = ?  
                AND serial_num = ? AND qty <= 0 AND user = ?";
                    $deleteStmt = mysqli_prepare($link, $deleteBorrowSql); // เปลี่ยนเป็น $deleteStmt
                    mysqli_stmt_bind_param($deleteStmt, "sss", $partnum, $serial_num, $uname);
                    mysqli_stmt_execute($deleteStmt);
                }
                // หมายเหตุ: กรณี OUT ไม่ต้องจัดการ tb_borrow

                break;

            default:
                throw new Exception("Invalid status");
        }
        mysqli_commit($link);
        echo json_encode("ok");

    } catch (Exception $e) {
        mysqli_rollback($link);
        echo json_encode("error: " . $e->getMessage());
    }

    mysqli_close($link);
} else if ($action == "addQuantity") {
    // รับค่าพารามิเตอร์จาก GET request
    $date = $_GET['date'];
    $partnum = $_GET['partnum'];
    $partname = $_GET['partname'];
    $supplier = $_GET['supplier'];
    $addQty = $_GET['qty']; // จำนวนที่จะเพิ่ม
    $location = $_GET['location'];
    $storename = $_GET['storename'];
    $note = $_GET['note'];
    $serial_num = $_GET['serial_num'];
    $sup_serial = $_GET['sup_serial'] ?? '';
    $sup_barcode = $_GET['sup_barcode'] ?? '';
    $uname = $_GET['uname'];

    // เริ่มการทำธุรกรรม
    mysqli_begin_transaction($link);

    try {
        // ตรวจสอบว่ามี serial นี้อยู่ใน tb_stock หรือไม่
        $checkSql = "SELECT qty FROM tb_stock 
                     WHERE part_num = ? AND location = ? AND serial_num = ?";
        $checkStmt = mysqli_prepare($link, $checkSql);
        mysqli_stmt_bind_param($checkStmt, "sss", $partnum, $location, $serial_num);
        mysqli_stmt_execute($checkStmt);

        mysqli_stmt_store_result($checkStmt);

        if (mysqli_stmt_num_rows($checkStmt) > 0) {
            // มีข้อมูลอยู่แล้ว -> อัพเดต qty เพิ่มเข้าไป
            mysqli_stmt_bind_result($checkStmt, $currentQty);
            mysqli_stmt_fetch($checkStmt);

            $newQty = $currentQty + $addQty;

            $updateSql = "UPDATE tb_stock SET 
                         datetime = ?,
                         part_name = ?,
                         supplier = ?,
                         qty = ?,
                         store_name = ?,
                         note = ?
                         WHERE part_num = ? AND location = ? AND serial_num = ?";

            $updateStmt = mysqli_prepare($link, $updateSql);
            mysqli_stmt_bind_param(
                $updateStmt,
                "sssisssss",
                $date,
                $partname,
                $supplier,
                $newQty,
                $storename,
                $note,
                $partnum,
                $location,
                $serial_num
            );

            $updateResult = mysqli_stmt_execute($updateStmt);

            if (!$updateResult) {
                throw new Exception("Error updating stock quantity: " . mysqli_error($link));
            }

        } else {
            // ไม่มีข้อมูล -> เพิ่มรายการใหม่
            $insertSql = "INSERT INTO tb_stock (
                         datetime, part_num, part_name, supplier,
                         qty, location, store_name, note, serial_num, sup_serial, sup_barcode
                         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

            $insertStmt = mysqli_prepare($link, $insertSql);
            mysqli_stmt_bind_param(
                $insertStmt,
                "ssssissssss",
                $date,
                $partnum,
                $partname,
                $supplier,
                $addQty,
                $location,
                $storename,
                $note,
                $serial_num,
                $sup_serial,
                $sup_barcode
            );

            $insertResult = mysqli_stmt_execute($insertStmt);

            if (!$insertResult) {
                throw new Exception("Error inserting new stock record: " . mysqli_error($link));
            }
        }

        // Commit การทำงาน
        mysqli_commit($link);
        echo json_encode("ok");

    } catch (Exception $e) {
        // Rollback หากเกิดข้อผิดพลาด
        mysqli_rollback($link);
        echo json_encode("error: " . $e->getMessage());
    }

    mysqli_close($link);
} else if ($action == "getProducts") {
    $sql = "SELECT * FROM tb_product ORDER BY Datein DESC";
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

// ฟังก์ชันค้นหาสินค้า
else if ($action == "searchProducts") {
    $search = isset($_GET['search']) ? $_GET['search'] : '';

    // สร้างเงื่อนไขการค้นหา
    $searchCondition = "";
    if (!empty($search)) {
        $searchCondition = " WHERE AT_Model LIKE '%$search%' 
                           OR AT_SN LIKE '%$search%' 
                           OR Sup_name LIKE '%$search%' 
                           OR Supplier_Model LIKE '%$search%'
                           OR Supplier_SN LIKE '%$search%'
                           OR CPU LIKE '%$search%'
                           OR Ram LIKE '%$search%'
                           OR Customer LIKE '%$search%'
                           OR Note LIKE '%$search%'
                           OR location LIKE '%$search%'";
    }

    $sql = "SELECT * FROM tb_product" . $searchCondition . " ORDER BY Datein DESC";
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

// ฟังก์ชันเพิ่มสินค้าใหม่
else if ($action == "addProduct") {
    // รับข้อมูลจาก GET parameters
    $datein = $_GET['datein'] ?? '';
    $supplier_model = $_GET['supplier_model'] ?? '';
    $sup_name = $_GET['sup_name'] ?? '';
    $supplier_sn = $_GET['supplier_sn'] ?? '';
    $at_model = $_GET['at_model'] ?? '';
    $at_sn = $_GET['at_sn'] ?? '';
    $displaysize = $_GET['displaysize'] ?? 0;
    $touchtype = $_GET['touchtype'] ?? '';
    $cap = $_GET['cap'] ?? 0;
    $resis = $_GET['resis'] ?? 0;
    $hdmi = $_GET['hdmi'] ?? 0;
    $vga = $_GET['vga'] ?? 0;
    $dvi = $_GET['dvi'] ?? 0;
    $displayport = $_GET['displayport'] ?? 0;
    $usb20 = $_GET['usb20'] ?? 0;
    $usb30 = $_GET['usb30'] ?? 0;
    $wifi = $_GET['wifi'] ?? 0;
    $wifibrand = $_GET['wifibrand'] ?? '';
    $wifimodel = $_GET['wifimodel'] ?? '';
    $lan = $_GET['lan'] ?? 0;
    $lanbrand = $_GET['lanbrand'] ?? '';
    $lanmodel = $_GET['lanmodel'] ?? '';
    $speaker = $_GET['speaker'] ?? 0;
    $headphone = $_GET['headphone'] ?? 0;
    $rs232 = $_GET['rs232'] ?? 0;
    $rs485 = $_GET['rs485'] ?? 0;
    $os_type = $_GET['os_type'] ?? '';
    $windows_license = $_GET['windows_license'] ?? '';
    $cpu = $_GET['cpu'] ?? '';
    $ssd_hdd = $_GET['ssd_hdd'] ?? '';
    $ssd_sn = $_GET['ssd_sn'] ?? '';
    $ram = $_GET['ram'] ?? '';
    $product_status = $_GET['product_status'] ?? '';
    $note = $_GET['note'] ?? '';
    $dateout = !empty($_GET['dateout']) ? $_GET['dateout'] : null;
    $customer = $_GET['customer'] ?? '';
    $quatation_no = $_GET['quatation_no'] ?? '';
    $po_number = $_GET['po_number'] ?? '';
    $location = $_GET['location'] ?? '';

    // ตรวจสอบค่าที่จำเป็น
    if (empty($datein) || empty($at_model) || empty($at_sn) || empty($sup_name)) {
        echo json_encode("error: Missing required fields");
        mysqli_close($link);
        return;
    }

    // เริ่มการทำธุรกรรม
    mysqli_begin_transaction($link);

    try {
        // 1. เพิ่มข้อมูลสินค้าลงใน tb_product (ใช้คอลัมน์ที่มีจริงในตาราง)
        $sql = "INSERT INTO `tb_product` (
            `Datein`, `Supplier_Model`, `Sup_name`, `Supplier_SN`, `AT_Model`, `AT_SN`,
            `displaysize`, `touchtype`, `cap`, `resis`, `HDMI`, `VGA`, `DVI`, `DisplayPort`,
            `USB2.0`, `USB3.0`, `WIFI`, `WIFIBRAND`, `WIFIMODEL`, `LAN`, `LANBRAND`, `LANMODEL`,
            `Speaker`, `Headphone`, `RS232`, `RS485`, `OS_TYPE`, `Windows_license`, `CPU`,
            `SSD/HDD`, `SSD_SN`, `Ram`, `Product_status`, `Note`, `Dateout`, `Customer`,
            `Quatation_No`, `PO_number` , `location`
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,?
        )";

        $stmt = mysqli_prepare($link, $sql);

        if (!$stmt) {
            throw new Exception("Prepare failed: " . mysqli_error($link));
        }

        mysqli_stmt_bind_param(
            $stmt,
            "ssssssisiisssssssssssssssssssssssssssss",
            $datein,
            $supplier_model,
            $sup_name,
            $supplier_sn,
            $at_model,
            $at_sn,
            $displaysize,
            $touchtype,
            $cap,
            $resis,
            $hdmi,
            $vga,
            $dvi,
            $displayport,
            $usb20,
            $usb30,
            $wifi,
            $wifibrand,
            $wifimodel,
            $lan,
            $lanbrand,
            $lanmodel,
            $speaker,
            $headphone,
            $rs232,
            $rs485,
            $os_type,
            $windows_license,
            $cpu,
            $ssd_hdd,
            $ssd_sn,
            $ram,
            $product_status,
            $note,
            $dateout,
            $customer,
            $quatation_no,
            $po_number,
            $location
        );

        $result1 = mysqli_stmt_execute($stmt);

        if (!$result1) {
            throw new Exception("Error inserting product: " . mysqli_stmt_error($stmt));
        }

        // 2. เพิ่มข้อมูลลงใน tb_log_product
        $log_sql = "INSERT INTO `tb_log_pc` (`ATC_modal`, `SN`, `status`, `date`, `user`) 
                    VALUES (?, ?, ?, ?, ?)";

        $log_stmt = mysqli_prepare($link, $log_sql);
        $status_log = "IN";
        $user = "System"; // หรือใช้จากผู้ใช้ที่ล็อกอิน

        mysqli_stmt_bind_param(
            $log_stmt,
            "sssss",
            $productData['AT_Model'],
            $productData['AT_SN'],
            $status_log,
            $dateout,
            $user
        );

        $log_result = mysqli_stmt_execute($log_stmt);

        if (!$log_result) {
            throw new Exception("Error inserting log: " . mysqli_stmt_error($log_stmt));
        }


        // Commit transaction
        mysqli_commit($link);
        echo json_encode("ok");

    } catch (Exception $e) {
        // Rollback transaction
        mysqli_rollback($link);
        echo json_encode("error: " . $e->getMessage());
    }

    mysqli_close($link);
}


// ฟังก์ชันลบสินค้า
else if ($action == "deleteProduct") {
    $product_id = $_GET['product_id'];

    // ตรวจสอบว่ามีการส่งค่า product_id มาหรือไม่
    if (!isset($product_id) || empty($product_id)) {
        echo json_encode(array("status" => "error", "message" => "ไม่ได้ระบุรหัสสินค้า"));
        mysqli_close($link);
        return;
    }

    // ตรวจสอบว่ามีข้อมูลอยู่หรือไม่
    $checkSql = "SELECT * FROM tb_product WHERE id = '$product_id'";
    $checkResult = mysqli_query($link, $checkSql);

    if (mysqli_num_rows($checkResult) == 0) {
        echo json_encode(array("status" => "error", "message" => "ไม่พบข้อมูลสินค้าที่ต้องการลบ"));
        mysqli_close($link);
        return;
    }

    // เริ่มการทำธุรกรรม
    mysqli_begin_transaction($link);

    try {
        // ดึงข้อมูลสินค้าก่อนลบเพื่อบันทึก log
        $productData = mysqli_fetch_assoc($checkResult);

        // 1. ลบข้อมูลสินค้า
        $sql = "DELETE FROM tb_product WHERE id = '$product_id'";
        $result1 = mysqli_query($link, $sql);

        if (!$result1) {
            throw new Exception("Error deleting product: " . mysqli_error($link));
        }

        // 2. บันทึก log การลบ
        $current_datetime = date('Y-m-d H:i:s');
        $user = "System"; // หรือใช้จากผู้ใช้ที่ล็อกอิน

        $log_sql = "INSERT INTO `tb_log_product` (
            `date`, `User`, `part_num`, `part_name`, `supplier`, `part_qty`, 
            `location`, `store_name`, `note`, `status`
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $log_stmt = mysqli_prepare($link, $log_sql);
        $qty = 1;
        $location = "DELETED";
        $store_name = "Main Store";
        $status = "DELETE";
        $note = "ลบสินค้า: " . $productData['AT_Model'];

        mysqli_stmt_bind_param(
            $log_stmt,
            "sssssissss",
            $current_datetime,
            $user,
            $productData['AT_Model'],
            $productData['AT_Model'],
            $productData['Sup_name'],
            $qty,
            $location,
            $store_name,
            $note,
            $status
        );

        $result2 = mysqli_stmt_execute($log_stmt);

        if (!$result2) {
            throw new Exception("Error inserting delete log: " . mysqli_error($link));
        }

        // Commit transaction
        mysqli_commit($link);
        echo json_encode(array("status" => "success", "message" => "ลบข้อมูลสินค้าสำเร็จ"));

    } catch (Exception $e) {
        // Rollback transaction
        mysqli_rollback($link);
        echo json_encode(array("status" => "error", "message" => $e->getMessage()));
    }

    mysqli_close($link);
} else if ($action == "getFixList") {
    $sql = "SELECT * FROM tb_fixlist ORDER BY date DESC";
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

// ฟังก์ชันค้นหา Fix List
else if ($action == "searchFixList") {
    $search = isset($_GET['search']) ? $_GET['search'] : '';

    // สร้างเงื่อนไขการค้นหา
    $searchCondition = "";
    if (!empty($search)) {
        $searchCondition = " WHERE Status LIKE '%$search%' 
                           OR Location LIKE '%$search%' 
                           OR fixID LIKE '%$search%' 
                           OR Modal LIKE '%$search%' 
                           OR Cpu LIKE '%$search%' 
                           OR Mainboard LIKE '%$search%' 
                           OR SN LIKE '%$search%' 
                           OR Customer LIKE '%$search%' 
                           OR symptom LIKE '%$search%' 
                           OR did LIKE '%$search%' 
                           OR equipinsite LIKE '%$search%' 
                           OR sender LIKE '%$search%' 
                           OR receiver LIKE '%$search%'";
    }

    $sql = "SELECT * FROM tb_fixlist" . $searchCondition . " ORDER BY date DESC, id DESC";
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

// ฟังก์ชันเพิ่ม Fix Item ใหม่
else if ($action == "addFixItem") {
    // รับข้อมูลจาก GET parameters
    $status = isset($_GET['Status']) ? mysqli_real_escape_string($link, $_GET['Status']) : '';
    $location = isset($_GET['Location']) ? mysqli_real_escape_string($link, $_GET['Location']) : '';
    $date = isset($_GET['date']) ? $_GET['date'] : '';
    $fixID = isset($_GET['fixID']) ? mysqli_real_escape_string($link, $_GET['fixID']) : '';
    $modal = isset($_GET['Modal']) ? mysqli_real_escape_string($link, $_GET['Modal']) : '';
    $cpu = isset($_GET['Cpu']) ? mysqli_real_escape_string($link, $_GET['Cpu']) : '';
    $mainboard = isset($_GET['Mainboard']) ? mysqli_real_escape_string($link, $_GET['Mainboard']) : '';
    $sn = isset($_GET['SN']) ? mysqli_real_escape_string($link, $_GET['SN']) : '';
    $customer = isset($_GET['Customer']) ? mysqli_real_escape_string($link, $_GET['Customer']) : '';
    $symptom = isset($_GET['symptom']) ? mysqli_real_escape_string($link, $_GET['symptom']) : '';
    $did = isset($_GET['did']) ? mysqli_real_escape_string($link, $_GET['did']) : '';
    $equipinsite = isset($_GET['equipinsite']) ? mysqli_real_escape_string($link, $_GET['equipinsite']) : '';
    $sender = isset($_GET['sender']) ? mysqli_real_escape_string($link, $_GET['sender']) : '';
    $receiver = isset($_GET['receiver']) ? mysqli_real_escape_string($link, $_GET['receiver']) : '';

    // ตรวจสอบข้อมูลที่จำเป็น
    if (empty($status) || empty($location) || empty($date) || empty($fixID)) {
        echo json_encode("error: Missing required fields (Status, Location, Date, Fix ID)");
        mysqli_close($link);
        return;
    }

    // ตรวจสอบว่า fixID ซ้ำหรือไม่
    $checkSQL = "SELECT fixID FROM tb_fixlist WHERE fixID = '$fixID'";
    $checkResult = mysqli_query($link, $checkSQL);

    if (mysqli_num_rows($checkResult) > 0) {
        echo json_encode("error: Fix ID already exists");
        mysqli_close($link);
        return;
    }

    // เพิ่มข้อมูลใหม่
    $sql = "INSERT INTO `tb_fixlist` (
                `Status`, `Location`, `date`, `fixID`, `Modal`, `Cpu`, `Mainboard`, 
                `SN`, `Customer`, `symptom`, `did`, `equipinsite`, `sender`, `receiver`
            ) VALUES (
                '$status', '$location', '$date', '$fixID', '$modal', '$cpu', '$mainboard',
                '$sn', '$customer', '$symptom', '$did', '$equipinsite', '$sender', '$receiver'
            )";

    $result = mysqli_query($link, $sql);

    if ($result) {
        echo json_encode("ok");
    } else {
        echo json_encode("error: " . mysqli_error($link));
    }

    mysqli_close($link);
}

// ฟังก์ชันแก้ไข Fix Item
else if ($action == "updateFixItem") {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;

    if ($id <= 0) {
        echo json_encode(array("status" => "error", "message" => "Invalid ID"));
        mysqli_close($link);
        return;
    }

    // รับข้อมูลจาก GET parameters
    $status = isset($_GET['Status']) ? mysqli_real_escape_string($link, $_GET['Status']) : '';
    $location = isset($_GET['Location']) ? mysqli_real_escape_string($link, $_GET['Location']) : '';
    $date = isset($_GET['date']) ? $_GET['date'] : '';
    $fixID = isset($_GET['fixID']) ? mysqli_real_escape_string($link, $_GET['fixID']) : '';
    $modal = isset($_GET['Modal']) ? mysqli_real_escape_string($link, $_GET['Modal']) : '';
    $cpu = isset($_GET['Cpu']) ? mysqli_real_escape_string($link, $_GET['Cpu']) : '';
    $mainboard = isset($_GET['Mainboard']) ? mysqli_real_escape_string($link, $_GET['Mainboard']) : '';
    $sn = isset($_GET['SN']) ? mysqli_real_escape_string($link, $_GET['SN']) : '';
    $customer = isset($_GET['Customer']) ? mysqli_real_escape_string($link, $_GET['Customer']) : '';
    $symptom = isset($_GET['symptom']) ? mysqli_real_escape_string($link, $_GET['symptom']) : '';
    $did = isset($_GET['did']) ? mysqli_real_escape_string($link, $_GET['did']) : '';
    $equipinsite = isset($_GET['equipinsite']) ? mysqli_real_escape_string($link, $_GET['equipinsite']) : '';
    $sender = isset($_GET['sender']) ? mysqli_real_escape_string($link, $_GET['sender']) : '';
    $receiver = isset($_GET['receiver']) ? mysqli_real_escape_string($link, $_GET['receiver']) : '';

    // ตรวจสอบข้อมูลที่จำเป็น
    if (empty($status) || empty($location) || empty($date) || empty($fixID)) {
        echo json_encode(array("status" => "error", "message" => "Missing required fields"));
        mysqli_close($link);
        return;
    }

    // ตรวจสอบว่า fixID ซ้ำกับรายการอื่นหรือไม่
    $checkSQL = "SELECT id FROM tb_fixlist WHERE fixID = '$fixID' AND id != $id";
    $checkResult = mysqli_query($link, $checkSQL);

    if (mysqli_num_rows($checkResult) > 0) {
        echo json_encode(array("status" => "error", "message" => "Fix ID already exists"));
        mysqli_close($link);
        return;
    }

    // อัพเดทข้อมูล
    $sql = "UPDATE `tb_fixlist` SET 
                `Status` = '$status',
                `Location` = '$location',
                `date` = '$date',
                `fixID` = '$fixID',
                `Modal` = '$modal',
                `Cpu` = '$cpu',
                `Mainboard` = '$mainboard',
                `SN` = '$sn',
                `Customer` = '$customer',
                `symptom` = '$symptom',
                `did` = '$did',
                `equipinsite` = '$equipinsite',
                `sender` = '$sender',
                `receiver` = '$receiver'
            WHERE id = $id";

    $result = mysqli_query($link, $sql);

    if ($result) {
        if (mysqli_affected_rows($link) > 0) {
            echo json_encode(array("status" => "success", "message" => "Fix item updated successfully"));
        } else {
            echo json_encode(array("status" => "error", "message" => "No changes made or record not found"));
        }
    } else {
        echo json_encode(array("status" => "error", "message" => "Error updating fix item: " . mysqli_error($link)));
    }

    mysqli_close($link);
}

// ฟังก์ชันลบ Fix Item
else if ($action == "deleteFixItem") {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;

    if ($id <= 0) {
        echo json_encode(array("status" => "error", "message" => "Invalid ID"));
        mysqli_close($link);
        return;
    }

    // ตรวจสอบว่ามีข้อมูลอยู่หรือไม่
    $checkSQL = "SELECT id FROM tb_fixlist WHERE id = $id";
    $checkResult = mysqli_query($link, $checkSQL);

    if (mysqli_num_rows($checkResult) == 0) {
        echo json_encode(array("status" => "error", "message" => "Record not found"));
        mysqli_close($link);
        return;
    }

    // ลบข้อมูล
    $sql = "DELETE FROM tb_fixlist WHERE id = $id";
    $result = mysqli_query($link, $sql);

    if ($result) {
        if (mysqli_affected_rows($link) > 0) {
            echo json_encode(array("status" => "success", "message" => "Fix item deleted successfully"));
        } else {
            echo json_encode(array("status" => "error", "message" => "Record not found"));
        }
    } else {
        echo json_encode(array("status" => "error", "message" => "Error deleting fix item: " . mysqli_error($link)));
    }

    mysqli_close($link);
}

// ฟังก์ชันดึงข้อมูล Fix Item รายการเดียว
else if ($action == "getFixItem") {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;

    if ($id <= 0) {
        echo json_encode(array("status" => "error", "message" => "Invalid ID"));
        mysqli_close($link);
        return;
    }

    $sql = "SELECT * FROM tb_fixlist WHERE id = $id";
    $result = mysqli_query($link, $sql);

    if (!$result) {
        echo json_encode(array("status" => "error", "message" => "Query failed: " . mysqli_error($link)));
        mysqli_close($link);
        return;
    }

    if (mysqli_num_rows($result) > 0) {
        $row = mysqli_fetch_assoc($result);
        echo json_encode($row);
    } else {
        echo json_encode(array("status" => "error", "message" => "Record not found"));
    }

    mysqli_close($link);
}

// ฟังก์ชันดึงสถิติ Fix List (เพิ่มเติม - ไม่บังคับ)
else if ($action == "getFixListStats") {
    $sql = "SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN Status = 'pending' THEN 1 END) as pending,
                COUNT(CASE WHEN Status = 'in-progress' THEN 1 END) as in_progress,
                COUNT(CASE WHEN Status = 'completed' THEN 1 END) as completed,
                COUNT(CASE WHEN Status = 'cancelled' THEN 1 END) as cancelled
            FROM tb_fixlist";

    $result = mysqli_query($link, $sql);

    if (!$result) {
        echo json_encode(array("status" => "error", "message" => "Stats query failed: " . mysqli_error($link)));
        mysqli_close($link);
        return;
    }

    if (mysqli_num_rows($result) > 0) {
        $stats = mysqli_fetch_assoc($result);
        echo json_encode($stats);
    } else {
        echo json_encode(array("total" => 0, "pending" => 0, "in_progress" => 0, "completed" => 0, "cancelled" => 0));
    }

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
} else if ($action == "updateStockItem") {
    $part_num = isset($_GET['part_num']) ? $_GET['part_num'] : '';
    $part_name = isset($_GET['part_name']) ? $_GET['part_name'] : '';
    $supplier = isset($_GET['supplier']) ? $_GET['supplier'] : '';
    $qty = isset($_GET['qty']) ? $_GET['qty'] : '';
    $location = isset($_GET['location']) ? $_GET['location'] : '';
    $store_name = isset($_GET['store_name']) ? $_GET['store_name'] : '';
    $note = isset($_GET['note']) ? $_GET['note'] : '';
    $serial_num = isset($_GET['serial_num']) ? $_GET['serial_num'] : '';
    $sup_serial = isset($_GET['sup_serial']) ? $_GET['sup_serial'] : '';
    $sup_barcode = isset($_GET['sup_barcode']) ? $_GET['sup_barcode'] : '';
    $updated_by = isset($_GET['updated_by']) ? $_GET['updated_by'] : '';
    $updated_at = isset($_GET['updated_at']) ? $_GET['updated_at'] : '';

    // ตรวจสอบข้อมูลที่จำเป็น
    if (empty($serial_num) || empty($part_num) || empty($part_name)) {
        echo json_encode(array("error" => "ข้อมูลไม่ครบถ้วน"));
        mysqli_close($link);
        exit;
    }

    // ตรวจสอบว่า qty เป็นตัวเลข
    if (!is_numeric($qty) || $qty < 0) {
        echo json_encode(array("error" => "จำนวนสินค้าต้องเป็นตัวเลขและมากกว่าหรือเท่ากับ 0"));
        mysqli_close($link);
        exit;
    }

    // อัปเดตข้อมูลใน tb_stock โดยใช้ serial_num เป็นเงื่อนไข
    $sql = "UPDATE tb_stock SET 
            part_num = ?, 
            part_name = ?, 
            supplier = ?, 
            qty = ?, 
            location = ?, 
            store_name = ?, 
            note = ?, 
            sup_serial = ?, 
            sup_barcode = ?
            WHERE serial_num = ?";

    $stmt = mysqli_prepare($link, $sql);

    if (!$stmt) {
        echo json_encode(array("error" => "Error preparing statement: " . mysqli_error($link)));
        mysqli_close($link);
        exit;
    }

    mysqli_stmt_bind_param(
        $stmt,
        "ssssssssss",
        $part_num,
        $part_name,
        $supplier,
        $qty,
        $location,
        $store_name,
        $note,
        $sup_serial,
        $sup_barcode,
        $serial_num
    );

    $executeResult = mysqli_stmt_execute($stmt);

    if ($executeResult) {
        // ตรวจสอบว่ามีการอัปเดตหรือไม่
        $affectedRows = mysqli_stmt_affected_rows($stmt);

        if ($affectedRows > 0) {
            echo json_encode("ok");
        } else {
            echo json_encode(array("error" => "ไม่พบข้อมูลที่ต้องการอัปเดตหรือข้อมูลไม่เปลี่ยนแปลง"));
        }
    } else {
        echo json_encode(array("error" => "Error updating stock: " . mysqli_stmt_error($stmt)));
    }

    mysqli_stmt_close($stmt);
    mysqli_close($link);
    exit;
}

// ฟังก์ชันสำหรับบันทึก log การแก้ไข
else if ($action == "insertEditLog") {
    $date = isset($_GET['date']) ? $_GET['date'] : '';
    $user = isset($_GET['user']) ? $_GET['user'] : '';
    $serial_num = isset($_GET['serial_num']) ? $_GET['serial_num'] : '';
    $part_num = isset($_GET['part_num']) ? $_GET['part_num'] : '';
    $part_name = isset($_GET['part_name']) ? $_GET['part_name'] : '';
    $action_type = isset($_GET['action']) ? $_GET['action'] : '';
    $note = isset($_GET['note']) ? $_GET['note'] : '';

    $sql = "INSERT INTO tb_log_edit (
                date, 
                User, 
                serial_num, 
                part_num, 
                part_name, 
                action_type, 
                note
            ) VALUES (?, ?, ?, ?, ?, ?, ?)";

    $stmt = mysqli_prepare($link, $sql);

    if ($stmt) {
        mysqli_stmt_bind_param(
            $stmt,
            "sssssss",
            $date,
            $user,
            $serial_num,
            $part_num,
            $part_name,
            $action_type,
            $note
        );

        $executeResult = mysqli_stmt_execute($stmt);

        if ($executeResult) {
            echo json_encode("ok");
        } else {
            echo json_encode(array("error" => "ไม่สามารถบันทึก log ได้"));
        }

        mysqli_stmt_close($stmt);
    } else {
        echo json_encode(array("error" => "Error preparing log statement"));
    }

    mysqli_close($link);
    exit;
}

// ฟังก์ชันสำหรับดึงข้อมูลรายละเอียดสินค้า (เพิ่ม id ในการ select)
else if ($action == "getItemDetails") {
    $part_num = $_GET['part_num'];
    $location = $_GET['location'];

    $sql = "SELECT id, part_num, part_name, supplier, qty, location, 
            store_name, note, serial_num, sup_serial, sup_barcode, datetime
            FROM tb_stock 
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
    exit;
} else if ($action == "outProduct") {
    // รับข้อมูลจาก GET parameters
    $product_id = $_GET['product_id'] ?? '';
    $customer = isset($_GET['customer']) ? mysqli_real_escape_string($link, $_GET['customer']) : '';
    $quatation_no = isset($_GET['quatation_no']) ? mysqli_real_escape_string($link, $_GET['quatation_no']) : '';
    $po_number = isset($_GET['po_number']) ? mysqli_real_escape_string($link, $_GET['po_number']) : '';
    $dateout = $_GET['dateout'] ?? '';
    $note = isset($_GET['note']) ? mysqli_real_escape_string($link, $_GET['note']) : '';
    $product_status = 'ขายแล้ว';

    // ตรวจสอบข้อมูลที่จำเป็น
    if (empty($product_id) || empty($customer) || empty($dateout)) {
        echo json_encode(array("status" => "error", "message" => "ข้อมูลไม่ครบถ้วน"));
        mysqli_close($link);
        return;
    }

    // ตรวจสอบว่ามีสินค้าอยู่จริงและยังไม่ได้ขาย
    $checkSql = "SELECT AT_Model, AT_SN, Product_status FROM tb_product WHERE AT_SN = '$product_id'";
    $checkResult = mysqli_query($link, $checkSql);

    if (mysqli_num_rows($checkResult) == 0) {
        echo json_encode(array("status" => "error", "message" => "ไม่พบข้อมูลสินค้า"));
        mysqli_close($link);
        return;
    }

    $productData = mysqli_fetch_assoc($checkResult);

    // ตรวจสอบว่าสินค้ายังไม่ได้ขาย
    if ($productData['Product_status'] === 'ขายแล้ว') {
        echo json_encode(array("status" => "error", "message" => "สินค้านี้ขายไปแล้ว"));
        mysqli_close($link);
        return;
    }

    // เริ่มการทำธุรกรรม
    mysqli_begin_transaction($link);

    try {
        // 1. อัพเดทข้อมูลสินค้า
        $updateSql = "UPDATE tb_product SET 
                     Customer = '$customer',
                     Quatation_No = '$quatation_no',
                     PO_number = '$po_number',
                     Dateout = '$dateout',
                     Product_status = '$product_status',
                     Note = CONCAT(IFNULL(Note, ''), IF(IFNULL(Note, '') = '', '', '\n'), 'OUT: $note')
                     WHERE AT_SN = '$product_id'";

        $updateResult = mysqli_query($link, $updateSql);

        if (!$updateResult) {
            throw new Exception("Error updating product: " . mysqli_error($link));
        }

        // 2. บันทึกลงใน tb_log_pc (ใช้ column ที่มีอยู่แล้ว)
        $log_sql = "INSERT INTO `tb_log_pc` (`ATC_modal`, `SN`, `status`, `date`, `user`) 
                    VALUES (?, ?, ?, ?, ?)";

        $log_stmt = mysqli_prepare($link, $log_sql);
        $status_log = "OUT";
        $user = "System"; // หรือใช้จากผู้ใช้ที่ล็อกอิน

        mysqli_stmt_bind_param(
            $log_stmt,
            "sssss",
            $productData['AT_Model'],
            $productData['AT_SN'],
            $status_log,
            $dateout,
            $user
        );

        $log_result = mysqli_stmt_execute($log_stmt);

        if (!$log_result) {
            throw new Exception("Error inserting log: " . mysqli_stmt_error($log_stmt));
        }

        // Commit transaction
        mysqli_commit($link);
        echo json_encode("ok");

    } catch (Exception $e) {
        // Rollback transaction
        mysqli_rollback($link);
        echo json_encode(array("status" => "error", "message" => $e->getMessage()));
    }

    mysqli_close($link);
}
// ฟังก์ชันดึงข้อมูลสินค้าตาม Serial Number
else if ($action == "getProductBySerial") {
    $serial = isset($_GET['serial']) ? mysqli_real_escape_string($link, $_GET['serial']) : '';

    if (empty($serial)) {
        echo json_encode(array("status" => "error", "message" => "ไม่ได้ระบุ Serial Number"));
        mysqli_close($link);
        return;
    }

    // ค้นหาสินค้าด้วย AT_SN
    $sql = "SELECT * FROM tb_product WHERE AT_SN = '$serial' LIMIT 1";
    $result = mysqli_query($link, $sql);

    if (!$result) {
        echo json_encode(array("status" => "error", "message" => "Query failed: " . mysqli_error($link)));
        mysqli_close($link);
        return;
    }

    if (mysqli_num_rows($result) > 0) {
        $productData = mysqli_fetch_assoc($result);
        echo json_encode($productData);
    } else {
        echo json_encode(array("status" => "error", "message" => "ไม่พบข้อมูลสินค้าที่มี Serial Number นี้"));
    }

    mysqli_close($link);
} else if ($action == "getPcLog") {
    $sql = "SELECT * FROM tb_log_pc ORDER BY date DESC, logID DESC LIMIT 1000";
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

// ฟังก์ชันใหม่: ค้นหา PC Log
else if ($action == "searchPcLog") {
    $search = isset($_GET['search']) ? $_GET['search'] : '';
    $status = isset($_GET['status']) ? $_GET['status'] : '';
    $start_date = isset($_GET['start_date']) ? $_GET['start_date'] : '';
    $end_date = isset($_GET['end_date']) ? $_GET['end_date'] : '';

    // สร้างคำสั่ง SQL พื้นฐาน
    $sql = "SELECT * FROM tb_log_pc WHERE 1=1";

    // เพิ่มเงื่อนไขการค้นหา
    if (!empty($search)) {
        $search = mysqli_real_escape_string($link, $search);
        $sql .= " AND (ATC_modal LIKE '%$search%' 
                 OR SN LIKE '%$search%' 
                 OR user LIKE '%$search%')";
    }

    // เพิ่มเงื่อนไขการกรองตามสถานะ
    if (!empty($status) && $status != 'all') {
        $status = mysqli_real_escape_string($link, $status);
        $sql .= " AND status = '$status'";
    }

    // เพิ่มเงื่อนไขการกรองตามช่วงวันที่
    if (!empty($start_date)) {
        $start_date = mysqli_real_escape_string($link, $start_date);
        $sql .= " AND date >= '$start_date'";
    }

    if (!empty($end_date)) {
        $end_date = mysqli_real_escape_string($link, $end_date);
        $sql .= " AND date <= '$end_date'";
    }

    // เรียงลำดับตามวันที่ล่าสุด
    $sql .= " ORDER BY date DESC, logID DESC LIMIT 1000";

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

// ฟังก์ชันใหม่: เพิ่ม PC Log ใหม่
else if ($action == "addPcLog") {
    $atc_modal = isset($_GET['atc_modal']) ? mysqli_real_escape_string($link, $_GET['atc_modal']) : '';
    $sn = isset($_GET['sn']) ? mysqli_real_escape_string($link, $_GET['sn']) : '';
    $status = isset($_GET['status']) ? mysqli_real_escape_string($link, $_GET['status']) : '';
    $date = isset($_GET['date']) ? $_GET['date'] : '';
    $user = isset($_GET['user']) ? mysqli_real_escape_string($link, $_GET['user']) : 'System';

    // ตรวจสอบข้อมูลที่จำเป็น
    if (empty($atc_modal) || empty($sn) || empty($status) || empty($date)) {
        echo json_encode(array("status" => "error", "message" => "ข้อมูลไม่ครบถ้วน"));
        mysqli_close($link);
        return;
    }

    // Validate status
    $valid_statuses = array('IN', 'OUT', 'BORROW', 'RETURN');
    if (!in_array($status, $valid_statuses)) {
        echo json_encode(array("status" => "error", "message" => "สถานะไม่ถูกต้อง"));
        mysqli_close($link);
        return;
    }

    // บันทึกลงใน tb_log_pc
    $log_sql = "INSERT INTO `tb_log_pc` (`ATC_modal`, `SN`, `status`, `date`, `user`) 
                VALUES (?, ?, ?, ?, ?)";

    $log_stmt = mysqli_prepare($link, $log_sql);

    if (!$log_stmt) {
        echo json_encode(array("status" => "error", "message" => "Prepare failed: " . mysqli_error($link)));
        mysqli_close($link);
        return;
    }

    mysqli_stmt_bind_param(
        $log_stmt,
        "sssss",
        $atc_modal,
        $sn,
        $status,
        $date,
        $user
    );

    $log_result = mysqli_stmt_execute($log_stmt);

    if ($log_result) {
        echo json_encode("ok");
    } else {
        echo json_encode(array("status" => "error", "message" => "Error inserting log: " . mysqli_stmt_error($log_stmt)));
    }

    mysqli_stmt_close($log_stmt);
    mysqli_close($link);
} else if ($action == "getPartImages") {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);

    $partNum = $_GET['partNum'] ?? '';
    if (!$partNum) {
        echo json_encode(["status" => "error", "message" => "No partNum provided"]);
        mysqli_close($link);
        return;
    }

    $partNum = mysqli_real_escape_string($link, $partNum);
    $sql = "SELECT picture FROM tb_part_no WHERE part_num = '$partNum'";
    $result = mysqli_query($link, $sql);

    if (!$result) {
        echo json_encode(["status" => "error", "message" => "Database query failed"]);
        mysqli_close($link);
        return;
    }

    $images = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $picture = $row['picture'];
        if ($picture && !empty($picture) && $picture !== 'NULL') {
            $normalizedPath = str_replace("\\", "/", $picture);
            $normalizedPath = ltrim($normalizedPath, '/');  // ✅ ป้องกัน /
            $fullUrl = "http://" . $_SERVER['HTTP_HOST'] . "/atc-crm-api/uploads/" . basename($normalizedPath);
            $images[] = $fullUrl;
        }
    }

    echo json_encode([
        "status" => "success",
        "images" => $images
    ], JSON_UNESCAPED_SLASHES);
    mysqli_close($link);
}
