# Literature Survey & Gap Analysis

This document provides a survey of existing research in Personal Finance Management (PFM) using AI and Machine Learning, and highlights how the **Finance Assistant** project differs and improves upon these approaches.

## 1. Existing Research & Methods

The integration of AI into personal finance has been a subject of research for several years. Key areas of study include:

### A. Automated Expense Classification
*   **Methodology:** Most research focuses on using supervised learning (e.g., Naive Bayes, Random Forest, or LSTM) to categorize bank transaction strings into labels like "Food", "Transport", etc.
*   **Key Papers:**
    *   *A. K. Z. A. Al-Ali et al., "Automated Expense Tracking System using OCR and Machine Learning"* (Focuses on scanning receipts).
    *   *R. Agrawal (2019), "Personal Finance Management using Machine Learning"* (Uses clustering for grouping expenses).

### B. Budgeting & Forecasting
*   **Methodology:** Traditional approaches use Time Series Analysis (ARIMA, SARIMA) to predict future spending based on historical data.
*   **Limitations:** These models are often rigid and struggle with irregular spending patterns or external factors (e.g., holidays, medical emergencies) without complex feature engineering.

### C. Rule-Based Chatbots
*   **Methodology:** Many "AI" financial assistants in literature are essentially decision-tree chatbots. They follow rigid flows ("If user says X, reply Y").
*   **Limitations:** They lack context awareness. They cannot answer complex, open-ended questions like "Why am I consistently overspending on weekends?"

---

## 2. Gap Analysis: How This Project is Different

The **Finance Assistant** project bridges the gap between rigid statistical tools and modern generative AI. Here is the comparative analysis:

| Feature | Standard Research Approach | Finance Assistant (This Project) |
| :--- | :--- | :--- |
| **User Interaction** | Static Forms / Rule-based Chatbots | **Generative AI Coach (Gemini)** capable of natural, context-aware conversation. |
| **Forecasting** | Complex ARIMA/LSTM models (Hard to deploy) | **Hybrid Approach:** Uses lightweight Linear Regression for trends + AI for qualitative advice. |
| **Anomaly Detection** | often omitted or purely threshold-based | **Statistical Z-Score Analysis:** Automatically adapts to user's spending variance per category. |
| **Advice Quality** | Generic ("You spent $500") | **Personalized:** "You spent ₹500 on Food, which is 20% higher than your average." |
| **Decision Support** | Passive (Reporting only) | **Active Necessity Scoring:** A unique algorithm that helps users decide *before* buying. |

## 3. Key Innovations in This Project

1.  **LLM-Driven Financial Coaching:**
    Unlike traditional apps that just show charts, this project integrates **Google's Gemini LLM**. It feeds the model live database statistics (Spending, Budget, Trends), allowing the AI to act as a *real* consultant that "knows" the user's finances.

2.  **Psychological "Necessity Score":**
    We implemented a custom algorithm (`necessity_score`) that digitizes the psychological decision-making process of "Needs vs. Wants", adding a behavioral economics layer often missing in purely technical research.

3.  **Hybrid Architecture:**
    Combines **Deterministic Logic** (math is always right for balances) with **Probabilistic AI** (advice can be nuanced). This prevents the "hallucination" problems common in pure-AI financial tools while retaining the empathy/human-like interaction.

## 4. Conclusion
While existing literature excels at specific tasks like *classifying* data, this project focuses on *interpreting* data. By leveraging a Large Language Model (LLM) alongside traditional statistical methods, the Finance Assistant moves beyond a simple "tracker" to become a proactive "advisor", addressing the engagement gap identified in many PFM studies.
