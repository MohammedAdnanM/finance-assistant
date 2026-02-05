/**
 * Savings Component
 * Process: Displays accumulated savings from previous months.
 */
import React from "react";
import { ArrowTrendingUpIcon, BanknotesIcon } from "@heroicons/react/24/outline";

export default function Savings({ totalSavings, history }) {
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* HERO CARD */}
        <div className="rounded-3xl p-8 bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-xl shadow-emerald-900/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-700">
                <BanknotesIcon className="h-40 w-40 -rotate-12" />
            </div>
            
            <div className="relative z-10">
                <p className="text-emerald-100 font-bold uppercase tracking-widest text-sm">Total Accumulated Savings</p>
                <h1 className="text-6xl font-black mt-4 drop-shadow-lg tracking-tighter">
                   {formatCurrency(totalSavings)}
                </h1>
                <div className="mt-6 flex items-center gap-2">
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm border border-white/10">
                        Lifetime Savings
                    </span>
                    {totalSavings > 0 && (
                        <span className="bg-emerald-400/20 px-3 py-1 rounded-full text-sm font-medium text-emerald-100 backdrop-blur-sm border border-emerald-400/30 flex items-center gap-1">
                            <ArrowTrendingUpIcon className="h-4 w-4" />
                            Growing
                        </span>
                    )}
                </div>
            </div>
        </div>

        {/* HISTORY TABLE */}
        <div className="bg-white dark:bg-[#111827] rounded-3xl p-8 border border-gray-200 dark:border-white/5 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Monthly Breakdown</h3>
            
            <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-white/5">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-white/5 text-gray-400 text-xs uppercase tracking-widest">
                        <tr>
                            <th className="p-4">Month</th>
                            <th className="p-4">Budget</th>
                            <th className="p-4">Spent</th>
                            <th className="p-4 text-right">Saved</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                        {history.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-400 italic">
                                    No past data available yet.
                                </td>
                            </tr>
                        ) : (
                            history.map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                    <td className="p-4 font-bold text-gray-700 dark:text-gray-200">
                                        {item.month}
                                    </td>
                                    <td className="p-4 text-gray-500 dark:text-gray-400">
                                        {formatCurrency(item.budget)}
                                    </td>
                                    <td className="p-4 text-gray-500 dark:text-gray-400">
                                        {formatCurrency(item.spent)}
                                    </td>
                                    <td className={`p-4 text-right font-black ${item.savings >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {item.savings >= 0 ? '+' : ''}{formatCurrency(item.savings)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
}
