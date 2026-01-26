"""
utils.py - Utility Functions for Data Analysis

Process: Provides helper functions for financial calculations and anomaly detection.

Main Functionality:
  - load_data(): Loads all transactions from the database
  - detect_anomalies(user_id): Identifies unusual spending patterns (2+ std deviations)
  - recommend_budget(df): Calculates recommended budget based on 3-month average + 15%
"""
import pandas as pd
from db import get_connection
import numpy as np


def load_data():
    conn = get_connection()
    df = pd.read_sql("SELECT * FROM transactions", conn)
    if df.empty:
        return df
    df["month"] = pd.to_datetime(df["date"]).dt.month
    return df

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


def financial_coach_reply(user_id, message):
    conn = get_connection()
    df = pd.read_sql("SELECT date, category, amount FROM transactions WHERE user_id=?", conn, params=(user_id,))
    
    if df.empty:
        return "You haven't recorded any transactions yet! Try adding some expenses first so I can analyze your habits."

    df["date"] = pd.to_datetime(df["date"])
    msg = message.lower()
    
    # Intent 1: Specific Category Spending
    categories = [c.lower() for c in df["category"].unique()]
    for cat in categories:
        if cat in msg:
            cat_sum = df[df["category"].str.lower() == cat]["amount"].sum()
            return f"You've spent a total of ₹{round(cat_sum, 2)} on {cat.capitalize()} across all recorded months."

    # Intent 2: Budget Status
    if "budget" in msg or "how am i doing" in msg:
        this_month = pd.Timestamp.today().strftime("%Y-%m")
        cur = conn.cursor()
        budget_row = cur.execute("SELECT amount FROM budget WHERE month=?", (this_month,)).fetchone()
        
        current_spent = df[df["date"].dt.to_period("M") == this_month]["amount"].sum()
        
        if not budget_row:
            return f"You haven't set a budget for this month yet, but you've spent ₹{round(current_spent, 2)} so far. You should set a target!"
        
        budget = budget_row[0]
        remaining = budget - current_spent
        
        if remaining > 0:
            return f"You're doing great! You've spent ₹{round(current_spent, 2)} out of your ₹{round(budget, 2)} budget. You still have ₹{round(remaining, 2)} left."
        else:
            return f"Heads up! You've already spent ₹{round(current_spent, 2)}, which is ₹{round(abs(remaining), 2)} over your ₹{round(budget, 2)} budget."

    # Intent 3: Biggest Expense
    if "biggest" in msg or "highest" in msg or "most" in msg:
        top_cat = df.groupby("category")["amount"].sum().idxmax()
        top_amt = df.groupby("category")["amount"].sum().max()
        return f"Your biggest spending category overall is {top_cat}, where you've spent ₹{round(top_amt, 2)}."

    # Intent 4: Prediction
    if "predict" in msg or "future" in msg or "next month" in msg:
        last_30 = df[df.date >= (pd.Timestamp.today() - pd.Timedelta(days=30))]
        prediction = last_30.amount.mean() * 30
        return f"Based on your last 30 days, I predict you'll spend about ₹{round(prediction, 2)} next month if your habits stay the same."

    # Default fallback
    return "I'm not quite sure how to answer that yet. You can ask me about your spending in a specific category, your budget status, or your biggest expense!"

