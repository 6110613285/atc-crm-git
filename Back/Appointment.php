<?php
/* include 'Connected.php'; */
header("Access-Control-Allow-Origin: *");
error_reporting(0);
error_reporting(E_ERROR | E_PARSE);
header("content-type:text/javascript;charset=utf-8");
$link = mysqli_connect($_GET['server'], $_GET['username'], $_GET['password'], $_GET['db']);

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

$action = $_GET['action'];

if ($action == "get" || $action == "getnewsale") {

    $sort = $_GET['sort'];
    $start = $_GET['start'];
    $end = $_GET['end'];
    $user_id = $_GET['userId'];
    if ($action == "getnewsale") {
        $result = mysqli_query($link, "SELECT * FROM tb_appointment WHERE app_user = '$user_id' AND app_dt BETWEEN '$start' AND '$end' ORDER BY app_id $sort");
    } else {
        $result = mysqli_query($link, "SELECT * FROM tb_appointment WHERE app_dt BETWEEN '$start' AND '$end' ORDER BY app_id $sort");
    }

    while ($row = mysqli_fetch_assoc($result)) {
        $output[] = $row;
    }

    echo json_encode($output);
    mysqli_close($link);
} else if ($action == "insert") {
    $appointmentId = $_GET['appointmentId'];
    $date = $_GET['date'];
    $time = $_GET['time'];
    $detail = $_GET['detail'];
    $status = $_GET['status'];

    $callId = $_GET['callId'];
    $customerId = $_GET['customerId'];
    $projectId = $_GET['projectId'];
    $user = $_GET['user'];

    $sql = "INSERT INTO `tb_appointment`(`app_id`, `app_date`, `app_time`, `app_detail`, `app_status`, `cal_id`, `cus_id`, `pj_id`, `app_user`) 
            VALUES ('$appointmentId','$date','$time','$detail','$status','$callId','$customerId','$projectId','$user')";

    $result = mysqli_query($link, $sql);

    if ($result) {
        echo json_encode("ok");
    }
    mysqli_close($link);
} else if ($action == "updateaftervisitdetail") {
    $id = $_GET['id'];
    $aftervisitdetail = $_GET['aftervisitdetail'];
    $dtvisit = $_GET['dtvisit'];

    $sql = "INSERT INTO tb_appointment (app_dt, app_dt_visit, app_time, app_id, app_date, app_detail, app_status, app_aftervisit_detail, cus_id, pj_id, app_user) 
            SELECT app_dt, '$dtvisit', app_time, NULL, app_date, app_detail, 'visited', '$aftervisitdetail', cus_id, pj_id, app_user 
            FROM tb_appointment 
            WHERE app_id = '$id'";

    $result = mysqli_query($link, $sql);

    if ($result) {
        echo json_encode("ok");
    }
    mysqli_close($link);
} else if ($action == "getwhereappid") {
    $sort = $_GET['sort'];
    $start = $_GET['start'];
    $end = $_GET['end'];

    $id = $_GET['id'];

    $result = mysqli_query($link, "SELECT * FROM tb_appointment WHERE app_id = '$id' ");

    while ($row = mysqli_fetch_assoc($result)) {
        $output[] = $row;
    }

    echo json_encode($output);
    mysqli_close($link);
} else if ($action == "getwherecalidcusid") {
    $sort = $_GET['sort'];
    $start = $_GET['start'];
    $end = $_GET['end'];

    $callRecordId = $_GET['callRecordId'];
    $customerId = $_GET['customerId'];
    $sort = $_GET['sort'];

    $result = mysqli_query($link, "SELECT * FROM tb_appointment WHERE cal_id = '$callRecordId' AND cus_id = '$customerId' ORDER BY app_id $sort ");

    while ($row = mysqli_fetch_assoc($result)) {
        $output[] = $row;
    }

    echo json_encode($output);
    mysqli_close($link);
} else if ($action == "getwherecusid") {
    $sort = $_GET['sort'];
    $start = $_GET['start'];
    $end = $_GET['end'];
    $customerId = $_GET['customerId'];

    $result = mysqli_query($link, "SELECT * FROM tb_appointment WHERE cus_id = '$customerId' AND (app_dt BETWEEN '$start' AND '$end' OR app_dt_visit BETWEEN '$start' AND '$end') ORDER BY app_id $sort ");

    while ($row = mysqli_fetch_assoc($result)) {
        $output[] = $row;
    }

    echo json_encode($output);
    mysqli_close($link);
} else if ($action == "getShowHomepage") {

    $user_id = $_GET['user_id'];
    $result = mysqli_query($link, "SELECT * 
    FROM tb_appointment 
    WHERE app_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 15 DAY) AND app_user = '$user_id' ORDER BY app_date ;");

    while ($row = mysqli_fetch_assoc($result)) {
        $output[] = $row;
    }

    echo json_encode($output);
    mysqli_close($link);
} else {
    echo json_encode("fail");
    mysqli_close($link);
}
