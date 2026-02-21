# Machine Learning & AI Algorithms

This document outlines the Machine Learning algorithms, Statistical methods, and AI models used in the Finance Assistant application.

## 1. Linear Regression (Supervised Learning)
*   Library: `scikit-learn`
*   File: `Backend/model_train.py`
*   Purpose:
    Predicts future transaction amounts based on the month. The model is trained on historical `month` vs `amount` data to establish a linear trend line for basic prediction.

## 2. Statistical Anomaly Detection (Unsupervised Method)
*   Library: Native Python `math` & SQLite
*   File: `Backend/utils.py` (`detect_anomalies`)
*   Purpose:
    Identifies suspicious or unusual transactions with context-awareness.
    *   **Method 1: Statistical Outliers:** For categories with ≥3 records, it flags transactions exceeding `Mean + 2 * Standard Deviation`.
    *   **Method 2: Global Fallback:** For smaller datasets, it flags amounts > 5x the global average of small transactions, but ignores them if they are < 50% of the user's monthly budget.
    *   **Method 3: Large Category Safety:** Categories like "Rent" or "Bills" are exempt from global mean checks and are only flagged if they exceed the total monthly budget by 120%.

## 3. Generative AI (LLM Integration)
*   Model: Google Gemini Flash (`gemini-flash-latest`)
*   Library: `google-generativeai`
*   File: `Backend/utils.py` (`financial_coach_reply`)
*   Purpose:
    Powers the "Financial Coach" chat feature. It converts raw financial data (Total Spending, Top Category, Daily Average) into a natural language prompt. The LLM then generates personalized, context-aware financial advice and answers user questions.

## 4. Time-Series Forecasting (Hybrid Heuristic)
*   Method: 60-Day Trailing Variable Velocity
*   File: `Backend/app.py` (`forecast`)
*   Purpose:
    Forecasts spending for the next 30 days by separating Fixed and Variable costs.
    *   **Variable Component:** Calculates the average daily spend on non-fixed categories over the last 60 days and projects it forward.
    *   **Fixed Component:** Identifies recurring large costs (Rent, Bills) to ensure the forecast line reflects typical survival costs.

## 5. Budget Recommendation (Weighted Heuristic)
*   Method: Fixed + (Variable * 1.15)
*   File: `Backend/utils.py` (`recommend_budget`)
*   Purpose:
    Suggests a safe monthly budget based on historical performance.
    *   **Fixed/Variable Split:** Prioritizes covering 100% of fixed costs (Bills, Rent, Utilities) while adding a 15% safety buffer to variable spending.
    *   **New User Buffer:** If a user has very little history, the system defaults to a 40% buffer over fixed costs to allow for initial variable spending discovery.

## 6. Necessity Scoring (Rule-Based Classifier)
*   Method: Weighted Scoring System (0-100)
*   File: `Backend/app.py` (`necessity_score`)
*   Purpose:
    Classifies a potential purchase as BUY, DELAY, or AVOID. It assigns scores based on:
    *   **Type (Weight: 50):** Needs are prioritized over Wants.
    *   **Frequency (Weight: 30):** High-frequency items score higher.
    *   **Budget Impact (Weight: 40):** Items costing < 5% of the monthly budget get maximum points.

## 7. Predictive Spending (Velocity-Based)
*   Method: Dampened Daily Velocity
*   File: `Backend/app.py` (`predict`)
*   Purpose:
    Predicts the current month's total end-of-month spend.
    *   Uses actual fixed costs spent so far.
    *   Projects variable spending using a "Dampened Velocity" (assumes at least 5 days have passed) to prevent early-month spikes from skewing the prediction.

