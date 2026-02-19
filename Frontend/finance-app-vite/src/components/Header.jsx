/**
 * Header Component
 * Process: Top navigation bar containing the user welcome, month selector, logout button, and real-time budget overview.
 * Main Functionality:
 *  - Month Selection
 *  - Budget Input & Display
 *  - Apply Recommended Budget
 *  - Logout User
 */
import React from "react";
import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/solid";

export default function Header({
  month,
  setMonth,
  logoutHandler,
  budget,
  saveBudget,
  recommendedBudget,
  spent,
  user
}) {
  return (
    <header
      className="sticky top-0 z-20 mb-8 border-b border-gray-200 dark:border-white/5 glass transition-all duration-500 animate-entry"
    >
      <div className="px-8 py-6 space-y-6">
        {/* TOP ROW */}
        <div className="flex items-center justify-between">
          <div className="animate-entry stagger-1">
            <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              {user ? (
                <>
                  Welcome back,{" "}
                  <span className="text-indigo-500">
                    {(() => {
                      const nickname = user.name ? user.name.split(" ")[0] : user.email.split("@")[0];
                      return nickname.charAt(0).toUpperCase() + nickname.slice(1);
                    })()}
                  </span>
                </>
              ) : (
                <>
                  Financial Hub <span className="text-indigo-500">_</span>
                </>
              )}
            </h2>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
              Your intelligent assets overview
            </p>
          </div>

          <div className="flex items-center gap-4 animate-entry stagger-2">
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 p-1 rounded-2xl border border-gray-200 dark:border-white/5 shadow-inner">
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="bg-transparent border-none text-sm font-black uppercase tracking-widest
                           text-gray-700 dark:text-indigo-400
                           focus:ring-0 cursor-pointer px-4 py-2"
              />
            </div>

            <button
              onClick={logoutHandler}
              className="flex items-center gap-2 px-5 py-2.5
                         rounded-2xl text-sm font-black uppercase tracking-tighter
                         text-red-500 hover:text-white
                         bg-red-50 dark:bg-red-500/10
                         hover:bg-red-500 dark:hover:bg-red-600
                         transition-all active:scale-90 shadow-sm"
            >
              <ArrowLeftStartOnRectangleIcon className="h-4 w-4" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* BUDGET OVERVIEW */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 rounded-[2rem] bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-xl shadow-black/5 animate-entry stagger-3">
            <div className="flex-1 space-y-3 min-w-[300px]">
                <div className="flex justify-between items-end">
                    <div className="group">
                        <label className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-[0.2em]">
                            Monthly Limit
                        </label>
                        <div className="flex items-center mt-1">
                            <span className="text-2xl font-black text-indigo-500 mr-2 drop-shadow-lg">
                            ₹
                            </span>
                            <input
                            type="number"
                            value={budget}
                            onChange={(e) => saveBudget(e.target.value)}
                            className="bg-transparent text-4xl font-black text-gray-900 dark:text-white
                                        border-none p-0 focus:ring-0 w-44 placeholder-gray-300 dark:placeholder-gray-700 transition-all group-hover:translate-x-1"
                            placeholder="000,000"
                            />
                        </div>
                    </div>
                    
                    <div className="flex gap-8 mb-1">
                        <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest">Spent</p>
                        <p className="text-xl font-black text-gray-900 dark:text-white">₹ {spent.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest">Available</p>
                        <p className={`text-xl font-black ${budget - spent < 0 ? "text-rose-500" : "text-emerald-500"}`}>
                            ₹ {(budget - spent).toLocaleString()}
                        </p>
                        </div>
                    </div>
                </div>

                {/* Interactive Progress Bar */}
                <div className="h-2 w-full bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden relative border border-gray-100 dark:border-white/5 shadow-inner">
                    <div 
                        className={`h-full transition-all duration-1000 ease-out rounded-full shadow-[0_0_15px_rgba(0,0,0,0.1)] ${
                            (spent / budget) > 1 ? "bg-rose-500 shadow-rose-500/20" : 
                            (spent / budget) > 0.85 ? "bg-yellow-500 shadow-yellow-500/20" : 
                            "bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-indigo-500/20"
                        }`}
                        style={{ width: `${Math.min((spent / (budget || 1)) * 100, 100)}%` }}
                    ></div>
                </div>
            </div>

          {recommendedBudget > 0 && (
            <div
              className="flex items-center gap-6
                  bg-emerald-50/50 dark:bg-emerald-500/5 
                  p-4 rounded-[1.5rem] border border-emerald-100 dark:border-emerald-500/10 shadow-inner group animate-pulse-slow"
            >
              <div className="flex flex-col">
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-[0.2em]">AI Advice</span>
                  <span className="text-emerald-700 dark:text-emerald-300 font-black text-lg">Suggests ₹{recommendedBudget.toLocaleString()}</span>
              </div>
              <button
                onClick={() => saveBudget(recommendedBudget)}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
              >
                Auto Setting
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
