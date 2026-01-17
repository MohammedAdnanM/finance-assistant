"""
migrate_db.py - Database Migration Script

Process: One-time script to update database schema and migrate existing data.

Main Functionality:
  - Adds user_id column to transactions table (if not exists)
  - Assigns orphaned transactions to the first registered user
  
Usage: python migrate_db.py
"""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "finance.db")

def migrate():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    print("Checking schema...")

    # 1. Add user_id column if not exists
    try:
        cur.execute("ALTER TABLE transactions ADD COLUMN user_id INTEGER")
        print("Added user_id column to transactions.")
    except sqlite3.OperationalError:
        print("user_id column already exists.")

    # 2. Get the first user (likely the one the user just created)
    user = cur.execute("SELECT id, email FROM users ORDER BY id ASC LIMIT 1").fetchone()
    
    if user:
        user_id, email = user
        print(f"Assigning existing transactions to User: {email} (ID: {user_id})")
        
        # 3. Update existing transactions
        result = cur.execute("UPDATE transactions SET user_id = ? WHERE user_id IS NULL", (user_id,))
        print(f"Updated {result.rowcount} transactions.")
        conn.commit()
    else:
        print("No users found to assign transactions to! Please register a user first.")

    conn.close()

if __name__ == "__main__":
    migrate()
