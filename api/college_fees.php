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
        $stmt = $conn->query("SELECT * FROM college_fees ORDER BY due_date ASC");
        $fees = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($fees);
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) {
            echo json_encode(["error" => "Invalid input"]);
            break;
        }
        $sql = "INSERT INTO college_fees (term_name, amount_due, due_date, amount_saved, status) VALUES (?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            $data['term_name'],
            $data['amount_due'],
            $data['due_date'],
            $data['amount_saved'] ?? 0,
            $data['status'] ?? 'Upcoming'
        ]);
        echo json_encode(["message" => "Fee added successfully", "id" => $conn->lastInsertId()]);
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['id'])) {
            echo json_encode(["error" => "ID required"]);
            break;
        }
        $sql = "UPDATE college_fees SET term_name=?, amount_due=?, due_date=?, amount_saved=?, status=? WHERE id=?";
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            $data['term_name'],
            $data['amount_due'],
            $data['due_date'],
            $data['amount_saved'],
            $data['status'],
            $data['id']
        ]);
        echo json_encode(["message" => "Fee updated successfully"]);
        break;
}
?>