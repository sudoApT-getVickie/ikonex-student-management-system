import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import brandLogo from './assets/logo.svg';

export default function Streams() {
    const [streams, setStreams] = useState([]);
    const [newStream, setNewStream] = useState({ stream_code: '', name: '', class_teacher: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Edit Modal State
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingStream, setEditingStream] = useState({ id: null, stream_code: '', name: '', class_teacher: '' });

    // Dossier Modal State
    const [dossierOpen, setDossierOpen] = useState(false);
    const [activeDossier, setActiveDossier] = useState(null);
    const [dossierLoading, setDossierLoading] = useState(false);

    const API_BASE = import.meta.env.VITE_API_URL;

    useEffect(() => {
        fetchStreams();
    }, [API_BASE]);

    const fetchStreams = async () => {
        try {
            const response = await axios.get(`${API_BASE}/api/streams`);
            setStreams(response.data);
        } catch (err) {
            setError("Failed to establish database connection.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setError(null);
        if (!newStream.name) return;

        try {
            const response = await axios.post(`${API_BASE}/api/streams`, newStream);
            setStreams([...streams, response.data]);
            setNewStream({ stream_code: '', name: '', class_teacher: '' });
        } catch (err) {
            if (err.response && err.response.status === 400) {
                setError(err.response.data.error);
            } else {
                setError("Failed to initialize stream.");
            }
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`${API_BASE}/api/streams/${editingStream.id}`, {
                stream_code: editingStream.stream_code,
                name: editingStream.name,
                class_teacher: editingStream.class_teacher
            });
            setStreams(streams.map(s => s.id === editingStream.id ? response.data : s));
            setEditModalOpen(false);
            setEditingStream({ id: null, stream_code: '', name: '', class_teacher: '' });
        } catch (err) {
            alert(err.response?.data?.error || "Failed to update stream.");
        }
    };

    const openEditModal = (stream) => {
        setEditingStream({
            id: stream.id,
            stream_code: stream.stream_code || '',
            name: stream.name,
            class_teacher: stream.class_teacher === 'Unassigned' ? '' : stream.class_teacher
        });
        setEditModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Permanently delete this stream? This will wipe all associated student assignments.")) return;
        try {
            await axios.delete(`${API_BASE}/api/streams/${id}`);
            setStreams(streams.filter(s => s.id !== id));
        } catch (err) {
            setError("Failed to delete stream.");
        }
    };

    const openDossier = async (id) => {
        setDossierOpen(true);
        setDossierLoading(true);
        try {
            const response = await axios.get(`${API_BASE}/api/streams/${id}/details`);
            setActiveDossier(response.data);
        } catch (err) {
            alert("Failed to compile class dossier.");
            setDossierOpen(false);
        } finally {
            setDossierLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-academy-teal font-sans flex relative">
            <aside className="w-64 border-r border-gray-200 bg-white hidden md:flex flex-col shadow-sm z-10">
                <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                    <img src={brandLogo} alt="Logo" className="w-8 h-8" />
                    <div>
                        <h1 className="text-xl font-black tracking-tighter text-academy-teal leading-none">IKONEX<span className="text-academy-teal/50">_SMS</span></h1>
                        <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-bold">Command Center</p>
                    </div>
                </div>
                <nav className="flex-1 p-4 space-y-2 mt-4">
                    <Link to="/dashboard" className="block p-3 rounded-lg text-gray-500 font-semibold transition-all hover:text-academy-teal hover:bg-gray-50">Dashboard</Link>
                    <Link to="/streams" className="block p-3 rounded-lg bg-emerald-50 text-emerald-900 border-l-4 border-academy-gold font-bold transition-all shadow-sm">Class Streams</Link>
                    <Link to="/students" className="block p-3 rounded-lg text-gray-500 font-semibold transition-all hover:text-academy-teal hover:bg-gray-50">Students Roster</Link>
                    <Link to="/subjects" className="block p-3 rounded-lg text-gray-500 font-semibold transition-all hover:text-academy-teal hover:bg-gray-50">Academic Subjects</Link>
                    <Link to="/scores" className="block p-3 rounded-lg text-gray-500 font-semibold transition-all hover:text-academy-teal hover:bg-gray-50">Performance Logs</Link>
                    <Link to="/reports" className="block p-3 rounded-lg text-gray-500 font-semibold transition-all hover:text-academy-teal hover:bg-gray-50">Print Center</Link>
                </nav>
            </aside>

            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="h-16 border-b border-gray-200 bg-white flex items-center px-8 justify-between shadow-sm">
                    <h2 className="text-sm font-bold text-gray-500">System Status: <span className="text-emerald-500 animate-pulse ml-1">● ONLINE</span></h2>
                    <Link to="/" className="px-6 py-2 bg-academy-gold text-academy-teal font-black tracking-widest uppercase border-2 border-academy-teal shadow-[3px_3px_0px_0px_#022B3A] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all duration-200 flex items-center gap-2 group text-xs cursor-pointer">
                        <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        Log Out
                    </Link>
                </header>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="mb-8">
                        <h2 className="text-3xl font-black tracking-tight text-academy-teal">Class Streams</h2>
                        <p className="text-gray-500 mt-1 text-sm font-medium">Manage academic cohorts and view class performance dossiers.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1">
                            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                                <h3 className="font-bold text-lg mb-4 text-academy-teal border-b border-gray-100 pb-3">Initialize Stream</h3>
                                {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-lg flex items-start gap-2"><span>⚠️</span> {error}</div>}
                                <form onSubmit={handleCreate} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-widest">Stream Code (Unique)</label>
                                        <input type="text" placeholder="e.g. F1-A" value={newStream.stream_code} onChange={(e) => setNewStream({ ...newStream, stream_code: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-academy-teal focus:outline-none focus:border-academy-gold transition-all text-sm font-black uppercase" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-widest">Stream Identifier</label>
                                        <input type="text" placeholder="e.g. Form 1A" value={newStream.name} onChange={(e) => setNewStream({ ...newStream, name: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-academy-teal focus:outline-none focus:border-academy-gold transition-all text-sm font-medium" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-widest">Class Teacher</label>
                                        <input type="text" placeholder="e.g. Mr. Ochieng" value={newStream.class_teacher} onChange={(e) => setNewStream({ ...newStream, class_teacher: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-academy-teal focus:outline-none focus:border-academy-gold transition-all text-sm font-medium" />
                                    </div>
                                    <button type="submit" className="w-full bg-academy-gold text-academy-teal font-black uppercase tracking-widest py-3 mt-2 rounded-lg hover:bg-yellow-400 hover:shadow-md transition-all duration-200">Deploy Stream</button>
                                </form>
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <div className="bg-white border border-gray-100 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
                                <div className="p-5 border-b border-gray-100 bg-white flex justify-between items-center">
                                    <h3 className="font-bold text-academy-teal">Active Cohorts</h3>
                                    <span className="text-xs font-bold bg-gray-100 text-gray-500 px-3 py-1 rounded-full">{streams.length} Streams</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-gray-50/50">
                                            <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                <th className="p-4 pl-6">Stream</th>
                                                <th className="p-4">Class Teacher</th>
                                                <th className="p-4 pr-6 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {isLoading ? (
                                                <tr><td colSpan="3" className="p-8 text-center text-gray-400 font-medium text-sm">Loading records...</td></tr>
                                            ) : streams.length === 0 ? (
                                                <tr><td colSpan="3" className="p-8 text-center text-gray-400 font-medium text-sm">No streams initialized.</td></tr>
                                            ) : (
                                                streams.map((stream) => (
                                                    <tr key={stream.id} className="border-b border-gray-50 hover:bg-emerald-50/30 transition-colors group">
                                                        <td className="p-4 pl-6 max-w-[140px] sm:max-w-[200px] lg:max-w-[250px]">
                                                            <div className="font-black text-academy-teal truncate" title={stream.name}>{stream.name}</div>
                                                            <div className="text-[10px] font-mono font-bold text-gray-400 mt-0.5">{stream.stream_code}</div>
                                                        </td>
                                                        <td className="p-4 max-w-[120px] sm:max-w-[180px]">
                                                            <div className="text-sm font-bold text-gray-600 truncate" title={stream.class_teacher || 'Unassigned'}>{stream.class_teacher || 'Unassigned'}</div>
                                                        </td>
                                                        <td className="p-4 pr-6 text-right flex justify-end gap-2">
                                                            <button onClick={() => openDossier(stream.id)} className="text-xs font-black text-academy-teal bg-yellow-50 border-2 border-academy-gold px-4 py-2 rounded-lg hover:bg-yellow-400 transition-all cursor-pointer shadow-sm">View Dossier</button>
                                                            <button onClick={() => openEditModal(stream)} className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-all cursor-pointer shadow-sm">Edit</button>
                                                            <button onClick={() => handleDelete(stream.id)} className="text-[10px] font-bold text-red-600 bg-white border border-red-200 px-3 py-2 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all cursor-pointer shadow-sm">Delete</button>
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

            {/* --- EDIT STREAM MODAL --- */}
            {editModalOpen && (
                <div className="fixed inset-0 bg-academy-teal/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                            <h3 className="text-xl font-black text-academy-teal tracking-tight">Edit Cohort Details</h3>
                            <button onClick={() => setEditModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors font-black cursor-pointer">✕</button>
                        </div>
                        <div className="p-6 bg-white">
                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-widest">Stream Code (Unique)</label>
                                    <input type="text" value={editingStream.stream_code} onChange={(e) => setEditingStream({ ...editingStream, stream_code: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-academy-teal focus:outline-none focus:border-blue-500 transition-all text-sm font-black uppercase" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-widest">Class Teacher</label>
                                    <input type="text" placeholder="e.g. Mr. Wanjala" value={editingStream.class_teacher} onChange={(e) => setEditingStream({ ...editingStream, class_teacher: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-academy-teal focus:outline-none focus:border-blue-500 transition-all text-sm font-medium" />
                                </div>
                                <div className="pt-2 flex gap-3">
                                    <button type="button" onClick={() => setEditModalOpen(false)} className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-lg hover:bg-gray-200 transition-all">Cancel</button>
                                    <button type="submit" className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 shadow-md transition-all">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* --- CLASS DOSSIER MODAL --- */}
            {dossierOpen && (
                <div className="fixed inset-0 bg-academy-teal/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-start">
                            <div>
                                <h3 className="text-2xl font-black text-academy-teal uppercase tracking-tight">{dossierLoading ? 'Compiling Dossier...' : activeDossier?.name}</h3>
                                {!dossierLoading && activeDossier && <p className="text-sm font-bold text-emerald-600 mt-1">Class Teacher: {activeDossier.class_teacher}</p>}
                            </div>
                            <button onClick={() => { setDossierOpen(false); setActiveDossier(null) }} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors text-lg font-black cursor-pointer shadow-sm">✕</button>
                        </div>
                        <div className="p-6 bg-white min-h-[300px]">
                            {dossierLoading ? (
                                <div className="h-full flex items-center justify-center text-gray-400 font-bold animate-pulse">Running Database Aggregation...</div>
                            ) : activeDossier ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                                            <div className="text-[10px] font-black uppercase text-blue-500 tracking-widest">Total Enrollment</div>
                                            <div className="text-3xl font-black text-blue-900 mt-1">{activeDossier.enrollment} <span className="text-lg font-bold text-blue-400">Students</span></div>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 border-b border-gray-100 pb-2">Assigned Curriculum ({activeDossier.subjects.length})</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {activeDossier.subjects.length > 0 ? activeDossier.subjects.map(sub => (
                                                    <span key={sub.code} className="bg-gray-100 border border-gray-200 text-gray-600 text-[10px] font-bold px-3 py-1.5 rounded-md">{sub.name}</span>
                                                )) : <span className="text-xs text-gray-400 italic">No subjects mapped to this stream.</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black uppercase tracking-widest text-academy-gold mb-3 border-b border-gray-100 pb-2 flex items-center gap-2"><span className="text-lg">🏆</span> Academic Top 3</h4>
                                        {activeDossier.topPerformers.length > 0 ? (
                                            <div className="space-y-3">
                                                {activeDossier.topPerformers.map((student, idx) => (
                                                    <div key={student.admission_number} className="flex items-center justify-between p-3 bg-yellow-50/50 border border-yellow-100 rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-6 h-6 rounded-full bg-academy-gold text-academy-teal flex items-center justify-center font-black text-xs shadow-sm">{idx + 1}</div>
                                                            <div>
                                                                <div className="text-sm font-black text-academy-teal leading-none">{student.last_name}, {student.first_name}</div>
                                                                <div className="text-[10px] font-mono text-gray-500 mt-1">{student.admission_number}</div>
                                                            </div>
                                                        </div>
                                                        <div className="text-lg font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-md">{student.average}%</div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-xs font-bold text-gray-400 text-center">Insufficient assessment data to calculate rankings.</div>
                                        )}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}