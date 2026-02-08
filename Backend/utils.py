"""
utils.py - Utility Functions for Data Analysis

Process: Provides helper functions for financial calculations, anomaly detection, and AI interactions.

Updated Functionality:
  - Gemini AI Coach: Integrated Google Generative AI for intelligent, context-aware financial advice.
  - Anomaly Detection: Identifies unusual spending patterns using statistical outliers.
  - Budget Optimization: Analyzes efficiency and suggests target monthly budgets.
  - Pattern Matching: Fallback logic for basic financial queries.
"""
import pandas as pd
from db import get_connection
import numpy as np


# Removed insecure global load_data function to prevent memory leakage and privacy issues.
# Data fetching is now handled per-route with proper user_id filtering.


def detect_anomalies(user_id=None):
    conn = get_connection()
    if user_id:
        df = pd.read_sql("SELECT id, amount, category FROM transactions WHERE user_id=?", conn, params=(user_id,))
    else:
        df = pd.read_sql("SELECT id, amount, category FROM transactions", conn)
    
    if df.empty:
        return []
    
    anomaly_ids = []
    
    # Group by category to find outliers within the same type of spending
    for category in df['category'].unique():
        cat_df = df[df['category'] == category]
        
        # We need a few data points in a category to establish a "normal" range
        if len(cat_df) >= 3:
            mean = cat_df.amount.mean()
            std = cat_df.amount.std()
            
            # If std is 0 (all values same), nothing is an anomaly
            if pd.isna(std) or std == 0:
                continue
                
            # Flag if amount is 2 standard deviations above the category mean
            anomalies = cat_df[cat_df.amount > mean + 2*std]
            anomaly_ids.extend(anomalies["id"].tolist())
        else:
            # Fallback for small categories: flag if it's 3x the global mean of small transactions
            global_mean = df[df.amount < 10000].amount.mean()
            if not pd.isna(global_mean):
                anomalies = cat_df[cat_df.amount > global_mean * 5]
                anomaly_ids.extend(anomalies["id"].tolist())

    return anomaly_ids



def recommend_budget(df):
    if df.empty:
        return 0

    monthly = (
        df.assign(month=pd.to_datetime(df["date"]).dt.to_period("M"))
          .groupby("month")["amount"]
          .sum()
          .tail(3)
    )

    avg_spend = monthly.mean()
    return round(avg_spend * 1.15, 2)


import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
    # Using gemini-flash-latest for best availability
    model = genai.GenerativeModel('gemini-flash-latest')
else:
    model = None

def financial_coach_reply(user_id, message):
    conn = get_connection()
    df = pd.read_sql("SELECT date, category, amount FROM transactions WHERE user_id=?", conn, params=(user_id,))
    
    if df.empty:
        return "You haven't recorded any transactions yet! Try adding some expenses first so I can analyze your habits."

    df["date"] = pd.to_datetime(df["date"])
    
    # Analyze Data for Context
    total_spent = df["amount"].sum()
    top_cat = df.groupby("category")["amount"].sum().idxmax()
    avg_daily = df.groupby("date")["amount"].sum().mean()
    
    # Prepare Context for Gemini
    context = f"""
    You are a professional Financial Coach. 
    The user is asking: "{message}"
    
    Here is their recent financial data:
    - Total Spending: ₹{total_spent}
    - Biggest Category: {top_cat}
    - Average Daily Spending: ₹{round(avg_daily, 2)}
    - Detailed Categories: {df.groupby("category")["amount"].sum().to_dict()}
    
    Instructions:
    1. Be encouraging and professional.
    2. Use the data provided to give specific advice.
    3. If they ask about a specific category or budget, prioritize that data.
    4. Keep the response concise but insightful (max 3-4 sentences).
    5. Always format currency as ₹.
    """

    if model:
        try:
            response = model.generate_content(context)
            return response.text
        except Exception as e:
            print(f"Gemini Error: {e}")
            return "I'm having a bit of trouble reaching my AI brain, but I'm still here! Based on your history, you've spent the most on " + top_cat + "."
    else:
        # Original Rule-based fallback if no API key
        msg = message.lower()
        if "budget" in msg or "how am i doing" in msg:
            this_month = pd.Timestamp.today().strftime("%Y-%m")
            cur = conn.cursor()
            budget_row = cur.execute("SELECT amount FROM budget WHERE user_id=? AND month=?", (user_id, this_month,)).fetchone()
            current_spent = df[df["date"].dt.to_period("M") == this_month]["amount"].sum()
            if not budget_row:
                return f"You haven't set a budget, but you've spent ₹{round(current_spent, 2)} so far."
            budget = budget_row[0]
            remaining = budget - current_spent
            return f"You've spent ₹{round(current_spent, 2)} out of ₹{round(budget, 2)}."
        
        return "Gemini API key not configured. I can only answer basic budget questions for now!"

