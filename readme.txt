💰 FinanceFlow: Personal Student ERP

FinanceFlow is a custom-engineered financial management system designed specifically for international students. It bridges the gap between a standard bank app and a personal accounting system, focusing on high-stakes obligations like college fee installments and long-term savings goals.

🚀 Key Features

1. College Installment Ledger

Unlike a standard expense, college fees are predicted months in advance.

Installment Roadmap: A predefined schedule of upcoming fees.

Contribution Tracking: Track how much you have "reserved" for the next installment vs. what is actually paid.

Countdown: Visual indicators for upcoming deadlines.

2. The "Daily Burn Rate" Algorithm

To prevent overspending, the app calculates your "Safe-to-Spend" amount daily.

Formula: (Total Disposable Income - Fixed Obligations) / Days until next Paycheck.

Real-time adjustment: If you overspend today, tomorrow's budget shrinks automatically.

3. Savings Goal Progress

Create "Virtual Envelopes" for specific goals (e.g., Emergency Fund, New Tech, Travel).

Visual progress bars showing how close you are to your target.

4. CBA Reconciler

Manual logging for instant awareness.

CSV Import logic (for PHP/MySQL) to match manual logs against Commonwealth Bank statements.

🗄️ Database Architecture (MySQL)

college_fees

Field

Type

Description

id

INT

Primary Key

term_name

VARCHAR

e.g., "Semester 2 - 2024"

amount_due

DECIMAL

Total amount required

due_date

DATE

Official deadline

amount_saved

DECIMAL

Money set aside for this specific fee

status

ENUM

'Upcoming', 'Funded', 'Paid'

transactions

Field

Type

Description

id

INT

Primary Key

category

VARCHAR

Groceries, Transport, KFC Salary, etc.

type

ENUM

'Income' or 'Expense'

bucket

ENUM

'Spending', 'College', 'Savings'

amount

DECIMAL

Transaction value

timestamp

DATETIME

When it happened

🛠️ Tech Stack & UI Requirements

Backend: PHP 8.x with PDO (MySQL).

Frontend: React + Tailwind CSS (for the modern, minimalistic look).

Icons: Lucide-React for clean, professional iconography.

Mobile First: All interactive elements (buttons/forms) must be at least 44x44px for easy thumb-tapping.

📈 Installation

Setup a local PHP environment (XAMPP/MAMP).

Import the provided SQL schema.

Use the React prototype as a guide for your frontend components.