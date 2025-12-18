import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { success, error } from "./utils/toast";
import {
  ResponsiveContainer,
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";

import {
  HomeIcon, ReceiptPercentIcon, ChartBarIcon,
  Cog6ToothIcon, ArrowLeftStartOnRectangleIcon
} from "@heroicons/react/24/solid";

export default function App() {

  const [editingId, setEditingId] = useState(null);

  const [forecast, setForecast] = useState([]);
  const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000";

  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loggedIn, setLoggedIn] = useState(() => localStorage.getItem("user") === "true");

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [recommendedBudget, setRecommendedBudget] = useState(null);

  const [date, setDate] = useState(`${month}-01`);
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

      if (!date || !category || !amount) {
        error("All fields required");
        return;
      }

      const payload = {
        date,
        category,
        amount: parseFloat(amount)
      };

      const url = editingId
        ? `${API_BASE}/update/${editingId}`
        : `${API_BASE}/add`;

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        error("Operation failed");
        return;
      }

      success(editingId ? "Transaction updated" : "Transaction added");

      setDate("");
      setCategory("");
      setAmount("");
      setEditingId(null);

      fetchTransactions();
      getAnomalies();
      getPrediction();
    }


  async function deleteTransaction(id) {
  const res = await fetch(`${API_BASE}/delete/${id}`, {
    method: "DELETE"
  });

  if (!res.ok) {
    error("Delete failed");
    return;
  }

  success("Transaction deleted");
  fetchTransactions();
  getAnomalies();
  getPrediction();
}


  async function getPrediction() {
    const res = await fetch(`${API_BASE}/predict`);
    const data = await res.json();
    setPrediction(data.prediction);
  }

  async function getRecommendedBudget() {
  try {
        const res = await fetch(`${API_BASE}/recommend-budget`);
        if (!res.ok) {
          setRecommendedBudget(null);
          return;
        }
        const data = await res.json();
        setRecommendedBudget(data.recommended_budget ?? null);
      } catch {
        setRecommendedBudget(null);
      }
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

  async function getForecast() {
  const res = await fetch(`${API_BASE}/forecast`);
  const data = await res.json();
  setForecast(data.forecast || []);
}


  /* ---------------- EFFECTS ---------------- */
  useEffect(() => {
    if (loggedIn) {
      fetchTransactions();
      fetchBudget();
      getPrediction();
      getAnomalies();
      getRecommendedBudget();
      getForecast();
      setDate(`${month}-01`);
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
      <aside className="w-20 hover:w-64 transition-all duration-300 bg-[#111827] p-6 flex flex-col group">


        <h1 className="text-3xl font-bold hidden group-hover:block">
          Finora
        </h1>

    <div className="flex-1">
        <nav className="space-y-3 text-gray-400 ">
         <button className="flex items-center gap-3 text-gray-400 hover:text-white">
            <HomeIcon className="h-5 min-w-[20px]" />
            <span className="hidden group-hover:inline">Dashboard</span>
          </button>
          <button className="flex items-center gap-3 text-gray-400 hover:text-white">
            <ReceiptPercentIcon className="h-5 min-w-[20px]" />
            <span className="hidden group-hover:inline">Transactions</span>
          </button>
          <button className="flex items-center gap-3 text-gray-400 hover:text-white">
            <ChartBarIcon className="h-5 min-w-[20px]" />
            <span className="hidden group-hover:inline">Analytics</span>
          </button>
          <button className="flex items-center gap-3 text-gray-400 hover:text-white">
            <Cog6ToothIcon className="h-5 min-w-[20px]" />
            <span className="hidden group-hover:inline">Settings</span>
          </button>
        </nav>
    </div>
        

      </aside>

      {/* CONTENT */}
      <main className="flex-1 p-10 space-y-12 overflow-y-auto">

        {/* TOP DASHBOARD SECTION */}
        <header className="sticky top-0 z-20 bg-[#0d1117]/90 backdrop-blur border-b border-gray-800">
<section className="bg-[#111827] border border-gray-800 rounded-2xl px-8 py-4 space-y-5">


  {/* TOP ROW */}
  <div className="flex items-center justify-between">
  {/* Left */}
  <div>
    <h2 className="text-2xl font-semibold tracking-tight">Welcome Back 👋</h2>
  </div>

  {/* Right */}
  <div className="flex items-center gap-4">
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500">Month</span>
      <input
        type="month"
        value={month}
        onChange={(e) => setMonth(e.target.value)}
        className="h-9 px-3 rounded-lg bg-gray-800 border border-gray-700 text-sm"
      />
    </div>

    <button
      onClick={logoutHandler}
      className="flex items-center gap-2 px-3 py-2
                 rounded-lg text-sm
                 text-red-400 hover:text-red-500
                 hover:bg-red-500/10 transition"
    >
      <ArrowLeftStartOnRectangleIcon className="h-4" />
      <span className="hidden md:inline">Logout</span>
    </button>
  </div>
</div>

    

  {/* BUDGET */}
  <div className="flex items-center justify-between gap-8">
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
          <div className="flex items-center gap-6 bg-[#0d1117] p-4 rounded-xl border border-gray-800">
            <p className="text-gray-400 whitespace-nowrap">
              Recommended Budget:
              <span className="text-green-400 font-bold ml-2">
                ₹ {recommendedBudget}
              </span>
            </p>

            <button
              onClick={() => saveBudget(recommendedBudget)}
              className="px-5 py-2 bg-green-600 hover:bg-green-700 rounded-xl"
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
        <span className={budget - spent < 0 ? "text-red-400" : "text-green-400"}>
          ₹ {budget - spent}
        </span>
      </p>
    </div>
  </div>
  </section>
</header>
  {/* STATS */}
  <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
  <div className="stat-card blue">
    <p>Monthly Budget</p>
    <h2>₹{budget}</h2>
  </div>

  <div className="stat-card purple">
    <p>Predicted Expense</p>
    <h2>₹{prediction}</h2>
  </div>

  <div className="stat-card green">
    <p>Total Transactions</p>
    <h2>{transactions.length}</h2>
  </div>

  <div className="stat-card red">
    <p>Anomalies</p>
    <h2>{anomalies.length}</h2>
  </div>
  </section>


{/* </section> */}


        {/* ADD TRANSACTION */}
        <section className="bg-[#111827] border border-gray-800 rounded-2xl p-8">
          <h3 className="text-2xl font-semibold mb-6">Add Transaction</h3>

          <form onSubmit={addTransaction}
            className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">

            <input
                  type="date"
                  value={date}
                  min={`${month}-01`}
                  max={`${month}-31`}
                  onChange={e => setDate(e.target.value)}
                  className="p-3 bg-gray-800 rounded-xl"
                />
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
              {editingId ? "Update" : "Add"}
            </button>

            {editingId && (
              <button type="button"onClick={() => {
                  setEditingId(null);
                  setDate(`${month}-01`);
                  setCategory("");
                  setAmount("");
                }}
                className="h-12 px-4 bg-gray-600 hover:bg-gray-700 rounded-xl"
              >
                Cancel
              </button>
            )}

          </form>
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
                 <tr
                        key={t.id}
                        className={`border-t border-gray-800 hover:bg-gray-800/40 ${
                          anomalies.includes(t.id) ? "bg-red-900/30" : ""
                        }`}
                      >
                        {/* DATE */}
                        <td className="p-4">{t.date}</td>

                        {/* CATEGORY */}
                        <td className="p-4">{t.category}</td>

                        {/* AMOUNT */}
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="text-blue-300 font-semibold">₹ {t.amount}</span>

                            {anomalies.includes(t.id) && (
                              <span className="text-xs px-2 py-0.5 rounded-full
                                              bg-red-600/20 text-red-400 border border-red-600/40">
                                Anomaly
                              </span>
                            )}
                          </div>
                        </td>

                        {/* ACTION */}
                        <td className="p-4 text-center">
                          <button
                            onClick={() => {
                              setEditingId(t.id);
                              setDate(t.date);
                              setCategory(t.category);
                              setAmount(t.amount);
                            }}
                            className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 rounded-xl mr-2"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => deleteTransaction(t.id)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-xl"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>

                ))
              )}
            </tbody>
          </table>
        </section>


        {/* PDF */}
        <div className="flex justify-end mt-2">
          <button
              onClick={downloadPDF}
              className="flex items-center gap-2 px-6 py-3 rounded-xl
                        bg-gradient-to-r from-purple-600 to-indigo-600
                        hover:from-purple-700 hover:to-indigo-700
                        shadow-lg shadow-purple-900/30
                        transition-all duration-200
                        active:scale-95"
            >
              <span className="text-sm font-semibold">
                Download Monthly Summary
              </span>
              <span className="text-xs opacity-80">PDF</span>
            </button>

        </div>

        {/* ANALYTICS */}
        <section className="bg-[#111827] border border-gray-800 rounded-2xl p-8 space-y-6">
          <h3 className="text-2xl font-semibold">Spending Analytics</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#0d1117] p-6 rounded-xl border border-gray-800">
              <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={transactions}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip />
                    <Line dataKey="amount" stroke="#3B82F6" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>

            </div>

            <div className="bg-[#0d1117] p-6 rounded-xl border border-gray-800">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryTotals(transactions)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="category" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip />
                  <Bar dataKey="total" fill="#10B981" />
                  <Bar dataKey="total" fill="url(#colorTotal)" />

                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#34d399"/>
                          <stop offset="100%" stopColor="#059669"/>
                        </linearGradient>
                      </defs>

                </BarChart>
              </ResponsiveContainer>

            </div>
          </div>
        </section>
{/* forecast graph */}
      <section className="bg-[#111827] border border-gray-800 rounded-2xl p-8 space-y-4">
              <h3 className="text-2xl font-semibold">30-Day Expense Forecast</h3>

              {forecast.length === 0 ? (
                <p className="text-gray-500">Not enough data to forecast</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={forecast}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#a855f7"
                      strokeWidth={3}
                      strokeDasharray="6 4"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </section>

        

      </main>
    </div>
  );
}
