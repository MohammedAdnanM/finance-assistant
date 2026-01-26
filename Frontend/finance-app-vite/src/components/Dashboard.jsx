/**
 * Dashboard Component
 * Process: Main application controller. Manages state (transactions, budget, auth, predictions), fetches data from API, and orchestrates the display of all sub-components.
 * Main Functionality:
 *  - Fetches and manages global state (Transactions, Budget, Stats)
 *  - Orchestrates layout (Sidebar, Header, Content)
 *  - Handles API communication (CRUD operations)
 */
import React, { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

// Components
// Components
import Sidebar from "./Sidebar";
import Header from "./Header";
import StatsCards from "./StatsCards";
import SmartInsights from "./SmartInsights";
import TransactionForm from "./TransactionForm";
import TransactionList from "./TransactionList";
import Analytics from "./Analytics";
import Forecast from "./Forecast";
import ChatCoach from "./ChatCoach";

// Utils
import { success, error } from "../utils/toast";
import { api } from "../utils/api";

export default function Dashboard({ logoutHandler }) {
  const [lastDeleted, setLastDeleted] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [forecast, setForecast] = useState([]);
  const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000";

  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  
  // State from App.jsx that is local to Dashboard now
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

  const [optimizations, setOptimizations] = useState([]);
  const [efficiency, setEfficiency] = useState([]);
  const [necessityResult, setNecessityResult] = useState(null);
  const [necessityType, setNecessityType] = useState("want");
  const [necessityFrequency, setNecessityFrequency] = useState("low");

  const categoriesList = [
    "Food",
    "Fuel",
    "Shopping",
    "Rent",
    "Bills",
    "Medicine",
    "Travel",
    "Entertainment",
    "Education",
    "Health",
    "Utilities"
  ];

  /* ---------------- API ---------------- */
  async function fetchOptimization() {
    const res = await api.get(`/optimize-budget?month=${month}`);
    if (res && res.ok) setOptimizations(await res.json());
  }

  async function fetchEfficiency() {
    const res = await api.get(`/category-efficiency?month=${month}`);
    if (res && res.ok) setEfficiency(await res.json());
  }

  async function checkNecessity() {
    if (!amount) {
        error("Please enter an amount first");
        return;
    }
    const res = await api.post("/necessity-score", {
        type: necessityType,
        frequency: necessityFrequency,
        amount: Number(amount || 0),
        budget,
    });
    if (res && res.ok) setNecessityResult(await res.json());
  }

  async function fetchTransactions() {
    const res = await api.get(`/transactions?month=${month}`);
    if (res && res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
    }
  }

  async function addTransaction(e) {
    if (e) e.preventDefault();

    if (!date || !category || !amount) {
      error("All fields required");
      return;
    }

    const payload = {
      date,
      category,
      amount: parseFloat(amount),
    };

    const endpoint = editingId ? `/update/${editingId}` : `/add`;
    const method = editingId ? "put" : "post";

    const res = await api[method](endpoint, payload);

    if (res && res.ok) {
        success(editingId ? "Transaction updated" : "Transaction added");
        if (!editingId) {
             // Optional: keep category for bulk entry?
        }
        setAmount("");
        setEditingId(null);
        
        // Refresh all data
        fetchTransactions();
        getAnomalies();
        getPrediction();
        fetchOptimization();
        fetchEfficiency();
    } else {
        error("Operation failed");
    }
  }

  async function deleteTransaction(tx) {
    // Optimistically remove from UI
    setTransactions((prev) => prev.filter((t) => t.id !== tx.id));
    setLastDeleted(tx);

    const res = await api.delete(`/delete/${tx.id}`);

    if (!res || !res.ok) {
        error("Delete failed");
        setTransactions((prev) => [...prev, tx]); // Revert
        setLastDeleted(null);
        return;
    }

    success(
        <span>
            Transaction deleted —
            <button onClick={undoDelete} className="ml-2 underline text-white font-bold">
            Undo
            </button>
        </span>
    );
    getAnomalies();
    getPrediction();
  }

  async function undoDelete() {
    if (!lastDeleted) return;

    const res = await api.post("/add", lastDeleted);

    if (res && res.ok) {
        setLastDeleted(null);
        fetchTransactions();
        success("Transaction restored");
    } else {
        error("Undo failed");
    }
  }

  async function getPrediction() {
    const res = await api.get("/predict");
    if (res && res.ok) {
        const data = await res.json();
        setPrediction(data.prediction);
    }
  }

  async function getRecommendedBudget() {
    const res = await api.get("/recommend-budget");
    if (res && res.ok) {
      const data = await res.json();
      setRecommendedBudget(data.recommended_budget ?? null);
    } else {
      setRecommendedBudget(null);
    }
  }

  async function getAnomalies() {
    const res = await api.get("/anomaly");
    if (res && res.ok) {
        const data = await res.json();
        setAnomalies(data.anomalies || []);
    }
  }

  async function fetchBudget() {
    const res = await api.get(`/budget/${month}`);
    if (res && res.ok) {
        const data = await res.json();
        setBudget(data.budget || 0);
    }
  }

  async function saveBudget(value) {
    setBudget(value);
    const res = await api.post("/budget", { month, amount: parseFloat(value) });
    if (!res || !res.ok) error("Failed to save budget");
  }

  async function getForecast() {
    const res = await api.get("/forecast");
    if (res && res.ok) {
        const data = await res.json();
        setForecast(data.forecast || []);
    }
  }

  /* ---------------- HELPERS ---------------- */
  function editTransaction(t) {
    setEditingId(t.id);
    setDate(t.date);
    setCategory(t.category);
    setAmount(t.amount);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setDate(`${month}-01`);
    setCategory("");
    setAmount("");
  }

  /* ---------------- EFFECTS ---------------- */
  useEffect(() => {
      fetchTransactions();
      fetchBudget();
      getPrediction();
      getAnomalies();
      getRecommendedBudget();
      getForecast();
      fetchOptimization();
      fetchEfficiency();
      setDate(`${month}-01`);
  }, [month]);

  useEffect(() => {
    const total = transactions.reduce((s, t) => s + Number(t.amount), 0);
    setSpent(total);
  }, [transactions]);


  /* ---------------- RENDER ---------------- */
  return (
    <div className="min-h-screen flex bg-gray-50 text-black dark:bg-[#0d1117] dark:text-white font-sans">
      
      {/* SIDEBAR */}
      <Sidebar />

      {/* CONTENT */}
      <main className="flex-1 overflow-y-auto">
        <Toaster position="bottom-right" />
        
        {/* HEADER */}
        <Header 
            month={month} 
            setMonth={setMonth} 
            logoutHandler={logoutHandler}
            budget={budget}
            saveBudget={saveBudget}
            recommendedBudget={recommendedBudget}
            spent={spent}
        />

        {/* STATS */}
        <StatsCards 
            budget={budget}
            prediction={prediction}
            transactions={transactions}
            anomalies={anomalies}
        />

        {/* FORM & INSIGHTS GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-2 items-start gap-0 mb-8">
            <TransactionForm 
                addTransaction={addTransaction}
                date={date}
                setDate={setDate}
                month={month}
                category={category}
                setCategory={setCategory}
                amount={amount}
                setAmount={setAmount}
                showSuggestions={showSuggestions}
                setShowSuggestions={setShowSuggestions}
                categoriesList={categoriesList}
                editingId={editingId}
                cancelEdit={cancelEdit}
            />
            <SmartInsights 
                optimizations={optimizations}
                efficiency={efficiency}
                necessityResult={necessityResult}
                checkNecessity={checkNecessity}
                resetNecessity={() => setNecessityResult(null)}
                necessityType={necessityType}
                setNecessityType={setNecessityType}
                necessityFrequency={necessityFrequency}
                setNecessityFrequency={setNecessityFrequency}
                amount={amount}
            />
        </div>

        {/* ANALYTICS & LIST GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-0">
             <div className="xl:col-span-5">
                <Analytics transactions={transactions} />
             </div>
             <div className="xl:col-span-7">
                <TransactionList 
                    transactions={transactions}
                    anomalies={anomalies}
                    editTransaction={editTransaction}
                    deleteTransaction={deleteTransaction}
                />
             </div>
        </div>

        {/* FORECAST */}
        <Forecast forecast={forecast} />

        <ChatCoach />
      </main>
    </div>
  );
}
