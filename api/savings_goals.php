<?php
require_once 'db.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $conn->query("SELECT * FROM savings_goals ORDER BY created_at DESC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) {
            echo json_encode(["error" => "Invalid input"]);
            break;
        }

        $sql = "INSERT INTO savings_goals (name, target_amount, current_amount) VALUES (?, ?, 0)";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$data['name'], $data['target_amount']]);
        echo json_encode(["message" => "Goal created", "id" => $conn->lastInsertId()]);
        break;
}
?>