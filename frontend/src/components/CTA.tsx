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

const CTA = () => (
  <section className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div className="rounded-2xl border bg-gradient-to-r from-indigo-50 to-white p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
      <div>
        <div className="text-xl font-bold">Ready to start?</div>
        <div className="text-slate-600 mt-2">Create an account and join a live class in minutes.</div>
      </div>
      <div className="flex gap-4">
        <PrimaryButton to="/signup">Get Started</PrimaryButton>
        <PrimaryButton to="/login">Contact Sales</PrimaryButton>
      </div>
    </div>
  </section>
);

export default CTA;
