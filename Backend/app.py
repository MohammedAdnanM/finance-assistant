from flask import Flask, request, jsonify
from flask_cors import CORS
from db import get_connection, init_db
from utils import detect_anomalies, recommend_budget

import pandas as pd
import pickle

app = Flask(__name__)
CORS(app)

init_db()

# Load model if exists
try:
    model = pickle.load(open("model.pkl", "rb"))
except:
    model = None

@app.route("/delete/<int:id>", methods=["DELETE"])
def delete_tx(id):
    print("DELETE REQUEST RECEIVED FOR ID:", id)

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("DELETE FROM transactions WHERE id=?", (id,))
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
def set_budget():
    data = request.json
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("REPLACE INTO budget VALUES (?,?)",
                (data["month"], data["amount"]))
    conn.commit()
    return jsonify({"status":"ok"})

@app.route("/budget/<month>")
def get_budget(month):
    conn = get_connection()
    cur = conn.cursor()
    row = cur.execute("SELECT amount FROM budget WHERE month=?",(month,)).fetchone()
    return jsonify({"budget": row[0] if row else 0})





@app.route("/add", methods=["POST"])
def add_transaction():
    data = request.json
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO transactions (date, category, amount)
        VALUES (?, ?, ?)
    """, (data["date"], data["category"], data["amount"]))

    conn.commit()
    return jsonify({"status": "success"}), 200

@app.route("/transactions", methods=["GET"])
def get_transactions():
    month = request.args.get("month")  # YYYY-MM
    conn = get_connection()
    cur = conn.cursor()

    if month:
        rows = cur.execute("""
            SELECT id, date, category, amount
            FROM transactions
            WHERE substr(date,1,7)=?
            ORDER BY date
        """, (month,)).fetchall()
    else:
        rows = cur.execute("""
            SELECT id, date, category, amount
            FROM transactions ORDER BY date
        """).fetchall()

    return jsonify({
        "transactions": [
            {"id": r[0], "date": r[1], "category": r[2], "amount": r[3]}
            for r in rows
        ]
    })


@app.route("/predict")
def predict():
    conn = get_connection()
    df = pd.read_sql("SELECT date, amount FROM transactions", conn)
    if df.empty:
        return jsonify({"prediction":0})

    df["date"] = pd.to_datetime(df["date"])
    last_month = df[df.date >= (pd.Timestamp.today()-pd.Timedelta(days=30))]
    prediction = last_month.amount.mean() * 30

    return jsonify({"prediction": round(prediction,2)})

@app.route("/recommend-budget")
def recommend_budget_api():
    conn = get_connection()
    df = pd.read_sql("SELECT date, amount FROM transactions", conn)

    recommended = recommend_budget(df)
    return jsonify({"recommended_budget": recommended})


### Anomaly Highlight
@app.route("/anomaly")
def anomaly():
    return jsonify({"anomalies": detect_anomalies()})

if __name__ == "__main__":
    app.run(debug=True)
