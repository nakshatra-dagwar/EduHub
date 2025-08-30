import React from "react";

const teachers = new Array(4).fill(0).map((_, i) => ({ name: `Teacher ${i + 1}`, bio: "Expert in subject." }));

const Teachers = () => (
  <section id="teachers" className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <h3 className="text-2xl font-bold">Top teachers</h3>
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {teachers.map((t, idx) => (
        <div key={t.name} className="p-4 border rounded-lg bg-white text-center">
          <div className="w-20 h-20 rounded-full bg-slate-100 mx-auto flex items-center justify-center">T</div>
          <div className="mt-3 font-semibold">{t.name}</div>
          <div className="text-sm text-slate-500 mt-1">{t.bio}</div>
        </div>
      ))}
    </div>
  </section>
);

export default Teachers;
