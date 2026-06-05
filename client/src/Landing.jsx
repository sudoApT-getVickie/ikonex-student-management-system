import React from 'react';
import { useNavigate } from 'react-router-dom';
import brandLogo from './assets/logo.svg';

export default function Landing() {
    const navigate = useNavigate();

    return (
        // Changed min-h-screen to h-screen to strictly enforce a single viewport height
        <div className="h-screen bg-academy-white flex flex-col md:flex-row font-sans overflow-hidden">

            {/* Left Column: UI & Typography */}
            {/* Added h-full to ensure it respects the parent's strict height */}
            <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-24 z-10 relative h-full">

                {/* Header Navigation / Logo Placeholder */}
                {/* Scaled down margin and logo size slightly */}
                {/* Header Navigation / Logo */}
                <div className="flex items-center gap-3 mb-6">
                    {/* Replace the 10x10 div circle with this image tag */}
                    <img src={brandLogo} alt="Ikonex Academy Logo" className="w-12 h-12" />

                    <span className="font-bold text-academy-teal tracking-widest text-xs">
                        IKONEX<br />ACADEMY
                    </span>
                </div>

                {/* Quick Stats Grid: Scaled down text and margins */}
                <div className="mb-6 flex gap-10 border-b border-gray-100 pb-4">
                    <div>
                        <p className="text-3xl font-black text-academy-teal">1,500+</p>
                        <p className="text-[10px] text-academy-teal/60 font-bold uppercase tracking-widest mt-1">Students Enrolled</p>
                    </div>
                    <div>
                        <p className="text-3xl font-black text-academy-teal">95%</p>
                        <p className="text-[10px] text-academy-teal/60 font-bold uppercase tracking-widest mt-1">A+ in last exam</p>
                    </div>
                </div>

                {/* Main Text Block: Tightened margins and adjusted H1 scaling */}
                <div className="mb-8">
                    {/* Primary Hook */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200 text-[11px] font-semibold text-academy-teal mb-4">
                        <span className="w-2 h-2 rounded-full bg-academy-teal"></span>
                        50 students joined today
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-academy-teal tracking-tighter leading-tight mb-4">
                        Ikonex-Academy <br /> School, Kenya
                    </h1>
                    <p className="text-base text-academy-teal/70 max-w-md font-medium">
                        Student & Skill Management System. Empowering the next generation of innovators with transparent, real-time performance tracking.
                    </p>
                </div>

                {/* Call to Action: Removed Database indicator, tightened button padding */}
                <div className="flex items-center">

                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-8 py-3 bg-academy-gold text-academy-teal font-black tracking-widest uppercase border-2 border-academy-teal shadow-[4px_4px_0px_0px_#022B3A] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all duration-200 flex items-center gap-3 group text-sm"
                    >
                        Log In
                        <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </button>
                </div>
            </div>

            {/* Right Column: Gradient-Masked Image */}
            <div className="w-full md:w-1/2 h-full absolute md:relative bottom-0 right-0 opacity-20 md:opacity-100 pointer-events-none">
                <div className="w-full h-full md:[mask-image:linear-gradient(to_right,transparent_0%,black_30%)]">

                    {/* Updated Image Tag */}
                    <img
                        src="/hero.webp"
                        alt="Students engaged in learning"
                        fetchPriority="high"
                        loading="eager"
                        className="w-full h-full object-cover object-left"
                    />

                </div>
            </div>

        </div>
    );
}