import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import brandLogo from './assets/logo.svg';

export default function Streams() {
    const [streams, setStreams] = useState([]);
    const [students, setStudents] = useState([]);

    const [newStreamName, setNewStreamName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // State to control the Roster Modal
    const [selectedStream, setSelectedStream] = useState(null);

    const API_BASE = import.meta.env.VITE_API_URL;

    useEffect(() => {
        fetchData();
    }, []);

    // Fetch Streams AND Students simultaneously to calculate class sizes instantly
    const fetchData = async () => {
        try {
            const [streamsRes, studentsRes] = await Promise.all([
                axios.get(`${API_BASE}/api/streams`),
                axios.get(`${API_BASE}/api/students`)
            ]);
            setStreams(streamsRes.data);
            setStudents(studentsRes.data);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Failed to establish database connection.");
        } finally {
            setIsLoading(false);
        }
    };

    // The Data Sanitization Engine
    const formatStreamName = (input) => {
        let clean = input.trim().toUpperCase();
        const match = clean.match(/^FORM\s*(\d)\s*([A-Z])$/i);
        if (match) {
            return `FORM ${match[1]}${match[2]}`;
        }
        return clean;
    };

    const handleCreateStream = async (e) => {
        e.preventDefault();
        setError(null);
        if (!newStreamName.trim()) return;

        const sanitizedName = formatStreamName(newStreamName);

        try {
            const response = await axios.post(`${API_BASE}/api/streams`, {
                name: sanitizedName
            });

            setStreams([...streams, response.data]);
            setNewStreamName('');
        } catch (err) {
            if (err.response && err.response.status === 400) {
                setError(err.response.data.error);
            } else {
                setError("System error during stream creation.");
            }
        }
    };

    const handleDeleteStream = async (id) => {
        if (!window.confirm("WARNING: Deleting a stream is a permanent action. Continue?")) return;

        try {
            await axios.delete(`${API_BASE}/api/streams/${id}`);
            setStreams(streams.filter(s => s.id !== id));
            setError(null);
            setSelectedStream(null); // Close modal if open
        } catch (err) {
            if (err.response && err.response.status === 400) {
                setError(err.response.data.error);
            } else {
                setError("Failed to delete class stream.");
            }
        }
    };

    // Derived logic for the Modal
    const streamStudents = selectedStream
        ? students.filter(s => s.stream_id === selectedStream.id)
        : [];

    return (
        <div className="min-h-screen bg-gray-50 text-academy-teal font-sans flex relative">

            {/* Sidebar Navigation */}
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
                    <Link to="/dashboard" className="block p-3 rounded-lg text-gray-500 font-semibold transition-all hover:text-academy-teal hover:bg-gray-50">
                        Dashboard
                    </Link>
                    <Link to="/streams" className="block p-3 rounded-lg bg-emerald-50 text-emerald-900 border-l-4 border-academy-gold font-bold transition-all shadow-sm">
                        Class Streams
                    </Link>
                    <Link to="/students" className="block p-3 rounded-lg text-gray-500 font-semibold transition-all hover:text-academy-teal hover:bg-gray-50">
                        Students Roster
                    </Link>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">

                <header className="h-16 border-b border-gray-200 bg-white flex items-center px-8 justify-between shadow-sm">
                    <h2 className="text-sm font-bold text-gray-500">
                        System Status: <span className="text-emerald-500 animate-pulse ml-1">● ONLINE</span>
                    </h2>
                    <div className="text-xs font-bold text-academy-teal border-2 border-academy-gold rounded-full px-4 py-1.5 bg-yellow-50">
                        ADMIN ACCESS
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">

                    <div className="mb-8">
                        <h2 className="text-3xl font-black tracking-tight text-academy-teal">Class Streams</h2>
                        <p className="text-gray-500 mt-1 text-sm font-medium">Manage academic cohorts and structural assignments.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Data Entry Form */}
                        <div className="lg:col-span-1">
                            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                                <h3 className="font-bold text-lg mb-4 text-academy-teal border-b border-gray-100 pb-3">Initialize New Stream</h3>

                                {error && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-lg flex items-start gap-2">
                                        <span>⚠️</span> {error}
                                    </div>
                                )}

                                <form onSubmit={handleCreateStream} className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Stream Designation</label>
                                        <input
                                            type="text"
                                            value={newStreamName}
                                            onChange={(e) => setNewStreamName(e.target.value)}
                                            placeholder="e.g. form1b or FORM 1 B"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-academy-teal placeholder-gray-400 focus:outline-none focus:border-academy-gold focus:ring-1 focus:ring-academy-gold transition-all font-medium"
                                            required
                                        />
                                        <p className="text-[10px] text-gray-400 mt-2 font-medium">Input will be automatically standardized to format: FORM 1A</p>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-academy-gold text-academy-teal font-black uppercase tracking-widest py-3 rounded-lg hover:bg-yellow-400 hover:shadow-md transition-all duration-200"
                                    >
                                        Deploy Stream
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Active Streams Table */}
                        <div className="lg:col-span-2">
                            <div className="bg-white border border-gray-100 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
                                <div className="p-5 border-b border-gray-100 bg-white flex justify-between items-center">
                                    <h3 className="font-bold text-academy-teal">Active Database Records</h3>
                                    <span className="text-xs font-bold bg-gray-100 text-gray-500 px-3 py-1 rounded-full">{streams.length} Total</span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-gray-50/50">
                                            <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                <th className="p-4 pl-6">ID</th>
                                                <th className="p-4">Stream Name</th>
                                                <th className="p-4 text-center">Enrollment</th>
                                                <th className="p-4 pr-6 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {isLoading ? (
                                                <tr><td colSpan="4" className="p-8 text-center text-gray-400 font-medium text-sm">Fetching records...</td></tr>
                                            ) : streams.length === 0 ? (
                                                <tr><td colSpan="4" className="p-8 text-center text-gray-400 font-medium text-sm">No streams initialized.</td></tr>
                                            ) : (
                                                streams.map((stream) => {
                                                    const count = students.filter(s => s.stream_id === stream.id).length;
                                                    return (
                                                        <tr key={stream.id} className="border-b border-gray-50 hover:bg-emerald-50/30 transition-colors group">
                                                            <td className="p-4 pl-6 font-mono text-sm text-gray-400">#{stream.id}</td>
                                                            <td className="p-4 font-black text-academy-teal text-lg">{stream.name}</td>
                                                            <td className="p-4 text-center">
                                                                <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-100">
                                                                    {count} Students
                                                                </span>
                                                            </td>
                                                            {/* FULLY INTEGRATED ACTION BUTTONS */}
                                                            <td className="p-4 pr-6 text-right flex justify-end gap-2">
                                                                <button
                                                                    onClick={() => setSelectedStream(stream)}
                                                                    className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-lg hover:bg-emerald-100 hover:border-emerald-200 transition-all cursor-pointer"
                                                                >
                                                                    View Roster
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteStream(stream.id)}
                                                                    className="text-xs font-bold text-red-600 bg-white border border-red-200 px-3 py-2 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all cursor-pointer shadow-sm"
                                                                    title="Delete Stream"
                                                                >
                                                                    Drop
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            {/* ROSTER MODAL OVERLAY */}
            {selectedStream && (
                <div className="fixed inset-0 bg-academy-teal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">

                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-academy-teal">{selectedStream.name} details</h3>
                                <p className="text-sm font-bold text-emerald-600 mt-1">{streamStudents.length} Students Currently Enrolled</p>
                            </div>
                            <button
                                onClick={() => setSelectedStream(null)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Roster List */}
                        <div className="p-6 max-h-96 overflow-y-auto custom-scrollbar">
                            {streamStudents.length === 0 ? (
                                <div className="text-center py-8 text-gray-400 font-medium">
                                    <p>No students assigned to this stream yet.</p>
                                    <Link to="/students" className="text-academy-gold font-bold text-sm mt-2 block hover:underline">Go to Students Roster to assign</Link>
                                </div>
                            ) : (
                                <ul className="space-y-3">
                                    {streamStudents.map((student, idx) => (
                                        <li key={student.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:border-academy-gold transition-colors">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-bold text-gray-400 w-4">{idx + 1}.</span>
                                                <span className="font-bold text-academy-teal">{student.last_name}, {student.first_name}</span>
                                            </div>
                                            {/* UPDATED TO SHOW ADMISSION NUMBER */}
                                            <span className="text-[10px] font-mono text-gray-400 font-bold border border-gray-200 px-2 py-0.5 rounded">
                                                ADM: {student.admission_number || 'N/A'}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}