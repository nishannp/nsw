<?php
require_once 'db.php';
header("Content-Type: application/json");

// Keyword Mappings for Auto-Categorization
$category_map = [
    'Woolworths' => ['Groceries', 'Spending'],
    'Coles' => ['Groceries', 'Spending'],
    'KFC' => ['Food', 'Spending'],
    'Mcdonalds' => ['Food', 'Spending'],
    'Uber' => ['Transport', 'Spending'],
    'Transport' => ['Transport', 'Spending'],
    'Opal' => ['Transport', 'Spending'],
    'Salary' => ['Salary', 'Income'],
    'Wages' => ['Wages', 'Income'],
    'Payroll' => ['Salary', 'Income'],
    'Transfer' => ['Transfer', 'Spending'],
    'College' => ['Fees', 'College'],
    'University' => ['Fees', 'College'],
    'Ebames' => ['Fees', 'College'],
];

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['csv_file'])) {
    $file = $_FILES['csv_file']['tmp_name'];

    if (($handle = fopen($file, "r")) !== FALSE) {
        $count = 0;

        while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
            // Attempt to detect columns dynamically or assume standard CBA format
            // Standard CBA: Date, Amount, Description, Balance
            // Sometimes: Date, Amount, Description

            // Basic validation: need at least date and amount
            if (count($data) < 2)
                continue;

            $raw_date = $data[0];
            $raw_amount = $data[1];
            $description = $data[2] ?? 'Unknown Transaction';

            // Clean Amount (remove $ and ,)
            $clean_amount = str_replace(['$', ','], '', $raw_amount);

            if (!is_numeric($clean_amount))
                continue; // Skip header or invalid rows

            $amount = (float) $clean_amount;

            // Determine Type
            // CBA: Debits are negative, Credits are positive (usually)
            // But sometimes imports might have separate columns. Assuming signed amount.
            if ($amount > 0) {
                $type = 'Income';
                $abs_amount = $amount;
            } else {
                $type = 'Expense';
                $abs_amount = abs($amount);
            }

            // Auto-Categorization Logic
            $category = $description;
            $bucket = 'Spending'; // Default

            if ($type === 'Income') {
                $bucket = 'Spending'; // Income usually goes to spending bucket initially or is unassigned
            }

            foreach ($category_map as $keyword => $map) {
                if (stripos($description, $keyword) !== false) {
                    $category = $map[0]; // Set cleaner category name
                    if ($type === 'Expense') {
                        $bucket = $map[1];   // Set bucket
                    }
                    break;
                }
            }

            $date = date('Y-m-d', strtotime(str_replace('/', '-', $raw_date))); // Handle DD/MM/YYYY

            $sql = "INSERT INTO transactions (category, type, bucket, amount, timestamp) VALUES (?, ?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->execute([$category, $type, $bucket, $abs_amount, $date]);

            $count++;
        }
        fclose($handle);
        echo json_encode(["message" => "Smartly imported $count transactions."]);
    } else {
        echo json_encode(["error" => "Failed to open file"]);
    }
} else {
    echo json_encode(["error" => "No file uploaded"]);
}
?>