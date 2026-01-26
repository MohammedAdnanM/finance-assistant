import sqlite3
import os
import random
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "finance.db")

def reset_and_seed():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # 1. Get User ID
    user = cur.execute("SELECT id FROM users LIMIT 1").fetchone()
    if not user:
        print("No user found. Please register in the app first.")
        return
    user_id = user[0]

    # 2. CLEAR ALL PREVIOUS RECORDS (Transactions and Budgets)
    print(f"Clearing all existing records for user {user_id}...")
    cur.execute("DELETE FROM transactions WHERE user_id=?", (user_id,))
    cur.execute("DELETE FROM budget")

    categories = [
        "Food", "Fuel", "Shopping", "Rent", "Bills", 
        "Medicine", "Travel", "Entertainment", "Education", 
        "Health", "Utilities"
    ]

    # 3. Generate 6 months of data (Aug 2025 - Jan 2026)
    months = [
        "2025-08", "2025-09", "2025-10", "2025-11", "2025-12", "2026-01"
    ]

    for m in months:
        # Set Budget to 60,000
        cur.execute("REPLACE INTO budget (month, amount) VALUES (?, ?)", (m, 60000.0))
        
        # Fixed Monthly Costs
        cur.execute("INSERT INTO transactions (user_id, date, category, amount) VALUES (?, ?, ?, ?)",
                    (user_id, f"{m}-01", "Rent", 22000.0))
        cur.execute("INSERT INTO transactions (user_id, date, category, amount) VALUES (?, ?, ?, ?)",
                    (user_id, f"{m}-05", "Bills", 4000.0))
        cur.execute("INSERT INTO transactions (user_id, date, category, amount) VALUES (?, ?, ?, ?)",
                    (user_id, f"{m}-10", "Utilities", 2500.0))

        # Varied Spending across other categories
        for cat in ["Food", "Fuel", "Shopping", "Medicine", "Travel", "Entertainment", "Education", "Health"]:
            # Some categories get multiple transactions per month
            num_tx = 3 if cat == "Food" else 2 if cat == "Fuel" else 1
            for _ in range(num_tx):
                day = random.randint(1, 28)
                # Generate varied amounts to create realistic "Efficiency" scores
                if cat == "Food": amt = random.uniform(200, 800)
                elif cat == "Shopping": amt = random.uniform(1000, 5000)
                elif cat == "Medicine": amt = random.uniform(300, 1500)
                else: amt = random.uniform(500, 3000)
                
                cur.execute("INSERT INTO transactions (user_id, date, category, amount) VALUES (?, ?, ?, ?)",
                            (user_id, f"{m}-{day:02d}", cat, round(amt, 2)))

    conn.commit()
    conn.close()
    print("Database wiped and fresh 6-month history seeded successfully!")

if __name__ == "__main__":
    reset_and_seed()
