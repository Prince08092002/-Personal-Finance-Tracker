# Personal Finance Tracker - Sample API Requests

Use these sample requests to test your backend endpoints directly via Postman, cURL, or any REST client. Replace `{{token}}` with a valid JWT obtained from the `/api/auth/login` endpoint.

## 1. Categories API

### Get All Categories
Retrieves all categories applicable to the authenticated user (both default system categories and their own custom categories).

**Request:**
```http
GET /api/categories
Authorization: Bearer {{token}}
```

**Response (200 OK):**
```json
{
  "success": true,
  "count": 6,
  "data": [
    { "id": 1, "name": "Food" },
    { "id": 2, "name": "Travel" },
    { "id": 3, "name": "Bills" }
  ]
}
```

### Create Custom Category
Creates a new personalized spending category for the user.

**Request:**
```http
POST /api/categories
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Gaming Subscriptions"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 9,
    "name": "Gaming Subscriptions"
  }
}
```

---

## 2. Expenses API

### Add a New Expense
Logs a new expense under a specific category id.

**Request:**
```http
POST /api/expenses
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "categoryId": 1,
  "amount": 24.50,
  "description": "Lunch with team",
  "expenseDate": "2026-03-27"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Expense added",
  "data": { "id": 12 }
}
```

### List All Expenses
Retrieves all expenses logged by the user, including the resolved category name.

**Request:**
```http
GET /api/expenses
Authorization: Bearer {{token}}
```

**Response (200 OK):**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": 12,
      "amount": "24.50",
      "description": "Lunch with team",
      "expense_date": "2026-03-27T00:00:00.000Z",
      "category_name": "Food"
    }
  ]
}
```

---

## 3. Income API

### Add New Income Source
Logs a new income transaction. Supported frequencies are `one-time`, `weekly`, and `monthly`.

**Request:**
```http
POST /api/income
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "source": "Freelance Web Project",
  "amount": 1500.00,
  "frequency": "one-time",
  "incomeDate": "2026-03-27"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Income added",
  "data": { "id": 4 }
}
```

---

## 4. Dashboard API

### Get Aggregated Dashboard Data
Returns all aggregated metrics for the dashboard view. Summarizes total income, total expenses, calculates the remaining balance, breaks down expenses by category, and shows the last 5 transactions (income or expense) combined.

**Request:**
```http
GET /api/dashboard
Authorization: Bearer {{token}}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalIncome": 1500.00,
    "totalExpense": 24.50,
    "remainingBalance": 1475.50,
    "categoryWiseExpense": [
      {
        "category": "Food",
        "total": "24.50"
      }
    ],
    "recentTransactions": [
      {
        "type": "income",
        "title": "Freelance Web Project",
        "amount": "1500.00",
        "date": "2026-03-27T00:00:00.000Z",
        "id": 4
      },
      {
        "type": "expense",
        "title": "Food",
        "amount": "24.50",
        "date": "2026-03-27T00:00:00.000Z",
        "id": 12
      }
    ]
  }
}
```
