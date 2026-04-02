import PageFade from "../components/PageFade";

const posts = [
  {
    title: "How journaling reduces anxiety",
    date: "Mar 2026",
    content:
      "Journaling helps anxiety by giving your thoughts a place to land. When you write, you are not trying to solve everything. You are moving from a swirling mental loop into something clearer and more manageable. Notice what triggered the feeling, how your body reacted, and what you can do in the next 10 minutes. Over time, this builds trust. Even when emotions feel big, you can still understand them and respond with intention. If you want to start gently, try ending each entry with one sentence: The smallest next step I can take is…",
  },
  {
    title: "Build a writing streak that lasts",
    date: "Feb 2026",
    content:
      "A streak feels powerful, but it only lasts when it is realistic. Instead of chasing long sessions, design a writing habit that survives busy days. Keep a minimum version, for example 2 to 3 sentences, and let that count. When you miss a day, do not restart with guilt. Restart with clarity. Pair journaling with a consistent trigger after coffee, before bed, or after a walk. Track streaks lightly, not obsessively. Your goal is not perfection. Your goal is returning. Consistency becomes easier when journaling helps you feel progress, even when it is tiny.",
  },
  {
    title: "AI prompts for deeper reflection",
    date: "Jan 2026",
    content:
      "If you sometimes get stuck staring at a blank page, AI prompts can help you break through politely. The best prompts do not tell you what to feel. They guide you to observe, connect, and choose. Try prompts like: What emotion is strongest right now, and where do you feel it in your body? What story are you telling yourself about this situation? What would you say to a friend who felt the same way? Once you answer, reflect for one minute on what you truly need today. Use the prompt once, then write honestly. Short answers are enough.",
  },
];

export default function BlogPage() {
  return (
    <PageFade>
      <div className="w-full max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-amber-700 dark:text-[#AAF0D1] mb-8">Blog</h1>
        <div className="space-y-8">
          {posts.map((p) => (
            <article
              key={p.title}
              className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-6"
            >
              <p className="text-xs text-slate-500">{p.date}</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-800">{p.title}</h2>
              <p className="mt-3 text-slate-600 leading-relaxed">{p.content}</p>
            </article>
          ))}
        </div>
      </div>
    </PageFade>
  );
}

