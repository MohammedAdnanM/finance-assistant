/**
 * SmartInsights Component
 * Process: Displays intelligent financial advice, including budget alerts, category efficiency ratings, and "Need vs Want" purchase decisions.
 * Main Functionality:
 *  - Budget Overspending Alerts
 *  - Category Spending Efficiency Rating
 *  - Purchase Decision Calculator (Buy/Delay/Avoid)
 */
import React from "react";

export default function SmartInsights({
  optimizations,
  efficiency,
  necessityResult,
  checkNecessity,
}) {
  return (
    <section
      className="bg-gray-50 border border-gray-200
                 dark:bg-[#111827] dark:border-gray-800
                 rounded-2xl p-8 space-y-8 shadow-sm mb-10 mx-8"
    >
      <div className="flex items-center gap-3 mb-6">
         <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
         <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Smart Insights</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Budget Optimization */}
        <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl border border-gray-100 dark:border-gray-700/50 hover:shadow-md transition-shadow">
          <h4 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-4 flex items-center gap-2">
            <span>Budget Alerts</span>
          </h4>
          <div className="space-y-3">
             {optimizations.length === 0 ? (
                <div className="flex items-center gap-2 text-green-500 bg-green-50 dark:bg-green-900/10 p-3 rounded-lg">
                    <span>✅</span>
                    <p className="font-medium">All good! No overspending.</p>
                </div>
            ) : (
                optimizations.map((o, i) => (
                <div key={i} className="flex items-start gap-2 text-red-500 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg">
                    <span>⚠</span>
                    <p className="text-sm">
                    <span className="font-bold">{o.category}:</span> {o.message}
                    </p>
                </div>
                ))
            )}
          </div>
        </div>

        {/* Category Efficiency */}
        <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl border border-gray-100 dark:border-gray-700/50 hover:shadow-md transition-shadow">
          <h4 className="text-lg font-semibold text-teal-600 dark:text-teal-400 mb-4">
            Category Efficiency
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {efficiency.map((e, i) => (
                <div key={i} className="flex justify-between items-center p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <span className="text-gray-600 dark:text-gray-300 font-medium">{e.category}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase
                        ${e.efficiency === "High" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : 
                          e.efficiency === "Medium" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                          "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                        {e.efficiency}
                    </span>
                </div>
            ))}
            {efficiency.length === 0 && <p className="text-gray-400 italic">No data available</p>}
          </div>
        </div>

        {/* Purchase Decision */}
        <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl border border-gray-100 dark:border-gray-700/50 hover:shadow-md transition-shadow">
          <h4 className="text-lg font-semibold text-yellow-600 dark:text-yellow-400 mb-4">
            Purchase Advisor
          </h4>
          <div className="flex flex-col items-center justify-center h-full pb-6">
            {necessityResult ? (
                <div className="text-center animate-in fade-in zoom-in duration-300">
                    <div className={`text-3xl font-bold mb-2 ${
                        necessityResult.decision === "BUY" ? "text-green-500" :
                        necessityResult.decision === "DELAY" ? "text-yellow-500" : "text-red-500"
                    }`}>
                        {necessityResult.decision}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Score: <span className="font-mono font-bold text-gray-800 dark:text-gray-200">{necessityResult.score}</span>/100
                    </div>
                    <button 
                        onClick={() => checkNecessity()} // This might need reset to run again if needed, or simpliy re-run
                        className="mt-4 text-xs text-blue-500 hover:underline"
                    >
                        Check another
                    </button>
                </div>
            ) : (
                <div className="text-center">
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                        Is this purchase worth it? Enter details above and ask AI.
                    </p>
                    <button
                    onClick={checkNecessity}
                    className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl shadow-lg shadow-yellow-500/30 transition-all active:scale-95"
                    >
                    Check Decision
                    </button>
                </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
