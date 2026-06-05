import React, { useState, useEffect } from 'react';
import axios from 'axios';
import brandLogo from './assets/logo.svg';

function App() {
  // 1. Initialize State
  const [metrics, setMetrics] = useState({
    students: 0,
    streams: 0,
    scores: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // 2. Fetch Data on Component Mount
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Use Vite's environment variable syntax
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
    <div className="min-h-screen bg-brutal-bg text-white font-sans flex">

      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-brutal-border bg-brutal-card hidden md:flex flex-col">
        <div className="p-6 border-b border-brutal-border flex items-center gap-3">
          <img src={brandLogo} alt="Ikonex Academy Logo" className="w-8 h-8" />
          <div>
            <h1 className="text-xl font-black tracking-tighter text-brutal-gold font-mono leading-none">
              IKONEX<span className="text-white">_SMS</span>
            </h1>
            <p className="text-[10px] text-gray-400 mt-1 font-mono uppercase tracking-widest">Command Center</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4">
          <a href="#" className="block p-3 rounded-sm bg-brutal-bg border border-brutal-border text-brutal-gold font-bold transition">
            Dashboard
          </a>
          <a href="#" className="block p-3 rounded-sm text-gray-400 font-medium transition hover:text-white hover:bg-gray-800">
            Class Streams
          </a>
          <a href="#" className="block p-3 rounded-sm text-gray-400 font-medium transition hover:text-white hover:bg-gray-800">
            Students Roster
          </a>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">

        <header className="h-16 border-b border-brutal-border bg-brutal-card flex items-center px-8 justify-between">
          <h2 className="text-sm font-mono font-bold text-gray-300">
            System Status: <span className="text-green-500 animate-pulse">● ONLINE</span>
          </h2>
          <div className="text-sm font-mono text-brutal-gold border border-brutal-gold px-3 py-1 bg-brutal-bg">
            ADMIN ACCESS
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">

          <div className="mb-8">
            <h2 className="text-3xl font-black tracking-tight">System Overview</h2>
            <p className="text-gray-400 mt-1 font-mono text-sm">Real-time database metrics</p>
          </div>

          {/* Dynamic Data Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div className="border border-brutal-border bg-brutal-card p-6">
              <h3 className="text-gray-400 font-mono text-xs mb-2 uppercase tracking-widest">Total Students</h3>
              <p className="text-4xl font-black text-brutal-gold">
                {isLoading ? "..." : metrics.students}
              </p>
            </div>

            <div className="border border-brutal-border bg-brutal-card p-6">
              <h3 className="text-gray-400 font-mono text-xs mb-2 uppercase tracking-widest">Active Streams</h3>
              <p className="text-4xl font-black text-brutal-gold">
                {isLoading ? "..." : metrics.streams}
              </p>
            </div>

            <div className="border border-brutal-border bg-brutal-card p-6 opacity-50">
              <h3 className="text-gray-400 font-mono text-xs mb-2 uppercase tracking-widest">Scores Logged</h3>
              <p className="text-4xl font-black text-brutal-gold">
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