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
  resetNecessity,
  necessityType,
  setNecessityType,
  necessityFrequency,
  setNecessityFrequency,
  amount,
}) {
  return (
    <section
      className="bg-gray-50 border border-gray-200
                 dark:bg-[#111827] dark:border-gray-800
                 rounded-2xl p-8 space-y-8 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-6">
         <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
         <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Smart Insights</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget Optimization */}
        <div className="bg-white dark:bg-gray-800/50 p-5 rounded-xl border border-gray-100 dark:border-gray-700/50 hover:shadow-md transition-shadow flex flex-col min-w-0">
          <h4 className="text-sm font-bold text-purple-600 dark:text-purple-400 mb-4 flex items-center gap-2">
            <span className="text-lg">🚨</span>
            <span className="truncate">Budget Alerts</span>
          </h4>
          <div className="flex-1 space-y-3">
             {optimizations.length === 0 ? (
                <div className="flex items-center gap-2 text-green-500 bg-green-50 dark:bg-green-900/10 p-3 rounded-lg">
                    <span>✅</span>
                    <p className="text-sm font-medium">No overspending detected.</p>
                </div>
            ) : (
                optimizations.map((o, i) => (
                <div key={i} className="flex items-start gap-2 text-red-500 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg animate-pulse-slow">
                    <span>⚠</span>
                    <p className="text-xs">
                    <span className="font-bold">{o.category}:</span> {o.message}
                    </p>
                </div>
                ))
            )}
          </div>
        </div>

        {/* Category Efficiency */}
        <div className="bg-white dark:bg-gray-800/50 p-5 rounded-xl border border-gray-100 dark:border-gray-700/50 hover:shadow-md transition-shadow flex flex-col min-w-0">
          <h4 className="text-sm font-bold text-teal-600 dark:text-teal-400 mb-4 flex items-center gap-2 flex-nowrap overflow-hidden">
             <span className="text-lg shrink-0">📊</span>
             <span className="truncate">Category Efficiency</span>
          </h4>
          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-1" style={{ minHeight: "250px", maxHeight: "400px" }}>
            {efficiency.length > 0 ? (
                efficiency.map((e, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 p-3 rounded-xl bg-gray-50/50 dark:bg-gray-800/40 border border-transparent hover:border-teal-500/30 transition-all group">
                        <span className="text-gray-700 dark:text-gray-300 text-sm font-semibold truncate">{e.category}</span>
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shrink-0 text-center min-w-[65px]
                            ${e.efficiency === "High" ? "bg-green-500/20 text-green-600 dark:text-green-400" : 
                              e.efficiency === "Medium" ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400" :
                              "bg-red-500/20 text-red-600 dark:text-red-400"}`}>
                            {e.efficiency}
                        </span>
                    </div>
                ))
            ) : (
                <div className="flex flex-col items-center justify-center h-full py-8 text-center text-gray-400">
                    <span className="text-xl mb-2 opacity-30">�</span>
                    <p className="text-xs italic">No data available</p>
                </div>
            )}
          </div>
        </div>

        {/* Purchase Decision */}
        <div className="bg-white dark:bg-gray-800/50 p-5 rounded-xl border border-gray-100 dark:border-gray-700/50 hover:shadow-md transition-shadow flex flex-col min-w-0">
          <h4 className="text-sm font-bold text-yellow-600 dark:text-yellow-400 mb-4 flex items-center gap-2">
            <span className="text-lg">💡</span>
            <span className="truncate">Purchase Advisor</span>
          </h4>
          <div className="flex-1 flex flex-col items-center justify-center h-full pb-4">
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
                        onClick={resetNecessity} 
                        className="mt-4 text-xs font-semibold text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    >
                        ← Check another amount
                    </button>
                </div>
            ) : (
                <div className="text-center w-full max-w-[200px] flex flex-col gap-4">
                    <p className="text-gray-500 dark:text-gray-400 text-xs">
                        {amount ? `Evaluate ₹${amount} purchase?` : "Is this purchase worth it?"}
                    </p>

                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                        <button 
                            type="button"
                            onClick={() => setNecessityType("need")}
                            className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all ${necessityType === 'need' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-500' : 'text-gray-500'}`}
                        >
                            NEED
                        </button>
                        <button 
                            type="button"
                            onClick={() => setNecessityType("want")}
                            className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all ${necessityType === 'want' ? 'bg-white dark:bg-gray-700 shadow-sm text-purple-500' : 'text-gray-500'}`}
                        >
                            WANT
                        </button>
                    </div>

                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                        {['low', 'medium', 'high'].map(f => (
                            <button 
                                key={f}
                                type="button"
                                onClick={() => setNecessityFrequency(f)}
                                className={`flex-1 py-1 text-[9px] font-bold rounded-md uppercase transition-all ${necessityFrequency === f ? 'bg-white dark:bg-gray-700 shadow-sm text-yellow-600 dark:text-yellow-400' : 'text-gray-500'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={checkNecessity}
                        className="group relative px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-yellow-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 overflow-hidden"
                    >
                        <span className="relative z-10">Analyze Worth</span>
                        <span className="text-lg group-hover:rotate-12 transition-transform">✨</span>
                    </button>
                    <p className="mt-1 text-[10px] text-gray-400 font-medium">
                        Enter amount in form below
                    </p>
                </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
