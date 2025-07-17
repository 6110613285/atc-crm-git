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

if ($action == "get") {
    try {
        $sort = $_GET['sort'];
        $result = mysqli_query($link, "SELECT * FROM tb_quotation ORDER BY qo_id $sort");

        while ($row = mysqli_fetch_assoc($result)) {
            $output[] = $row;
        }

        echo json_encode($output);
        mysqli_close($link);
    } catch (Exception $ex) {
        echo json_encode($ex);
    }
} else if ($action == "getitemwhereqoid") {
    try {
        $id = $_GET['id'];
        $result = mysqli_query($link, "SELECT * FROM tb_qo_item WHERE qo_id = '$id' ");

        while ($row = mysqli_fetch_assoc($result)) {
            $output[] = $row;
        }

        echo json_encode($output);
        mysqli_close($link);
    } catch (Exception $ex) {
        echo json_encode($ex);
    }
} else if ($action == "insert") {
    $quotationId = $_GET['quotationId'];
    $reviseId = $_GET['reviseid'];
    $customerId = $_GET['customerId'];
    $projectId = $_GET['projectId'];
    $companyId = $_GET['companyId'];

    $currency = $_GET['currency'];
    $issue_date = $_GET['issue_date'];

    $quotationvalidunit = $_GET['quotationvalidunit'];
    $quotationvalidunitunit = $_GET['quotationvalidunitunit'];
    $creditterm = $_GET['creditterm'];
    $leadtime = $_GET['leadtime'];
    $timeunit = $_GET['timeunit'];
    $saler = $_GET['saler'];

    $item = $_GET['item'];

    $totalprice = $_GET['totalprice'];
    $percentdiscount = $_GET['percentdiscount'];
    $discount = $_GET['discount'];

    $priceafterdiscount = $_GET['priceafterdiscount'];
    $vat = $_GET['vat'];
    $withholding = $_GET['withholding'];
    $overall = $_GET['overall'];

    $statusapprove = $_GET['statusapprove'];
    $comment = "-";


    $sql = "INSERT INTO `tb_quotation`(`qo_id`, qo_revise_id, `cus_id`, `pj_id` , `co_id`, `qo_currency`, `qo_issue_date`, `qo_validunit`, `qo_validunit_unit`, `qo_creditterm`, `qo_leadtime`, `qo_timeunit`, `qo_saler`, `qo_item`, `qo_totalprice`, `qo_percentdiscount`, `qo_discount`, `qo_priceafterdiscount`, `qo_vat`, `qo_withholding`, `qo_overall`, `qo_status_approve`,`qo_comment`) 
            VALUES ('$quotationId','$reviseId','$customerId','$projectId','$companyId','$currency','$issue_date','$quotationvalidunit','$quotationvalidunitunit','$creditterm','$leadtime','$timeunit','$saler','$item','$totalprice','$percentdiscount','$discount','$priceafterdiscount','$vat','$withholding','$overall','$statusapprove','$comment')";

    $result = mysqli_query($link, $sql);
    //echo json_encode($result);

    if ($result) {
        echo json_encode('ok');
    } else {
        echo json_encode(mysqli_error($link));
    }

    mysqli_close($link);
} else if ($action == "insertitem") {
    $quotationId = $_GET['quotationId'];
    $reviseId = $_GET['reviseid'];
    $productId = $_GET['productId'];
    $item_qty = $_GET['item_qty'];


    $sql = "INSERT INTO `tb_qo_item`(`qo_id`, `qo_revise_id`, `pd_id`, `item_qty`) 
            VALUES ('$quotationId', '$reviseId', '$productId','$item_qty')";

    $result = mysqli_query($link, $sql);
    //echo json_encode($result);

    if ($result) {
        echo json_encode('ok');
    }

    mysqli_close($link);
} else if ($action == "getwhereqoid") {

    $id = $_GET['id'];

    $result = mysqli_query($link, "SELECT * FROM tb_quotation WHERE qo_id = '$id' ");

    while ($row = mysqli_fetch_assoc($result)) {
        $output[] = $row;
    }

    echo json_encode($output);

    mysqli_close($link);
} else if ($action == "getwherepjid") {

    $id = $_GET['id'];
    $sort = $_GET['sort'];

    $result = mysqli_query($link, "SELECT * FROM tb_quotation WHERE pj_id = '$id' ORDER BY qo_id $sort");

    while ($row = mysqli_fetch_assoc($result)) {
        $output[] = $row;
    }

    echo json_encode($output);
    mysqli_close($link);
} else if ($action == "update") {
    $id = $_GET['qoid'];
    $statusapprove = $_GET['statusapprove'];
    $comment = $_GET['comment'];
    $user = $_GET['user'];

    $sql = " UPDATE `tb_quotation` SET qo_status_approve = '$statusapprove' , qo_comment = '$comment', qo_user_approve = '$user' WHERE qo_id = '$id' ";

    $result = mysqli_query($link, $sql);

    if ($result) {
        echo json_encode("ok");
    }
    mysqli_close($link);
} else if ($action == "copyqo") {
    $id = $_GET['quotationid'];
    $revise_id = $_GET['reviseid'];

    $sql = " INSERT INTO tb_quotation_history SELECT * FROM tb_quotation WHERE qo_id = '$id' ";

    $result = mysqli_query($link, $sql);

    if ($result) {
        $sql = " DELETE FROM `tb_quotation` WHERE qo_id = '$id' ";
        $result = mysqli_query($link, $sql);
        if ($result) {

            echo json_encode('ok');
        }
    } else {
        echo json_encode(mysqli_error($link));
    }

    mysqli_close($link);
} else if ($action == "copyitem") {
    $id = $_GET['quotationid'];

    $sql = " INSERT INTO tb_qo_item_history SELECT * FROM tb_qo_item WHERE qo_id = '$id' ";

    $result = mysqli_query($link, $sql);

    if ($result) {
        $sql = " DELETE FROM `tb_qo_item` WHERE qo_id = '$id' ";
        $result = mysqli_query($link, $sql);
        if ($result) {
            echo json_encode('ok');
        }
    } else {
        echo json_encode(mysqli_error($link));
    }

    mysqli_close($link);
} else if ($action == "delete") {
    $id = $_GET['id'];

    $sql = " DELETE FROM `tb_quotation` WHERE qo_id = '$id' ";

    $result = mysqli_query($link, $sql);

    if ($result) {
        $sql = " DELETE FROM `tb_qo_item` WHERE qo_id = '$id' ";

        $result = mysqli_query($link, $sql);

        if ($result) {
            echo json_encode("ok");
        } else {
            echo json_encode("fail");
        }
    } else {
        echo json_encode("fail");
    }
    mysqli_close($link);
} else if ($action == "getcount") {

    //$id = $_GET['id'];
    $sort = $_GET['sort'];
    $sql = "SELECT qo_id, COUNT(pd_id) AS qtylist, Sum(item_qty) AS qty FROM tb_qo_item  GROUP BY qo_id";
    $result = mysqli_query($link, $sql);

    while ($row = mysqli_fetch_assoc($result)) {
        $output[] = $row;
    }

    echo json_encode($output);
    mysqli_close($link);
} else if ($action == "insertipc") {
    $quotationId = $_GET['quotationId'];
    $reviseId = $_GET['reviseid'];
    $customerId = $_GET['customerId'];
    $projectId = $_GET['projectId'];
    $companyId = $_GET['companyId'];

    $currency = $_GET['currency'];
    $issue_date = $_GET['issue_date'];

    $quotationvalidunit = $_GET['quotationvalidunit'];
    $quotationvalidunitunit = $_GET['quotationvalidunitunit'];
    $creditterm = $_GET['creditterm'];
    $leadtime = $_GET['leadtime'];
    $timeunit = $_GET['timeunit'];
    $saler = $_GET['saler'];

    $item = $_GET['item'];

    $totalprice = $_GET['totalprice'];
    $percentdiscount = $_GET['percentdiscount'];
    $discount = $_GET['discount'];

    $priceafterdiscount = $_GET['priceafterdiscount'];
    $vat = $_GET['vat'];
    $withholding = $_GET['withholding'];
    $overall = $_GET['overall'];

    $statusapprove = $_GET['statusapprove'];



    $sql = "INSERT INTO `tb_quotation_ipc`(`qo_id`, qo_revise_id, `cus_id`, `pj_id` , `co_id`, `qo_currency`, `qo_issue_date`, `qo_validunit`, `qo_validunit_unit`, `qo_creditterm`, `qo_leadtime`, `qo_timeunit`, `qo_saler`, `qo_item`, `qo_totalprice`, `qo_percentdiscount`, `qo_discount`, `qo_priceafterdiscount`, `qo_vat`, `qo_withholding`, `qo_overall`, `qo_status_approve`) 
            VALUES ('$quotationId','$reviseId','$customerId','$projectId','$companyId','$currency','$issue_date','$quotationvalidunit','$quotationvalidunitunit','$creditterm','$leadtime','$timeunit','$saler','$item','$totalprice','$percentdiscount','$discount','$priceafterdiscount','$vat','$withholding','$overall','$statusapprove')";

    $result = mysqli_query($link, $sql);
    //echo json_encode($result);

    if ($result) {
        echo json_encode('ok');
    } else {
        echo json_encode(mysqli_error($link));
    }

    mysqli_close($link);
} else if ($action == "insertitemipc") {
    $quotationId = $_GET['quotationId'];
    $reviseId = $_GET['reviseid'];
    $productId = $_GET['productId'];
    $item_qty = $_GET['item_qty'];
    $price = $_GET['item_price'];
    $comport = $_GET['comport'];
    $modelType = $_GET['modelType'];
    $sizeScreen = $_GET['sizeScreen'];
    $cpu = $_GET['cpu'];
    $mainboard = $_GET['mainboard'];
    $adapter = $_GET['adapter'];
    $os = $_GET['os'];
    $warranty = $_GET['warranty'];
    $ram = $_GET['ram'];
    $storage = $_GET['storage'];
    $rj45Qty = $_GET['rj45Qty'];
    $usbQty = $_GET['usbQty'];
    $hdmiVgaQty = $_GET['hdmiVgaQty'];
    $wifi = $_GET['wifi'];
    $detail = $_GET['detail'];

    $sql = "INSERT INTO `tb_qo_item_ipc`(`qo_id`, `qo_revise_id`, `model_id`, `item_qty`,`item_price`,`adapter`,`model_type`,`size_screen`,`cpu`,`mainboard`,`storage`,`ram`,`rj45_qty`,`comport`,`usb_qty`,`hdmi_vga_qty`,`wifi`,`detail`,`warranty`) 
            VALUES ('$quotationId', '$reviseId', '$productId','$item_qty','$price','$adapter','$modelType','$sizeScreen','$cpu','$mainboard','$storage','$ram','$rj45Qty','$comport','$usbQty','$hdmiVgaQty','$wifi','$detail','$warranty')";

    $result = mysqli_query($link, $sql);

    if ($result) {
        echo json_encode("ok");
    } else {
        // เพิ่มการแสดง Error ที่เกิดขึ้น
        echo json_encode(mysqli_error($link)); // ข้อความ Error จาก MySQL

    }

    mysqli_close($link);
} else if ($action == "getwhereqoidipc") {

    $id = $_GET['id'];

    $result = mysqli_query($link, "SELECT * FROM tb_quotation_ipc WHERE qo_id = '$id' ");

    while ($row = mysqli_fetch_assoc($result)) {
        $output[] = $row;
    }

    echo json_encode($output);

    mysqli_close($link);
} else if ($action == "getipc") {
    try {
        $sort = $_GET['sort'] ?? 'DESC';
        $result = mysqli_query($link, "SELECT * FROM tb_quotation_ipc ORDER BY qo_id $sort");
        
        $output = [];
        if ($result) {
            while ($row = mysqli_fetch_assoc($result)) {
                $output[] = $row;
            }
        }
        
        echo json_encode($output); // ส่งคืน [] ถ้าไม่มีข้อมูล
        mysqli_close($link);
    } catch (Exception $ex) {
        echo json_encode([]); // ส่งคืน array เปล่าเมื่อเกิดข้อผิดพลาด
    }
}else if ($action == "getwhereqoidipc") {

    $id = $_GET['id'];

    $result = mysqli_query($link, "SELECT * FROM tb_quotation_ipc WHERE qo_id = '$id' ");

    while ($row = mysqli_fetch_assoc($result)) {
        $output[] = $row;
    }

    echo json_encode($output);

    mysqli_close($link);
} else if ($action == "getitemwhereqoidipc") {
    try {
        $id = $_GET['id'];
        $result = mysqli_query($link, "SELECT * FROM tb_qo_item_ipc WHERE qo_id = '$id' ");

        while ($row = mysqli_fetch_assoc($result)) {
            $output[] = $row;
        }

        echo json_encode($output);
        mysqli_close($link);
    } catch (Exception $ex) {
        echo json_encode($ex);
    }
} else if ($action == "updateipc") {
    $id = $_GET['qoid'];
    $statusapprove = $_GET['statusapprove'];
    $comment = $_GET['comment'];
    $user = $_GET['user'];

    $sql = " UPDATE `tb_quotation_ipc` SET qo_status_approve = '$statusapprove' , qo_comment = '$comment', qo_user_approve = '$user' WHERE qo_id = '$id' ";

    $result = mysqli_query($link, $sql);

    if ($result) {
        echo json_encode("ok");
    }
    mysqli_close($link);
} else {
    echo json_encode("fail");
    mysqli_close($link);
}
