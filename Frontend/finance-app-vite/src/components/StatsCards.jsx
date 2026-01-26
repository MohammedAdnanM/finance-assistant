/**
 * StatsCards Component
 * Process: Shows high-level financial metrics (Total Transactions, Current Budget, Predicted Expense, Anomalies) in a grid layout.
 *
 * Updated Functionality:
 *  - Visual Polish: High-contrast premium gradients (Indigo, Purple, Teal, Rose).
 *  - Animations: Staggered entry animations for a polished reveal effect.
 *  - Dynamic Alerts: Real-time visual warnings for budget overruns.
 */
import { BanknotesIcon, ChartBarIcon, ClipboardDocumentListIcon, ExclamationTriangleIcon, SparklesIcon } from "@heroicons/react/24/outline";

export default function StatsCards({ budget, prediction, transactions, anomalies }) {
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  
  const isOverBudget = prediction > budget && budget > 0;
  
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 px-6">

      <div className="stat-card bg-gradient-to-br from-indigo-600 to-indigo-800 animate-entry stagger-1">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <BanknotesIcon className="h-12 w-12 rotate-12" />
        </div>
        <p className="text-white/70 font-medium text-xs uppercase tracking-widest">Monthly Budget</p>
        <h2 className="text-3xl font-black mt-2 drop-shadow-sm">{formatCurrency(budget)}</h2>
        <div className="mt-4 h-1 w-full bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white/60" style={{ width: `${Math.min((budget/100000)*100, 100)}%` }}></div>
        </div>
      </div>

      <div className="stat-card bg-gradient-to-br from-purple-600 to-purple-800 animate-entry stagger-2">
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <SparklesIcon className="h-12 w-12 rotate-12" />
        </div>
        <p className="text-white/70 font-medium text-xs uppercase tracking-widest">Predicted Expense</p>
        <h2 className="text-3xl font-black mt-2 drop-shadow-sm">{formatCurrency(prediction)}</h2>
        <div className="mt-2 flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border 
                ${isOverBudget ? 'bg-red-500/20 border-red-400 text-red-100' : 'bg-emerald-500/20 border-emerald-400 text-emerald-100'}`}>
                {isOverBudget ? '⚠️ ALERT' : '✅ ON TRACK'}
            </span>
        </div>
      </div>

      <div className="stat-card bg-gradient-to-br from-teal-600 to-teal-800 animate-entry stagger-3">
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <ClipboardDocumentListIcon className="h-12 w-12 -rotate-12" />
        </div>
        <p className="text-white/70 font-medium text-xs uppercase tracking-widest">Transactions</p>
        <h2 className="text-3xl font-black mt-2 drop-shadow-sm">{transactions.length}</h2>
        <p className="text-[10px] text-white/50 mt-1 italic">Recorded this month</p>
      </div>

      <div className="stat-card bg-gradient-to-br from-rose-600 to-rose-800 animate-entry stagger-4">
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <ExclamationTriangleIcon className="h-12 w-12" />
        </div>
        <p className="text-white/70 font-medium text-xs uppercase tracking-widest">Anomalies</p>
        <h2 className="text-3xl font-black mt-2 drop-shadow-sm">{anomalies.length}</h2>
        <p className="text-[10px] text-white/50 mt-1 italic">Suspected irregularities</p>
      </div>

    </section>
  );
}
