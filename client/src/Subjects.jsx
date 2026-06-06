import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import brandLogo from './assets/logo.svg';

export default function Subjects() {
    const [subjects, setSubjects] = useState([]);
    const [streams, setStreams] = useState([]);

    const [newSubject, setNewSubject] = useState({ name: '', code: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Assignment Modal State
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [selectedStreamId, setSelectedStreamId] = useState('');
    const [assignSuccess, setAssignSuccess] = useState(null);

    const API_BASE = import.meta.env.VITE_API_URL;

    useEffect(() => {
        fetchData();
    }, [API_BASE]);

    const fetchData = async () => {
        try {
            const [subjectsRes, streamsRes] = await Promise.all([
                axios.get(`${API_BASE}/api/subjects`),
                axios.get(`${API_BASE}/api/streams`)
            ]);
            setSubjects(subjectsRes.data);
            setStreams(streamsRes.data);
        } catch (err) {
            setError("Failed to establish database connection.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- DATA SANITIZATION ENGINES ---
    const formatSubjectCode = (input) => {
        let clean = input.trim().toUpperCase();
        const match = clean.match(/^([A-Z]+)[\s-]*(\d+)$/i);
        if (match) return `${match[1]}-${match[2]}`; // Forces "MAT-101"
        return clean;
    };

    const formatName = (input) => {
        return input.trim().toLowerCase().split(/\s+/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };
    // ---------------------------------

    const handleCreateSubject = async (e) => {
        e.preventDefault();
        setError(null);
        if (!newSubject.name || !newSubject.code) return;

        const sanitizedCode = formatSubjectCode(newSubject.code);
        const sanitizedName = formatName(newSubject.name);

        try {
            const response = await axios.post(`${API_BASE}/api/subjects`, {
                name: sanitizedName,
                code: sanitizedCode
            });
            setSubjects([...subjects, response.data]);
            setNewSubject({ name: '', code: '' });
        } catch (err) {
            if (err.response && err.response.status === 400) {
                setError(err.response.data.error);
            } else {
                setError("Failed to initialize subject.");
            }
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Permanently delete this subject? All stream assignments will be lost.")) return;
        try {
            await axios.delete(`${API_BASE}/api/subjects/${id}`);
            setSubjects(subjects.filter(s => s.id !== id));
        } catch (err) {
            setError("Failed to drop subject.");
        }
    };

    // Junction Table Assignment Execution
    const handleAssignSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setAssignSuccess(null);

        if (!selectedStreamId || !selectedSubject) return;

        try {
            await axios.post(`${API_BASE}/api/subjects/assign`, {
                stream_id: selectedStreamId,
                subject_id: selectedSubject.id
            });
            setAssignSuccess(`Successfully mapped ${selectedSubject.code} to the selected stream.`);
            setTimeout(() => {
                setAssignModalOpen(false);
                setAssignSuccess(null);
                setSelectedStreamId('');
            }, 2000);
        } catch (err) {
            if (err.response && err.response.status === 400) {
                setError(err.response.data.error);
            } else {
                setError("Failed to map subject. It may already be assigned.");
            }
        }
    };

    const openAssignModal = (subject) => {
        setSelectedSubject(subject);
        setAssignModalOpen(true);
        setError(null);
        setAssignSuccess(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 text-academy-teal font-sans flex relative">

            {/* Sidebar Navigation */}
            <aside className="w-64 border-r border-gray-200 bg-white hidden md:flex flex-col shadow-sm z-10">
                <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                    <img src={brandLogo} alt="Logo" className="w-8 h-8" />
                    <div>
                        <h1 className="text-xl font-black tracking-tighter text-academy-teal leading-none">
                            IKONEX<span className="text-academy-teal/50">_SMS</span>
                        </h1>
                        <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-bold">Command Center</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2 mt-4">
                    <Link to="/dashboard" className="block p-3 rounded-lg text-gray-500 font-semibold transition-all hover:text-academy-teal hover:bg-gray-50">Dashboard</Link>
                    <Link to="/streams" className="block p-3 rounded-lg text-gray-500 font-semibold transition-all hover:text-academy-teal hover:bg-gray-50">Class Streams</Link>
                    <Link to="/students" className="block p-3 rounded-lg text-gray-500 font-semibold transition-all hover:text-academy-teal hover:bg-gray-50">Students Roster</Link>
                    <Link to="/subjects" className="block p-3 rounded-lg bg-emerald-50 text-emerald-900 border-l-4 border-academy-gold font-bold transition-all shadow-sm">Academic Subjects</Link>
                </nav>
            </aside>

            <main className="flex-1 flex flex-col h-screen overflow-hidden">

                <header className="h-16 border-b border-gray-200 bg-white flex items-center px-8 justify-between shadow-sm">
                    <h2 className="text-sm font-bold text-gray-500">
                        System Status: <span className="text-emerald-500 animate-pulse ml-1">● ONLINE</span>
                    </h2>
                    <div className="text-xs font-bold text-academy-teal border-2 border-academy-gold rounded-full px-4 py-1.5 bg-yellow-50">ADMIN ACCESS</div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">

                    <div className="mb-8">
                        <h2 className="text-3xl font-black tracking-tight text-academy-teal">Academic Subjects</h2>
                        <p className="text-gray-500 mt-1 text-sm font-medium">Manage curriculum catalog and stream mapping.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Create Subject Form */}
                        <div className="lg:col-span-1">
                            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                                <h3 className="font-bold text-lg mb-4 text-academy-teal border-b border-gray-100 pb-3">Initialize Subject</h3>

                                {error && !assignModalOpen && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-lg flex items-start gap-2">
                                        <span>⚠️</span> {error}
                                    </div>
                                )}

                                <form onSubmit={handleCreateSubject} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-widest">Subject Code</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. mat 101"
                                            value={newSubject.code}
                                            onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-academy-teal focus:outline-none focus:border-academy-gold transition-all text-sm font-medium"
                                            required
                                        />
                                        <p className="text-[10px] text-gray-400 mt-1 font-medium">Auto-formats to: MAT-101</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-widest">Subject Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Mathematics"
                                            value={newSubject.name}
                                            onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-academy-teal focus:outline-none focus:border-academy-gold transition-all text-sm font-medium"
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="w-full bg-academy-gold text-academy-teal font-black uppercase tracking-widest py-3 mt-2 rounded-lg hover:bg-yellow-400 hover:shadow-md transition-all duration-200">
                                        Deploy Subject
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Subjects Roster Table */}
                        <div className="lg:col-span-2">
                            <div className="bg-white border border-gray-100 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
                                <div className="p-5 border-b border-gray-100 bg-white flex justify-between items-center">
                                    <h3 className="font-bold text-academy-teal">Curriculum Database</h3>
                                    <span className="text-xs font-bold bg-gray-100 text-gray-500 px-3 py-1 rounded-full">{subjects.length} Records</span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-gray-50/50">
                                            <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                <th className="p-4 pl-6">Code</th>
                                                <th className="p-4">Subject Name</th>
                                                <th className="p-4 pr-6 text-right">Routing & Management</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {isLoading ? (
                                                <tr><td colSpan="3" className="p-8 text-center text-gray-400 font-medium text-sm">Loading records...</td></tr>
                                            ) : subjects.length === 0 ? (
                                                <tr><td colSpan="3" className="p-8 text-center text-gray-400 font-medium text-sm">No subjects initialized.</td></tr>
                                            ) : (
                                                subjects.map((subject) => (
                                                    <tr key={subject.id} className="border-b border-gray-50 hover:bg-emerald-50/30 transition-colors group">
                                                        <td className="p-4 pl-6 font-mono text-sm font-bold text-academy-teal">{subject.code}</td>
                                                        <td className="p-4 font-black text-academy-teal">{subject.name}</td>
                                                        <td className="p-4 pr-6 text-right flex justify-end gap-2">
                                                            <button
                                                                onClick={() => openAssignModal(subject)}
                                                                className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-lg hover:bg-emerald-100 hover:border-emerald-200 transition-all cursor-pointer"
                                                            >
                                                                Map to Stream
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(subject.id)}
                                                                className="text-[10px] font-bold text-red-600 bg-white border border-red-200 px-3 py-2 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all cursor-pointer shadow-sm"
                                                            >
                                                                Drop
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            {/* ASSIGNMENT MODAL OVERLAY */}
            {assignModalOpen && selectedSubject && (
                <div className="fixed inset-0 bg-academy-teal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-xl font-black text-academy-teal">Map Curriculum</h3>
                                <p className="text-sm font-bold text-emerald-600 mt-1">{selectedSubject.code} - {selectedSubject.name}</p>
                            </div>
                            <button onClick={() => setAssignModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors cursor-pointer">✕</button>
                        </div>

                        <form onSubmit={handleAssignSubmit} className="p-6">
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-lg">⚠️ {error}</div>
                            )}
                            {assignSuccess && (
                                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-lg">✓ {assignSuccess}</div>
                            )}

                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Select Target Stream</label>
                            <select
                                value={selectedStreamId}
                                onChange={(e) => setSelectedStreamId(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-academy-teal focus:outline-none focus:border-academy-gold transition-all text-sm font-bold mb-6"
                                required
                            >
                                <option value="" disabled>Select a stream...</option>
                                {streams.map(stream => (
                                    <option key={stream.id} value={stream.id}>{stream.name}</option>
                                ))}
                            </select>

                            <button type="submit" className="w-full bg-academy-teal text-white font-bold tracking-wider py-3 rounded-lg hover:bg-emerald-800 transition-all shadow-md">
                                Execute Assignment
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}