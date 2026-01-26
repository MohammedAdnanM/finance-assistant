/**
 * StatsCards Component
 * Process: Shows high-level financial metrics (Total Transactions, Current Budget, Predicted Expense, Anomalies) in a grid layout.
 * Main Functionality:
 *  - Display Monthly Budget
 *  - Display Predicted Expenses
 *  - Display Transaction Count
 *  - Display Anomaly Count
 */
import { BanknotesIcon, ChartBarIcon, ClipboardDocumentListIcon, ExclamationTriangleIcon, SparklesIcon } from "@heroicons/react/24/outline";

export default function StatsCards({ budget, prediction, transactions, anomalies }) {
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  
  const isOverBudget = prediction > budget && budget > 0;
  
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 px-8">

      <div className="stat-card blue relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity">
            <BanknotesIcon className="h-10 w-10 rotate-12" />
        </div>
        <p className="text-blue-100 font-medium text-sm uppercase tracking-wide">Monthly Budget</p>
        <h2 className="text-3xl font-bold mt-1">{formatCurrency(budget)}</h2>
      </div>

      <div className="stat-card purple relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity">
            <SparklesIcon className="h-10 w-10 rotate-12" />
        </div>
        <p className="text-purple-100 font-medium text-sm uppercase tracking-wide">Predicted Expense</p>
        <h2 className="text-3xl font-bold mt-1">{formatCurrency(prediction)}</h2>
        <div className="mt-2 flex items-center gap-1.5 overflow-hidden">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter shrink-0 
                ${isOverBudget ? 'bg-red-500/30 text-red-100' : 'bg-green-500/30 text-green-100'}`}>
                {isOverBudget ? '⚠️ Warning' : '✅ On Track'}
            </span>
            <span className="text-[10px] text-purple-200 truncate opacity-80">Based on 30-day trend</span>
        </div>
      </div>

      <div className="stat-card green relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity">
            <ClipboardDocumentListIcon className="h-10 w-10 -rotate-12" />
        </div>
        <p className="text-green-100 font-medium text-sm uppercase tracking-wide">Total Transactions</p>
        <h2 className="text-3xl font-bold mt-1">{transactions.length}</h2>
      </div>

      <div className="stat-card red relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity">
            <ExclamationTriangleIcon className="h-10 w-10" />
        </div>
        <p className="text-red-100 font-medium text-sm uppercase tracking-wide">Anomalies</p>
        <h2 className="text-3xl font-bold mt-1">{anomalies.length}</h2>
      </div>

    </section>
  );
}
