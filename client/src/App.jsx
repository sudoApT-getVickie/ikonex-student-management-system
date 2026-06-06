import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import brandLogo from './assets/logo.svg';

function App() {
  const [metrics, setMetrics] = useState({
    students: 0,
    streams: 0,
    scores: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL;

        const [studentsRes, streamsRes] = await Promise.all([
          axios.get(`${API_BASE}/api/students`),
          axios.get(`${API_BASE}/api/streams`)
        ]);

        setMetrics({
          students: studentsRes.data.length,
          streams: streamsRes.data.length,
          scores: 1024
        });
      } catch (error) {
        console.error("Error fetching metrics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  return (
    // Swapped brutal-bg for a very soft gray to make the white cards pop
    <div className="min-h-screen bg-gray-50 text-academy-teal font-sans flex">

      {/* Sidebar Navigation: Now pure white with soft borders */}
      <aside className="w-64 border-r border-gray-200 bg-white hidden md:flex flex-col shadow-sm z-10">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <img src={brandLogo} alt="Ikonex Academy Logo" className="w-8 h-8" />
          <div>
            <h1 className="text-xl font-black tracking-tighter text-academy-teal leading-none">
              IKONEX<span className="text-academy-teal/50">_SMS</span>
            </h1>
            <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-bold">Command Center</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4">
          {/* Active Link Styling */}
          <Link to="/dashboard" className="block p-3 rounded-lg bg-emerald-50 text-emerald-900 border-l-4 border-academy-gold font-bold transition-all">
            Dashboard
          </Link>
          {/* Inactive Link Styling */}
          <Link to="/streams" className="block p-3 rounded-lg text-gray-500 font-semibold transition-all hover:text-academy-teal hover:bg-gray-50">
            Class Streams
          </Link>
          <Link to="/students" className="block p-3 rounded-lg text-gray-500 font-semibold transition-all hover:text-academy-teal hover:bg-gray-50">
            Students Roster
          </Link>
          <Link to="/subjects" className="block p-3 rounded-lg text-gray-500 font-semibold transition-all hover:text-academy-teal hover:bg-gray-50">
            Academic Subjects
          </Link>
          <Link to="/scores" className="block p-3 rounded-lg text-gray-500 font-semibold transition-all hover:text-academy-teal hover:bg-gray-50">
            Performance Logs
          </Link>
          <Link to="/reports" className="block p-3 rounded-lg text-gray-500 font-semibold transition-all hover:text-academy-teal hover:bg-gray-50">
            Print Center
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Top Header */}
        <header className="h-16 border-b border-gray-200 bg-white flex items-center px-8 justify-between shadow-sm">
          <h2 className="text-sm font-bold text-gray-500">System Status: <span className="text-emerald-500 animate-pulse ml-1">● ONLINE</span></h2>

          <Link
            to="/"
            className="px-6 py-2 bg-academy-gold text-academy-teal font-black tracking-widest uppercase border-2 border-academy-teal shadow-[3px_3px_0px_0px_#022B3A] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all duration-200 flex items-center gap-2 group text-xs cursor-pointer"
            title="Securely log out of the Command Center"
          >
            {/* Log Out Door Icon */}
            <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            Log Out
          </Link>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">

          <div className="mb-8">
            <h2 className="text-3xl font-black tracking-tight text-academy-teal">System Overview</h2>
            <p className="text-gray-500 mt-1 text-sm font-medium">Real-time database metrics & institutional health</p>
          </div>

          {/* Dynamic Data Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Metric Card 1 */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
              <h3 className="text-gray-400 font-bold text-xs mb-2 uppercase tracking-widest">Total Students</h3>
              <p className="text-5xl font-black text-academy-teal">
                {isLoading ? "..." : metrics.students}
              </p>
            </div>

            {/* Metric Card 2 */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
              <h3 className="text-gray-400 font-bold text-xs mb-2 uppercase tracking-widest">Active Streams</h3>
              <p className="text-5xl font-black text-academy-teal">
                {isLoading ? "..." : metrics.streams}
              </p>
            </div>

            {/* Metric Card 3 */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] opacity-60">
              <h3 className="text-gray-400 font-bold text-xs mb-2 uppercase tracking-widest">Scores Logged</h3>
              <p className="text-5xl font-black text-academy-teal">
                {isLoading ? "..." : metrics.scores}
              </p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default App;