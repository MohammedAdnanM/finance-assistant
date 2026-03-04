import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { BanknotesIcon, ChartPieIcon, PresentationChartLineIcon, WalletIcon } from "@heroicons/react/24/outline";

export default function Analytics({ transactions, budget }) {
  
  const stats = useMemo(() => {
    const expenses = transactions.filter(t => !t.type || t.type.toLowerCase() === 'expense');
    const income = transactions.filter(t => t.type && t.type.toLowerCase() === 'income');
    
    const totalSpent = expenses.reduce((s, t) => s + Number(t.amount), 0);
    const totalIncome = income.reduce((s, t) => s + Number(t.amount), 0);
    
    const catData = {};
    expenses.forEach(t => {
      const cat = t.category || "Uncategorized";
      catData[cat] = (catData[cat] || 0) + Number(t.amount);
    });

    // Group by date for line chart
    const dailyData = {};
    transactions.forEach(t => {
      if (!dailyData[t.date]) dailyData[t.date] = { date: t.date, income: 0, expense: 0 };
      if (t.type && t.type.toLowerCase() === 'income') {
        dailyData[t.date].income += Number(t.amount);
      } else {
        dailyData[t.date].expense += Number(t.amount);
      }
    });

    const sortedDaily = Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));
    const sortedCats = Object.keys(catData).map(k => ({ name: k, value: catData[k] })).sort((a,b) => b.value - a.value);

    // Saving calculation: (Budget - Expenses) + Income
    const netSavings = (Number(budget) - totalSpent) + totalIncome;

    return {
      totalSpent,
      totalIncome,
      savings: netSavings,
      savingsRate: budget > 0 ? (Math.max(0, netSavings / (Number(budget) + totalIncome)) * 100).toFixed(1) : 0,
      daily: sortedDaily,
      categories: sortedCats,
      cashflow: [
        { name: 'Income', value: totalIncome, color: '#10B981' },
        { name: 'Expenses', value: totalSpent, color: '#F43F5E' }
      ]
    };
  }, [transactions, budget]);

  const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#F59E0B', '#10B981'];

  return (
    <section className="space-y-6">
      {/* Analytics Header Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex items-center gap-4">
             <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
                <WalletIcon className="h-6 w-6" />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Monthly Savings</p>
                <h4 className="text-xl font-black text-gray-900 dark:text-white">₹{stats.savings.toLocaleString()}</h4>
             </div>
        </div>
        <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex items-center gap-4">
             <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500">
                <PresentationChartLineIcon className="h-6 w-6" />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Savings Rate</p>
                <h4 className="text-xl font-black text-gray-900 dark:text-white">{stats.savingsRate}%</h4>
             </div>
        </div>
        <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex items-center gap-4">
             <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500">
                <BanknotesIcon className="h-6 w-6" />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Top Expense</p>
                <h4 className="text-xl font-black text-gray-900 dark:text-white truncate max-w-[120px]">
                    {stats.categories[0]?.name || "N/A"}
                </h4>
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Trend Visualization */}
        <div className="bg-white dark:bg-[#111827] p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <PresentationChartLineIcon className="h-4 w-4 text-indigo-500" />
                Income vs Expenses
            </h4>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.daily}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-800" />
                <XAxis dataKey="date" hide />
                <YAxis stroke="#6B7280" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#1f2937', color: '#fff' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}
                    labelStyle={{ color: '#9CA3AF', marginBottom: '4px', fontSize: '10px' }}
                />
                <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={4} dot={false} animationDuration={2000} />
                <Line type="monotone" dataKey="expense" stroke="#F43F5E" strokeWidth={4} dot={false} animationDuration={2000} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Visualization */}
        <div className="bg-white dark:bg-[#111827] p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-xl overflow-hidden">
           <div className="flex items-center justify-between mb-8">
                <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <ChartPieIcon className="h-4 w-4 text-purple-500" />
                    Spending Breakdown
                </h4>
            </div>
            <div className="flex flex-col items-center gap-8">
                {/* Chart on Top */}
                <div className="w-full h-[250px] flex justify-center items-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={stats.categories}
                                innerRadius={70}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                                cx="50%"
                                cy="50%"
                            >
                                {stats.categories.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#1f2937', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                
                {/* Labels at the Bottom */}
                <div className="w-full">
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {stats.categories.slice(0, 6).map((cat, i) => (
                        <div key={i} title={cat.name} className="p-3 bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-all flex flex-col justify-between group">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate group-hover:whitespace-normal group-hover:text-indigo-400 transition-colors">{cat.name}</span>
                                </div>
                                <span className="text-[10px] font-black text-gray-500 shrink-0">{((cat.value / stats.totalSpent) * 100).toFixed(0)}%</span>
                            </div>
                            <p className="text-sm font-black dark:text-white">₹{cat.value.toLocaleString()}</p>
                        </div>
                    ))}
                   </div>
                </div>
            </div>
        </div>

        {/* Cashflow Bar Chart */}
        <div className="bg-white dark:bg-[#111827] p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-xl xl:col-span-2 overflow-hidden">
             <div className="flex items-center justify-between mb-8">
                <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <BanknotesIcon className="h-4 w-4 text-emerald-500" />
                    Category Rankings
                </h4>
            </div>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.categories.slice(0, 8)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" className="dark:stroke-gray-800" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" stroke="#6B7280" fontSize={10} axisLine={false} tickLine={false} width={100} />
                        <Tooltip 
                             cursor={{fill: 'rgba(99, 102, 241, 0.05)'}}
                             contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#1f2937', color: '#fff' }}
                             itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                             labelStyle={{ color: '#9CA3AF' }}
                        />
                        <Bar dataKey="value" radius={[0, 10, 10, 0]} fill="#6366F1" animationDuration={1500} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

      </div>
    </section>
  );
}
