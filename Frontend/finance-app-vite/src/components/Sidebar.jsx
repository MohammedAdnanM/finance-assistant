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
      className="w-20 hover:w-64 transition-all duration-300
                  bg-gray-200 text-black
                  dark:bg-[#111827] dark:text-white
                  p-6 flex flex-col group sticky top-0 h-screen"
    >
      <h1 className="text-3xl font-bold hidden group-hover:block mb-8">
        Finora
      </h1>

      <div className="flex-1">
        <nav className="space-y-6 text-gray-500 dark:text-gray-400">
          <button className="flex items-center gap-4 hover:text-blue-600 dark:hover:text-white transition-colors w-full">
            <HomeIcon className="h-6 w-6 min-w-[24px]" />
            <span className="hidden group-hover:inline font-medium">
              Dashboard
            </span>
          </button>
          <button className="flex items-center gap-4 hover:text-blue-600 dark:hover:text-white transition-colors w-full">
            <ReceiptPercentIcon className="h-6 w-6 min-w-[24px]" />
            <span className="hidden group-hover:inline font-medium">
              Transactions
            </span>
          </button>
          <button className="flex items-center gap-4 hover:text-blue-600 dark:hover:text-white transition-colors w-full">
            <ChartBarIcon className="h-6 w-6 min-w-[24px]" />
            <span className="hidden group-hover:inline font-medium">
              Analytics
            </span>
          </button>
          <button className="flex items-center gap-4 hover:text-blue-600 dark:hover:text-white transition-colors w-full">
            <Cog6ToothIcon className="h-6 w-6 min-w-[24px]" />
            <span className="hidden group-hover:inline font-medium">
              Settings
            </span>
          </button>
        </nav>
      </div>
    </aside>
  );
}
