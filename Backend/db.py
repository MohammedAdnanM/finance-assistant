"""
db.py - Database Configuration and Initialization

Process: Manages Database connection and schema setup for both SQLite (Local) and PostgreSQL (Production).

Main Functionality:
  - get_connection(): Returns a database connection instance based on DATABASE_URL
  - init_db(): Creates tables if they don't exist, with syntax adjustments for Postgres compatibility
"""
import sqlite3
import os
import psycopg2
from urllib.parse import urlparse

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "finance.db")
DATABASE_URL = os.getenv("DATABASE_URL")
PLACEHOLDER = "%s" if DATABASE_URL else "?"

def get_connection():
    if DATABASE_URL:
        # Fix: Render uses 'postgres://' but psycopg2 needs 'postgresql://'
        url = DATABASE_URL.replace("postgres://", "postgresql://", 1)
        return psycopg2.connect(url, sslmode="require")
    else:
        return sqlite3.connect(DB_PATH, check_same_thread=False)

def init_db():
    conn = get_connection()
    cur = conn.cursor()

    # Use SERIAL for Postgres, AUTOINCREMENT for SQLite
    id_type = "SERIAL PRIMARY KEY" if DATABASE_URL else "INTEGER PRIMARY KEY AUTOINCREMENT"

    cur.execute(f"""
        CREATE TABLE IF NOT EXISTS transactions (
            id {id_type},
            user_id INTEGER,
            date TEXT,
            category TEXT,
            amount REAL,
            notes TEXT,
            type TEXT DEFAULT 'expense'
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

    cur.execute(f"""
        CREATE TABLE IF NOT EXISTS users (
            id {id_type},
            email TEXT UNIQUE,
            password_hash TEXT,
            name TEXT
        )
    """)

    cur.execute(f"""
        CREATE TABLE IF NOT EXISTS recurring_transactions (
            id {id_type},
            user_id INTEGER,
            amount REAL,
            category TEXT,
            notes TEXT,
            type TEXT DEFAULT 'expense',
            day_of_month INTEGER
        )
    """)

    cur.execute(f"""
        CREATE TABLE IF NOT EXISTS chat_history (
            id {id_type},
            user_id INTEGER,
            role TEXT,
            content TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()
