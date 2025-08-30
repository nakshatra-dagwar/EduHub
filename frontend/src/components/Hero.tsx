import React from "react";
import { Link } from 'react-router-dom';

function PrimaryButton({ children, to }: { children: React.ReactNode, to?: string }) {
  if (to) {
    return (
      <Link to={to} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700">
        {children}
      </Link>
    );
  }
  return (
    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700">
      {children}
    </button>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <div className="text-xl font-semibold">{value}</div>
      <div className="text-xs">{label}</div>
    </div>
  );
}

const Hero = () => (
  <section id="home" className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-28 flex flex-col lg:flex-row items-center gap-12">
    <div className="flex-1">
      <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">Transforming classrooms into pixel-powered adventures</h1>
      <p className="mt-6 text-slate-600 max-w-xl">EduHub connects passionate teachers with curious learners through interactive courses, live classes, and assignments — a modern platform for real learning outcomes.</p>
      <div className="mt-8 flex gap-4">
        <PrimaryButton to="/signup">Join as a Student</PrimaryButton>
        <PrimaryButton to="/login">Become a Teacher</PrimaryButton>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-4 text-sm text-slate-600">
        <StatItem label="Students" value="12k+" />
        <StatItem label="Courses" value="120+" />
        <StatItem label="Teachers" value="350+" />
      </div>
    </div>
    <div className="flex-1">
      <div className="w-full h-72 sm:h-96 rounded-2xl bg-gradient-to-br from-indigo-50 to-white shadow-md flex items-center justify-center">
        <div className="text-center px-6">
          <div className="text-slate-400">[Hero Illustration]</div>
          <div className="mt-4 text-xs text-slate-500">Export your vector or PNG from Figma and replace this area.</div>
        </div>
      </div>
    </div>
  </section>
);

export default Hero;
