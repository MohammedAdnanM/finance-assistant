"""
utils.py - Utility Functions for Data Analysis

Process: Provides helper functions for financial calculations, anomaly detection, and AI interactions.

Updated Functionality:
  - Gemini AI Coach: Integrated Google Generative AI for intelligent, context-aware financial advice.
  - Anomaly Detection: Identifies unusual spending patterns using statistical outliers.
  - Budget Optimization: Analyzes efficiency and suggests target monthly budgets.
  - Pattern Matching: Fallback logic for basic financial queries.
"""
# import pandas as pd
import math
from datetime import date, datetime
from db import get_connection
# import numpy as np


# Removed insecure global load_data function to prevent memory leakage and privacy issues.
# Data fetching is now handled per-route with proper user_id filtering.


def detect_anomalies(user_id=None):
    conn = get_connection()
    cur = conn.cursor()
    if user_id:
        cur.execute("SELECT id, amount, category FROM transactions WHERE user_id=?", (user_id,))
    else:
        cur.execute("SELECT id, amount, category FROM transactions")
    
    rows = cur.fetchall()
    if not rows:
        return []
    
    # Data: id, amount, category
    data = [{"id": r[0], "amount": r[1], "category": r[2]} for r in rows]
    
    def get_stats(vals):
        if not vals: return 0, 0
        n = len(vals)
        mean = sum(vals) / n
        if n < 2: return mean, 0 # Standard deviation is undefined or 0 for less than 2 points
        variance = sum((x - mean) ** 2 for x in vals) / n
        return mean, math.sqrt(variance)

    # Global fallback for small transactions
    small_amounts = [d['amount'] for d in data if d['amount'] < 10000]
    global_mean = sum(small_amounts) / len(small_amounts) if small_amounts else None

    categories = set(d['category'] for d in data)
    anomaly_ids = []
    
    for cat in categories:
        cat_items = [d for d in data if d['category'] == cat]
        amounts = [d['amount'] for d in cat_items]
        
        if len(cat_items) >= 3:
            mean, std = get_stats(amounts)
            if std == 0:
                continue
            # Flag if amount is 2 standard deviations above mean
            for item in cat_items:
                if item['amount'] > mean + 2 * std:
                    anomaly_ids.append(item['id'])
        elif global_mean is not None:
            # Fallback for small categories: flag if it's 5x the global mean of small transactions
            for item in cat_items:
                if item['amount'] > global_mean * 5:
                    anomaly_ids.append(item['id'])

    return anomaly_ids


def recommend_budget(data):
    """Expects data as a list of dictionaries with 'date' and 'amount' keys."""
    if not data:
        return 0

    # Group by month (YYYY-MM)
    monthly_sums = {}
    for item in data:
        dt_str = item['date']
        # Extract YYYY-MM from 'YYYY-MM-DD' string
        month = dt_str[:7]
        monthly_sums[month] = monthly_sums.get(month, 0) + item['amount']

    # Get last 3 months by chronological order
    sorted_months = sorted(monthly_sums.keys())
    last_3_months_data = []
    if len(sorted_months) >= 3:
        last_3_months_data = [monthly_sums[m] for m in sorted_months[-3:]]
    else:
        last_3_months_data = [monthly_sums[m] for m in sorted_months] # Use all available months if less than 3
    
    if not last_3_months_data:
        return 0

    avg_spend = sum(last_3_months_data) / len(last_3_months_data)
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
    cur = conn.cursor()
    cur.execute("SELECT date, category, amount FROM transactions WHERE user_id=?", (user_id,))
    rows = cur.fetchall()
    
    if not rows:
        return "You haven't recorded any transactions yet! Try adding some expenses first so I can analyze your habits."

    # Process rows into analytics context
    total_spent = 0
    cat_sums = {}
    unique_dates = set()
    
    for r_date, r_cat, r_amount in rows:
        total_spent += r_amount
        cat_sums[r_cat] = cat_sums.get(r_cat, 0) + r_amount
        unique_dates.add(r_date) # Assuming r_date is 'YYYY-MM-DD' string
    
    top_cat = max(cat_sums, key=cat_sums.get) if cat_sums else "N/A"
    avg_daily = total_spent / len(unique_dates) if unique_dates else 0
    
    # Prepare Context for Gemini
    context = f"""
    You are a professional Financial Coach. 
    The user is asking: "{message}"
    
    Here is their recent financial data:
    - Total Spending: ₹{total_spent}
    - Biggest Category: {top_cat}
    - Average Daily Spending: ₹{round(avg_daily, 2)}
    - Detailed Categories: {cat_sums}
    
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
            return f"I'm having a bit of trouble reaching my AI brain, but I'm still here! Based on your history, you've spent the most on {top_cat}."
    else:
        # Original Rule-based fallback if no API key
        msg = message.lower()
        if "budget" in msg or "how am i doing" in msg:
            this_month = datetime.now().strftime("%Y-%m")
            budget_row = cur.execute("SELECT amount FROM budget WHERE user_id=? AND month=?", (user_id, this_month,)).fetchone()
            
            # Calculate current month's spending manually
            current_spent = sum(r[2] for r in rows if r[0][:7] == this_month)
            
            if not budget_row:
                return f"You haven't set a budget, but you've spent ₹{round(current_spent, 2)} so far."
            budget = budget_row[0]
            # remaining = budget - current_spent # This was in the original, but not used in the return string
            return f"You've spent ₹{round(current_spent, 2)} out of ₹{round(budget, 2)}."
        
        return "Gemini API key not configured. I can only answer basic budget questions for now!"
