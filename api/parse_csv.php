<?php
// HARDENED CSV PARSER
require_once 'db.php'; // Connection not strictly needed for parsing but good for consistency
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");

ini_set('auto_detect_line_endings', TRUE);

// Mapping Logic (Centralized)
$category_map = [
    'Woolworths' => ['Groceries', 'Spending'],
    'Coles' => ['Groceries', 'Spending'],
    'Aldi' => ['Groceries', 'Spending'],
    'KFC' => ['Food', 'Spending'],
    'Mcdonalds' => ['Food', 'Spending'],
    'Hungry Jack' => ['Food', 'Spending'],
    'Dominos' => ['Food', 'Spending'],
    'Uber' => ['Transport', 'Spending'],
    'Transport' => ['Transport', 'Spending'],
    'Opal' => ['Transport', 'Spending'],
    'Salary' => ['Salary', 'Income'],
    'Wages' => ['Salary', 'Income'],
    'Payroll' => ['Salary', 'Income'],
    'Transfer to xx0652' => ['Savings Transfer', 'Savings'],
    'Transfer from xx0652' => ['Transfer In', 'Income'],
    'CommBank app' => ['Transfer', 'Spending'],
    'Steam' => ['Entertainment', 'Spending'],
    'Netflix' => ['Entertainment', 'Spending'],
    'Spotify' => ['Entertainment', 'Spending'],
];

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['csv_file'])) {
    $file = $_FILES['csv_file']['tmp_name'];

    if (($handle = fopen($file, "r")) !== FALSE) {
        $parsed_data = [];

        while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
            if (count($data) < 2)
                continue;

            // RAW DATA ACCESS
            // CBA: Date, Amount, Desc, Balance
            $raw_date = $data[0];
            $raw_amount = $data[1]; // e.g. "-100.00" or "+500.00"
            $description = $data[2] ?? 'Unknown';
            $raw_balance = $data[3] ?? null;

            // 1. DETERMINE TYPE (ROBUST STRING CHECK)
            // We check for the explicit presence of '-' or '+' signs.
            // This bypasses issues where (float) might strip things weirdly or locale issues.
            if (strpos($raw_amount, '+') !== false) {
                $type = 'Income';
            } elseif (strpos($raw_amount, '-') !== false) {
                $type = 'Expense';
            } else {
                // Fallback to numeric check
                $clean_check = (float) str_replace(['"', ',', '$'], '', $raw_amount);
                $type = ($clean_check < 0) ? 'Expense' : 'Income';
            }

            // 2. CLEAN AMOUNT
            // Now we get the absolute value for storage
            $clean_amount_str = str_replace(['+', '-', '"', ',', '$'], '', $raw_amount);
            $amount = (float) $clean_amount_str;

            // 3. AUTO CATEGORIZE
            $category = $description;
            // CRITICAL: Force Bucket based on Type first
            $bucket = ($type === 'Income') ? 'Income' : 'Spending';

            foreach ($category_map as $keyword => $map) {
                if (stripos($description, $keyword) !== false) {
                    $category = $map[0];
                    // Only override bucket if it's NOT Income (unless map says so)
                    // If Type is Income, we usually want to keep it Income bucket unless it's a specific refund to spending?
                    // Let's stick to: Income Type = Income Bucket, unless map explicitly says otherwise?
                    // Map format: [Category, Bucket]
                    // If map bucket is Income, that's fine. 
                    // If map bucket is Spending (e.g. Refund from Woolworths?), might want Spending bucket.

                    if ($type === 'Expense') {
                        $bucket = $map[1];
                    } else {
                        // It is Income.
                        // If map says Savings, adhere to it (e.g. Transfer In from Savings?)
                        // If map says Spending (e.g. Refund), adhere to it.
                        // If map says Income, adhere.
                        if (isset($map[1])) {
                            $bucket = $map[1];
                        }
                    }
                    break;
                }
            }

            // Hard Fix for Transfer from (Income)
            if (stripos($description, 'Transfer from') !== false) {
                $type = 'Income';
                $bucket = 'Income';
            }

            // 4. DATE PARSING
            $date = $raw_date;
            $dt = DateTime::createFromFormat('d/m/Y', $raw_date);
            $iso_date = $dt ? $dt->format('Y-m-d') : $raw_date;

            // 5. BALANCE CLEANING
            $balance = null;
            if ($raw_balance) {
                $balance = (float) str_replace(['"', ',', '$', '+'], '', $raw_balance);
            }

            $parsed_data[] = [
                'date' => $iso_date,
                'raw_date' => $raw_date,
                'category' => ucwords(strtolower($category)),
                'original_desc' => $description,
                'amount' => abs($amount),
                'type' => $type,
                'bucket' => $bucket,
                'running_balance' => $balance,
                'selected' => true
            ];
        }
        fclose($handle);
        echo json_encode($parsed_data);
    } else {
        echo json_encode(["error" => "Failed to open file"]);
    }
}
?>