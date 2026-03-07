import React, { useMemo } from "react";
import { formatDate } from "../utils/formatters";
import { ArrowTrendingUpIcon, BanknotesIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function Savings({ totalSavings, history }) {
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  // Calculate cumulative savings for the chart
  const chartData = useMemo(() => {
    let cumulative = 0;
    // History is usually sorted desc (newest first). Let's flip it for the chart.
    return [...history].reverse().map(item => {
      cumulative += item.savings;
      return {
        month: item.month,
        amount: cumulative
      };
    });
  }, [history]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto">
        
        {/* HERO CARD */}
        <div className="rounded-[2.5rem] p-10 bg-gradient-to-br from-emerald-600 to-teal-900 text-white shadow-2xl shadow-emerald-900/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-1000">
                <BanknotesIcon className="h-56 w-56 -rotate-12" />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">
                <div>
                    <p className="text-emerald-100 font-black uppercase tracking-[0.3em] text-xs">Accumulated Wealth</p>
                    <h1 className="text-7xl font-black mt-4 drop-shadow-2xl tracking-tighter">
                       {formatCurrency(totalSavings)}
                    </h1>
                    <div className="mt-8 flex items-center gap-4">
                        <span className="bg-white/10 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest backdrop-blur-md border border-white/10 flex items-center gap-2">
                             Net Position
                        </span>
                        {totalSavings > 0 && (
                            <span className="bg-white/10 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest backdrop-blur-md border border-white/10 text-emerald-100 flex items-center gap-2">
                                <ArrowTrendingUpIcon className="h-4 w-4" />
                                On Target
                            </span>
                        )}
                    </div>
                </div>
                
                <div className="w-full md:w-64 h-24 bg-white/5 rounded-3xl border border-white/10 p-4 backdrop-blur-sm hidden lg:block">
                     <p className="text-[10px] font-black uppercase tracking-widest text-emerald-200/50 mb-2">Monthly Saving</p>
                     <div className="flex items-center justify-between">
                         <span className="text-2xl font-black text-white">
                            {history[0] ? formatCurrency(history[0].savings) : '₹ 0'}
                         </span>
                         <span className="text-[10px] text-emerald-300 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                            {history[0]?.savings >= 0 ? 'Surplus' : 'Deficit'}
                         </span>
                     </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* GROWTH CHART */}
            <div className="xl:col-span-8 bg-white dark:bg-[#111827] rounded-[2.5rem] p-10 border border-gray-100 dark:border-white/5 shadow-xl">
                <div className="flex items-center gap-3 mb-10">
                    <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500">
                        <ChartBarIcon className="h-6 w-6" />
                    </div>
                    <h3 className="text-2xl font-bold dark:text-white">Growth Trajectory</h3>
                </div>
                
                <div className="h-[350px] w-full">
                    {chartData.length < 2 ? (
                        <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50 dark:bg-white/5 rounded-3xl border border-dashed border-gray-200">
                            Collect at least 2 months of history to see growth patterns.
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-800" />
                                <XAxis dataKey="month" hide />
                                <YAxis hide />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', backgroundColor: '#1f2937', color: '#fff' }}
                                    itemStyle={{ fontSize: '14px', fontWeight: '900', color: '#10B981' }}
                                    labelStyle={{ color: '#9CA3AF' }}
                                    labelFormatter={(label) => formatDate(label)}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="amount" 
                                    stroke="#10B981" 
                                    strokeWidth={4} 
                                    fillOpacity={1} 
                                    fill="url(#colorGrowth)" 
                                    animationDuration={2500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* HISTORY LEGEND */}
            <div className="xl:col-span-4 bg-white dark:bg-[#111827] rounded-[2.5rem] p-10 border border-gray-100 dark:border-white/5 shadow-xl">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Performance</h3>
                
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {history.length === 0 ? (
                        <p className="text-gray-400 italic text-center py-10">No history yet.</p>
                    ) : (
                        history.map((item, idx) => (
                            <div key={idx} className="p-5 bg-gray-50 dark:bg-white/5 rounded-[1.5rem] flex items-center justify-between border border-transparent hover:border-emerald-500/30 transition-all group">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{formatDate(item.month)}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Limit: {formatCurrency(item.budget)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-lg font-black ${item.savings >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {item.savings >= 0 ? '+' : ''}{formatCurrency(item.savings)}
                                    </p>
                                    <p className="text-[10px] font-bold text-gray-300 dark:text-gray-600 uppercase">Monthly Delta</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    </div>
  );
}
