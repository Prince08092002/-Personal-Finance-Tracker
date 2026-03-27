# Personal Finance Tracker — Commands Cheat Sheet

This doc lists the **common commands** to install, run, build, and manage the database for this project.

> Notes
> - OS: Windows (PowerShell)
> - Backend runs on: `http://localhost:5000`
> - Frontend runs on: `http://localhost:5173`

---

## Backend (Node/Express)

### Install dependencies

```bash
cd "C:\Users\princ\OneDrive\Desktop\Personal _finance"
npm install
```

### Run backend (development)

```bash
cd "C:\Users\princ\OneDrive\Desktop\Personal _finance"
npm run dev
```

### Run backend (production-style start)

```bash
cd "C:\Users\princ\OneDrive\Desktop\Personal _finance"
npm start
```

---

## Frontend (React/Vite)

### Install dependencies

```bash
cd "C:\Users\princ\OneDrive\Desktop\Personal _finance\frontend"
npm install
```

### Run frontend (development)

```bash
cd "C:\Users\princ\OneDrive\Desktop\Personal _finance\frontend"
npm run dev
```

### Lint

```bash
cd "C:\Users\princ\OneDrive\Desktop\Personal _finance\frontend"
npm run lint
```

### Build (production)

```bash
cd "C:\Users\princ\OneDrive\Desktop\Personal _finance\frontend"
npm run build
```

### Preview production build

```bash
cd "C:\Users\princ\OneDrive\Desktop\Personal _finance\frontend"
npm run preview
```

---

## Environment variables (Backend)

Create a file named `.env` in the backend root:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_PASSWORD_HERE
DB_NAME=finance_app
JWT_SECRET=YOUR_SECRET_HERE
```

---

## Database (MySQL 8+)

### Verify MySQL CLI is available

```bash
mysql --version
```

### Create database + tables from the schema file

Run from project root:

```bash
cd "C:\Users\princ\OneDrive\Desktop\Personal _finance"
mysql -u root -p < schema.sql
```

If your MySQL user is not `root`, replace it:

```bash
mysql -u YOUR_USER -p < schema.sql
```

### Connect to the database

```bash
mysql -u root -p -D finance_app
```

### Show tables

```sql
SHOW TABLES;
```

Expected main tables:
- `users`
- `categories`
- `expenses`
- `income`
- `budgets`

### Quick table counts

```sql
SELECT COUNT(*) AS users_count FROM users;
SELECT COUNT(*) AS categories_count FROM categories;
SELECT COUNT(*) AS expenses_count FROM expenses;
SELECT COUNT(*) AS income_count FROM income;
SELECT COUNT(*) AS budgets_count FROM budgets;
```

### Useful “view data” queries

Users:

```sql
SELECT id, name, email, phone_number, is_deleted, created_at
FROM users
ORDER BY id DESC
LIMIT 10;
```

Categories:

```sql
SELECT id, user_id, name, created_at
FROM categories
ORDER BY id DESC
LIMIT 50;
```

Expenses (with category name):

```sql
SELECT
  e.id, e.user_id, c.name AS category, e.amount, e.description,
  e.expense_date, e.created_at
FROM expenses e
JOIN categories c ON c.id = e.category_id
ORDER BY e.expense_date DESC
LIMIT 50;
```

Income:

```sql
SELECT id, user_id, source, amount, frequency, income_date, created_at
FROM income
ORDER BY income_date DESC
LIMIT 50;
```

Budgets + actual spend (example for one month):

```sql
-- Set these for your user/month:
SET @userId = 2;
SET @monthKey = '2026-03'; -- YYYY-MM
SET @start = STR_TO_DATE(CONCAT(@monthKey,'-01'),'%Y-%m-%d');
SET @end = DATE_ADD(@start, INTERVAL 1 MONTH);

SELECT
  c.id AS category_id,
  c.name AS category_name,
  COALESCE(b.budget_amount, 0) AS budget_amount,
  COALESCE(SUM(e.amount), 0) AS actual_amount
FROM categories c
LEFT JOIN budgets b
  ON b.user_id=@userId AND b.category_id=c.id AND b.month_key=@monthKey
LEFT JOIN expenses e
  ON e.user_id=@userId AND e.category_id=c.id
  AND e.expense_date>=@start AND e.expense_date<@end
WHERE c.user_id IS NULL OR c.user_id=@userId
GROUP BY c.id, c.name, b.budget_amount
ORDER BY c.name ASC;
```

---

## API quick test commands (optional)

### Test backend health

```bash
curl http://localhost:5000/
```

### If you have a JWT token

Replace `YOUR_JWT_TOKEN`:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:5000/api/dashboard
```

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" "http://localhost:5000/api/transactions?page=1&limit=10&type=all"
```

---

## One-shot “run everything” (2 terminals)

Terminal 1 (backend):

```bash
cd "C:\Users\princ\OneDrive\Desktop\Personal _finance"
npm install
npm run dev
```

Terminal 2 (frontend):

```bash
cd "C:\Users\princ\OneDrive\Desktop\Personal _finance\frontend"
npm install
npm run dev
```

