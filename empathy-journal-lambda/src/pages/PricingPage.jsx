import PageFade from "../components/PageFade";

const plans = [
  { name: "Free", price: "$0", desc: "Basic journaling + limited AI insights", perks: ["30 analyses/month", "Basic trends", "Toolkit access"] },
  { name: "Pro", price: "$12/mo", desc: "For personal growth power users", perks: ["Unlimited analyses", "Advanced analytics", "Export reports"] },
  { name: "Coach", price: "$39/mo", desc: "For therapists and small groups", perks: ["Shared dashboards", "Client notes", "Priority support"] },
];

export default function PricingPage() {
  return (
    <PageFade>
      <div>
        <h1 className="text-4xl font-bold text-amber-700 dark:text-[#AAF0D1] mb-8">Pricing</h1>
        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((p) => (
            <article key={p.name} className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-xl font-semibold">{p.name}</h2>
              <p className="text-3xl font-bold mt-2">{p.price}</p>
              <p className="text-slate-600 mt-2">{p.desc}</p>
              <ul className="mt-4 space-y-2 text-slate-700 text-sm">
                {p.perks.map((perk) => (
                  <li key={perk}>• {perk}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </PageFade>
  );
}

