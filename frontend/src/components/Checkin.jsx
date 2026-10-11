import React, { useState, useEffect } from 'react'
import api from '../utils/api'
import { Calendar, Check, Loader2, ListChecks, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, addDays, parseISO } from 'date-fns'

export default function Checkin({ goals: habits = [], onSaved }) {
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchLogs()
    }, [date])

    async function fetchLogs() {
        try {
            const res = await api.get(`/checkin?date=${date}`)
            setLogs(res.data)
        } catch (e) {
            console.error(e)
        }
    }

    async function toggleHabit(habitId, currentCompleted) {
        try {
            await api.post('/checkin', { 
                date, 
                habitId, 
                completed: !currentCompleted,
                score: 1 
            })
            fetchLogs()
            if (onSaved) onSaved()
        } catch (e) {
            console.error(e)
        }
    }

    const changeDate = (offset) => {
        const newDate = addDays(parseISO(date), offset) // parseISO keeps local time; new Date('yyyy-MM-dd') is UTC
        setDate(format(newDate, 'yyyy-MM-dd'))
    }

    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <ListChecks size={20} className="text-electric" />
                        Habit Tracker
                    </h3>
                </div>

                <div className="flex items-center gap-2 bg-[#0D0F14] p-1 rounded-xl border border-gray-800">
                    <button onClick={() => changeDate(-1)} className="p-2 hover:bg-gray-800 rounded-lg text-gray-500 hover:text-white transition-colors">
                        <ChevronLeft size={18} />
                    </button>
                    <div className="flex-1 text-center font-bold text-sm text-white">
                        {date === format(new Date(), 'yyyy-MM-dd') ? 'Today' : date}
                    </div>
                    <button onClick={() => changeDate(1)} className="p-2 hover:bg-gray-800 rounded-lg text-gray-500 hover:text-white transition-colors">
                        <ChevronRight size={18} />
                    </button>
                    <input 
                      type="date" 
                      value={date} 
                      onChange={e => setDate(e.target.value)}
                      className="hidden" // Or styled icon trigger
                      id="date-picker"
                    />
                    <label htmlFor="date-picker" className="p-2 hover:bg-gray-800 rounded-lg text-gray-500 hover:text-white cursor-pointer transition-colors">
                        <Calendar size={18} />
                    </label>
                </div>
            </header>
            
            <div className="space-y-2 border-t border-gray-800 pt-4">
                {habits.filter(h => h.active).length === 0 ? (
                    <p className="text-center text-gray-500 text-sm italic py-8">No active habits. Add some in Settings!</p>
                ) : (
                    habits.filter(h => h.active).map(habit => {
                        const log = logs.find(l => l.habitId === habit._id);
                        const isDone = log ? log.completed : false;

                        return (
                            <div 
                                key={habit._id} 
                                onClick={() => toggleHabit(habit._id, isDone)}
                                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                                    isDone 
                                    ? 'bg-electric/10 border-electric/30' 
                                    : 'bg-[#0D0F14] border-gray-800 hover:border-gray-700'
                                } group`}
                            >
                                <span className={`text-sm font-medium transition-colors ${isDone ? 'text-electric' : 'text-gray-400 group-hover:text-white'}`}>
                                    {habit.title}
                                </span>
                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                    isDone 
                                    ? 'bg-electric border-electric shadow-[0_0_10px_rgba(0,242,255,0.4)]' 
                                    : 'border-gray-700'
                                }`}>
                                    {isDone && <Check size={16} className="text-black stroke-[3px]" />}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="bg-electric/5 p-4 rounded-2xl border border-electric/20">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    <span>Daily Progress</span>
                    <span>{Math.round((logs.filter(l => l.completed).length / Math.max(1, habits.filter(h => h.active).length)) * 100)}%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-900 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-electric transition-all duration-500 ease-out"
                        style={{ width: `${(logs.filter(l => l.completed).length / Math.max(1, habits.filter(h => h.active).length)) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    )
}
