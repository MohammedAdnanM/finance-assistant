# API Reference

Base URL (Development): `http://127.0.0.1:5000`

## Authentication

### Register User
*   Endpoint: `POST /register`
*   Body:
    ```json
    {
      "email": "user@example.com",
      "password": "securepassword",
      "name": "John Doe"
    }
    ```
*   Response: `201 Created`
    - Returns `{"msg": "User created...", "access_token": "..."}` for immediate login.

### Login
*   Endpoint: `POST /login`
*   Body:
    ```json
    {
      "email": "user@example.com",
      "password": "securepassword"
    }
    ```
*   Response: Returns JWT `access_token`

---

## User Profile

### Get Current User
*   Endpoint: `GET /api/user`
*   Response: `{"id": 1, "email": "user@example.com", "name": "John Doe"}`

---

## Transactions
Note: All following endpoints require `Authorization: Bearer <token>` header.

### Get Transactions
*   Endpoint: `GET /transactions`
*   Query Params: `?month=YYYY-MM` (optional, filters by month)
*   Response: List of transactions.

### Add Transaction
*   Endpoint: `POST /add`
*   Body:
    ```json
    {
      "date": "2023-10-27",
      "category": "Food",
      "amount": 150.00
    }
    ```

### Update Transaction
*   Endpoint: `PUT /update/<id>`
*   Body: Same as Add Transaction.

### Delete Transaction
*   Endpoint: `DELETE /delete/<id>`

---

## Budget & Analysis

### Set Budget
*   Endpoint: `POST /budget`
*   Body: `{"month": "YYYY-MM", "amount": 5000}`

### Get Budget
*   Endpoint: `GET /budget/<month>`

### Get Savings
*   Endpoint: `GET /savings`
*   Description: Returns cumulative lifetime savings and monthly savings history.

### Get Spending Prediction
*   Endpoint: `GET /predict`
*   Description: Predicts end-of-month spending.
*   Logic: (Current Spent Fixed) + (Current Spent Variable) + (Variable Daily Velocity * Remaining Days).
*   Response: `{"prediction": 4500.50}`

### Recommend Budget
*   Endpoint: `GET /recommend-budget`
*   Description: Suggests a budget based on historical average + buffer.

### Get Anomalies
*   Endpoint: `GET /anomaly`
*   Description: Returns transactions flagged as statistical outliers.

### Get Forecast
*   Endpoint: `GET /forecast`
*   Description: Returns a 30-day daily spending forecast.
*   Response: `{"forecast": [{"date": "2023-11-01", "amount": 150.0}, ...]}`

### Optimize Budget
*   Endpoint: `GET /optimize-budget`
*   Query Params: `?month=YYYY-MM` (optional)
*   Description: Identifies overspending categories.
*   Response: `[{"category": "Food", "message": "Spending is ₹500 above average..."}, ...]`

### Category Efficiency
*   Endpoint: `GET /category-efficiency`
*   Query Params: `?month=YYYY-MM` (optional)
*   Description: Rates spending efficiency per category based on average transaction size. Labels fixed costs as "Fixed".
*   Response: `[{"category": "Rent", "efficiency": "Fixed"}, {"category": "Food", "efficiency": "High"}]`

### Necessity Score
*   Endpoint: `POST /necessity-score`
*   Body: `{"type": "need", "frequency": "high", "amount": 100, "budget": 1000}`
*   Response: Purchase decision ("BUY", "DELAY", "AVOID") and score.

---

## AI Assistant

### Chat with Coach
*   Endpoint: `POST /chat`
*   Body: `{"message": "How am I doing this month?"}`
*   Response: AI-generated financial advice using Gemini.

