<?php
header("Access-Control-Allow-Origin: *");

// การเชื่อมต่อฐานข้อมูล
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "db_atc_crm";
$db_charset = 'utf8mb4';

/* // การเชื่อมต่อฐานข้อมูลบนserver
$servername = "aliantechnology.com";
$username = "cp615710_atc";
$password = "Aliantechnology";
$dbname = "cp615710_atc_db";
$db_charset = 'utf8mb4'; */

date_default_timezone_set("Asia/Bangkok");

function genRandomStr($length)
{
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $charactersLength = strlen($characters);
    $randomStr = '';
    for ($i = 0; $i < $length; $i++) {
        $randomStr .= $characters[rand(0, $charactersLength - 1)];
    }
    return $randomStr;
}

try {

    $now = date("Y-m-d H:i:S");
    $genToken = md5(genRandomStr(10) . $now);

    $conn = new PDO("mysql:host=$servername;dbname=$dbname;charset=$db_charset", $username, $password);
    // กำหนดให้ PDO แสดงข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}

// รับค่า username และ password จาก body ของ HTTP request
$data = json_decode(file_get_contents('php://input'), true);
$login_username = $data['username'];
$login_password = $data['password'];

// ตรวจสอบการเข้าสู่ระบบ
$sql = "SELECT * FROM tb_user WHERE username = ? /* :username AND password = :password */";
$stmt = $conn->prepare($sql);
/* $stmt->bindParam(':username', $username);
        $stmt->bindParam(':password', $password); */
if ($stmt->execute([$login_username])) {
    $num = $stmt->rowCount();
    if ($num > 0) {
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);

            //$encpassword = md5($login_password);
            $encpassword = $login_password;
            ////echo json_encode($password);
            if ($encpassword == $password) {
                $userid = $id;

                $query = 'UPDATE tb_user SET token = ? WHERE id = ?';
                $stmt = $conn->prepare($query);
                if ($stmt->execute([
                    $genToken, $userid
                ])) {

                    $result = new stdClass();
                    $result->userid = $id;
                    $result->user_id = $user_id;
                    $result->token = $genToken;
                    $result->fullname = $fname . " " . $lname;
                    $result->fullnameth = $fnameth . " " . $lnameth;
                    $result->department = $department;
                    $result->position = $position;
                    $result->tel = $tel;
                    $result->email = $email;
                    $result->level = $level;
                    $result->status = $status;
                    $result->Roleuser = $Roleuser;
                    if ($result->status == "0") {
                        echo json_encode("0");
                    } else {

                        echo json_encode(array("login" => true, "status" => "$result->status", "message" => "Login successful", "data" => $result));
                    }
                } else {
                    echo json_encode(array("login" => false, "status" => "bad", "message" => "Invalid username or password", "log" => 3));
                }
            } else {
                echo json_encode(array("login" => false, "status" => "bad", "message" => "Invalid username or password", "log" => 2));
            }
        }
    } else {
        echo json_encode(array("login" => false, "status" => "bad", "message" => "Invalid username or password", "log" => 1));
    }
} else {
    echo json_encode(array("login" => false, "status" => "bad", "message" => "Invalid username or password", "log" => 0));
}

/*     //$result = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($result) {
    // ถ้าพบข้อมูลผู้ใช้งาน ส่งกลับ HTTP response ให้ Postman ว่าเข้าสู่ระบบสำเร็จ
    echo json_encode(array("success" => true, "message" => "Login successful"));
    } else {
    // ถ้าไม่พบข้อมูลผู้ใช้งาน ส่งกลับ HTTP response ให้ Postman ว่าเข้าสู่ระบบไม่สำเร็จ
    echo json_encode(array("success" => false, "message" => "Invalid username or password"));
    } */

// ปิดการเชื่อมต่อฐานข้อมูล
$conn = null;
