import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";

import {
  HomeIcon, ReceiptPercentIcon, ChartBarIcon,
  Cog6ToothIcon, ArrowLeftStartOnRectangleIcon
} from "@heroicons/react/24/solid";

export default function App() {
  const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000";

  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loggedIn, setLoggedIn] = useState(() => localStorage.getItem("user") === "true");

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [recommendedBudget, setRecommendedBudget] = useState(null);

  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");

  const [transactions, setTransactions] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [anomalies, setAnomalies] = useState([]);

  const [budget, setBudget] = useState(0);
  const [spent, setSpent] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const categoriesList = [
    "Food","Fuel","Shopping","Rent","Bills","Medicine","Travel","Entertainment"
  ];

  /* ---------------- AUTH ---------------- */
  function loginHandler() {
    if (email && pass) {
      localStorage.setItem("user", "true");
      setLoggedIn(true);
    }
  }

  function logoutHandler() {
    localStorage.removeItem("user");
    setLoggedIn(false);
  }

  /* ---------------- API ---------------- */
  async function fetchTransactions() {
    const res = await fetch(`${API_BASE}/transactions?month=${month}`);
    const data = await res.json();
    setTransactions(data.transactions || []);
  }

  async function addTransaction(e) {
    e.preventDefault();
    if (!date || !category || !amount) return;

    await fetch(`${API_BASE}/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        category,
        amount: parseFloat(amount)
      })
    });

    setDate("");
    setCategory("");
    setAmount("");
    fetchTransactions();
    getPrediction();
    getAnomalies();
  }

  async function deleteTransaction(id) {
    await fetch(`${API_BASE}/delete/${id}`, { method: "DELETE" });
    fetchTransactions();
    getPrediction();
    getAnomalies();
  }

  async function getPrediction() {
    const res = await fetch(`${API_BASE}/predict`);
    const data = await res.json();
    setPrediction(data.prediction);
  }

  async function getRecommendedBudget() {
  const res = await fetch(`${API_BASE}/recommend-budget`);
  const data = await res.json();
  setRecommendedBudget(data.recommended_budget);
}


  async function getAnomalies() {
    const res = await fetch(`${API_BASE}/anomaly`);
    const data = await res.json();
    setAnomalies(data.anomalies || []);
  }

  async function fetchBudget() {
    const res = await fetch(`${API_BASE}/budget/${month}`);
    const data = await res.json();
    setBudget(data.budget || 0);
  }

  async function saveBudget(value) {
    setBudget(value);
    await fetch(`${API_BASE}/budget`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month, amount: parseFloat(value) })
    });
  }

  /* ---------------- EFFECTS ---------------- */
  useEffect(() => {
    if (loggedIn) {
      fetchTransactions();
      fetchBudget();
      getPrediction();
      getAnomalies();
      getRecommendedBudget();
    }
  }, [loggedIn, month]);

  useEffect(() => {
    const total = transactions.reduce((s, t) => s + Number(t.amount), 0);
    setSpent(total);
  }, [transactions]);

  function categoryTotals(list) {
    const totals = {};
    list.forEach(t => totals[t.category] = (totals[t.category] || 0) + Number(t.amount));
    return Object.keys(totals).map(k => ({ category: k, total: totals[k] }));
  }

  function downloadPDF() {
    const doc = new jsPDF();
    doc.text("Monthly Finance Summary", 14, 20);

    autoTable(doc, {
      startY: 30,
      head: [["Date","Category","Amount"]],
      body: transactions.map(t => [t.date, t.category, `₹${t.amount}`])
    });

    doc.save("Finance-Summary.pdf");
  }

  /* ---------------- LOGIN UI ---------------- */
  if (!loggedIn) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <div className="bg-gray-900 p-8 rounded-xl w-96">
          <h1 className="text-2xl mb-6 text-center">Finance Assistant</h1>
          <input className="w-full mb-3 p-2 bg-gray-800"
            placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input className="w-full mb-4 p-2 bg-gray-800"
            placeholder="Password" type="password"
            value={pass} onChange={e => setPass(e.target.value)} />
          <button onClick={loginHandler}
            className="w-full bg-blue-600 p-2 rounded">
            Login
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- MAIN UI ---------------- */
  return (
    <div className="min-h-screen flex bg-[#0d1117] text-white">

      {/* SIDEBAR */}
      <aside className="w-64 bg-[#111827] p-6 space-y-6">
        <h1 className="text-3xl font-bold">Finora</h1>

        <nav className="space-y-3 text-gray-400">
          <button className="flex gap-2 hover:text-white"><HomeIcon className="h-5" /> Dashboard</button>
          <button className="flex gap-2 hover:text-white"><ReceiptPercentIcon className="h-5" /> Transactions</button>
          <button className="flex gap-2 hover:text-white"><ChartBarIcon className="h-5" /> Analytics</button>
          <button className="flex gap-2 hover:text-white"><Cog6ToothIcon className="h-5" /> Settings</button>
        </nav>

        <button onClick={logoutHandler}
          className="w-full bg-red-600 p-2 rounded flex gap-2 justify-center">
          <ArrowLeftStartOnRectangleIcon className="h-5" /> Logout
        </button>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 p-10 space-y-12 overflow-y-auto">

        {/* TOP DASHBOARD SECTION */}
<section className="bg-[#111827] border border-gray-800 rounded-2xl p-8 space-y-8">

  {/* TOP ROW */}
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
    <div>
      <h2 className="text-4xl font-bold">Welcome Back 👋</h2>
      <p className="text-gray-400 mt-1">
        Track your expenses, monitor spending, and forecast the future.
      </p>
    </div>

    <div className="flex items-center gap-3">
      <label className="text-gray-400">Month</label>
      <input
        type="month"
        value={month}
        onChange={(e) => setMonth(e.target.value)}
        className="p-3 rounded-xl bg-gray-800 border border-gray-700"
      />
    </div>
  </div>

  {/* BUDGET */}
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
    <div>
      <p className="text-gray-400 text-sm">Monthly Budget</p>
      <input
        type="number"
        value={budget}
        onChange={(e) => saveBudget(e.target.value)}
        className="mt-2 p-3 rounded-xl bg-gray-800 border border-gray-700 w-56"
      />
    </div>
   
   
    {recommendedBudget > 0 && (
          <div className="flex items-center justify-between bg-[#0d1117] p-4 rounded-xl border border-gray-800">
            <p className="text-gray-400">
              Recommended Budget:
              <span className="text-green-400 font-bold ml-2">
                ₹ {recommendedBudget}
              </span>
            </p>

            <button
              onClick={() => saveBudget(recommendedBudget)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-xl"
            >
              Apply
            </button>
          </div>
        )}


    <div className="text-sm">
      <p>
        Spent: <span className="text-blue-400 font-semibold">₹ {spent}</span>
      </p>
      <p>
        Remaining:{" "}
        <span className="text-green-400 font-semibold">
          ₹ {budget - spent}
        </span>
      </p>
    </div>
  </div>

  {/* STATS */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600">
      <p className="text-sm opacity-80">Predicted Expense</p>
      <p className="text-4xl font-bold mt-2">₹ {prediction ?? "—"}</p>
    </div>

    <div className="p-6 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-600">
      <p className="text-sm opacity-80">Total Transactions</p>
      <p className="text-4xl font-bold mt-2">{transactions.length}</p>
    </div>

    <div className="p-6 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700">
      <p className="text-sm opacity-80">Anomalies</p>
      <p className="text-4xl font-bold mt-2">{anomalies.length}</p>
    </div>
  </div>

</section>


        {/* ADD TRANSACTION */}
        <section className="bg-[#111827] border border-gray-800 rounded-2xl p-8">
          <h3 className="text-2xl font-semibold mb-6">Add Transaction</h3>

          <form onSubmit={addTransaction}
            className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">

            <input type="date" value={date}
              onChange={e => setDate(e.target.value)}
              className="p-3 bg-gray-800 rounded-xl" />

            {/* <input placeholder="Category" value={category}
              onChange={e => setCategory(e.target.value)}
              className="p-3 bg-gray-800 rounded-xl" /> */}
              <div className="relative">
                    <input
                      placeholder="Category"
                      value={category}
                      onFocus={() => setShowSuggestions(true)}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        setShowSuggestions(true);
                      }}
                      className="p-3 bg-gray-800 rounded-xl w-full"
                    />

                    {showSuggestions && (
                      <div className="absolute z-10 mt-2 w-full bg-gray-900 border border-gray-700 rounded-xl shadow-xl">
                        {categoriesList.map((c, i) => (
                          <div
                            key={i}
                            className="p-3 hover:bg-gray-800 cursor-pointer"
                            onClick={() => {
                              setCategory(c);
                              setShowSuggestions(false);
                            }}
                          >
                            {c}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>


            <input type="number" placeholder="Amount" value={amount}
              onChange={e => setAmount(e.target.value)}
              className="p-3 bg-gray-800 rounded-xl" />

            <button type="submit"
              className="h-12 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold">
              Add
            </button>
          </form>
        </section>

        {/* PDF */}
        <div className="flex justify-end">
          <button onClick={downloadPDF}
            className="px-5 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl">
            Download Monthly Summary PDF
          </button>
        </div>

        {/* ANALYTICS */}
        <section className="bg-[#111827] border border-gray-800 rounded-2xl p-8 space-y-6">
          <h3 className="text-2xl font-semibold">Spending Analytics</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#0d1117] p-6 rounded-xl border border-gray-800">
              <LineChart width={400} height={300} data={transactions}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip />
                <Line dataKey="amount" stroke="#3B82F6" strokeWidth={3} />
              </LineChart>
            </div>

            <div className="bg-[#0d1117] p-6 rounded-xl border border-gray-800">
              <BarChart width={400} height={300} data={categoryTotals(transactions)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="category" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip />
                <Bar dataKey="total" fill="#10B981" />
              </BarChart>
            </div>
          </div>
        </section>

        {/* TRANSACTIONS */}
        <section className="bg-[#111827] border border-gray-800 rounded-2xl p-8">
          <h3 className="text-2xl font-semibold mb-4">Transactions</h3>

          <table className="w-full border border-gray-800 rounded-xl overflow-hidden">
            <thead className="bg-gray-800 text-gray-300">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Category</th>
                <th className="p-4">Amount</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-gray-500">
                    No transactions yet
                  </td>
                </tr>
              ) : (
                transactions.map(t => (
                  <tr key={t.id}
                    className={`border-t border-gray-800 hover:bg-gray-800/40 ${
                      anomalies.includes(t.id) ? "bg-red-900/40" : ""
                    }`}>
                    <td className="p-4">{t.date}</td>
                    <td className="p-4">{t.category}</td>
                    <td className="p-4 text-blue-300 font-semibold">₹ {t.amount}</td>
                    <td className="p-4 text-center">
                      <button onClick={() => deleteTransaction(t.id)}
                        className="px-4 py-1 bg-red-600 hover:bg-red-700 rounded-xl">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

      </main>
    </div>
  );
}
