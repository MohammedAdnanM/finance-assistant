"""
db.py - Database Configuration and Initialization

Process: Manages SQLite database connection and schema setup.

Main Functionality:
  - get_connection(): Returns a database connection instance
  - init_db(): Creates tables (transactions, budget, users) if they don't exist
"""
import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "finance.db")

def get_connection():
    return sqlite3.connect(DB_PATH, check_same_thread=False)

def init_db():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            date TEXT,
            category TEXT,
            amount REAL
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS budget (
            user_id INTEGER,
            month TEXT,
            amount REAL,
            PRIMARY KEY (user_id, month)
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE,
            password_hash TEXT,
            name TEXT
        )
    """)

    conn.commit()
    conn.close()
