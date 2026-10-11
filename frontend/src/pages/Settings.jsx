import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Target, Trash2, Edit2, RotateCcw, Lock, Save, Plus, ArrowLeft, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Settings({ habits: propHabits = [], fetchHabits }) {
  const [habits, setHabits] = useState(propHabits);
  const [newName, setNewName] = useState('');
  const [profile, setProfile] = useState({ name: '', password: '' });
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    fetchLocalHabits();
    fetchProfile();
  }, []);

  async function fetchLocalHabits() {
    try {
      const res = await api.get('/habits');
      setHabits(res.data);
    } catch (e) { console.error(e) }
  }

  async function fetchProfile() {
    try {
      const res = await api.get('/auth/me');
      setProfile({ ...profile, name: res.data.name });
    } catch (e) { console.error(e) }
  }

  const addHabit = async () => {
    if (!newName.trim()) return;
    try {
      await api.post('/habits', { title: newName });
      setNewName('');
      fetchLocalHabits();
      if (fetchHabits) fetchHabits();
    } catch (e) { console.error(e) }
  };

  const toggleStatus = async (habit) => {
    try {
      await api.put(`/habits/${habit._id}`, { active: !habit.active });
      fetchLocalHabits();
      if (fetchHabits) fetchHabits();
    } catch (e) { console.error(e) }
  };

  const deleteHabit = async (id) => {
    if (!window.confirm("Delete this habit permanently?")) return;
    try {
      await api.delete(`/habits/${id}`);
      fetchLocalHabits();
      if (fetchHabits) fetchHabits();
    } catch (e) { console.error(e) }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/profile', profile);
      setStatusMsg('Profile updated successfully!');
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (e) { setStatusMsg('Failed to update profile') }
  };

  const resetProgress = async () => {
    if (!window.confirm("RESET ALL PROGRESS? This cannot be undone.")) return;
    try {
      await api.delete('/auth/reset-progress');
      alert("All progress cleared.");
    } catch (e) { console.error(e) }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 md:p-10 max-w-4xl mx-auto space-y-10 pb-20">
      <header className="flex items-center gap-4 mb-8">
        <h2 className="text-3xl font-bold">Settings</h2>
      </header>

      {/* Habit Management Section */}
      <section className="bg-card p-6 rounded-2xl border border-gray-800 shadow-xl space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Calendar className="text-electric" size={22} /> Habit Directives
        </h3>
        
        <div className="flex gap-3">
          <input 
            className="flex-1 bg-bg border border-gray-800 p-3 rounded-xl outline-none focus:ring-1 focus:ring-electric"
            placeholder="E.g. Morning Meditation, Read 20 mins..." 
            value={newName} 
            onChange={e => setNewName(e.target.value)}
          />
          <button onClick={addHabit} className="bg-electric text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90">
            <Plus size={20} /> Deploy
          </button>
        </div>

        <div className="space-y-3 mt-4">
          {habits.map(h => (
            <div key={h._id} className="flex items-center justify-between p-4 bg-bg border border-gray-800 rounded-xl group">
              <div className="flex flex-col">
                <span className={`font-medium ${!h.active ? 'text-gray-600 line-through' : ''}`}>{h.title}</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">{h.active ? 'Active' : 'Archived'}</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => toggleStatus(h)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    h.active ? 'border-neon-green/30 text-neon-green bg-neon-green/5' : 'border-gray-700 text-gray-500'
                  }`}
                >
                  {h.active ? 'Pause' : 'Activate'}
                </button>
                <button onClick={() => deleteHabit(h._id)} className="p-2 text-red-500 bg-red-500/5 rounded-lg border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Profile Section */}
      <section className="bg-card p-6 rounded-2xl border border-gray-800 shadow-xl space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Lock className="text-purple-500" size={22} /> Security & Profile
        </h3>
        <form onSubmit={updateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Display Name</label>
            <input 
              className="w-full bg-bg border border-gray-800 p-3 rounded-xl outline-none focus:ring-1 focus:ring-purple-500"
              value={profile.name} 
              onChange={e => setProfile({...profile, name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Change Password</label>
            <input 
              type="password"
              className="w-full bg-bg border border-gray-800 p-3 rounded-xl outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="Leave blank to keep current"
              value={profile.password} 
              onChange={e => setProfile({...profile, password: e.target.value})}
            />
          </div>
          <div className="md:col-span-2 flex justify-between items-center pt-4">
             {statusMsg && <p className="text-sm font-medium text-electric">{statusMsg}</p>}
             <button type="submit" className="bg-white text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 ml-auto hover:bg-gray-200">
               <Save size={20} /> Save Changes
             </button>
          </div>
        </form>
      </section>

      {/* Danger Zone */}
      <section className="bg-red-950/20 p-6 rounded-2xl border border-red-900/40 space-y-4">
        <h3 className="text-red-500 font-bold text-lg flex items-center gap-2">
          <RotateCcw size={20} /> Danger Zone
        </h3>
        <p className="text-sm text-gray-400">Permanently reset all your check-ins, heatmap data, and stats. Current active goals will be preserved.</p>
        <button onClick={resetProgress} className="bg-red-600/10 text-red-500 border border-red-600/30 px-6 py-2 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all text-sm">
          Reset Progress Data
        </button>
      </section>
    </motion.div>
  );
}
