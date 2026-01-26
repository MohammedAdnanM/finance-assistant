/**
 * Analytics Component
 * Process: Visualizes transaction trends over time and category breakdowns using interactive charts.
 * Main Functionality:
 *  - Renders Line Chart for spending trends over time
 *  - Renders Bar Chart for spending by category
 */
import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function Analytics({ transactions }) {
  
  function categoryTotals(list) {
    const totals = {};
    list.forEach(
      (t) => (totals[t.category] = (totals[t.category] || 0) + Number(t.amount))
    );
    return Object.keys(totals).map((k) => ({ category: k, total: totals[k] }));
  }

  const data = categoryTotals(transactions);

  return (
    <section
      className="bg-white border text-gray-900 border-gray-200
                   dark:bg-[#111827] dark:border-gray-800
                   rounded-2xl p-8 shadow-sm space-y-8"
    >
      <div className="flex items-center gap-3">
         <div className="h-8 w-1 bg-gradient-to-b from-green-500 to-teal-400 rounded-full"></div>
         <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Spending Analytics</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Line Chart */}
        <div className="bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 p-6 rounded-xl">
          <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-6 uppercase tracking-wider">Trend Over Time</h4>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={transactions}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis dataKey="date" stroke="#9CA3AF" tick={{fontSize: 12}} />
                <YAxis stroke="#9CA3AF" tick={{fontSize: 12}} />
                <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#3B82F6" 
                    strokeWidth={3} 
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6 }} 
                />
                </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 p-6 rounded-xl">
          <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-6 uppercase tracking-wider">Category Breakdown</h4>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis dataKey="category" stroke="#9CA3AF" tick={{fontSize: 12}} />
                <YAxis stroke="#9CA3AF" tick={{fontSize: 12}} />
                <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="total" radius={[6, 6, 0, 0]} fill="url(#colorTotal)" />
                <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                </defs>
                </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
