import PageFade from "../components/PageFade";

const faqs = [
  ["Is my journal private?", "Your data is stored in your Firebase project. Add auth + strict rules for full privacy."],
  ["How does AI analysis work?", "Journal text is sent to your Lambda endpoint, then analyzed by Gemini and returned as structured JSON."],
  ["Can I use this for free?", "Yes, with the free plan and provider free-tier limits where available."],
  ["Do you support teams?", "Coach plan supports shared workflows and insights."],
];

export default function FaqPage() {
  return (
    <PageFade>
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold text-amber-700 dark:text-[#AAF0D1] mb-8">FAQ</h1>
        <div className="space-y-3">
          {faqs.map(([q, a]) => (
            <details key={q} className="bg-white border border-slate-200 rounded-xl p-4">
              <summary className="cursor-pointer font-semibold text-slate-800">{q}</summary>
              <p className="mt-2 text-slate-600">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </PageFade>
  );
}

