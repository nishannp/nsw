<?php
require_once 'db.php';
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

// 1. Calculate safe-to-spend (existing logic)
// ... [Existing calculation logic] ...

// Helper queries
$stmt = $conn->query("SELECT 
    (SELECT COALESCE(SUM(amount),0) FROM transactions WHERE type='Income') - 
    (SELECT COALESCE(SUM(amount),0) FROM transactions WHERE type='Expense') 
    as balance");
$balance = $stmt->fetch(PDO::FETCH_ASSOC)['balance'];

$stmt = $conn->query("SELECT * FROM college_fees WHERE status='Upcoming' ORDER BY due_date ASC LIMIT 1");
$next_fee = $stmt->fetch(PDO::FETCH_ASSOC);

$liability = 0;
if ($next_fee) {
    $liability = $next_fee['amount_due'] - $next_fee['amount_saved'];
}

$days_remaining = date('t') - date('j');
if ($days_remaining <= 0)
    $days_remaining = 1;

$safe_to_spend = ($balance - $liability) / $days_remaining;

// 2. Smart Alerts Logic
$alerts = [];

// ALERT: Low Daily Budget
if ($safe_to_spend < 15) {
    $alerts[] = [
        'type' => 'danger',
        'title' => 'Critical Burn Rate',
        'message' => 'Your daily budget is under $15. Avoid eating out.'
    ];
} elseif ($safe_to_spend < 30) {
    $alerts[] = [
        'type' => 'warning',
        'title' => 'Tight Budget',
        'message' => 'Try to stick to essentials for the next few days.'
    ];
}

// ALERT: Upcoming Fee
if ($next_fee) {
    $fee_date = new DateTime($next_fee['due_date']);
    $today = new DateTime();
    $diff = $today->diff($fee_date)->days;
    $is_overdue = $today > $fee_date;

    if ($is_overdue) {
        $alerts[] = [
            'type' => 'danger',
            'title' => 'Fee Overdue!',
            'message' => "{$next_fee['term_name']} was due {$diff} days ago!"
        ];
    } elseif ($diff <= 7) {
        $alerts[] = [
            'type' => 'warning',
            'title' => 'Fee Due Soon',
            'message' => "{$next_fee['term_name']} due in {$diff} days. You need $" . ($next_fee['amount_due'] - $next_fee['amount_saved'])
        ];
    }
}

// ALERT: Savings Goal Progress
$stmt = $conn->query("SELECT * FROM savings_goals WHERE current_amount >= target_amount AND current_amount > 0 LIMIT 1");
$completed_goal = $stmt->fetch(PDO::FETCH_ASSOC);
if ($completed_goal) {
    $alerts[] = [
        'type' => 'success',
        'title' => 'Goal Crushed!',
        'message' => "You reached your target for {$completed_goal['name']}!"
    ];
}

echo json_encode([
    "balance" => $balance,
    "next_fee" => $next_fee,
    "days_remaining" => $days_remaining,
    "safe_to_spend_daily" => round($safe_to_spend, 2),
    "alerts" => $alerts
]);
?>