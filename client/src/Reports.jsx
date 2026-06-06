import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import brandLogo from './assets/logo.svg';

export default function Reports() {
    const [students, setStudents] = useState([]);
    const [streams, setStreams] = useState([]);
    const [scores, setScores] = useState([]);

    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [selectedStreamId, setSelectedStreamId] = useState('');

    const [studentReportStreamId, setStudentReportStreamId] = useState('');

    const reportFilteredStudents = studentReportStreamId
        ? students.filter(s => s.stream_id === parseInt(studentReportStreamId))
        : students;

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState('');
    const [previewFilename, setPreviewFilename] = useState('');

    const API_BASE = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [studentsRes, streamsRes, scoresRes] = await Promise.all([
                    axios.get(`${API_BASE}/api/students`),
                    axios.get(`${API_BASE}/api/streams`),
                    axios.get(`${API_BASE}/api/scores`)
                ]);
                setStudents(studentsRes.data);
                setStreams(streamsRes.data);
                setScores(scoresRes.data);
            } catch (err) {
                setError("Failed to fetch reporting data.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [API_BASE]);

    const getGrade = (marks) => {
        if (marks >= 80) return 'A';
        if (marks >= 70) return 'B';
        if (marks >= 60) return 'C';
        if (marks >= 50) return 'D';
        return 'E';
    };

    // --- PDF GENERATION: INDIVIDUAL STUDENT ---
    const generateStudentReport = (e) => {
        e.preventDefault();
        if (!selectedStudentId) return;

        const student = students.find(s => s.id === parseInt(selectedStudentId));
        const studentScores = scores.filter(s => s.admission_number === student.admission_number);

        if (studentScores.length === 0) {
            alert("No scores recorded for this student yet.");
            return;
        }

        const doc = new jsPDF();

        // Document Header
        doc.setFontSize(22);
        doc.setTextColor(4, 120, 87); // Academy Teal
        doc.text("IKONEX ACADEMY", 14, 20);

        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text("OFFICIAL ACADEMIC REPORT CARD", 14, 28);

        // Student Details
        doc.setFontSize(11);
        doc.setTextColor(0);
        doc.text(`Student Name: ${student.last_name}, ${student.first_name}`, 14, 40);
        doc.text(`Admission No: ${student.admission_number}`, 14, 46);
        doc.text(`Class Stream: ${student.stream_name || 'Unassigned'}`, 14, 52);

        // Table Data Formatting
        let totalMarks = 0;
        const tableData = studentScores.map(score => {
            totalMarks += score.marks;
            return [score.subject_code, score.subject_name, score.exam_type, score.marks, getGrade(score.marks)];
        });

        const average = (totalMarks / studentScores.length).toFixed(1);

        // Build Table
        // Build Table (Modern Vite Syntax)
        autoTable(doc, {
            startY: 60,
            head: [['Code', 'Subject', 'Exam Type', 'Marks', 'Grade']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [4, 120, 87] }
        });
        // Summary Section
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`Total Marks: ${totalMarks}`, 14, finalY);
        doc.text(`Average Score: ${average}%`, 14, finalY + 8);
        doc.text(`Overall Grade: ${getGrade(average)}`, 14, finalY + 16);

        const filename = `${student.admission_number}_Report_Card.pdf`;
        const blobUrl = doc.output('bloburl'); // Converts PDF to a secure internal URL

        setPdfPreviewUrl(blobUrl);
        setPreviewFilename(filename);
        setPreviewModalOpen(true);
    };

    // --- PDF GENERATION: CLASS STREAM RANKING ---
    const generateClassReport = (e) => {
        e.preventDefault();
        if (!selectedStreamId) return;

        const stream = streams.find(s => s.id === parseInt(selectedStreamId));
        // Find all students in this stream
        const streamStudents = students.filter(s => s.stream_id === stream.id);

        if (streamStudents.length === 0) {
            alert("No students assigned to this stream.");
            return;
        }

        // Aggregate Data per Student
        const rankingData = streamStudents.map(student => {
            const studentScores = scores.filter(s => s.admission_number === student.admission_number);
            const totalMarks = studentScores.reduce((sum, score) => sum + score.marks, 0);
            const average = studentScores.length > 0 ? (totalMarks / studentScores.length).toFixed(1) : 0;
            return {
                ...student,
                totalMarks,
                average,
                examsTaken: studentScores.length
            };
        });

        // Sort by Total Marks (Descending) for Ranking
        rankingData.sort((a, b) => b.totalMarks - a.totalMarks);

        const doc = new jsPDF();

        doc.setFontSize(22);
        doc.setTextColor(4, 120, 87);
        doc.text("IKONEX ACADEMY", 14, 20);

        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`CLASS PERFORMANCE REPORT: ${stream.name}`, 14, 28);
        doc.text(`Total Enrollment: ${streamStudents.length} Students`, 14, 34);

        const tableData = rankingData.map((data, index) => [
            index + 1, // Rank
            data.admission_number,
            `${data.last_name}, ${data.first_name}`,
            data.examsTaken,
            data.totalMarks,
            `${data.average}%`
        ]);

        // Build Table (Modern Vite Syntax)
        autoTable(doc, {
            startY: 45,
            head: [['Rank', 'ADM No.', 'Student Name', 'Exams Taken', 'Total Marks', 'Average']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [4, 120, 87] }
        });

        const filename = `${stream.name.replace(/\s+/g, '_')}_Performance_Report.pdf`;
        const blobUrl = doc.output('bloburl');

        setPdfPreviewUrl(blobUrl);
        setPreviewFilename(filename);
        setPreviewModalOpen(true);
    };

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
                    <Link to="/scores" className="block p-3 rounded-lg text-gray-500 font-semibold transition-all hover:text-academy-teal hover:bg-gray-50">Performance Logs</Link>
                    <Link to="/reports" className="block p-3 rounded-lg bg-emerald-50 text-emerald-900 border-l-4 border-academy-gold font-bold transition-all shadow-sm">Print Center</Link>
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
                        <h2 className="text-3xl font-black tracking-tight text-academy-teal">Print Center</h2>
                        <p className="text-gray-500 mt-1 text-sm font-medium">Generate automated PDF performance reports.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        {/* Student Report Generator */}
                        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                            <h3 className="font-black text-xl text-academy-teal mb-2">Individual Report Card</h3>
                            <p className="text-sm text-gray-500 mb-6">Generates a detailed breakdown of a single student's academic performance across all subjects.</p>

                            <form onSubmit={generateStudentReport} className="space-y-4">

                                {/* NEW: Filter by Stream Gatekeeper */}
                                <select
                                    value={studentReportStreamId}
                                    onChange={(e) => {
                                        setStudentReportStreamId(e.target.value);
                                        // CRITICAL: Clear the student selection if the stream changes
                                        setSelectedStudentId('');
                                    }}
                                    className="w-full bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-emerald-900 focus:outline-none focus:border-academy-gold text-sm font-bold"
                                >
                                    <option value="">All Streams (Unfiltered)</option>
                                    {streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>

                                {/* UPDATED: Dependent Student Dropdown */}
                                <select
                                    value={selectedStudentId}
                                    onChange={(e) => setSelectedStudentId(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-academy-teal focus:outline-none focus:border-academy-gold text-sm font-bold"
                                    required
                                >
                                    <option value="" disabled>Select a student...</option>
                                    {reportFilteredStudents.map(s => (
                                        <option key={s.id} value={s.id}>{s.admission_number} - {s.last_name}, {s.first_name}</option>
                                    ))}
                                </select>

                                <button type="submit" className="w-full bg-academy-teal text-white font-bold tracking-wider py-3 rounded-lg hover:bg-emerald-800 transition-all shadow-md">
                                    Export PDF Report
                                </button>
                            </form>
                        </div>

                        {/* Class Stream Report Generator */}
                        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                            <h3 className="font-black text-xl text-academy-teal mb-2">Class Performance Ranking</h3>
                            <p className="text-sm text-gray-500 mb-6">Generates an aggregated class roster ranked by total marks and average performance.</p>

                            <form onSubmit={generateClassReport} className="space-y-4">
                                <select
                                    value={selectedStreamId}
                                    onChange={(e) => setSelectedStreamId(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-academy-teal focus:outline-none focus:border-academy-gold text-sm font-bold"
                                    required
                                >
                                    <option value="" disabled>Select a class stream...</option>
                                    {streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>

                                <button type="submit" className="w-full bg-academy-gold text-academy-teal font-black tracking-wider py-3 rounded-lg hover:bg-yellow-400 transition-all shadow-md">
                                    Export PDF Report
                                </button>
                            </form>
                        </div>

                    </div>
                </div>
            </main>
            {/* --- PDF PREVIEW MODAL OVERLAY --- */}
            {previewModalOpen && (
                <div className="fixed inset-0 bg-academy-teal/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-8">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">

                        {/* Modal Header */}
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-lg font-black text-academy-teal">Document Preview</h3>
                                <p className="text-xs font-bold text-gray-500">{previewFilename}</p>
                            </div>

                            <div className="flex items-center gap-4">
                                <a
                                    href={pdfPreviewUrl}
                                    download={previewFilename}
                                    className="bg-academy-gold text-academy-teal text-sm font-black px-6 py-2.5 rounded-lg hover:bg-yellow-400 transition-colors shadow-sm"
                                >
                                    Confirm & Download
                                </a>
                                <button
                                    onClick={() => {
                                        setPreviewModalOpen(false);
                                        URL.revokeObjectURL(pdfPreviewUrl); // Prevents memory leaks
                                    }}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors text-lg"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Modal Body (iFrame Render) */}
                        <div className="flex-1 bg-gray-200/50 p-2 md:p-4">
                            <iframe
                                src={pdfPreviewUrl}
                                className="w-full h-full rounded-xl border border-gray-200 shadow-inner bg-white"
                                title="PDF Preview"
                            />
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}