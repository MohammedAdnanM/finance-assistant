/**
 * StatsCards Component
 * Process: Shows high-level financial metrics (Total Transactions, Current Budget, Predicted Expense, Anomalies) in a grid layout.
 * Main Functionality:
 *  - Display Monthly Budget
 *  - Display Predicted Expenses
 *  - Display Transaction Count
 *  - Display Anomaly Count
 */
import React from "react";

export default function StatsCards({ budget, prediction, transactions, anomalies }) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 px-8">
      <div className="stat-card blue relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
           {/* Decorative Icon can go here */}
        </div>
        <p className="text-blue-100 font-medium text-sm uppercase tracking-wide">Monthly Budget</p>
        <h2 className="text-3xl font-bold mt-1">₹{budget}</h2>
      </div>

      <div className="stat-card purple relative overflow-hidden group">
        <p className="text-purple-100 font-medium text-sm uppercase tracking-wide">Predicted Expense</p>
        <h2 className="text-3xl font-bold mt-1">₹{prediction}</h2>
      </div>

      <div className="stat-card green relative overflow-hidden group">
        <p className="text-green-100 font-medium text-sm uppercase tracking-wide">Total Transactions</p>
        <h2 className="text-3xl font-bold mt-1">{transactions.length}</h2>
      </div>

      <div className="stat-card red relative overflow-hidden group">
        <p className="text-red-100 font-medium text-sm uppercase tracking-wide">Anomalies</p>
        <h2 className="text-3xl font-bold mt-1">{anomalies.length}</h2>
      </div>
    </section>
  );
}
