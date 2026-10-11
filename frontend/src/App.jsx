import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom'
import api from './utils/api'
import KPI from './components/KPICards'
import Heatmap from './components/Heatmap'
import Checkin from './components/Checkin'
import AIInsight from './components/AIInsight'
import Login from './pages/Login'
import Register from './pages/Register'
import Settings from './pages/Settings'
import Analytics from './pages/Analytics'
import { LogOut, Home, BarChart3, Target, Settings as SettingsIcon, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function Dashboard({ habits, fetchHabits }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 md:p-10 overflow-y-auto max-w-7xl mx-auto space-y-10">
      <header>
        <h2 className="text-3xl font-bold text-white">Command Center</h2>
        <p className="text-gray-500 mt-1 italic tracking-tight font-medium">"Discipline is the bridge between habits and accomplishment."</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <KPI />
          <div className="bg-card p-6 rounded-2xl border border-gray-800 shadow-xl overflow-hidden hover:border-gray-700 transition-all">
            <Heatmap />
          </div>
          <div className="bg-card p-6 rounded-2xl border border-gray-800 shadow-xl hover:border-gray-700 transition-all">
            <AIInsight />
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-card p-6 rounded-2xl border border-gray-800 shadow-xl hover:border-gray-700 transition-all">
            <Checkin goals={habits} onSaved={fetchHabits} />
          </div>
          <div className="bg-card p-6 rounded-2xl border border-gray-800 shadow-xl hover:border-gray-700 transition-all">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Target size={18} className="text-electric" />
              Active Directives
            </h3>
            <ul className="space-y-3">
              {habits.length === 0 ? (
                <li className="text-sm text-gray-500 italic p-4 text-center border border-dashed border-gray-800 rounded-lg">No habits defined</li>
              ) : (
                habits.filter(h => h.active).map(h => (
                  <li key={h._id} className="text-sm text-gray-300 bg-bg p-3.5 rounded-xl border border-gray-800 flex items-center justify-between group hover:border-electric/30 transition-all">
                    <span>{h.title}</span>
                    <span className="w-2 h-2 rounded-full bg-neon-green shadow-[0_0_8px_rgba(57,255,20,0.5)]"></span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function Sidebar({ logout }) {
  const [isOpen, setIsOpen] = useState(false)
  const navItems = [
    { to: '/', icon: <Home size={20}/>, label: 'Dashboard' },
    { to: '/analytics', icon: <BarChart3 size={20}/>, label: 'Analytics' },
    { to: '/settings', icon: <SettingsIcon size={20}/>, label: 'Settings' }
  ]

  return (
    <>
      {/* Mobile Toggle */}
      <button onClick={() => setIsOpen(!isOpen)} className="md:hidden fixed top-4 right-4 z-50 p-3 bg-card rounded-xl border border-gray-800 text-electric">
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Content */}
      <aside className={`fixed md:sticky top-0 h-screen w-64 bg-card border-r border-gray-800/50 p-8 flex flex-col justify-between z-40 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div>
          <h1 className="text-xl font-black text-electric mb-12 tracking-tighter">CONTROL 2026</h1>
          <nav className="space-y-3">
            {navItems.map(item => (
              <NavLink 
                key={item.to}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className={({isActive}) => `flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${isActive ? 'bg-electric text-black font-bold shadow-lg shadow-electric/20 scale-[1.02]' : 'text-gray-500 hover:bg-gray-800/50 hover:text-white'}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
        <button onClick={logout} className="flex items-center gap-4 text-red-500 hover:text-red-400 font-bold px-5 py-4 transition-colors group">
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Logout</span>
        </button>
      </aside>

      {/* Overlay */}
      {isOpen && <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden" />}
    </>
  )
}

export default function App(){
  const [habits, setHabits] = useState([])
  const [auth, setAuth] = useState(!!localStorage.getItem('token'))

  useEffect(()=>{
    if (auth) fetchHabits()
  },[auth])

  async function fetchHabits(){
    try {
      const res = await api.get('/habits')
      if (Array.isArray(res.data)) setHabits(res.data);
      else setHabits([])
    } catch(e) {
      console.error(e)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setAuth(false)
  }

  return (
    <Router>
      <div className="flex bg-bg min-h-screen text-white font-sans selection:bg-electric/30">
        {auth && <Sidebar logout={logout} />}
        
        <main className="flex-1 relative">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/login" element={!auth ? <Login setAuth={setAuth} /> : <Navigate to="/" />} />
              <Route path="/register" element={!auth ? <Register setAuth={setAuth} /> : <Navigate to="/" />} />
              
              <Route path="/" element={auth ? <Dashboard habits={habits} fetchHabits={fetchHabits} /> : <Navigate to="/login" />} />
              <Route path="/settings" element={auth ? <Settings habits={habits} fetchHabits={fetchHabits} /> : <Navigate to="/login" />} />
              <Route path="/analytics" element={auth ? <Analytics habits={habits} /> : <Navigate to="/login" />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </Router>
  )
}
