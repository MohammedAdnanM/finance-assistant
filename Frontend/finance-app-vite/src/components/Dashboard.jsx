/**
 * Dashboard Component
 * Process: Main application controller. Manages state (transactions, budget, auth, predictions), fetches data from API, and orchestrates the display of all sub-components.
 *
 * Updated Functionality:
 *  - Premium Obsidian UI: Deep dark mode with indigo/teal gradients and glassmorphism.
 *  - Micro-Animations: Staggered entrance animations and tactile feedback.
 *  - Intelligent AI Coaching: Integrated with Google Gemini for context-aware financial advice.
 *  - Optimized Layout: Zero-gap dual-column grid for streamlined data visualization.
 *  - Robust Undo: Fault-tolerant transaction restoration with real-time UI notifications.
 */
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

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
import Savings from "./Savings";
import MobileNav from "./MobileNav";

// Utils
import { success, error } from "../utils/toast";
import { api } from "../utils/api";

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

export default function Dashboard({ logoutHandler, user }) {
  const [lastDeleted, setLastDeleted] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [forecast, setForecast] = useState([]);
  const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000";

  const [activeTab, setActiveTab] = useState("overview");
  const [savingsData, setSavingsData] = useState({ total_savings: 0, history: [] });
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
    try {
        const res = await api.post("/necessity-score", {
            type: necessityType,
            frequency: necessityFrequency,
            amount: Number(amount || 0),
            budget,
        });
        
        if (res && res.ok) {
            const data = await res.json();
            setNecessityResult(data);
            success("Analysis complete!");
        } else {
            error("Failed to analyze purchase");
        }
    } catch (err) {
        console.error("Necessity check error:", err);
        error("Error analyzing purchase");
    }
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
        getSavings();
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

    // Capture the ID of the toast to dismiss it later
    const tId = toast.success(
        <div className="flex items-center gap-3">
            <span>Transaction deleted</span>
            <button 
                onClick={() => {
                    undoDelete(tx, tId);
                }} 
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
            >
                Undo
            </button>
        </div>,
        { duration: 5000 }
    );

    getAnomalies();
    getPrediction();
    getSavings();
  }

  async function undoDelete(txToRestore, tId) {
    if (!txToRestore) return;

    const res = await api.post("/add", txToRestore);

    if (res && res.ok) {
        if (tId) toast.dismiss(tId);
        setLastDeleted(null);
        fetchTransactions();
        getSavings();
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

  async function getSavings() {
    const res = await api.get("/savings");
    if (res && res.ok) {
        setSavingsData(await res.json());
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
      getSavings();
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
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        healthScore={(() => {
            if (budget === 0) return { score: 0, label: "No Budget Set", color: "gray" };
            const ratio = (spent / budget) * 100;
            if (ratio > 100) return { score: Math.max(0, 100 - (ratio - 100)), label: "Over Budget", color: "red" };
            if (ratio > 85) return { score: 70, label: "At Risk", color: "yellow" };
            if (ratio > 50) return { score: 85, label: "Healthy", color: "indigo" };
            return { score: 95, label: "Excellent", color: "emerald" };
        })()}
      />

      {/* CONTENT */}
      <main className="flex-1 overflow-y-auto">
        <Toaster 
            position="bottom-right" 
            toastOptions={{
                className: 'glass !bg-obsidian !text-white border border-white/10 !rounded-2xl',
                style: {
                    background: '#161b22',
                    color: '#fff',
                    borderRadius: '1rem',
                    border: '1px solid rgba(255,255,255,0.1)'
                },
                success: {
                    iconTheme: {
                        primary: '#10b981',
                        secondary: '#fff',
                    },
                },
            }}
        />
        
        {/* HEADER */}
        <Header 
            month={month} 
            setMonth={setMonth} 
            logoutHandler={logoutHandler}
            budget={budget}
            saveBudget={saveBudget}
            recommendedBudget={recommendedBudget}
            spent={spent}
            user={user}
        />

        {/* STATS */}
        {activeTab === 'overview' && (
        <StatsCards 
            budget={budget}
            prediction={prediction}
            transactions={transactions}
            anomalies={anomalies}
        />
        )}

        {/* MAIN DASHBOARD GRID */}
        {activeTab === 'overview' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 px-4 md:px-6 pb-32 md:pb-20">

            {/* LEFT COLUMN: ADD & ANALYTICS */}
            <div className="xl:col-span-5 space-y-6">
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
                
                <div className="hidden md:block space-y-6">
                    <Analytics transactions={transactions} />
                    <div className="hidden xl:block">
                        <Forecast forecast={forecast} />
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: INSIGHTS & LIST */}
            <div className="xl:col-span-7 space-y-6">
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
                
                <TransactionList 
                    transactions={transactions}
                    anomalies={anomalies}
                    editTransaction={editTransaction}
                    deleteTransaction={deleteTransaction}
                />
            </div>
        </div>
        )}

        {activeTab === 'savings' && (
           <div className="p-6 pb-32 md:pb-6">
               <Savings totalSavings={savingsData.total_savings} history={savingsData.history} />
           </div>
        )}
        
        {activeTab === 'history' && (
            <div className="p-6 pb-32 md:pb-6">
                 <TransactionList 
                    transactions={transactions}
                    anomalies={anomalies}
                    editTransaction={editTransaction}
                    deleteTransaction={deleteTransaction}
                />
            </div>
        )}

        {activeTab === 'analytics' && (
            <div className="p-6 pb-32 md:pb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Analytics transactions={transactions} />
                <Forecast forecast={forecast} />
            </div>
        )}
        <ChatCoach />

         {/* MOBILE NAV */}
        <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </main>
    </div>
  );
}
