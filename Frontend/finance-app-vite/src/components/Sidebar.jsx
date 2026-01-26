/**
 * Sidebar Component
 * Process: Vertical navigation menu for accessing different sections of the app (Dashboard, Transactions, Settings).
 * Main Functionality:
 *  - Navigation Links
 *  - Responsive Menu (Hover effects)
 */
import React from "react";
import {
  HomeIcon,
  ReceiptPercentIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/solid";

export default function Sidebar() {
  return (
    <aside
      className="w-24 hover:w-72 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
                  bg-white dark:bg-obsidian border-r border-gray-200 dark:border-white/5
                  px-6 py-10 flex flex-col group sticky top-0 h-screen z-30"
    >
      <div className="flex items-center gap-4 mb-12">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            <span className="text-white font-black text-2xl">F</span>
        </div>
        <h1 className="text-2xl font-black tracking-tighter hidden group-hover:block dark:text-white animate-in fade-in slide-in-from-left-2 duration-500">
          FINORA<span className="text-indigo-500">.</span>
        </h1>
      </div>

      <div className="flex-1">
        <nav className="space-y-4">
          {[
            { icon: HomeIcon, label: "Overview", active: true },
            { icon: ReceiptPercentIcon, label: "History" },
            { icon: ChartBarIcon, label: "Analytics" },
            { icon: Cog6ToothIcon, label: "Control" }
          ].map((item, idx) => (
            <button 
              key={idx}
              className={`flex items-center gap-5 p-4 rounded-2xl transition-all w-full relative overflow-hidden group/item
                ${item.active 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                  : 'text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-white/5'}`}
            >
              <item.icon className={`h-6 w-6 shrink-0 transition-transform group-hover/item:scale-110`} />
              <span className="hidden group-hover:inline font-black text-xs uppercase tracking-widest whitespace-nowrap animate-in fade-in slide-in-from-left-3 duration-500">
                {item.label}
              </span>
              {item.active && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-1.5 bg-white rounded-l-full"></div>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 hidden group-hover:block animate-in fade-in duration-700">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Storage Status</p>
        <div className="mt-2 h-1.5 w-full bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 w-[65%] shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
        </div>
        <p className="text-[9px] text-gray-500 mt-2 font-bold uppercase tracking-tighter">65% of limit used</p>
      </div>
    </aside>
  );
}
