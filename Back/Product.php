<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database connection parameters
$servername = $_GET['server'] ?? "localhost";
$username = $_GET['username'] ?? "root";
$password = $_GET['password'] ?? "";
$dbname = $_GET['db'] ?? "db_atc_crm";
$db_charset = 'utf8mb4';

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
    $conn = new PDO("mysql:host=$servername;dbname=$dbname;charset=$db_charset", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(array("error" => "Connection failed: " . $e->getMessage()));
    exit();
}

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'get':
        getAllProducts();
        break;
    case 'getbyid':
        getProductById();
        break;
    case 'insert':
        insertProduct();
        break;
    case 'update':
        updateProduct();
        break;
    case 'delete':
        deleteProduct();
        break;
    case 'search':
        searchProducts();
        break;
    default:
        echo json_encode(array("error" => "Invalid action"));
        break;
}

function getAllProducts()
{
    global $conn;
    
    $sort = $_GET['sort'] ?? 'ASC';
    $limit = $_GET['limit'] ?? null;
    $offset = $_GET['offset'] ?? 0;
    
    try {
        $sql = "SELECT * FROM tb_product ORDER BY id $sort";
        
        if ($limit !== null) {
            $sql .= " LIMIT $limit OFFSET $offset";
        }
        
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Add formatted data for frontend
        foreach ($products as &$product) {
            $product['pd_id'] = $product['id'];
            $product['pd_name'] = $product['model'];
            $product['pd_description'] = $product['detail'];
            $product['pd_sellprice'] = $product['1price'];
        }
        
        echo json_encode($products);
    } catch (PDOException $e) {
        echo json_encode(array("error" => $e->getMessage()));
    }
}

function getProductById()
{
    global $conn;
    
    $id = $_GET['id'] ?? '';
    
    if (empty($id)) {
        echo json_encode(array("error" => "ID is required"));
        return;
    }
    
    try {
        $sql = "SELECT * FROM tb_product WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$id]);
        
        $product = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($product) {
            // Add formatted data for frontend
            $product['pd_id'] = $product['id'];
            $product['pd_name'] = $product['model'];
            $product['pd_description'] = $product['detail'];
            $product['pd_sellprice'] = $product['1price'];
            
            echo json_encode($product);
        } else {
            echo json_encode(null);
        }
    } catch (PDOException $e) {
        echo json_encode(array("error" => $e->getMessage()));
    }
}

function insertProduct()
{
    global $conn;
    
    $model = $_POST['model'] ?? '';
    $screen_size = $_POST['screen_size'] ?? '';
    $cpu = $_POST['cpu'] ?? '';
    $ssd = $_POST['ssd'] ?? '';
    $ram = $_POST['ram'] ?? '';
    $os = $_POST['os'] ?? '';
    $price1 = $_POST['1price'] ?? 0;
    $price10 = $_POST['10price'] ?? 0;
    $price100 = $_POST['100price'] ?? 0;
    $detail = $_POST['detail'] ?? '';
    
    if (empty($model)) {
        echo json_encode(array("error" => "Model is required"));
        return;
    }
    
    try {
        $sql = "INSERT INTO tb_product (model, screen_size, CPU, ssd, ram, os, 1price, 10price, 100price, detail) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $conn->prepare($sql);
        
        if ($stmt->execute([$model, $screen_size, $cpu, $ssd, $ram, $os, $price1, $price10, $price100, $detail])) {
            echo json_encode("ok");
        } else {
            echo json_encode(array("error" => "Insert failed"));
        }
    } catch (PDOException $e) {
        echo json_encode(array("error" => $e->getMessage()));
    }
}

function updateProduct()
{
    global $conn;
    
    $id = $_POST['id'] ?? '';
    $model = $_POST['model'] ?? '';
    $screen_size = $_POST['screen_size'] ?? '';
    $cpu = $_POST['cpu'] ?? '';
    $ssd = $_POST['ssd'] ?? '';
    $ram = $_POST['ram'] ?? '';
    $os = $_POST['os'] ?? '';
    $price1 = $_POST['1price'] ?? 0;
    $price10 = $_POST['10price'] ?? 0;
    $price100 = $_POST['100price'] ?? 0;
    $detail = $_POST['detail'] ?? '';
    
    if (empty($id) || empty($model)) {
        echo json_encode(array("error" => "ID and Model are required"));
        return;
    }
    
    try {
        $sql = "UPDATE tb_product SET 
                model = ?, screen_size = ?, CPU = ?, ssd = ?, ram = ?, os = ?, 
                1price = ?, 10price = ?, 100price = ?, detail = ? 
                WHERE id = ?";
        
        $stmt = $conn->prepare($sql);
        
        if ($stmt->execute([$model, $screen_size, $cpu, $ssd, $ram, $os, $price1, $price10, $price100, $detail, $id])) {
            echo json_encode("ok");
        } else {
            echo json_encode(array("error" => "Update failed"));
        }
    } catch (PDOException $e) {
        echo json_encode(array("error" => $e->getMessage()));
    }
}

function deleteProduct()
{
    global $conn;
    
    $id = $_POST['id'] ?? $_GET['id'] ?? '';
    
    if (empty($id)) {
        echo json_encode(array("error" => "ID is required"));
        return;
    }
    
    try {
        $sql = "DELETE FROM tb_product WHERE id = ?";
        $stmt = $conn->prepare($sql);
        
        if ($stmt->execute([$id])) {
            echo json_encode("ok");
        } else {
            echo json_encode(array("error" => "Delete failed"));
        }
    } catch (PDOException $e) {
        echo json_encode(array("error" => $e->getMessage()));
    }
}

function searchProducts()
{
    global $conn;
    
    $keyword = $_GET['keyword'] ?? '';
    
    if (empty($keyword)) {
        getAllProducts();
        return;
    }
    
    try {
        $sql = "SELECT * FROM tb_product WHERE 
                model LIKE ? OR 
                screen_size LIKE ? OR 
                CPU LIKE ? OR 
                ssd LIKE ? OR 
                ram LIKE ? OR 
                os LIKE ? OR 
                detail LIKE ?";
        
        $searchTerm = "%$keyword%";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$searchTerm, $searchTerm, $searchTerm, $searchTerm, $searchTerm, $searchTerm, $searchTerm]);
        
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Add formatted data for frontend
        foreach ($products as &$product) {
            $product['pd_id'] = $product['id'];
            $product['pd_name'] = $product['model'];
            $product['pd_description'] = $product['detail'];
            $product['pd_sellprice'] = $product['1price'];
        }
        
        echo json_encode($products);
    } catch (PDOException $e) {
        echo json_encode(array("error" => $e->getMessage()));
    }
}

// ปิดการเชื่อมต่อฐานข้อมูล
$conn = null;
?>