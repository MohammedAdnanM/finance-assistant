import React, { useMemo } from "react";
import { formatDate } from "../utils/formatters";
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

export default function Analytics({ transactions, budget, savingsData }) {
  
  const stats = useMemo(() => {
    const expenses = transactions.filter(t => !t.type || t.type.toLowerCase() === 'expense');
    const income = transactions.filter(t => t.type && t.type.toLowerCase() === 'income');
    
    const totalSpent = expenses.reduce((s, t) => s + Number(t.amount), 0);
    const totalIncome = income.reduce((s, t) => s + Number(t.amount), 0);
    
    // Group Spending categories
    const catData = {};
    expenses.forEach(t => {
      const cat = t.category || "Uncategorized";
      catData[cat] = (catData[cat] || 0) + Number(t.amount);
    });

    // Group Income categories
    const incomeCatData = {};
    income.forEach(t => {
        const cat = t.category || "General Income";
        incomeCatData[cat] = (incomeCatData[cat] || 0) + Number(t.amount);
    });

    // Group by date for line chart & calculate cumulative net worth
    const dailyData = {};
    transactions.forEach(t => {
      if (!dailyData[t.date]) dailyData[t.date] = { date: t.date, income: 0, expense: 0 };
      if (t.type && t.type.toLowerCase() === 'income') {
        dailyData[t.date].income += Number(t.amount);
      } else {
        dailyData[t.date].expense += Number(t.amount);
      }
    });

    const currMonthNet = totalIncome - totalSpent;
    const historyTotalSavings = (savingsData?.total_savings || 0);
    let cumulativeBalance = historyTotalSavings - currMonthNet; // Starting point for this month
    
    const sortedDaily = Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));
    const trendWithNetWorth = sortedDaily.map(d => {
        cumulativeBalance += (d.income - d.expense);
        return { ...d, netWorth: cumulativeBalance };
    });

    const sortedCats = Object.keys(catData).map(k => ({ name: k, value: catData[k] })).sort((a,b) => b.value - a.value);
    const sortedIncomeCats = Object.keys(incomeCatData).map(k => ({ name: k, value: incomeCatData[k] })).sort((a,b) => b.value - a.value);

    // Saving calculation: (Budget - Expenses) + Income
    // Wait, let's keep it simple: Net = Income - Expenses
    const monthlyNetFlow = totalIncome - totalSpent;

    return {
      totalSpent,
      totalIncome,
      netFlow: monthlyNetFlow,
      ratio: totalSpent > 0 ? (totalIncome / totalSpent).toFixed(2) : (totalIncome > 0 ? "∞" : "0.00"),
      savingsRate: totalIncome > 0 ? (Math.max(0, (totalIncome - totalSpent) / totalIncome) * 100).toFixed(1) : 0,
      daily: trendWithNetWorth,
      categories: sortedCats,
      incomeCategories: sortedIncomeCats,
    };
  }, [transactions, budget, savingsData]);

  const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#F59E0B', '#10B981'];

  return (
    <section className="space-y-6">
      {/* Analytics Header Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex items-center gap-4">
             <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
                <WalletIcon className="h-6 w-6" />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Monthly Net Flow</p>
                <h4 className={`text-xl font-black ${stats.netFlow >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {stats.netFlow >= 0 ? '+' : ''}₹{stats.netFlow.toLocaleString()}
                </h4>
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
             <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
                <ChartPieIcon className="h-6 w-6" />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">I:E Ratio</p>
                <h4 className="text-xl font-black text-gray-900 dark:text-white">{stats.ratio}x</h4>
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
        
        {/* Trend Visualization: Income vs Expenses */}
        <div className="bg-white dark:bg-[#111827] p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
                <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <PresentationChartLineIcon className="h-4 w-4 text-indigo-500" />
                    Cash Flow Activity
                </h4>
                <p className="text-[10px] text-gray-400 mt-1 font-bold">Daily income vs spending intensity</p>
            </div>
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
                    labelFormatter={(label) => formatDate(label)}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                <Line name="Income" type="monotone" dataKey="income" stroke="#10B981" strokeWidth={4} dot={false} animationDuration={2000} />
                <Line name="Expense" type="monotone" dataKey="expense" stroke="#F43F5E" strokeWidth={4} dot={false} animationDuration={2000} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Net Worth Trend Chart */}
        <div className="bg-white dark:bg-[#111827] p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
                <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <WalletIcon className="h-4 w-4 text-emerald-500" />
                    Assets & Net Worth
                </h4>
                <p className="text-[10px] text-gray-400 mt-1 font-bold">Cumulative financial growth trajectory</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.daily}>
                <defs>
                  <linearGradient id="colorWorth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-800" />
                <XAxis dataKey="date" hide />
                <YAxis stroke="#6B7280" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#1f2937', color: '#fff' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}
                    labelStyle={{ color: '#9CA3AF', marginBottom: '4px', fontSize: '10px' }}
                    labelFormatter={(label) => formatDate(label)}
                />
                <Line name="Net Worth" type="stepAfter" dataKey="netWorth" stroke="#10B981" strokeWidth={4} dot={false} animationDuration={2500} fillOpacity={1} fill="url(#colorWorth)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Visualization: Spending */}
        <div className="bg-white dark:bg-[#111827] p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-xl overflow-hidden">
           <div className="flex items-center justify-between mb-8">
                <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <ChartPieIcon className="h-4 w-4 text-rose-500" />
                    Spending Breakdown
                </h4>
            </div>
            <div className="flex flex-col items-center gap-8">
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
                
                <div className="w-full">
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {stats.categories.slice(0, 6).map((cat, i) => (
                        <div key={i} title={cat.name} className="p-3 bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-all flex flex-col justify-between group">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate group-hover:whitespace-normal group-hover:text-indigo-400 transition-colors">{cat.name}</span>
                                </div>
                                <span className="text-[10px] font-black text-gray-500 shrink-0">{stats.totalSpent > 0 ? ((cat.value / stats.totalSpent) * 100).toFixed(0) : 0}%</span>
                            </div>
                            <p className="text-sm font-black dark:text-white">₹{cat.value.toLocaleString()}</p>
                        </div>
                    ))}
                   </div>
                </div>
            </div>
        </div>

        {/* Categories Visualization: Income Sources */}
        <div className="bg-white dark:bg-[#111827] p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-xl overflow-hidden">
           <div className="flex items-center justify-between mb-8">
                <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <BanknotesIcon className="h-4 w-4 text-emerald-500" />
                    Income Streams
                </h4>
            </div>
            <div className="flex flex-col items-center gap-8">
                <div className="w-full h-[250px] flex justify-center items-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={stats.incomeCategories.length > 0 ? stats.incomeCategories : [{name: 'No Income', value: 1}]}
                                innerRadius={70}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                                cx="50%"
                                cy="50%"
                            >
                                {stats.incomeCategories.map((entry, index) => (
                                    <Cell key={`cell-income-${index}`} fill={['#10B981', '#34D399', '#6EE7B7', '#A7F3D0'][index % 4]} />
                                ))}
                                {stats.incomeCategories.length === 0 && <Cell fill="#374151" />}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#1f2937', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                
                <div className="w-full">
                   <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
                    {stats.incomeCategories.slice(0, 4).map((cat, i) => (
                        <div key={i} title={cat.name} className="p-3 bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-all flex flex-col justify-between group">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0'][i % 4] }}></div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate group-hover:whitespace-normal group-hover:text-emerald-400 transition-colors">{cat.name}</span>
                                </div>
                                <span className="text-[10px] font-black text-gray-500 shrink-0">{stats.totalIncome > 0 ? ((cat.value / stats.totalIncome) * 100).toFixed(0) : 0}%</span>
                            </div>
                            <p className="text-sm font-black dark:text-white">₹{cat.value.toLocaleString()}</p>
                        </div>
                    ))}
                    {stats.incomeCategories.length === 0 && (
                        <div className="col-span-2 text-center py-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest italic">No income sources recorded</div>
                    )}
                   </div>
                </div>
            </div>
        </div>

      </div>
    </section>
  );
}
