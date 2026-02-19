# Machine Learning & AI Algorithms

This document outlines the Machine Learning algorithms, Statistical methods, and AI models used in the Finance Assistant application.

## 1. Linear Regression (Supervised Learning)
*   Library: `scikit-learn`
*   File: `Backend/model_train.py`
*   Purpose:
    Predicts future transaction amounts based on the month. The model is trained on historical `month` vs `amount` data to establish a linear trend line for basic prediction.

## 2. Statistical Anomaly Detection (Unsupervised Method)
*   Method: Z-Score / Standard Deviation Analysis
*   File: `Backend/utils.py` (`detect_anomalies`)
*   Purpose:
    Identifies suspicious or unusual transactions.
    *   For each spending category, it calculates the Mean and Standard Deviation.
    *   Transactions exceeding `Mean + 2 * Standard Deviation` are flagged as anomalies.
    *   Includes a fallback for small datasets using a multiplier of the global mean.

## 3. Generative AI (LLM Integration)
*   Model: Google Gemini Flash (`gemini-flash-latest`)
*   Library: `google-generativeai`
*   File: `Backend/utils.py` (`financial_coach_reply`)
*   Purpose:
    Powers the "Financial Coach" chat feature. It converts raw financial data (Total Spending, Top Category, Daily Average) into a natural language prompt. The LLM then generates personalized, context-aware financial advice and answers user questions.

## 4. Time-Series Forecasting (Heuristic)
*   Method: Average Daily Spend Projection
*   File: `Backend/app.py` (`forecast`)
*   Purpose:
    Forecasts spending for the next 30 days. It calculates the user's historical average daily spend and projects it forward linearly to estimate future account activity.

## 5. Budget Recommendation (Heuristic)
*   Method: Moving Average + Buffer
*   File: `Backend/utils.py` (`recommend_budget`)
*   Purpose:
    Suggests a safe monthly budget by taking the average spending of the last 3 months and adding a 15% buffer (safety margin) to accommodate fluctuations.

## 6. Necessity Scoring (Rule-Based Classifier)
*   Method: Weighted Scoring System
*   File: `Backend/app.py` (`necessity_score`)
*   Purpose:
    Classifies a potential purchase as BUY, DELAY, or AVOID. It assigns scores based on:
    *   Type (Need vs. Want)
    *   Frequency of use
    *   Cost relative to total budget

