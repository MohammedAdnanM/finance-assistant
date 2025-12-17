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

def detect_anomalies():
    conn = get_connection()
    df = pd.read_sql("SELECT id, amount FROM transactions", conn)
    mean = df.amount.mean()
    std = df.amount.std()
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
