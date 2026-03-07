import React, { useState, useEffect } from "react";
import { ArrowPathIcon, TrashIcon, PlusIcon, CalendarIcon } from "@heroicons/react/24/solid";
import { api } from "../utils/api";
import { success, error } from "../utils/toast";

export default function RecurringTransactions({ categoriesList }) {
  const [items, setItems] = useState([]);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [day, setDay] = useState(1);
  const [notes, setNotes] = useState("");
  const [type, setType] = useState("expense");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setIsLoading(true);
    const res = await api.get("/recurring");
    if (res && res.ok) {
      setItems(await res.json());
    }
    setIsLoading(false);
  }

  async function handleAdd(e) {
    if (e) e.preventDefault();
    if (!amount || !category) {
      error("Amount and Category are required");
      return;
    }

    const res = await api.post("/recurring", {
      amount: parseFloat(amount),
      category,
      day_of_month: parseInt(day),
      notes,
      type
    });

    if (res && res.ok) {
      success("Recurring subscription added");
      setAmount("");
      setCategory("");
      setNotes("");
      setDay(1);
      fetchItems();
    } else {
      error("Failed to add recurring item");
    }
  }

  async function handleDelete(id) {
    const res = await api.delete(`/recurring/${id}`);
    if (res && res.ok) {
      success("Recurring item removed");
      fetchItems();
    } else {
      error("Failed to remove item");
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <ArrowPathIcon className="h-6 w-6 text-indigo-500" />
            </div>
            Recurring Subscriptions
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium italic">
            Automate expected expenses like rent and bills. They'll be auto-added to your transactions every month.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ADD FORM */}
        <div className="lg:col-span-12">
            <form onSubmit={handleAdd} className="bg-white dark:bg-gray-900/50 backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-[2rem] p-8 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Type</label>
                        <select 
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-obsidian border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 text-gray-900 dark:text-white"
                        >
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Category</label>
                        <select 
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-obsidian border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 text-gray-900 dark:text-white"
                        >
                            <option value="">Select Category</option>
                            {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Day of Month</label>
                        <input 
                            type="number" 
                            min="1" 
                            max="31"
                            value={day}
                            onChange={(e) => setDay(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-obsidian border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 text-gray-900 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Amount</label>
                        <input 
                            type="number" 
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-gray-50 dark:bg-obsidian border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 text-gray-900 dark:text-white"
                        />
                    </div>
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl px-6 py-4 transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2">
                        <PlusIcon className="h-4 w-4" /> Save Plan
                    </button>
                </div>
            </form>
        </div>

        {/* LIST */}
        <div className="lg:col-span-12">
            {isLoading ? (
                <div className="flex justify-center p-12">
                     <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
                </div>
            ) : items.length === 0 ? (
                <div className="bg-gray-100/50 dark:bg-white/5 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-[2rem] p-12 text-center">
                    <ArrowPathIcon className="h-12 w-12 text-gray-400 mx-auto mb-4 opacity-20" />
                    <h3 className="text-xl font-black text-gray-400">No recurring plans yet</h3>
                    <p className="text-sm text-gray-400 mt-1">Add your monthly bills and subscriptions above.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                        <div key={item.id} className="group bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-white/5 rounded-[2rem] p-6 hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
                            <div className="flex items-start justify-between">
                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${item.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                    <CalendarIcon className="h-6 w-6" />
                                </div>
                                <button 
                                    onClick={() => handleDelete(item.id)}
                                    className="p-3 text-gray-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                            
                            <div className="mt-4">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Every Month (Day {item.day_of_month})</p>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white mt-1">{item.category}</h3>
                                <p className="text-2xl font-black text-indigo-500 mt-2">₹{item.amount.toLocaleString()}</p>
                            </div>
                            
                            {item.notes && (
                                <p className="mt-3 text-xs text-gray-500 line-clamp-1 italic font-medium">"{item.notes}"</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
