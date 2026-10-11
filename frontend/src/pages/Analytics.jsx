import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Legend, Cell
} from 'recharts';
import { TrendingUp, Award, AlertCircle, BarChart3, Activity, PieChart } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';

export default function Analytics({ habits: propHabits = [] }) {
  const [data, setData] = useState(null);
  const [range, setRange] = useState(30);
  const [habits, setHabits] = useState(propHabits);

  useEffect(() => {
    fetchAnalytics();
    if (propHabits.length === 0) fetchHabits();
  }, [range]);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get(`/analytics?range=${range}`);
      setData(res.data);
    } catch (e) { console.error(e) }
  };

  const fetchHabits = async () => {
    try {
      const res = await api.get('/habits');
      setHabits(res.data);
    } catch (e) { console.error(e) }
  };

  if (!data) return (
    <div className="flex items-center justify-center p-20 text-electric">
       <BarChart3 className="animate-pulse" size={40} />
    </div>
  );

  const series = data.series.map(s => ({
    ...s,
    formattedDate: format(parseISO(s.date), 'MMM dd'),
    completionRate: Math.round(s.completionRate * 100)
  }));

  const byHabit = data.byGoal.map(bg => {
    const h = habits.find(habit => habit._id === bg._id);
    return {
      name: h ? h.title : 'Archived Habit',
      rate: Math.round(bg.completionRate * 100)
    };
  }).filter(bg => bg.name !== 'Archived Habit');

  const COLORS = ['#00f2ff', '#39FF14', '#A855F7', '#EC4899', '#EAB308'];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h2 className="text-3xl font-bold">Analytics Engine</h2>
           <p className="text-gray-500 mt-1">Deep patterns of your consistency and discipline.</p>
        </div>
        <div className="flex bg-card p-1 rounded-xl border border-gray-800 self-end">
          {[7, 30, 90].map(r => (
            <button 
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${range === r ? 'bg-electric text-black shadow-lg shadow-electric/20' : 'text-gray-500 hover:text-white'}`}
            >
              {r} DAYS
            </button>
          ))}
        </div>
      </header>

      {/* Main Stats Graph */}
      <section className="bg-card p-6 md:p-8 rounded-2xl border border-gray-800 shadow-xl overflow-hidden min-h-[400px]">
        <h3 className="text-lg font-bold mb-8 flex items-center gap-2">
           <Activity className="text-electric" size={20} /> Discipline Momentum
        </h3>
        <div className="h-[300px] w-full">
           <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series}>
                <defs>
                   <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f2ff" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00f2ff" stopOpacity={0}/>
                   </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="formattedDate" stroke="#4b5563" fontSize={11} axisLine={false} tickLine={false} minTickGap={20} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#0D0F14', border: '1px solid #1f2937', color: '#fff', borderRadius: '12px', fontSize: '13px' }}
                   itemStyle={{ color: '#00f2ff' }}
                />
                <Area type="monotone" dataKey="completionRate" name="Consistency" stroke="#00f2ff" strokeWidth={3} fillOpacity={1} fill="url(#colorRate)" />
              </AreaChart>
           </ResponsiveContainer>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Best/Weakest Cards */}
        <section className="space-y-6">
           <div className="bg-card p-6 rounded-2xl border border-gray-800 shadow-xl flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-neon-green/10 flex items-center justify-center border border-neon-green/20">
                 <Award className="text-neon-green" size={28} />
              </div>
              <div>
                 <h4 className="text-xs font-bold text-gray-500 uppercase">Strongest Habit</h4>
                 <p className="text-lg font-bold">{byHabit[0]?.name || 'N/A'}</p>
                 <p className="text-xs text-neon-green font-medium">{byHabit[0]?.rate || 0}% Completion Score</p>
              </div>
           </div>
           
           <div className="bg-card p-6 rounded-2xl border border-gray-800 shadow-xl flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                 <AlertCircle className="text-red-500" size={28} />
              </div>
              <div>
                 <h4 className="text-xs font-bold text-gray-500 uppercase">Focus Required</h4>
                 <p className="text-lg font-bold">{byHabit[byHabit.length - 1]?.name || 'N/A'}</p>
                 <p className="text-xs text-red-500 font-medium">{byHabit[byHabit.length - 1]?.rate || 0}% Completion Score</p>
              </div>
           </div>
        </section>

        {/* Habit Distribution Chart */}
        <section className="bg-card p-6 rounded-2xl border border-gray-800 shadow-xl">
           <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <PieChart className="text-pink-500" size={20} /> Habit Distribution
           </h3>
           <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={byHabit} layout="vertical" margin={{ left: -10, right: 20 }}>
                    <XAxis type="number" hide domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={11} axisLine={false} tickLine={false} width={100} />
                    <Tooltip cursor={{fill: '#1f2937'}} contentStyle={{ backgroundColor: '#0D0F14', border: '1px solid #1f2937', color: '#fff', borderRadius: '12px', fontSize: '11px' }} />
                    <Bar dataKey="rate" name="Score" radius={[0, 6, 6, 0]}>
                       {byHabit.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                    </Bar>
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </section>
      </div>

      {/* Summary Insights */}
      <section className="bg-electric/5 p-6 rounded-2xl border border-electric/20 overflow-hidden relative">
        <TrendingUp className="absolute -top-10 -right-10 opacity-5" size={200} />
        <h3 className="text-electric font-bold text-lg mb-2">Consistency Index Summary</h3>
        <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
          Based on the last {range} days, you have maintained a discipline level of {series.reduce((acc,curr)=>acc+curr.completionRate,0) / (series.length||1) | 0}%. 
          Your momentum is currently <span className="text-electric font-bold">{series.length > 5 && series[series.length-1].completionRate > series[series.length-5].completionRate ? 'Increasing 📈' : 'Stabilizing'}</span>.
        </p>
      </section>
    </motion.div>
  );
}
