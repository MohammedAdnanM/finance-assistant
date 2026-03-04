/**
 * TransactionForm Component
 * Process: Provides a form interface for adding new transactions or editing existing ones, including category auto-suggestions.
 * Main Functionality:
 *  - Add New Transaction
 *  - Edit Existing Transaction
 *  - Auto-complete Categories
 *  - Form Validation
 */
import React from "react";

export default function TransactionForm({
  addTransaction,
  date,
  setDate,
  month,
  category,
  setCategory,
  amount,
  setAmount,
  notes,
  setNotes,
  type,
  setType,
  showSuggestions,
  setShowSuggestions,
  categoriesList,
  editingId,
  cancelEdit,
}) {
  return (
    <section
      className="bg-white border border-gray-200
          dark:bg-[#111827] dark:border-gray-800
          rounded-2xl p-8 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
         <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
           {editingId ? "Edit Transaction" : "Add New Transaction"}
         </h3>
      </div>

      <form
        onSubmit={addTransaction}
        className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
      >
        {/* Toggle Expense/Income */}
        <div className="md:col-span-12 mb-2">
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
                <button
                    type="button"
                    onClick={() => setType("expense")}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                        type === "expense" 
                        ? "bg-white dark:bg-gray-700 text-rose-600 shadow-sm" 
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    Expense
                </button>
                <button
                    type="button"
                    onClick={() => setType("income")}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                        type === "income" 
                        ? "bg-white dark:bg-gray-700 text-emerald-600 shadow-sm" 
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    Income
                </button>
            </div>
        </div>
        <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1">Date</label>
            <input
            type="date"
            value={date}
            min={`${month}-01`}
            max={`${month}-31`}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3 rounded-xl
                    bg-gray-50 text-black border border-gray-200
                    dark:bg-gray-800 dark:text-white dark:border-gray-700
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
        </div>

        <div className="relative md:col-span-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1">
            Category <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <input
            placeholder="e.g. Food, Travel..."
            value={category}
            onFocus={() => setShowSuggestions(true)}
            onChange={(e) => {
              setCategory(e.target.value);
              setShowSuggestions(true);
            }}
            onBlur={() => {
              // Delay allows the onClick of the suggestion to trigger before it disappears
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            className="w-full p-3 rounded-xl
                  bg-gray-50 text-black border border-gray-200
                  dark:bg-gray-800 dark:text-white dark:border-gray-700
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />

          {showSuggestions && (
            <div className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
              {categoriesList.map((c, i) => (
                <div
                  key={i}
                  className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-200 transition-colors"
                  onClick={() => {
                    setCategory(c);
                    setShowSuggestions(false);
                  }}
                >
                  {c}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1">Amount</label>
            <div className="relative">
                <span className="absolute left-3 top-3.5 text-gray-500">₹</span>
                <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-3 pl-8 rounded-xl
                        bg-gray-50 text-black border border-gray-200
                        dark:bg-gray-800 dark:text-white dark:border-gray-700
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
            </div>
        </div>

        <div className="md:col-span-2">
            <button
            type="submit"
            className="h-[50px] w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all active:scale-95"
            >
            {editingId ? "Update" : "Add"}
            </button>
        </div>

        {/* Notes Section */}
        <div className="md:col-span-10">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1">
                Notes <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
                placeholder="Add some details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 rounded-xl
                        bg-gray-50 text-black border border-gray-200
                        dark:bg-gray-800 dark:text-white dark:border-gray-700
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
        </div>

        {editingId && (
            <div className="md:col-span-2">
                <button
                    type="button"
                    onClick={cancelEdit}
                    className="h-[50px] w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl transition-all"
                    aria-label="Cancel Edit"
                >
                    Cancel
                </button>
            </div>
        )}
      </form>
    </section>
  );
}
