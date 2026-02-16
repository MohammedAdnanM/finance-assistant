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
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from db import get_connection, init_db
from utils import detect_anomalies, recommend_budget, financial_coach_reply

import pickle

app = Flask(__name__)

CORS(app, resources={
    r"/*": {
        "origins": [
            "https://finance-assistant.vercel.app",
            "https://finance-assistant-git-c431b5-mohammed-adnans-projects-7ef5f0b2.vercel.app",
            "https://finance-assistant-e8qg-9zb5uh9qf.vercel.app",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
        ],
        "allow_headers": ["Content-Type", "Authorization"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "supports_credentials": True
    }
})
# SECURITY CONFIG
_jwt_secret = os.getenv("JWT_SECRET_KEY")
if not _jwt_secret or _jwt_secret == "super-secret-key-change-this-in-prod":
    print("WARNING: Insecure JWT_SECRET_KEY detected. Please set JWT_SECRET_KEY in your .env file.")
    app.config["JWT_SECRET_KEY"] = _jwt_secret or "temporary-dev-key"
else:
    app.config["JWT_SECRET_KEY"] = _jwt_secret

jwt = JWTManager(app)

init_db()

# Load model if exists
try:
    with open("model.pkl", "rb") as f:
        model = pickle.load(f)
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

@app.route("/api/user", methods=["GET"])
@jwt_required()
def get_user():
    user_id = get_jwt_identity()
    conn = get_connection()
    cur = conn.cursor()
    user = cur.execute("SELECT id, email FROM users WHERE id=?", (user_id,)).fetchone()
    
    if not user:
        return jsonify({"msg": "User not found"}), 404
        
    return jsonify({
        "id": user[0],
        "email": user[1]
    }), 200

@app.route("/delete/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_tx(id):
    user_id = int(get_jwt_identity())
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM transactions WHERE id=? AND user_id=?", (id, user_id))
    conn.commit()
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
    user_id = int(get_jwt_identity())
    data = request.json
    
    if "month" not in data or "amount" not in data:
        return jsonify({"msg": "Missing month or amount"}), 400
        
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("REPLACE INTO budget (user_id, month, amount) VALUES (?, ?, ?)",
                (user_id, data["month"], data["amount"]))
    conn.commit()
    return jsonify({"status": "ok"})

@app.route("/budget/<month>")
@jwt_required()
def get_budget(month):
    user_id = int(get_jwt_identity())
    conn = get_connection()
    cur = conn.cursor()
    row = cur.execute("SELECT amount FROM budget WHERE user_id=? AND month=?", (user_id, month)).fetchone()
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
    cur = conn.cursor()
    cur.execute("SELECT date, amount FROM transactions WHERE user_id=?", (user_id,))
    rows = cur.fetchall()
    if not rows:
        return jsonify({"prediction": 0})
    
    # Calculate daily average over last 30 days
    cutoff_date = datetime.now() - timedelta(days=30)
    recent_amounts = []
    for r_date_str, r_amount in rows:
        try:
            r_date = datetime.strptime(r_date_str, "%Y-%m-%d")
            if r_date >= cutoff_date:
                recent_amounts.append(r_amount)
        except ValueError:
            # Handle invalid date format if necessary, or skip
            pass
    
    if not recent_amounts:
        return jsonify({"prediction": 0})
    
    daily_avg = sum(recent_amounts) / len(recent_amounts)
    prediction = daily_avg * 30
    return jsonify({"prediction": round(prediction, 2)})

@app.route("/recommend-budget")
@jwt_required()
def recommend_budget_api():
    user_id = int(get_jwt_identity())
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT date, amount FROM transactions WHERE user_id=?", (user_id,))
    rows = cur.fetchall()
    # The recommend_budget utility function expects a list of dictionaries or similar structure
    data = [{"date": r[0], "amount": r[1]} for r in rows]
    recommended = recommend_budget(data)
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
    cur = conn.cursor()
    cur.execute("SELECT date, amount FROM transactions WHERE user_id=?", (user_id,))
    rows = cur.fetchall()
    if not rows:
        return jsonify({"forecast": []})

    # Group by date to get daily totals
    daily_totals = {}
    for r_date_str, r_amount in rows:
        try:
            # Ensure date is valid before using
            datetime.strptime(r_date_str, "%Y-%m-%d")
            daily_totals[r_date_str] = daily_totals.get(r_date_str, 0) + r_amount
        except ValueError:
            pass # Skip invalid dates
    
    if not daily_totals:
        return jsonify({"forecast": []})

    avg_daily = sum(daily_totals.values()) / len(daily_totals)
    
    forecast_list = []
    start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0) # Normalize to start of day
    for i in range(1, 31):
        fc_date = (start + timedelta(days=i)).strftime("%Y-%m-%d")
        forecast_list.append({"date": fc_date, "amount": round(avg_daily, 2)})

    return jsonify({"forecast": forecast_list})

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
    month_param = request.args.get("month") # YYYY-MM
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT date, category, amount FROM transactions WHERE user_id=?", (user_id,))
    rows = cur.fetchall()
    if not rows:
        return jsonify([])

    # Group by category and month
    cat_month_sums = {} # {category: {month: total}}
    all_categories = set()

    for r_date_str, r_cat, r_amount in rows:
        all_categories.add(r_cat)
        try:
            r_month = r_date_str[:7] # Extract YYYY-MM
            if r_cat not in cat_month_sums:
                cat_month_sums[r_cat] = {}
            cat_month_sums[r_cat][r_month] = cat_month_sums[r_cat].get(r_month, 0) + r_amount
        except (TypeError, IndexError):
            # Handle cases where date string might be malformed
            pass

    # Determine the target month for recent spending
    today_month = datetime.now().strftime("%Y-%m")
    target_month = month_param if month_param else today_month

    # Get total global budget for comparison
    budget_row = cur.execute("SELECT amount FROM budget WHERE user_id=? AND month=?", (user_id, today_month)).fetchone()
    total_budget = budget_row[0] if budget_row else 0

    result = []

    for cat in all_categories:
        monthly_data = cat_month_sums.get(cat, {})
        
        # Calculate average monthly spend for this category
        # We need at least one month of data to calculate an average
        if monthly_data:
            avg_monthly_spend = sum(monthly_data.values()) / len(monthly_data)
        else:
            avg_monthly_spend = 0 # No historical data for this category

        category_recent_total = monthly_data.get(target_month, 0)

        # Condition 1: Spending is 20% higher than historical average
        # Ensure there's more than one month of data to make a meaningful comparison
        if len(monthly_data) > 1 and avg_monthly_spend > 0 and category_recent_total > avg_monthly_spend * 1.2:
            diff = category_recent_total - avg_monthly_spend
            result.append({
                "category": cat,
                "message": f"Spending is ₹{round(diff)} above your monthly average. Try to scale back."
            })
        
        # Condition 2: Category consumes > 50% of total budget (for large categories/new users)
        elif total_budget > 0 and category_recent_total > total_budget * 0.5:
             result.append({
                "category": cat,
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
    cur = conn.cursor()
    if month:
        cur.execute("SELECT category, amount FROM transactions WHERE user_id=? AND substr(date,1,7)=?", (user_id, month))
    else:
        cur.execute("SELECT category, amount FROM transactions WHERE user_id=?", (user_id,))
    rows = cur.fetchall()

    cat_stats = {} # {category: [total_amount, count]}
    for r_cat, r_amount in rows:
        if r_cat not in cat_stats:
            cat_stats[r_cat] = [0, 0]
        cat_stats[r_cat][0] += r_amount
        cat_stats[r_cat][1] += 1

    results = []
    for cat, stats in cat_stats.items():
        total = stats[0]
        count = stats[1]

        if total == 0 or count == 0:
            level = "Low" # Or "N/A", depending on desired behavior for no transactions
        else:
            avg = total / count  # average spend per transaction

            if avg <= 500:
                level = "High"
            elif avg <= 1500:
                level = "Medium"
            else:
                level = "Low"

        results.append({
            "category": cat,
            "efficiency": level
        })

    return jsonify(results)
    

@app.route("/savings", methods=["GET"])
@jwt_required()
def get_savings():
    user_id = int(get_jwt_identity())
    conn = get_connection()
    cur = conn.cursor()
    
    # Get all transactions
    cur.execute("SELECT date, amount FROM transactions WHERE user_id=?", (user_id,))
    tx_rows = cur.fetchall()
    
    # Get all budgets
    cur.execute("SELECT month, amount FROM budget WHERE user_id=?", (user_id,))
    budget_rows = cur.fetchall()
    
    if not tx_rows and not budget_rows:
        return jsonify({"total_savings": 0, "history": []})

    # Group spending by month
    monthly_spent = {}
    for r_date_str, r_amount in tx_rows:
        try:
            r_month = r_date_str[:7] # Extract YYYY-MM
            monthly_spent[r_month] = monthly_spent.get(r_month, 0) + r_amount
        except (TypeError, IndexError):
            pass # Skip invalid dates

    # Prepare budgets dictionary
    budgets = {b[0]: b[1] for b in budget_rows}
    
    # Collect all unique months from both transactions and budgets
    all_months = set(list(monthly_spent.keys()) + list(budgets.keys()))
    
    current_month_str = datetime.now().strftime("%Y-%m")
    history = []
    total_savings = 0
    
    # Iterate through months, sorted for consistent output
    for m in sorted(list(all_months), reverse=True):
        # Exclude current and future months from historical savings calculation
        if m >= current_month_str:
            continue 
        
        budget = budgets.get(m, 0)
        spent = monthly_spent.get(m, 0)
        savings = budget - spent
        total_savings += savings
        history.append({"month": m, "budget": budget, "spent": spent, "savings": savings})
    
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


# if __name__ == "__main__":

#     app.run(debug=True, host='0.0.0.0')

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    is_development = os.environ.get("FLASK_ENV") == "development"
    
    app.run(
        host="0.0.0.0",
        port=port,
        debug=is_development
    )
