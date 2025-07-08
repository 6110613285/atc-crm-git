<?php
header("Content-Type: application/json");
require 'Store.php'; // ✅ ใช้ไฟล์เชื่อมต่อฐานข้อมูลของเอิง

$part_num = $_GET['part_num'] ?? '';

if ($part_num) {
    $stmt = $conn->prepare("SELECT image_name FROM picture WHERE part_num = ? LIMIT 2");
    $stmt->bind_param("s", $part_num);
    $stmt->execute();
    $result = $stmt->get_result();

    $images = [];
    while ($row = $result->fetch_assoc()) {
        $images[] = $row['/atc-crm-api/uploads/'];
    }

    echo json_encode($images);
} else {
    echo json_encode([]);
}
?>

