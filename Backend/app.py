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
from db import get_connection, init_db, PLACEHOLDER, DATABASE_URL
from utils import detect_anomalies, recommend_budget, financial_coach_reply
import pickle

app = Flask(__name__)

CORS(app, resources={
    r"/*": {
        "origins": [
            "https://finance-assistant-zeta.vercel.app",
            "https://finance-assistant.vercel.app",
            "https://finance-assistant-app.vercel.app",
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
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=30)

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
    try:
        data = request.json
        email = data.get("email")
        password = data.get("password")
        name = data.get("name", "")

        if not email or not password:
            return jsonify({"msg": "Missing email or password"}), 400

        conn = get_connection()
        cur = conn.cursor()
        
        # Check if user exists
        cur.execute(f"SELECT id FROM users WHERE email={PLACEHOLDER}", (email,))
        user = cur.fetchone()
        if user:
            return jsonify({"msg": "User already exists"}), 400

        hashed = generate_password_hash(password)
        cur.execute(f"INSERT INTO users (email, password_hash, name) VALUES ({PLACEHOLDER}, {PLACEHOLDER}, {PLACEHOLDER})", (email, hashed, name))
        conn.commit()
        
        # Generate token for immediate login
        if DATABASE_URL:
            # Fix for Postgres where lastrowid is not supported in psycopg2
            cur.execute(f"SELECT id FROM users WHERE email={PLACEHOLDER}", (email,))
            new_user = cur.fetchone()
            user_id = new_user[0]
        else:
            user_id = cur.lastrowid
            
        access_token = create_access_token(identity=str(user_id))

        return jsonify({
            "msg": "User created successfully", 
            "access_token": access_token,
            "user": {
                "id": user_id,
                "name": name,
                "email": email
            }
        }), 201
    except Exception as e:
        return jsonify({"msg": f"Server error: {str(e)}"}), 500

@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.json
        email = data.get("email")
        password = data.get("password")

        conn = get_connection()
        cur = conn.cursor()
        cur.execute(f"SELECT id, password_hash, name, email FROM users WHERE email={PLACEHOLDER}", (email,))
        user = cur.fetchone()

        if not user or not check_password_hash(user[1], password):
            return jsonify({"msg": "Bad email or password"}), 401

        access_token = create_access_token(identity=str(user[0]))
        return jsonify({
            "access_token": access_token,
            "user": {
                "id": user[0],
                "name": user[2],
                "email": user[3]
            }
        }), 200
    except Exception as e:
        return jsonify({"msg": f"Server error: {str(e)}"}), 500

@app.route("/api/user", methods=["GET"])
@jwt_required()
def get_user():
    try:
        user_id = int(get_jwt_identity())
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(f"SELECT id, email, name FROM users WHERE id={PLACEHOLDER}", (user_id,))
        user = cur.fetchone()
        
        if not user:
            return jsonify({"msg": "User not found"}), 404
            
        return jsonify({
            "id": user[0],
            "email": user[1],
            "name": user[2]
        }), 200
    except Exception as e:
        return jsonify({"msg": f"Server error: {str(e)}"}), 500

@app.route("/delete/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_tx(id):
    user_id = int(get_jwt_identity())
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(f"DELETE FROM transactions WHERE id={PLACEHOLDER} AND user_id={PLACEHOLDER}", (id, user_id))
    conn.commit()
    return jsonify({"status": "deleted"}), 200

@app.route("/budget", methods=["POST"])
@jwt_required()
def set_budget():
    user_id = int(get_jwt_identity())
    data = request.json
    
    if "month" not in data or "amount" not in data:
        return jsonify({"msg": "Missing month or amount"}), 400
        
    conn = get_connection()
    cur = conn.cursor()
    if DATABASE_URL:
        # Postgres UPSERT
        cur.execute(f"""
            INSERT INTO budget (user_id, month, amount) VALUES ({PLACEHOLDER}, {PLACEHOLDER}, {PLACEHOLDER})
            ON CONFLICT (user_id, month) DO UPDATE SET amount = EXCLUDED.amount
        """, (user_id, data["month"], data["amount"]))
    else:
        # SQLite
        cur.execute(f"REPLACE INTO budget (user_id, month, amount) VALUES ({PLACEHOLDER}, {PLACEHOLDER}, {PLACEHOLDER})",
                    (user_id, data["month"], data["amount"]))
    conn.commit()
    return jsonify({"status": "ok"})

@app.route("/budget/<month>")
@jwt_required()
def get_budget(month):
    user_id = int(get_jwt_identity())
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(f"SELECT amount FROM budget WHERE user_id={PLACEHOLDER} AND month={PLACEHOLDER}", (user_id, month))
    row = cur.fetchone()
    return jsonify({"budget": row[0] if row else 0})

@app.route("/add", methods=["POST"])
@jwt_required()
def add_transaction():
    user_id = int(get_jwt_identity())
    data = request.json
    conn = get_connection()
    cur = conn.cursor()

    transaction_type = data.get("type", "expense").lower()
    cur.execute(f"""
        INSERT INTO transactions (user_id, date, category, amount, notes, type)
        VALUES ({PLACEHOLDER}, {PLACEHOLDER}, {PLACEHOLDER}, {PLACEHOLDER}, {PLACEHOLDER}, {PLACEHOLDER})
    """, (user_id, data["date"], data.get("category", ""), data["amount"], data.get("notes", ""), transaction_type))

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
        cur.execute(f"""
            SELECT id, date, category, amount, notes, type
            FROM transactions
            WHERE user_id={PLACEHOLDER} AND substr(date,1,7)={PLACEHOLDER}
            ORDER BY date
        """, (user_id, month,))
    else:
        cur.execute(f"""
            SELECT id, date, category, amount, notes, type
            FROM transactions WHERE user_id={PLACEHOLDER} ORDER BY date
        """, (user_id,))
    
    rows = cur.fetchall()

    return jsonify({
        "transactions": [
            {"id": r[0], "date": r[1], "category": r[2], "amount": r[3], "notes": r[4], "type": r[5]}
            for r in rows
        ]
    })

@app.route("/predict")
@jwt_required()
def predict():
    user_id = int(get_jwt_identity())
    conn = get_connection()
    cur = conn.cursor()
    
    FIXED_CATS = ["Rent", "Bills", "Education", "Insurance", "Utilities", "Emi", "Loan"]
    today = datetime.now()
    this_month_str = today.strftime("%Y-%m")
    
    days_passed = max(today.day, 1)
    days_in_month = 30 # Simplified
    
    cur.execute(f"SELECT date, amount, category FROM transactions WHERE user_id={PLACEHOLDER} AND substr(date,1,7)={PLACEHOLDER} AND type='expense'", (user_id, this_month_str))
    rows = cur.fetchall()
    
    if not rows:
        return jsonify({"prediction": 0})
    
    fixed_total = 0
    variable_total = 0
    
    for r_date, r_amount, r_cat in rows:
        cat_norm = r_cat.strip().title() if r_cat else ""
        if cat_norm in FIXED_CATS:
            fixed_total += r_amount
        else:
            variable_total += r_amount
            
    effective_days = max(days_passed, 5)
    variable_avg_daily = variable_total / effective_days
    remaining_days = max(days_in_month - days_passed, 0)
    variable_predicted = variable_total + (variable_avg_daily * remaining_days)
    
    prediction = fixed_total + variable_predicted
    
    return jsonify({"prediction": round(prediction, 2)})

@app.route("/recommend-budget")
@jwt_required()
def recommend_budget_api():
    user_id = int(get_jwt_identity())
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(f"SELECT date, amount FROM transactions WHERE user_id={PLACEHOLDER}", (user_id,))
    rows = cur.fetchall()
    data = [{"date": r[0], "amount": r[1]} for r in rows]
    recommended = recommend_budget(data)
    return jsonify({"recommended_budget": recommended})

@app.route("/anomaly")
@jwt_required()
def anomaly():
    user_id = int(get_jwt_identity())
    return jsonify({"anomalies": detect_anomalies(user_id)})

@app.route("/forecast")
@jwt_required()
def forecast():
    user_id = int(get_jwt_identity())
    conn = get_connection()
    cur = conn.cursor()
    
    cutoff = (datetime.now() - timedelta(days=60)).strftime("%Y-%m-%d")
    cur.execute(f"SELECT date, amount, category FROM transactions WHERE user_id={PLACEHOLDER} AND date >= {PLACEHOLDER} AND type='expense'", (user_id, cutoff))
    rows = cur.fetchall()
    
    if not rows:
        return jsonify({"forecast": []})

    FIXED_CATS = ["Rent", "Bills", "Education", "Insurance", "Utilities"]
    variable_total = sum(r[1] for r in rows if r[2] not in FIXED_CATS)
    avg_daily_variable = variable_total / 60
    
    fixed_by_month = {}
    for r_date, r_amount, r_cat in rows:
        if r_cat in FIXED_CATS:
            m = r_date[:7]
            if m not in fixed_by_month: fixed_by_month[m] = 0
            fixed_by_month[m] += r_amount
    
    forecast_list = []
    start = datetime.now()
    
    for i in range(1, 31):
        fc_date_obj = start + timedelta(days=i)
        fc_date = fc_date_obj.strftime("%Y-%m-%d")
        forecast_list.append({"date": fc_date, "amount": round(avg_daily_variable, 2)})

    return jsonify({"forecast": forecast_list})

@app.route("/update/<int:id>", methods=["PUT"])
@jwt_required()
def update_transaction(id):
    user_id = int(get_jwt_identity())
    data = request.json
    conn = get_connection()
    cur = conn.cursor()

    transaction_type = data.get("type", "expense").lower()
    cur.execute(f"""
        UPDATE transactions
        SET date={PLACEHOLDER}, category={PLACEHOLDER}, amount={PLACEHOLDER}, notes={PLACEHOLDER}, type={PLACEHOLDER}
        WHERE id={PLACEHOLDER} AND user_id={PLACEHOLDER}
    """, (data["date"], data.get("category", ""), data["amount"], data.get("notes", ""), transaction_type, id, user_id))

    conn.commit()
    return jsonify({"status": "updated"}), 200

@app.route("/optimize-budget", methods=["GET"])
@jwt_required()
def optimize_budget():
    user_id = int(get_jwt_identity())
    month_param = request.args.get("month") # YYYY-MM
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(f"SELECT date, category, amount FROM transactions WHERE user_id={PLACEHOLDER} AND type='expense'", (user_id,))
    rows = cur.fetchall()
    if not rows:
        return jsonify([])

    cat_month_sums = {}
    all_categories = set()

    for r_date_str, r_cat, r_amount in rows:
        all_categories.add(r_cat)
        try:
            r_month = r_date_str[:7]
            if r_cat not in cat_month_sums:
                cat_month_sums[r_cat] = {}
            cat_month_sums[r_cat][r_month] = cat_month_sums[r_cat].get(r_month, 0) + r_amount
        except (TypeError, IndexError):
            pass

    today_month = datetime.now().strftime("%Y-%m")
    target_month = month_param if month_param else today_month

    cur.execute(f"SELECT amount FROM budget WHERE user_id={PLACEHOLDER} AND month={PLACEHOLDER}", (user_id, today_month))
    budget_row = cur.fetchone()
    total_budget = budget_row[0] if budget_row else 0

    FIXED_CATS = ["Rent", "Bills", "Education", "Insurance", "Utilities"]
    result = []

    for cat in all_categories:
        monthly_data = cat_month_sums.get(cat, {})
        avg_monthly_spend = sum(monthly_data.values()) / len(monthly_data) if monthly_data else 0
        category_recent_total = monthly_data.get(target_month, 0)

        # Condition 1: Spending is 20% higher than historical average
        if len(monthly_data) > 1 and avg_monthly_spend > 0 and category_recent_total > avg_monthly_spend * 1.2:
            diff = category_recent_total - avg_monthly_spend
            result.append({
                "category": cat,
                "message": f"Spending is ₹{round(diff)} above your monthly average. Try to scale back."
            })
        
        # Condition 2: Category consumes > 50% of total budget (EXCLUDE FIXED COSTS)
        elif total_budget > 0 and category_recent_total > total_budget * 0.5 and cat not in FIXED_CATS:
             result.append({
                "category": cat,
                "message": f"This category accounts for {round((category_recent_total/total_budget)*100)}% of your total budget."
            })

    return jsonify(result)

@app.route("/necessity-score", methods=["POST"])
@jwt_required()
def necessity_score():
    try:
        data = request.json
        score = 0
        
        if data.get("type") == "need":
            score += 50
        else:
            score += 20
        
        freq = data.get("frequency", "low")
        if freq == "high":
            score += 30
        elif freq == "medium":
            score += 20
        else:
            score += 10
        
        amount = float(data.get("amount", 0) or 0)
        budget = float(data.get("budget", 0) or 0)
        
        if budget > 0:
            ratio = amount / budget
            if ratio < 0.05:
                score += 40
            elif ratio < 0.15:
                score += 25
            else:
                score += 10
        else:
            score += 20
        
        decision = "BUY" if score >= 85 else "DELAY" if score >= 45 else "AVOID"
        
        return jsonify({
            "score": min(score, 100),
            "decision": decision
        }), 200
    except Exception as e:
        return jsonify({"msg": f"Error: {str(e)}"}), 500
        
@app.route("/category-efficiency", methods=["GET"])
@jwt_required()
def category_efficiency():
    user_id = int(get_jwt_identity())
    month = request.args.get("month")
    conn = get_connection()
    cur = conn.cursor()
    if month:
        cur.execute(f"SELECT category, amount FROM transactions WHERE user_id={PLACEHOLDER} AND substr(date,1,7)={PLACEHOLDER} AND type='expense'", (user_id, month))
    else:
        cur.execute(f"SELECT category, amount FROM transactions WHERE user_id={PLACEHOLDER} AND type='expense'", (user_id,))
    rows = cur.fetchall()

    cat_stats = {}
    for r_cat, r_amount in rows:
        if r_cat not in cat_stats:
            cat_stats[r_cat] = [0, 0]
        cat_stats[r_cat][0] += r_amount
        cat_stats[r_cat][1] += 1

    FIXED_CATS = ["Rent", "Bills", "Education", "Insurance", "Utilities"]
    results = []
    for cat, stats in cat_stats.items():
        total, count = stats[0], stats[1]

        if cat in FIXED_CATS:
            level = "Fixed"
        elif total == 0 or count == 0:
            level = "N/A"
        else:
            avg = total / count
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
    
    cur.execute(f"SELECT date, amount, type FROM transactions WHERE user_id={PLACEHOLDER}", (user_id,))
    tx_rows = cur.fetchall()
    
    cur.execute(f"SELECT month, amount FROM budget WHERE user_id={PLACEHOLDER}", (user_id,))
    budget_rows = cur.fetchall()
    
    if not tx_rows and not budget_rows:
        return jsonify({"total_savings": 0, "history": []})

    monthly_spent = {}
    monthly_income = {}
    for r_date_str, r_amount, r_type in tx_rows:
        try:
            r_month = r_date_str[:7]
            if r_type == 'income':
                monthly_income[r_month] = monthly_income.get(r_month, 0) + r_amount
            else:
                monthly_spent[r_month] = monthly_spent.get(r_month, 0) + r_amount
        except (TypeError, IndexError):
            pass

    budgets = {b[0]: b[1] for b in budget_rows}
    all_months = set(list(monthly_spent.keys()) + list(budgets.keys()) + list(monthly_income.keys()))
    
    current_month_str = datetime.now().strftime("%Y-%m")
    history = []
    total_savings = 0
    
    for m in sorted(list(all_months), reverse=True):
        budget = budgets.get(m, 0)
        spent = monthly_spent.get(m, 0)
        income = monthly_income.get(m, 0)
        
        savings = (budget - spent) + income
        if m < current_month_str:
            total_savings += savings
        
        history.append({
            "month": m, 
            "budget": budget, 
            "spent": spent, 
            "income": income, 
            "savings": savings
        })
    
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
    port = int(os.environ.get("PORT", 5000))
    is_development = os.environ.get("FLASK_ENV") == "development"
    
    app.run(
        host="0.0.0.0",
        port=port,
        debug=is_development
    )
