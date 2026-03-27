import PageFade from "../components/PageFade";

const posts = [
  { title: "How journaling reduces anxiety", date: "Mar 2026" },
  { title: "Build a writing streak that lasts", date: "Feb 2026" },
  { title: "AI prompts for deeper reflection", date: "Jan 2026" },
];

export default function BlogPage() {
  return (
    <PageFade>
      <div>
        <h1 className="text-4xl font-bold text-amber-700 dark:text-[#AAF0D1] mb-8">Blog</h1>
        <div className="space-y-3">
          {posts.map((p) => (
            <article key={p.title} className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-xs text-slate-500">{p.date}</p>
              <h2 className="font-semibold text-slate-800">{p.title}</h2>
            </article>
          ))}
        </div>
      </div>
    </PageFade>
  );
}

