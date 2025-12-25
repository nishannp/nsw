<?php
require_once 'db.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

switch ($method) {
    case 'GET':
        $stmt = $conn->query("SELECT * FROM transactions ORDER BY timestamp DESC");
        $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($transactions);
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) {
            echo json_encode(["error" => "Invalid input"]);
            break;
        }

        try {
            $conn->beginTransaction();

            $category = $data['category'];
            $type = $data['type'];
            $bucket = $data['bucket'];
            $amount = $data['amount'];
            $linked_fee_id = $data['linked_fee_id'] ?? null;
            $linked_goal_id = $data['linked_goal_id'] ?? null;
            $timestamp = $data['timestamp'] ?? date('Y-m-d H:i:s'); // Allow override, default to NOW

            $sql = "INSERT INTO transactions (category, type, bucket, amount, linked_fee_id, linked_goal_id, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->execute([$category, $type, $bucket, $amount, $linked_fee_id, $linked_goal_id, $timestamp]);
            $txn_id = $conn->lastInsertId();

            if ($linked_fee_id) {
                $stmt = $conn->prepare("UPDATE college_fees SET amount_saved = amount_saved + ? WHERE id = ?");
                $stmt->execute([$amount, $linked_fee_id]);
                $stmt = $conn->prepare("UPDATE college_fees SET status = 'Funded' WHERE id = ? AND amount_saved >= amount_due AND status != 'Paid'");
                $stmt->execute([$linked_fee_id]);
            }

            if ($linked_goal_id) {
                $stmt = $conn->prepare("UPDATE savings_goals SET current_amount = current_amount + ? WHERE id = ?");
                $stmt->execute([$amount, $linked_goal_id]);
            }

            $conn->commit();
            echo json_encode(["message" => "Transaction added successfully", "id" => $txn_id]);

        } catch (Exception $e) {
            $conn->rollBack();
            echo json_encode(["error" => "Transaction failed: " . $e->getMessage()]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['id'])) {
            echo json_encode(["error" => "ID required"]);
            break;
        }
        $sql = "UPDATE transactions SET category=?, amount=?, type=?, bucket=?, timestamp=? WHERE id=?";
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            $data['category'],
            $data['amount'],
            $data['type'],
            $data['bucket'],
            $data['timestamp'] ?? date('Y-m-d H:i:s'),
            $data['id']
        ]);
        echo json_encode(["message" => "Transaction updated"]);
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        if ($id) {
            $stmt = $conn->prepare("SELECT linked_fee_id, linked_goal_id, amount FROM transactions WHERE id = ?");
            $stmt->execute([$id]);
            $txn = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($txn) {
                $amount = $txn['amount'];
                if ($txn['linked_fee_id']) {
                    $upd = $conn->prepare("UPDATE college_fees SET amount_saved = amount_saved - ? WHERE id = ?");
                    $upd->execute([$amount, $txn['linked_fee_id']]);
                }
                if ($txn['linked_goal_id']) {
                    $upd = $conn->prepare("UPDATE savings_goals SET current_amount = current_amount - ? WHERE id = ?");
                    $upd->execute([$amount, $txn['linked_goal_id']]);
                }
            }

            $stmt = $conn->prepare("DELETE FROM transactions WHERE id=?");
            $stmt->execute([$id]);
            echo json_encode(["message" => "Deleted"]);
        }
        break;
}
?>