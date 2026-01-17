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
}) {
  return (
    <header
      className="sticky top-0 z-20 mb-8
                   bg-white/80 border-b border-gray-200
                   dark:bg-[#0d1117]/80 dark:border-gray-800
                   backdrop-blur-md transition-colors duration-300"
    >
      <div className="px-8 py-5 space-y-5">
        {/* TOP ROW */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-800 dark:text-white">
              Welcome Back 👋
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Here's your finance overview
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="bg-transparent border-none text-sm font-medium
                           text-gray-700 dark:text-gray-200
                           focus:ring-0 cursor-pointer px-2 py-1"
              />
            </div>

            <button
              onClick={logoutHandler}
              className="flex items-center gap-2 px-4 py-2
                         rounded-lg text-sm font-medium
                         text-red-500 hover:text-red-600
                         bg-red-50 dark:bg-red-900/10
                         hover:bg-red-100 dark:hover:bg-red-900/20
                         transition-all"
            >
              <ArrowLeftStartOnRectangleIcon className="h-4 w-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* BUDGET OVERVIEW */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-4 rounded-xl bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div>
              <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider">
                Monthly Budget
              </label>
              <div className="flex items-center mt-1">
                <span className="text-xl font-bold text-gray-700 dark:text-gray-300 mr-2">
                  ₹
                </span>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => saveBudget(e.target.value)}
                  className="bg-transparent text-2xl font-bold text-gray-900 dark:text-white
                             border-none p-0 focus:ring-0 w-32 placeholder-gray-400"
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="h-10 w-px bg-gray-300 dark:bg-gray-700 hidden sm:block mx-2"></div>

            <div className="flex gap-8 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Spent</p>
                  <p className="text-blue-500 font-semibold text-lg">₹ {spent}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Remaining</p>
                  <p className={`font-semibold text-lg ${budget - spent < 0 ? "text-red-500" : "text-green-500"}`}>
                     ₹ {budget - spent}
                  </p>
                </div>
            </div>
          </div>

          {recommendedBudget > 0 && (
            <div
              className="flex items-center gap-4
                  bg-green-50 border border-green-200
                  dark:bg-green-900/10 dark:border-green-800
                  p-3 rounded-lg shadow-sm"
            >
              <div className="flex flex-col">
                  <span className="text-xs text-green-700 dark:text-green-400 font-medium uppercase">Recommended Budget</span>
                  <span className="text-green-800 dark:text-green-300 font-bold">₹ {recommendedBudget}</span>
              </div>
              <button
                onClick={() => saveBudget(recommendedBudget)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold uppercase rounded-md shadow-md transition-all active:scale-95"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
