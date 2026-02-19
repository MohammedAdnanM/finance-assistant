# Database Schema

The application uses SQLite (`finance.db`) for data storage.

## Tables

### 1. `users`
Stores user authentication details.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | INTEGER PK | Auto-incrementing User ID |
| `email` | TEXT UNIQUE | User's email address |
| `password_hash` | TEXT | Hashed password (using werkzeug) |
| `name` | TEXT | User's full name |

### 2. `transactions`
Stores individual financial records.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | INTEGER PK | Auto-incrementing Transaction ID |
| `user_id` | INTEGER | Foreign Key to `users.id` |
| `date` | TEXT | Transaction date (ISO 8601: YYYY-MM-DD) |
| `category` | TEXT | Spending category (e.g., Food, Rent) |
| `amount` | REAL | Transaction amount |

### 3. `budget`
Stores monthly budget limits.

| Column | Type | Description |
| :--- | :--- | :--- |
| `user_id` | INTEGER PK | Foreign Key to `users.id` |
| `month` | TEXT PK | Month identifier (YYYY-MM) |
| `amount` | REAL | Budget limit for that month |

## Notes
*   Isolation: All transaction queries are filtered by `user_id` to ensure data privacy.
*   Dates: Stored as TEXT strings for SQLite compatibility, parsed as needed in Python.

