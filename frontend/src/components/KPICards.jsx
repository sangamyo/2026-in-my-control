import React, { useEffect, useState } from 'react'
import api from '../utils/api'
import { Flame, Target, TrendingUp, Trophy } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function KPICards() {
  const [stats, setStats] = useState({ 
    totalCheckins: 0, 
    currentStreak: 0, 
    completionRate: 0, 
    level: 1,
    weeklyPoints: []
  })

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const res = await api.get('/stats')
      setStats(res.data)
    } catch (e) {
      console.error(e)
    }
  }

  const chartData = stats.weeklyPoints?.length > 0 
    ? stats.weeklyPoints 
    : Array.from({length:7}).map((_,i)=>({ date:`Day ${i+1}`, points: 0 }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          label="Current Streak" 
          value={`${stats.currentStreak} Days`} 
          icon={<Flame size={20} className="text-orange-500" />} 
          color="border-orange-500/20 text-orange-400"
        />
        <StatCard 
          label="Total Check-ins" 
          value={stats.totalCheckins} 
          icon={<Target size={20} className="text-electric" />} 
          color="border-electric/20 text-electric"
        />
        <StatCard 
          label="Consistency" 
          value={`${stats.completionRate}%`} 
          icon={<TrendingUp size={20} className="text-neon-green" />} 
          color="border-neon-green/20 text-neon-green"
        />
        <StatCard 
          label="User Level" 
          value={`Lvl ${stats.level}`} 
          icon={<Trophy size={20} className="text-purple-500" />} 
          color="border-purple-500/20 text-purple-400"
        />
      </div>

      <div className="bg-card p-6 rounded-2xl border border-gray-800 shadow-lg">
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
          <TrendingUp size={18} className="text-neon-green" />
          Weekly Progress
        </h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111217', border: '1px solid #1f2937', borderRadius: '8px' }}
                itemStyle={{ color: '#00f2ff' }}
              />
              <Line 
                type="monotone" 
                dataKey="points" 
                stroke="#00f2ff" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#00f2ff' }} 
                activeDot={{ r: 6, stroke: '#00f2ff', strokeWidth: 2, fill: '#111217' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className={`bg-card p-5 rounded-2xl border ${color} shadow-sm hover:translate-y-[-2px] transition-all`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold tracking-tight text-white">{value}</div>
    </div>
  )
}
