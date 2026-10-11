import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

export default function Register({ setAuth }) {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', formData);
      localStorage.setItem('token', res.data.token);
      setAuth(true);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4">
      <div className="bg-card p-8 rounded-xl w-full max-w-md shadow-2xl border border-gray-800">
        <h2 className="text-3xl font-bold text-electric mb-6 text-center">Register</h2>
        {error && <div className="bg-red-900 border border-red-500 text-red-200 p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 mb-1 py-1">Name</label>
            <input name="name" type="text" value={formData.name} onChange={onChange} className="w-full bg-bg border border-gray-700 p-2 rounded text-white focus:outline-none focus:border-electric" required />
          </div>
          <div>
            <label className="block text-gray-400 mb-1 py-1">Email</label>
            <input name="email" type="email" value={formData.email} onChange={onChange} className="w-full bg-bg border border-gray-700 p-2 rounded text-white focus:outline-none focus:border-electric" required />
          </div>
          <div>
            <label className="block text-gray-400 mb-1 py-1">Password</label>
            <input name="password" type="password" value={formData.password} onChange={onChange} className="w-full bg-bg border border-gray-700 p-2 rounded text-white focus:outline-none focus:border-electric" required />
          </div>
          <button type="submit" className="w-full bg-electric hover:bg-blue-600 text-black font-bold py-2 rounded transition-colors mt-4">Register</button>
        </form>
        <p className="text-center text-gray-500 mt-6 text-sm">Already have an account? <Link to="/login" className="text-electric">Login</Link></p>
      </div>
    </div>
  );
}
