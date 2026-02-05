"""
app.py - Main Flask Application Server

Process: Central API server that handles all HTTP requests from the frontend.

Main Functionality:
  - User Authentication (Register, Login with JWT tokens)
  - Transaction CRUD (Add, Read, Update, Delete)
  - Budget Management (Set/Get monthly budgets)
  - AI Insights (Predictions, Anomaly Detection, Forecasting)
  - Financial Analytics (Category Efficiency, Budget Optimization)
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from db import get_connection, init_db
from utils import detect_anomalies, recommend_budget, financial_coach_reply

import pandas as pd
import pickle

app = Flask(__name__)
CORS(app)

# SECURITY CONFIG
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "super-secret-key-change-this-in-prod") 
jwt = JWTManager(app)

init_db()

# Load model if exists
try:
    model = pickle.load(open("model.pkl", "rb"))
except:
    model = None

# ---------------- AUTH ROUTES ---------------- #
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"msg": "Missing email or password"}), 400

    conn = get_connection()
    cur = conn.cursor()
    
    # Check if user exists
    user = cur.execute("SELECT id FROM users WHERE email=?", (email,)).fetchone()
    if user:
        return jsonify({"msg": "User already exists"}), 400

    hashed = generate_password_hash(password)
    cur.execute("INSERT INTO users (email, password_hash) VALUES (?, ?)", (email, hashed))
    conn.commit()

    return jsonify({"msg": "User created successfully"}), 201

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    conn = get_connection()
    cur = conn.cursor()
    user = cur.execute("SELECT id, password_hash FROM users WHERE email=?", (email,)).fetchone()

    if not user or not check_password_hash(user[1], password):
        return jsonify({"msg": "Bad email or password"}), 401

    access_token = create_access_token(identity=str(user[0]))
    return jsonify({"access_token": access_token}), 200

@app.route("/delete/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_tx(id):
    user_id = int(get_jwt_identity())
    print("DELETE REQUEST RECEIVED FOR ID:", id)

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("DELETE FROM transactions WHERE id=? AND user_id=?", (id, user_id))
    conn.commit()

    print("ROWS AFFECTED:", cur.rowcount)

    return jsonify({"status": "deleted"}), 200


# @app.route("/delete/<int:transaction_id>", methods=["DELETE"])
# def delete_transaction(transaction_id):
#     conn = get_connection()
#     cur = conn.cursor()
#     cur.execute("DELETE FROM transactions WHERE id = ?", (transaction_id,))
#     conn.commit()
#     return jsonify({"message": "Transaction deleted"}), 

###month 
@app.route("/budget", methods=["POST"])
@jwt_required()
def set_budget():
    data = request.json
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("REPLACE INTO budget VALUES (?,?)",
                (data["month"], data["amount"]))
    conn.commit()
    return jsonify({"status":"ok"})

@app.route("/budget/<month>")
@jwt_required()
def get_budget(month):
    conn = get_connection()
    cur = conn.cursor()
    row = cur.execute("SELECT amount FROM budget WHERE month=?",(month,)).fetchone()
    return jsonify({"budget": row[0] if row else 0})





@app.route("/add", methods=["POST"])
@jwt_required()
def add_transaction():
    user_id = int(get_jwt_identity())
    data = request.json
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO transactions (user_id, date, category, amount)
        VALUES (?, ?, ?, ?)
    """, (user_id, data["date"], data["category"], data["amount"]))

    conn.commit()
    return jsonify({"status": "success"}), 200

@app.route("/transactions", methods=["GET"])
@jwt_required()
def get_transactions():
    user_id = int(get_jwt_identity())
    month = request.args.get("month")  # YYYY-MM
    conn = get_connection()
    cur = conn.cursor()

    if month:
        rows = cur.execute("""
            SELECT id, date, category, amount
            FROM transactions
            WHERE user_id=? AND substr(date,1,7)=?
            ORDER BY date
        """, (user_id, month,)).fetchall()
    else:
        rows = cur.execute("""
            SELECT id, date, category, amount
            FROM transactions WHERE user_id=? ORDER BY date
        """, (user_id,)).fetchall()

    return jsonify({
        "transactions": [
            {"id": r[0], "date": r[1], "category": r[2], "amount": r[3]}
            for r in rows
        ]
    })


@app.route("/predict")
@jwt_required()
def predict():
    user_id = int(get_jwt_identity())
    conn = get_connection()
    df = pd.read_sql("SELECT date, amount FROM transactions WHERE user_id=?", conn, params=(user_id,))
    if df.empty:
        return jsonify({"prediction":0})

    df["date"] = pd.to_datetime(df["date"])
    last_month = df[df.date >= (pd.Timestamp.today()-pd.Timedelta(days=30))]
    prediction = last_month.amount.mean() * 30

    return jsonify({"prediction": round(prediction,2)})

@app.route("/recommend-budget")
@jwt_required()
def recommend_budget_api():
    user_id = int(get_jwt_identity())
    conn = get_connection()
    df = pd.read_sql("SELECT date, amount FROM transactions WHERE user_id=?", conn, params=(user_id,))

    recommended = recommend_budget(df)
    return jsonify({"recommended_budget": recommended})


### Anomaly Highlight
@app.route("/anomaly")
@jwt_required()
def anomaly():
    user_id = int(get_jwt_identity())
    return jsonify({"anomalies": detect_anomalies(user_id)})

###forecasting
@app.route("/forecast")
@jwt_required()
def forecast():
    user_id = int(get_jwt_identity())
    conn = get_connection()
    df = pd.read_sql("SELECT date, amount FROM transactions WHERE user_id=?", conn, params=(user_id,))

    # No transactions at all
    if df.empty:
        return jsonify({"forecast": []})

    # Convert date safely
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df = df.dropna()

    # Group by date and calculate daily spend
    daily = df.groupby("date")["amount"].sum()

    # If still empty
    if daily.empty:
        return jsonify({"forecast": []})

    # Average daily spending
    daily_avg = float(daily.mean())

    forecast = []
    start = pd.Timestamp.today().normalize()

    for i in range(1, 31):
        forecast.append({
            "date": (start + pd.Timedelta(days=i)).strftime("%Y-%m-%d"),
            "amount": round(daily_avg, 2)
        })

    return jsonify({"forecast": forecast})

##### Update transaction
@app.route("/update/<int:id>", methods=["PUT"])
@jwt_required()
def update_transaction(id):
    user_id = int(get_jwt_identity())
    data = request.json
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE transactions
        SET date=?, category=?, amount=?
        WHERE id=? AND user_id=?
    """, (data["date"], data["category"], data["amount"], id, user_id))

    conn.commit()
    return jsonify({"status": "updated"}), 200

### Budget Optimization###
@app.route("/optimize-budget", methods=["GET"])
@jwt_required()
def optimize_budget():
    user_id = int(get_jwt_identity())
    month = request.args.get("month") # YYYY-MM
    conn = get_connection()
    df = pd.read_sql("SELECT date, category, amount FROM transactions WHERE user_id=?", conn, params=(user_id,))

    if df.empty:
        return jsonify([])

    df["date"] = pd.to_datetime(df["date"])
    
    # Use selected month's data for "recent" spending, or last 30 days as fallback
    if month:
        target_month_data = df[df["date"].dt.to_period("M") == month]
    else:
        target_month_data = df[df["date"] >= pd.Timestamp.today() - pd.Timedelta(days=30)]

    
    # Get total global budget for comparison
    cur = conn.cursor()
    month_str = pd.Timestamp.today().strftime("%Y-%m")
    budget_row = cur.execute("SELECT amount FROM budget WHERE month=?", (month_str,)).fetchone()
    total_budget = budget_row[0] if budget_row else 0

    result = []

    for category in df["category"].unique():
        cat_df = df[df["category"] == category]
        
        # Calculate average monthly spend for this category
        # We group by month and sum, then take the mean of those sums
        monthly_sums = cat_df.assign(m=cat_df["date"].dt.to_period("M")).groupby("m")["amount"].sum()
        avg_monthly_spend = monthly_sums.mean()
        
        category_recent_total = target_month_data[target_month_data["category"] == category]["amount"].sum()

        # Condition 1: Spending is 20% higher than historical average
        if len(monthly_sums) > 1 and category_recent_total > avg_monthly_spend * 1.2:
            diff = category_recent_total - avg_monthly_spend
            result.append({
                "category": category,
                "message": f"Spending is ₹{round(diff)} above your monthly average. Try to scale back."
            })
        
        # Condition 2: Category consumes > 50% of total budget (for large categories/new users)
        elif total_budget > 0 and category_recent_total > total_budget * 0.5:
             result.append({
                "category": category,
                "message": f"This category accounts for {round((category_recent_total/total_budget)*100)}% of your total budget."
            })

    return jsonify(result)

###Necessity score###
@app.route("/necessity-score", methods=["POST"])
@jwt_required()
def necessity_score():
    data = request.json
    score = 0
    
    # Base Type Scoring
    if data.get("type") == "need":
        score += 50
    else:
        score += 20

    # Frequency Scoring
    freq = data.get("frequency", "low")
    if freq == "high":
        score += 30
    elif freq == "medium":
        score += 20
    else:
        score += 10

    # Amount relative to budget scoring
    amount = data.get("amount", 0)
    budget = data.get("budget", 0)
    
    if budget > 0:
        ratio = amount / budget
        if ratio < 0.05:
            score += 40
        elif ratio < 0.15:
            score += 25
        else:
            score += 10
    else:
        # Default if no budget set
        score += 20

    decision = "BUY" if score >= 85 else "DELAY" if score >= 45 else "AVOID"

    return jsonify({
        "score": min(score, 100),
        "decision": decision
    })

###category efficiency algorithm###
@app.route("/category-efficiency", methods=["GET"])
@jwt_required()
def category_efficiency():
    user_id = int(get_jwt_identity())
    month = request.args.get("month")
    conn = get_connection()
    
    if month:
        df = pd.read_sql("SELECT category, amount FROM transactions WHERE user_id=? AND substr(date,1,7)=?", 
                         conn, params=(user_id, month))
    else:
        df = pd.read_sql("SELECT category, amount FROM transactions WHERE user_id=?", conn, params=(user_id,))


    results = []
    grouped = df.groupby("category")

    for category, data in grouped:
        total = data["amount"].sum()
        count = len(data)

        if total == 0:
            level = "Low"
        else:
            avg = total / count  # average spend per transaction

            if avg <= 500:
                level = "High"
            elif avg <= 1500:
                level = "Medium"
            else:
                level = "Low"

        results.append({
            "category": category,
            "efficiency": level
        })

    return jsonify(results)
    

@app.route("/savings", methods=["GET"])
@jwt_required()
def get_savings():
    user_id = int(get_jwt_identity())
    conn = get_connection()
    
    # Get all transactions
    df = pd.read_sql("SELECT date, amount FROM transactions WHERE user_id=?", conn, params=(user_id,))
    
    # Get all budgets
    budgets = pd.read_sql("SELECT month, amount as budget FROM budget", conn)
    
    if df.empty and budgets.empty:
        return jsonify({"total_savings": 0, "history": []})

    # Process Transactions
    if not df.empty:
        df["date"] = pd.to_datetime(df["date"])
        df["month"] = df["date"].dt.to_period("M").astype(str)
        monthly_spent = df.groupby("month")["amount"].sum().reset_index()
        monthly_spent.columns = ["month", "spent"]
    else:
        monthly_spent = pd.DataFrame(columns=["month", "spent"])

    # Merge Budgets and Spent
    # We want ALL months that have either a budget OR spending
    merged = pd.merge(budgets, monthly_spent, on="month", how="outer").fillna(0)
    
    # Filter for PAST months only (exclude current month)
    current_month = pd.Timestamp.today().strftime("%Y-%m")
    past_months = merged[merged["month"] < current_month].copy()
    
    past_months["savings"] = past_months["budget"] - past_months["spent"]
    
    # Sort by month descending
    past_months = past_months.sort_values("month", ascending=False)
    
    total_savings = past_months["savings"].sum()
    
    history = past_months.to_dict(orient="records")
    
    return jsonify({
        "total_savings": round(total_savings, 2),
        "history": history
    })
    

@app.route("/chat", methods=["POST"])
@jwt_required()
def chat():
    user_id = int(get_jwt_identity())
    data = request.json
    message = data.get("message", "")
    response = financial_coach_reply(user_id, message)
    return jsonify({"response": response})


if __name__ == "__main__":

    app.run(debug=True)

