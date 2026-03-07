/**
 * TransactionList Component
 * Process: Renders a tabular list of recent transactions with options to edit, delete, and export data to PDF.
 * Main Functionality:
 *  - List Transactions Table
 *  - Export Data to PDF
 *  - Edit Transaction (Trigger)
 *  - Delete Transaction
 *  - Anomaly Highlighting
 */
import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatDate } from "../utils/formatters";
import { ArrowDownTrayIcon, PencilSquareIcon, TrashIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

export default function TransactionList({
  transactions,
  anomalies,
  editTransaction,
  deleteTransaction,
  addRecurringFromTransaction,
}) {

  function downloadPDF() {
    const doc = new jsPDF();
    doc.text("Monthly Finance Summary", 14, 20);

    autoTable(doc, {
      startY: 30,
      head: [["Date", "Category", "Amount", "Notes", "Type"]],
      body: transactions.map((t) => [formatDate(t.date), t.category || "-", `₹${t.amount}`, t.notes || "-", t.type || "expense"]),
    });

    doc.save("Finance-Summary.pdf");
  }

  return (
    <section
      className="bg-white border border-gray-200
                   dark:bg-[#111827] dark:border-gray-800
                   rounded-2xl p-8 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Transactions</h3>
        
        <button
            onClick={downloadPDF}
            className="flex items-center gap-2 px-4 py-2 rounded-lg
            bg-gray-100 hover:bg-gray-200 text-gray-700
            dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300
            transition-all text-sm font-medium"
        >
            <ArrowDownTrayIcon className="h-4 w-4" />
            <span>Export PDF</span>
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 overflow-hidden">
        {/* Mobile View: Cards */}
        <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-800">
            {transactions.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">No transactions found</div>
            ) : (
                transactions.map((t) => (
                    <div key={t.id} className="p-4 flex flex-col gap-3 bg-white dark:bg-[#111827]">
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                                <span className={`font-bold text-base ${(t.type && t.type.toLowerCase() === 'income') ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {(t.type && t.type.toLowerCase() === 'income') ? '+' : '-'} ₹ {t.amount.toLocaleString()}
                                </span>
                                <span className="text-xs text-gray-500 mt-0.5">{formatDate(t.date)}</span>
                            </div>
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                {t.category || "Uncategorized"}
                            </span>
                        </div>

                        {t.notes && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                                "{t.notes}"
                            </p>
                        )}
                        
                        {anomalies.includes(t.id) && (
                            <div className="flex items-center gap-1.5 text-[9px] px-2 py-1 rounded-md font-black uppercase tracking-widest bg-rose-500/10 text-rose-600 w-fit">
                                <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                                Anomaly
                            </div>
                        )}

                        <div className="flex gap-2 mt-1 justify-end">
                            <button
                                onClick={() => addRecurringFromTransaction(t)}
                                className="flex-1 py-1.5 px-3 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold flex items-center justify-center gap-2"
                                title="Make Recurring"
                            >
                                <ArrowPathIcon className="h-3 w-3" /> Auto
                            </button>
                            <button
                                onClick={() => editTransaction(t)}
                                className="flex-1 py-1.5 px-3 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold flex items-center justify-center gap-2"
                            >
                                <PencilSquareIcon className="h-3 w-3" /> Edit
                            </button>
                            <button
                                onClick={() => deleteTransaction(t)}
                                className="flex-1 py-1.5 px-3 bg-red-50 text-red-600 rounded-lg text-xs font-bold flex items-center justify-center gap-2"
                            >
                                <TrashIcon className="h-3 w-3" /> Delete
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>

        {/* Desktop View: Table */}
        <table className="w-full text-left hidden md:table">
          <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">
            <tr>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium">Notes</th>
              <th className="p-4 font-medium">Amount</th>
              <th className="p-4 text-center font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center animate-entry">
                        <div className="h-24 w-24 rounded-full bg-indigo-50 dark:bg-indigo-500/5 flex items-center justify-center mb-6 border border-indigo-100 dark:border-indigo-500/10">
                            <span className="text-5xl">✨</span>
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Clean Slate!</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                            No transactions found for this month. You're either off to a great start or it's time to log some data.
                        </p>
                    </div>
                </td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr
                  key={t.id}
                  className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5 transition-colors border-b border-gray-50 dark:border-gray-800/50 last:border-0"
                >
                  {/* DATE */}
                  <td className="p-4 text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap text-sm">{formatDate(t.date)}</td>

                  {/* CATEGORY */}
                   <td className="p-4">
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        {t.category || "Uncategorized"}
                    </span>
                  </td>

                  {/* NOTES */}
                  <td className="p-4 text-gray-500 dark:text-gray-400 text-sm italic max-w-xs truncate">
                    {t.notes || "-"}
                  </td>

                  {/* AMOUNT */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className={`font-bold text-base ${(t.type && t.type.toLowerCase() === 'income') ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {(t.type && t.type.toLowerCase() === 'income') ? '+' : '-'} ₹ {t.amount.toLocaleString()}
                      </span>

                      {anomalies.includes(t.id) && (
                        <span
                          className="flex items-center gap-1.5 text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest
                                     bg-rose-500/10 text-rose-600 border border-rose-500/20
                                     dark:text-rose-400 animate-pulse-slow"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                          Anomaly
                        </span>
                      )}
                    </div>
                  </td>

                  {/* ACTION */}
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                        onClick={() => addRecurringFromTransaction(t)}
                        className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                        title="Make Recurring"
                        >
                        <ArrowPathIcon className="h-5 w-5" />
                        </button>
                        
                        <button
                        onClick={() => editTransaction(t)}
                        className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit"
                        >
                        <PencilSquareIcon className="h-5 w-5" />
                        </button>

                        <button
                        onClick={() => deleteTransaction(t)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete"
                        >
                        <TrashIcon className="h-5 w-5" />
                        </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
