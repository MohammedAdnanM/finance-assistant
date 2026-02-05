/**
 * MobileNav Component
 * Process: Bottom navigation bar for mobile devices.
 */
import React from "react";
import {
  HomeIcon,
  ReceiptPercentIcon,
  ChartBarIcon,
  BanknotesIcon,
} from "@heroicons/react/24/solid";

export default function MobileNav({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'overview', icon: HomeIcon, label: "Overview" },
    { id: 'savings', icon: BanknotesIcon, label: "Savings" },
    { id: 'history', icon: ReceiptPercentIcon, label: "History" },
    { id: 'analytics', icon: ChartBarIcon, label: "Analytics" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#161b22] border-t border-gray-200 dark:border-white/10 z-50 pb-safe">
      <div className="flex justify-around items-center p-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-full
              ${activeTab === item.id 
                ? 'text-indigo-600 dark:text-indigo-400' 
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
          >
            <item.icon className={`h-6 w-6 ${activeTab === item.id ? 'animate-bounce-slight' : ''}`} />
            <span className="text-[10px] font-bold uppercase tracking-wide">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
