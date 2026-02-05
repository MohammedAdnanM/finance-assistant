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
  BanknotesIcon
} from "@heroicons/react/24/solid";

export default function Sidebar({ activeTab, setActiveTab, healthScore }) {
  const menuItems = [
    { id: 'overview', icon: HomeIcon, label: "Overview" },
    { id: 'savings', icon: BanknotesIcon, label: "Savings" },
    { id: 'history', icon: ReceiptPercentIcon, label: "History" },
    { id: 'analytics', icon: ChartBarIcon, label: "Analytics" },
    // { id: 'control', icon: Cog6ToothIcon, label: "Control" } // Control not yet implemented
  ];

  return (
    <aside
      className="hidden md:flex w-24 hover:w-72 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
                  bg-white dark:bg-obsidian border-r border-gray-200 dark:border-white/5
                  px-6 py-10 flex-col group sticky top-0 h-screen z-30"
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
          {menuItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-5 p-4 rounded-2xl transition-all w-full relative overflow-hidden group/item
                ${activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                  : 'text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-white/5'}`}
            >
              <item.icon className={`h-6 w-6 shrink-0 transition-transform group-hover/item:scale-110`} />
              <span className="hidden group-hover:inline font-black text-xs uppercase tracking-widest whitespace-nowrap animate-in fade-in slide-in-from-left-3 duration-500">
                {item.label}
              </span>
              {activeTab === item.id && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-1.5 bg-white rounded-l-full"></div>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-5 rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10 border border-gray-200 dark:border-white/5 hidden group-hover:block animate-in fade-in duration-700 relative overflow-hidden">
        
        {/* Decorative Glow */}
        <div className={`absolute top-0 right-0 w-20 h-20 bg-${healthScore?.color || 'gray'}-500/20 blur-2xl rounded-full -mr-10 -mt-10 pointer-events-none`}></div>

        <div className="flex items-center justify-between mb-3 relative z-10">
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Financial Health</p>
                <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-gray-900 dark:text-white">
                        {healthScore?.score || 0}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">/ 100</span>
                </div>
            </div>
            
            <div className={`
                flex items-center justify-center h-8 w-8 rounded-full 
                bg-white dark:bg-white/10 shadow-sm border border-gray-100 dark:border-white/5
                text-${healthScore?.color || 'gray'}-500
            `}>
                {healthScore?.score >= 80 ? '🏆' : (healthScore?.score >= 50 ? '📈' : '⚠️')}
            </div>
        </div>
        
        <div className="h-2 w-full bg-gray-200 dark:bg-black/40 rounded-full overflow-hidden relative z-10">
            <div 
                className={`h-full transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] rounded-full 
                            bg-gradient-to-r from-${healthScore?.color || 'gray'}-400 to-${healthScore?.color || 'gray'}-600 
                            shadow-[0_0_12px_rgba(0,0,0,0.2)]`}
                style={{ width: `${healthScore?.score || 0}%` }}
            ></div>
        </div>
        
        <div className="mt-3 flex items-center justify-between relative z-10">
             <span className={`text-[9px] font-black uppercase tracking-widest py-0.5 px-2 rounded-lg bg-${healthScore?.color || 'gray'}-500/10 text-${healthScore?.color || 'gray'}-600 dark:text-${healthScore?.color || 'gray'}-300`}>
                {healthScore?.label || 'N/A'}
            </span>
            <span className="text-[9px] text-gray-400 font-medium">{healthScore?.score >= 50 ? 'Keep it up!' : 'Action Needed'}</span>
        </div>
      </div>
    </aside>
  );
}
