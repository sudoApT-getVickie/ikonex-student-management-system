import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import brandLogo from './assets/logo.svg';

export default function Scores() {
    const [scores, setScores] = useState([]);
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [streams, setStreams] = useState([]);

    const [newScore, setNewScore] = useState({
        student_id: '',
        subject_id: '',
        exam_type: 'MID-TERM',
        marks: ''
    });

    const [filterStreamId, setFilterStreamId] = useState('');

    const [formStreamId, setFormStreamId] = useState('');

    const formFilteredStudents = formStreamId
        ? students.filter(s => s.stream_id === parseInt(formStreamId))
        : students;

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_BASE = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [scoresRes, studentsRes, subjectsRes, streamsRes] = await Promise.all([
                    axios.get(`${API_BASE}/api/scores`),
                    axios.get(`${API_BASE}/api/students`),
                    axios.get(`${API_BASE}/api/subjects`),
                    axios.get(`${API_BASE}/api/streams`)
                ]);
                setScores(scoresRes.data);
                setStudents(studentsRes.data);
                setSubjects(subjectsRes.data);
                setStreams(streamsRes.data);
            } catch (err) {
                setError("Failed to connect to the database.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [API_BASE]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!newScore.student_id || !newScore.subject_id || newScore.marks === '') {
            setError("All fields are required.");
            return;
        }

        try {
            await axios.post(`${API_BASE}/api/scores`, newScore);
            // Refresh the scores table to get the joined names
            const updatedScores = await axios.get(`${API_BASE}/api/scores`);
            setScores(updatedScores.data);

            // Reset marks but keep student/subject selected for faster bulk entry
            setNewScore({ ...newScore, marks: '' });
        } catch (err) {
            if (err.response && err.response.status === 400) {
                setError(err.response.data.error);
            } else {
                setError("Failed to record score.");
            }
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this exam record?")) return;
        try {
            await axios.delete(`${API_BASE}/api/scores/${id}`);
            setScores(scores.filter(s => s.id !== id));
        } catch (err) {
            setError("Failed to delete score.");
        }
    };

    // Helper function to calculate grade letter
    const getGrade = (marks) => {
        if (marks >= 80) return 'A';
        if (marks >= 70) return 'B';
        if (marks >= 60) return 'C';
        if (marks >= 50) return 'D';
        return 'E';
    };

    // --- NEW: CLIENT-SIDE FILTERING ENGINE ---
    const filteredScores = filterStreamId
        ? scores.filter(score => {
            // Map the score back to the student to find their stream_id
            const student = students.find(s => s.admission_number === score.admission_number);
            return student && student.stream_id === parseInt(filterStreamId);
        })
        : scores;

    return (
        <div className="min-h-screen bg-gray-50 text-academy-teal font-sans flex">

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
                    <Link to="/subjects" className="block p-3 rounded-lg text-gray-500 font-semibold transition-all hover:text-academy-teal hover:bg-gray-50">Academic Subjects</Link>
                    <Link to="/scores" className="block p-3 rounded-lg bg-emerald-50 text-emerald-900 border-l-4 border-academy-gold font-bold transition-all shadow-sm">Performance Logs</Link>
                    <Link to="/reports" className="block p-3 rounded-lg text-gray-500 font-semibold transition-all hover:text-academy-teal hover:bg-gray-50">
                        Print Center
                    </Link>
                </nav>
            </aside>

            <main className="flex-1 flex flex-col h-screen overflow-hidden">

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
                        <h2 className="text-3xl font-black tracking-tight text-academy-teal">Performance Logs</h2>
                        <p className="text-gray-500 mt-1 text-sm font-medium">Record and track academic assessments.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Grading Form */}
                        <div className="lg:col-span-1">
                            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                                <h3 className="font-bold text-lg mb-4 text-academy-teal border-b border-gray-100 pb-3">Log Assessment</h3>

                                {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-lg flex items-start gap-2"><span>⚠️</span> {error}</div>}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* NEW: Cascading Gatekeeper Dropdown */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-widest">1. Filter by Stream</label>
                                        <select
                                            value={formStreamId}
                                            onChange={(e) => {
                                                setFormStreamId(e.target.value);
                                                // CRITICAL: Reset the student selection if the stream changes
                                                setNewScore({ ...newScore, student_id: '' });
                                            }}
                                            className="w-full bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5 text-emerald-900 focus:outline-none focus:border-academy-gold text-sm font-bold"
                                        >
                                            <option value="">All Streams (Unfiltered)</option>
                                            {streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>

                                    {/* UPDATED: Dependent Student Dropdown */}


                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-widest">Select Student</label>
                                        <select
                                            value={newScore.student_id}
                                            onChange={(e) => setNewScore({ ...newScore, student_id: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-academy-teal focus:outline-none focus:border-academy-gold text-sm font-medium"
                                            required
                                        >
                                            <option value="" disabled>Choose student...</option>
                                            {students.map(s => <option key={s.id} value={s.id}>{s.admission_number} - {s.last_name}, {s.first_name}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-widest">Select Subject</label>
                                        <select
                                            value={newScore.subject_id}
                                            onChange={(e) => setNewScore({ ...newScore, subject_id: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-academy-teal focus:outline-none focus:border-academy-gold text-sm font-medium"
                                            required
                                        >
                                            <option value="" disabled>Choose subject...</option>
                                            {subjects.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-widest">Exam Type</label>
                                            <select
                                                value={newScore.exam_type}
                                                onChange={(e) => setNewScore({ ...newScore, exam_type: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-academy-teal focus:outline-none focus:border-academy-gold text-sm font-medium"
                                            >
                                                <option value="MID-TERM">Mid-Term</option>
                                                <option value="END-TERM">End-Term</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-widest">Marks (0-100)</label>
                                            <input
                                                type="number"
                                                min="0" max="100"
                                                value={newScore.marks}
                                                onChange={(e) => setNewScore({ ...newScore, marks: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-academy-teal focus:outline-none focus:border-academy-gold text-sm font-black text-center"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button type="submit" className="w-full bg-academy-gold text-academy-teal font-black uppercase tracking-widest py-3 mt-2 rounded-lg hover:bg-yellow-400 hover:shadow-md transition-all duration-200">
                                        Save Record
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Scores Roster Table */}
                        <div className="lg:col-span-2">
                            <div className="bg-white border border-gray-100 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
                                <div className="p-5 border-b border-gray-100 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-bold text-academy-teal">Academic Registry</h3>
                                        <span className="text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full">
                                            {filteredScores.length} Entries
                                        </span>
                                    </div>

                                    {/* NEW: Filter Dropdown */}
                                    <select
                                        value={filterStreamId}
                                        onChange={(e) => setFilterStreamId(e.target.value)}
                                        className="w-full sm:w-auto bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-academy-teal focus:outline-none focus:border-academy-gold text-xs font-bold"
                                    >
                                        <option value="">All Class Streams (Unfiltered)</option>
                                        {streams.map(stream => (
                                            <option key={stream.id} value={stream.id}>{stream.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-gray-50/50">
                                            <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                <th className="p-4 pl-6">Student</th>
                                                <th className="p-4">Subject</th>
                                                <th className="p-4">Exam</th>
                                                <th className="p-4 text-center">Score</th>
                                                <th className="p-4 pr-6 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {isLoading ? (
                                                <tr><td colSpan="5" className="p-8 text-center text-gray-400 font-medium text-sm">Loading records...</td></tr>
                                            ) : filteredScores.length === 0 ? (
                                                <tr><td colSpan="5" className="p-8 text-center text-gray-400 font-medium text-sm">No records found for this selection.</td></tr>
                                            ) : (
                                                filteredScores.map((score) => (
                                                    <tr key={score.id} className="border-b border-gray-50 hover:bg-emerald-50/30 transition-colors group">
                                                        <td className="p-4 pl-6">
                                                            <div className="font-black text-academy-teal">{score.last_name}, {score.first_name}</div>
                                                            <div className="text-[10px] font-mono text-gray-400">{score.admission_number}</div>
                                                        </td>
                                                        <td className="p-4 font-bold text-sm text-gray-600">{score.subject_code}</td>
                                                        <td className="p-4 text-xs font-bold text-emerald-700">{score.exam_type}</td>
                                                        <td className="p-4 text-center">
                                                            <span className="font-black text-lg text-academy-teal">{score.marks}</span>
                                                            <span className="text-xs font-bold text-gray-400 ml-1">({getGrade(score.marks)})</span>
                                                        </td>
                                                        <td className="p-4 pr-6 text-right">
                                                            <button
                                                                onClick={() => handleDelete(score.id)}
                                                                className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-3 py-1.5 rounded hover:bg-red-100 transition-colors uppercase tracking-wider"
                                                            >
                                                                Void
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
        </div>
    );
}