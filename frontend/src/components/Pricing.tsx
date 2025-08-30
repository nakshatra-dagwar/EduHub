import React from "react";

const tiers = [
  { name: "Basic", price: "Free", points: ["Access to free courses", "Community"] },
  { name: "Pro", price: "₹499/mo", points: ["Live classes", "Assignments & grading"] },
  { name: "Enterprise", price: "Contact", points: ["Custom onboarding", "Priority support"] },
];

const Pricing = () => (
  <section id="pricing" className="bg-white py-12">
    <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <h3 className="text-2xl font-bold">Pricing</h3>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((t) => (
          <div key={t.name} className="border rounded-2xl p-6 text-center">
            <div className="text-lg font-semibold">{t.name}</div>
            <div className="mt-2 text-2xl font-extrabold">{t.price}</div>
            <ul className="mt-4 text-sm text-slate-600 space-y-2">
              {t.points.map((p) => (
                <li key={p}>• {p}</li>
              ))}
            </ul>
            <div className="mt-6">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Choose</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Pricing;
