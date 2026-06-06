import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import brandLogo from './assets/logo.svg';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [streams, setStreams] = useState([]);

  const [newStudent, setNewStudent] = useState({
    admission_number: '',
    first_name: '',
    last_name: '',
    stream_id: ''
  });

  const [filterStreamId, setFilterStreamId] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, streamsRes] = await Promise.all([
          axios.get(`${API_BASE}/api/students`),
          axios.get(`${API_BASE}/api/streams`)
        ]);
        setStudents(studentsRes.data);
        setStreams(streamsRes.data);
      } catch (err) {
        setError("Failed to connect to the database. Ensure server is running.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [API_BASE]);

  // --- DATA SANITIZATION ENGINES ---

  const formatAdmissionNumber = (input) => {
    let clean = input.trim().toUpperCase();
    // Matches letters, optional spaces/dashes, then digits (e.g., "adm 001" or "ADM002")
    const match = clean.match(/^([A-Z]+)[\s-]*(\d+)$/i);
    if (match) {
      return `${match[1]}-${match[2]}`; // Forces "ADM-001" format
    }
    return clean; // Fallback for highly custom strings
  };

  const formatName = (input) => {
    return input
      .trim()
      .toLowerCase()
      .split(/\s+/) // Splits by any amount of whitespace
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalizes first letter
      .join(' ');
  };

  // ---------------------------------

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    if (!newStudent.admission_number || !newStudent.first_name || !newStudent.last_name || !newStudent.stream_id) {
      setError("All fields, including Admission Number, are required.");
      return;
    }

    // Apply sanitization right before network request
    const sanitizedAdm = formatAdmissionNumber(newStudent.admission_number);
    const sanitizedFirst = formatName(newStudent.first_name);
    const sanitizedLast = formatName(newStudent.last_name);

    try {
      await axios.post(`${API_BASE}/api/students`, {
        admission_number: sanitizedAdm,
        first_name: sanitizedFirst,
        last_name: sanitizedLast,
        stream_id: newStudent.stream_id
      });

      const updatedStudents = await axios.get(`${API_BASE}/api/students`);
      setStudents(updatedStudents.data);

      setNewStudent({ admission_number: '', first_name: '', last_name: '', stream_id: '' });
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setError(err.response.data.error);
      } else {
        setError("Registration failed. Please try again.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to drop this student? This action permanently deletes their record.")) return;

    try {
      await axios.delete(`${API_BASE}/api/students/${id}`);
      setStudents(students.filter(s => s.id !== id));
    } catch (err) {
      setError("Failed to delete the student record.");
    }
  };

  const filteredStudents = filterStreamId === 'ALL'
    ? students
    : students.filter(s => s.stream_name === streams.find(st => st.id === parseInt(filterStreamId))?.name);

  return (
    <div className="min-h-screen bg-gray-50 text-academy-teal font-sans flex">

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
          <Link to="/dashboard" className="block p-3 rounded-lg text-gray-500 font-semibold transition-all hover:text-academy-teal hover:bg-gray-50">Dashboard</Link>
          <Link to="/streams" className="block p-3 rounded-lg text-gray-500 font-semibold transition-all hover:text-academy-teal hover:bg-gray-50">Class Streams</Link>
          <Link to="/students" className="block p-3 rounded-lg bg-emerald-50 text-emerald-900 border-l-4 border-academy-gold font-bold transition-all shadow-sm">Students Roster</Link>
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

      <main className="flex-1 flex flex-col h-screen overflow-hidden">

        <header className="h-16 border-b border-gray-200 bg-white flex items-center px-8 justify-between shadow-sm">
          <h2 className="text-sm font-bold text-gray-500">
            System Status: <span className="text-emerald-500 animate-pulse ml-1">● ONLINE</span>
          </h2>
          <div className="text-xs font-bold text-academy-teal border-2 border-academy-gold rounded-full px-4 py-1.5 bg-yellow-50">ADMIN ACCESS</div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">

          <div className="mb-8 flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-academy-teal">Students Roster</h2>
              <p className="text-gray-500 mt-1 text-sm font-medium">Manage enrollments, assignments, and student records.</p>
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Filter View</label>
              <select
                value={filterStreamId}
                onChange={(e) => setFilterStreamId(e.target.value)}
                className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-bold text-academy-teal focus:outline-none focus:border-academy-gold shadow-sm"
              >
                <option value="ALL">All Streams</option>
                {streams.map(stream => (
                  <option key={stream.id} value={stream.id}>{stream.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                <h3 className="font-bold text-lg mb-4 text-academy-teal border-b border-gray-100 pb-3">Register Student</h3>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-lg flex items-start gap-2">
                    <span>⚠️</span> {error}
                  </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-widest">Admission Number</label>
                    <input
                      type="text"
                      placeholder="e.g. adm001 or ADM 001"
                      value={newStudent.admission_number}
                      onChange={(e) => setNewStudent({ ...newStudent, admission_number: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-academy-teal focus:outline-none focus:border-academy-gold transition-all text-sm font-medium"
                      required
                    />
                    <p className="text-[10px] text-gray-400 mt-1 font-medium">Auto-formats to: ADM-001</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-widest">First Name</label>
                    <input
                      type="text"
                      placeholder="e.g. jOhn"
                      value={newStudent.first_name}
                      onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-academy-teal focus:outline-none focus:border-academy-gold transition-all text-sm font-medium"
                      required
                    />
                    <p className="text-[10px] text-gray-400 mt-1 font-medium">Auto-formats to Title Case</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-widest">Last Name</label>
                    <input
                      type="text"
                      placeholder="e.g. dOE"
                      value={newStudent.last_name}
                      onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-academy-teal focus:outline-none focus:border-academy-gold transition-all text-sm font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-widest">Assign to Stream</label>
                    <select
                      value={newStudent.stream_id}
                      onChange={(e) => setNewStudent({ ...newStudent, stream_id: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-academy-teal focus:outline-none focus:border-academy-gold transition-all text-sm font-medium"
                      required
                    >
                      <option value="" disabled>Select a stream...</option>
                      {streams.map(stream => (
                        <option key={stream.id} value={stream.id}>{stream.name}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-academy-gold text-academy-teal font-black uppercase tracking-widest py-3 mt-2 rounded-lg hover:bg-yellow-400 hover:shadow-md transition-all duration-200"
                  >
                    Enroll Student
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-100 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-white flex justify-between items-center">
                  <h3 className="font-bold text-academy-teal">Enrolled Students</h3>
                  <span className="text-xs font-bold bg-gray-100 text-gray-500 px-3 py-1 rounded-full">{filteredStudents.length} Records</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50">
                      <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        <th className="p-4 pl-6">ADM No.</th>
                        <th className="p-4">Student Name</th>
                        <th className="p-4">Assigned Stream</th>
                        <th className="p-4 pr-6 text-right">Manage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr><td colSpan="4" className="p-8 text-center text-gray-400 font-medium text-sm">Loading records...</td></tr>
                      ) : filteredStudents.length === 0 ? (
                        <tr><td colSpan="4" className="p-8 text-center text-gray-400 font-medium text-sm">No students found.</td></tr>
                      ) : (
                        filteredStudents.map((student) => (
                          <tr key={student.id} className="border-b border-gray-50 hover:bg-emerald-50/30 transition-colors group">
                            <td className="p-4 pl-6 font-mono text-sm font-bold text-academy-teal">{student.admission_number || 'N/A'}</td>
                            <td className="p-4 font-black text-academy-teal">{student.last_name}, {student.first_name}</td>
                            <td className="p-4 text-sm font-bold text-emerald-700 bg-emerald-50/50 rounded inline-block mt-2 px-2 py-0.5">{student.stream_name || 'Unassigned'}</td>
                            <td className="p-4 pr-6 text-right space-x-2">
                              <button
                                onClick={() => handleDelete(student.id)}
                                className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-3 py-1.5 rounded hover:bg-red-100 hover:border-red-200 transition-colors uppercase tracking-wider cursor-pointer"
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
    </div>
  );
}