import { useState } from "react";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import JournalList from "../components/JournalList";
import PageFade from "../components/PageFade";
import { useAuth } from "../auth/AuthContext";

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-amber-700 dark:text-[#AAF0D1] text-xl font-bold mb-2">{title}</h3>
      <div>{children}</div>
    </div>
  );
}

export default function JournalPage() {
  const { user, getIdToken } = useAuth();
  const [journal, setJournal] = useState("");
  const [insight, setInsight] = useState(null);
  const [analyzedJournal, setAnalyzedJournal] = useState("");
  const [loading, setLoading] = useState(false);
  const trimmedJournal = journal.trim();
  const isJournalEmpty = trimmedJournal.length === 0;

  const saveJournal = async () => {
    if (isJournalEmpty) return;
    if (!user?.uid) {
      alert("Please log in again before saving.");
      return;
    }
    try {
      const insightToSave =
        analyzedJournal === trimmedJournal && insight && !insight.error ? insight : null;
      await addDoc(collection(db, "journals"), {
        userId: user.uid,
        content: trimmedJournal,
        insight: insightToSave,
        createdAt: Timestamp.now(),
      });
      alert("Journal saved successfully.");
      setJournal("");
      setInsight(null);
      setAnalyzedJournal("");
    } catch (err) {
      console.error(err);
      alert(`Error saving journal: ${err?.code || "unknown"}${err?.message ? ` - ${err.message}` : ""}`);
    }
  };

  const analyzeJournal = async () => {
    if (isJournalEmpty) return;
    setLoading(true);
    setInsight(null);
    try {
      const token = await getIdToken();
      const res = await fetch(import.meta.env.VITE_LAMBDA_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ journal: trimmedJournal }),
      });

      const data = await res.json();
      const legacyInsightError =
        typeof data?.insight === "string" && data.insight.toLowerCase().includes("error");

      if (!res.ok || data?.error || legacyInsightError) {
        setInsight({
          error:
            data?.error ||
            (legacyInsightError ? data.insight : null) ||
            "Unable to analyze journal right now.",
        });
        setAnalyzedJournal("");
      } else {
        setInsight(data);
        setAnalyzedJournal(trimmedJournal);
      }
    } catch (err) {
      console.error(err);
      setInsight({ error: "Something went wrong while fetching insights." });
      setAnalyzedJournal("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageFade>
      <div className="space-y-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <section className="bg-white/80 dark:bg-slate-900/40 p-8 rounded-3xl shadow-sm flex flex-col space-y-6 border border-amber-100 dark:border-slate-700">
            <h2 className="text-3xl font-bold text-amber-700 dark:text-[#AAF0D1] mb-4">Long-form Journal</h2>
            <textarea
              className="w-full h-64 p-6 border border-amber-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-200 dark:focus:ring-emerald-300/40 text-slate-900 dark:text-slate-100 bg-white/90 dark:bg-slate-950/40 placeholder:text-slate-400"
              placeholder="Write your deeper reflection here..."
              value={journal}
              onChange={(e) => setJournal(e.target.value)}
            />

            <div className="flex justify-end space-x-4">
              <button
                onClick={saveJournal}
                disabled={isJournalEmpty || loading}
                className="bg-amber-200 text-amber-950 hover:bg-amber-300 transition transform-gpu hover:-translate-y-0.5 hover:shadow-md disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none font-semibold py-3 px-6 rounded-full dark:!bg-[#FFD9B0] dark:!text-slate-900 dark:hover:!bg-[#FFE6C9] dark:hover:shadow-lg"
              >
                Save Journal
              </button>
              <button
                onClick={analyzeJournal}
                disabled={loading || isJournalEmpty}
                className="bg-emerald-100 text-emerald-950 border border-emerald-200 hover:bg-emerald-200 transition transform-gpu hover:-translate-y-0.5 hover:shadow-md disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none font-semibold py-3 px-6 rounded-full dark:!bg-[#AAF0D1] dark:!text-slate-900 dark:hover:!bg-[#D6FFF0] dark:hover:shadow-lg"
              >
                {loading ? "Analyzing..." : "AI Insight"}
              </button>
            </div>
          </section>

          <section className="bg-white/80 dark:bg-slate-900/40 p-8 rounded-3xl shadow-sm flex flex-col space-y-6 border border-amber-100 dark:border-slate-700">
            <h2 className="text-3xl font-bold text-amber-700 dark:text-[#AAF0D1] mb-4">AI Insights</h2>
            {insight && !insight.error ? (
              <div className="space-y-4">
                <Section title="Detected Emotion">
                  <p className="text-lg font-semibold text-amber-700 dark:text-[#AAF0D1]">{insight.emotion}</p>
                </Section>
                <Section title="Key Themes">
                  <ul className="list-disc list-inside text-slate-700 dark:text-slate-200 space-y-2">
                    {insight.themes?.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </Section>
                <Section title="Reflection Prompts">
                  <ul className="list-decimal list-inside text-slate-700 dark:text-slate-200 space-y-2">
                    {insight.reflection_prompts?.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </Section>
                <Section title="Summary">
                  <p className="text-slate-700 dark:text-slate-200 leading-relaxed">{insight.summary}</p>
                </Section>
              </div>
            ) : insight?.error ? (
              <p className="text-red-700 bg-red-100 p-4 rounded-xl dark:!bg-rose-950/30 dark:!text-rose-200 border border-red-200/60 dark:border-rose-900/40">
                {insight.error}
              </p>
            ) : (
              <div className="text-slate-500 dark:text-slate-300 text-center py-12">
                <p className="text-lg mb-2">Write and click AI Insight for analysis.</p>
              </div>
            )}
          </section>
        </div>

        <JournalList />
      </div>
    </PageFade>
  );
}

