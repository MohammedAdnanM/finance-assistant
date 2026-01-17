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
        df = pd.read_sql("SELECT id, amount FROM transactions WHERE user_id=?", conn, params=(user_id,))
    else:
        df = pd.read_sql("SELECT id, amount FROM transactions", conn)
    
    if df.empty:
        return []
    
    mean = df.amount.mean()
    std = df.amount.std()
    if pd.isna(std) or std == 0:
        return []
    anomalies = df[df.amount > mean + 2*std]
    return anomalies["id"].tolist()



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
