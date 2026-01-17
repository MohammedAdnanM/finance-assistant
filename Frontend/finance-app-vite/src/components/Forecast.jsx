/**
 * Forecast Component
 * Process: Displays a 30-day expense forecast using historical data and AI predictions.
 * Main Functionality:
 *  - Visualizes future spending trends via Line Chart
 *  - Displays empty state if insufficient data
 */
import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function Forecast({ forecast }) {
  return (
    <section
      className="bg-white border border-gray-200
                   dark:bg-[#111827] dark:border-gray-800
                   rounded-2xl p-8 mx-8 mb-10 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-6">
         <div className="h-8 w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
         <h3 className="text-2xl font-bold text-gray-900 dark:text-white">30-Day Expense Forecast</h3>
      </div>

      {forecast.length === 0 ? (
        <div className="p-12 text-center bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
             <p className="text-gray-500">Not enough data to generate a forecast yet.</p>
             <p className="text-sm text-gray-400 mt-2">Add more transactions to see AI predictions.</p>
        </div>
      ) : (
        <div className="h-[300px] w-full bg-gray-50 dark:bg-[#0d1117] p-4 rounded-xl border border-gray-200 dark:border-gray-800">
            <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis dataKey="date" stroke="#9CA3AF" tick={{fontSize: 12}} />
                <YAxis stroke="#9CA3AF" tick={{fontSize: 12}} />
                <Tooltip 
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line
                type="monotone"
                dataKey="amount"
                stroke="#a855f7"
                strokeWidth={3}
                strokeDasharray="6 4"
                dot={{ r: 0 }}
                activeDot={{ r: 6 }}
                />
            </LineChart>
            </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
