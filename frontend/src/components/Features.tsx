import React from "react";

const items = [
  { title: "Live Classes", desc: "Real-time interaction with teachers and recordings." },
  { title: "Assignments", desc: "Submit, grade, and track progress seamlessly." },
  { title: "Community", desc: "Peer discussions, study groups and more." },
];

const Features = () => (
  <section className="bg-gradient-to-b from-white to-slate-50 py-12">
    <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold">Platform features</h2>
      <p className="text-slate-600 mt-2 max-w-2xl">Everything a modern online education platform needs to deliver high-quality learning experiences.</p>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {items.map((it) => (
          <div key={it.title} className="p-6 bg-white rounded-2xl shadow-sm border">
            <div className="text-lg font-semibold">{it.title}</div>
            <div className="mt-3 text-slate-600 text-sm">{it.desc}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Features;
