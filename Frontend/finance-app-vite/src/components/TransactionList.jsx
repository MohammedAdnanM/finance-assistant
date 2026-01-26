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
import { ArrowDownTrayIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function TransactionList({
  transactions,
  anomalies,
  editTransaction,
  deleteTransaction,
}) {

  function downloadPDF() {
    const doc = new jsPDF();
    doc.text("Monthly Finance Summary", 14, 20);

    autoTable(doc, {
      startY: 30,
      head: [["Date", "Category", "Amount"]],
      body: transactions.map((t) => [t.date, t.category, `₹${t.amount}`]),
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

      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">
            <tr>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium">Amount</th>
              <th className="p-4 text-center font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-4xl opacity-50">💸</span>
                        <p>No transactions yet</p>
                    </div>
                </td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr
                  key={t.id}
                  className="group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
                >
                  {/* DATE */}
                  <td className="p-4 text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">{t.date}</td>

                  {/* CATEGORY */}
                  <td className="p-4">
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300">
                        {t.category}
                    </span>
                  </td>

                  {/* AMOUNT */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-900 dark:text-white font-bold">
                        ₹ {t.amount}
                      </span>

                      {anomalies.includes(t.id) && (
                        <span
                          className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full
                                     bg-red-100 text-red-600 border border-red-200
                                     dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30"
                        >
                          ⚠ Abnormal
                        </span>
                      )}
                    </div>
                  </td>

                  {/* ACTION */}
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
