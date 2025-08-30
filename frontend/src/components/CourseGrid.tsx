import React from "react";

const courses = new Array(6).fill(0).map((_, i) => ({
  id: i + 1,
  title: `Course ${i + 1}`,
  desc: "Short description about course learning outcomes.",
}));

const CourseGrid = () => (
  <section id="courses" className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <h3 className="text-2xl font-bold">Popular courses</h3>
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((c) => (
        <article key={c.id} className="rounded-xl border p-4 bg-white shadow-sm">
          <div className="h-36 rounded-md bg-slate-100 flex items-center justify-center">[Preview]</div>
          <h4 className="mt-3 font-semibold">{c.title}</h4>
          <p className="text-sm text-slate-600 mt-2">{c.desc}</p>
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-slate-500">4.8 ⭐</div>
            <button className="text-sm px-3 py-1 border rounded-md">Enroll</button>
          </div>
        </article>
      ))}
    </div>
  </section>
);

export default CourseGrid;
