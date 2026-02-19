# Projects Guide & Setup

## Project Description
Finance Assistant is a full-stack web application designed to help users track expenses, manage budgets, and receive AI-powered financial advice.

### Tech Stack
*   Frontend: React (Vite), Tailwind CSS
*   Backend: Flask (Python)
*   Database: SQLite
*   AI: Google Gemini Flash API, Scikit-learn (Linear Regression)

---

## Folder Structure

```
finance assistant/
├── Backend/                 # Flask Server & Logic
│   ├── app.py               # Main API Application
│   ├── db.py                # Database Connection & Models
│   ├── utils.py             # Helper func, AI & ML logic
│   ├── model_train.py       # ML Training Script
│   ├── finance.db           # SQLite Database (Auto-created)
│   └── requirements.txt     # Python Dependencies
│
├── Frontend/finance-app-vite/ # React Application
│   ├── src/                 # Source Code
│   │   ├── components/      # UI Components (Dashboard, Sidebar, Savings, MobileNav, etc.)
│   │   ├── utils/           # API Helpers   
│   │   └── App.jsx          # Main Entry
│   └── package.json         # Node Dependencies
│
└── docs/                    # Documentation
    ├── API_REFERENCE.md
    ├── DATABASE_SCHEMA.md
    ├── ML_ALGORITHMS.md
    └── PROJECT_GUIDE.md
```

---

## Setup Instructions

### 1. Backend Setup
1.  Navigate to the definition folder: `cd Backend`
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Set up Environment Variables:
    *   Create a `.env` file in `Backend/`.
    *   Add your Gemini API Key:
        ```
        GEMINI_API_KEY=your_api_key_here
        ```
4.  Run the Server:
    ```bash
    python app.py
    ```
    The server will start at `http://127.0.0.1:5000`.

### 2. Frontend Setup
1.  Navigate to the frontend folder: `cd Frontend/finance-app-vite`
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the Development Server:
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:5173`.

---

## Usage
1.  Register/Login: Create an account to start tracking.
2.  Dashboard: View your monthly spending and balance.
3.  Transactions: Add, edit, or delete expenses.
4.  Coach: Chat with the AI for financial advice.
5.  Analytics: View charts, forecasts, and anomaly detection.
6.  Savings: specific view to track your accumulating wealth over time.

