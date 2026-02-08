import sqlite3
import os
import random
from datetime import datetime, timedelta

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "finance.db")

def seed():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # 1. Get User ID (Target the first user)
    user = cur.execute("SELECT id FROM users LIMIT 1").fetchone()
    if not user:
        print("No user found. Please register in the app first.")
        return
    user_id = user[0]

    # 2. Clear existing (Optional, but let's keep it clean for this request)
    # cur.execute("DELETE FROM transactions WHERE user_id=?", (user_id,))
    # cur.execute("DELETE FROM budget")

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
        # Set Budget
        cur.execute("REPLACE INTO budget (user_id, month, amount) VALUES (?, ?, ?)", (user_id, m, 60000.0))
        
        # Monthly fixed costs
        cur.execute("INSERT INTO transactions (user_id, date, category, amount) VALUES (?, ?, ?, ?)",
                    (user_id, f"{m}-01", "Rent", 25000.0))
        cur.execute("INSERT INTO transactions (user_id, date, category, amount) VALUES (?, ?, ?, ?)",
                    (user_id, f"{m}-05", "Bills", 4500.0))
        cur.execute("INSERT INTO transactions (user_id, date, category, amount) VALUES (?, ?, ?, ?)",
                    (user_id, f"{m}-10", "Utilities", 3000.0))

        # Randomize other categories
        total_remaining = 30000.0 # Aim for around 62k total to show some overspending
        
        # Distribute remaining across categories
        for cat in ["Food", "Fuel", "Shopping", "Medicine", "Travel", "Entertainment", "Education", "Health"]:
            # Multiple entries for some
            num_entries = 2 if cat in ["Food", "Fuel"] else 1
            for _ in range(num_entries):
                day = random.randint(1, 28)
                amt = random.uniform(500, 4000)
                cur.execute("INSERT INTO transactions (user_id, date, category, amount) VALUES (?, ?, ?, ?)",
                            (user_id, f"{m}-{day:02d}", cat, round(amt, 2)))

    conn.commit()
    conn.close()
    print("Database seeded successfully with 6 months of data!")

if __name__ == "__main__":
    seed()
