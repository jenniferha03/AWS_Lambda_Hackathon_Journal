import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../auth/AuthContext";

/** Emotion from AI journal insight only; omit entries without analysis. */
function emotionFromAiInsight(data) {
  const raw = data?.insight?.emotion;
  if (typeof raw !== "string") return null;
  const t = raw.trim();
  return t ? t : null;
}

function emotionColorClass(emotion) {
  const e = emotion.toLowerCase();
  if (e.includes("happy") || e.includes("joy") || e.includes("excited")) return "bg-emerald-500";
  if (e.includes("grateful") || e.includes("content") || e.includes("calm")) return "bg-teal-500";
  if (e.includes("sad") || e.includes("down") || e.includes("lonely")) return "bg-blue-500";
  if (e.includes("ang") || e.includes("frustrat") || e.includes("irrit")) return "bg-rose-500";
  if (e.includes("anx") || e.includes("stress") || e.includes("worried")) return "bg-amber-500";
  return "bg-indigo-500";
}

export default function EmotionTrends() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [totalJournalCount, setTotalJournalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.uid) {
      setEntries([]);
      setTotalJournalCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const q = query(collection(db, "journals"), where("userId", "==", user.uid));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const sorted = snapshot.docs
          .map((doc) => {
            const d = doc.data();
            return {
              id: doc.id,
              createdAt: d.createdAt || null,
              raw: d,
            };
          })
          .sort((a, b) => {
            const at = a.createdAt?.toMillis?.() || 0;
            const bt = b.createdAt?.toMillis?.() || 0;
            return bt - at;
          });

        setTotalJournalCount(sorted.length);

        const data = sorted
          .map((row) => {
            const emotion = emotionFromAiInsight(row.raw);
            if (!emotion) return null;
            return { id: row.id, createdAt: row.createdAt, emotion };
          })
          .filter(Boolean)
          .slice(0, 7);

        setEntries(data);
        setLoading(false);
      },
      (e) => {
        console.error("Error fetching emotion trends:", e);
        setError("Couldn’t load emotion trends.");
        setLoading(false);
      },
    );
    return () => unsub();
  }, [user?.uid]);

  const counts = useMemo(() => {
    const map = new Map();
    for (const entry of entries) {
      map.set(entry.emotion, (map.get(entry.emotion) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([emotion, count]) => ({ emotion, count }))
      .sort((a, b) => b.count - a.count || a.emotion.localeCompare(b.emotion));
  }, [entries]);

  const total = entries.length || 1;

  return (
    <section className="bg-white/80 dark:bg-slate-900/40 p-6 md:p-8 rounded-3xl shadow-sm border border-amber-100 dark:border-slate-700 flex flex-col space-y-6">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-2xl font-bold text-amber-700 dark:text-[#AAF0D1]">Emotion Trends</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">Last 7 AI-analyzed entries</p>
      </div>

      {loading ? (
        <p className="text-slate-700 dark:text-slate-200 bg-amber-50 dark:bg-slate-900/35 p-4 rounded-xl border border-amber-100 dark:border-slate-700">
          Loading trends…
        </p>
      ) : error ? (
        <p className="text-red-700 bg-red-100 p-4 rounded-xl shadow-sm dark:!bg-rose-950/30 dark:!text-rose-200 border border-red-200/60 dark:border-rose-900/40">
          {error}
        </p>
      ) : entries.length === 0 ? (
        <p className="text-slate-700 dark:text-slate-200 bg-amber-50 dark:bg-slate-900/35 p-4 rounded-xl border border-amber-100 dark:border-slate-700">
          {totalJournalCount === 0
            ? "No journals yet—write a reflection and use AI Insight to see trends here."
            : "No AI insights in your saved journals yet. Open Journal and run AI Insight so emotions can appear here—entries saved without analysis are not counted."}
        </p>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            {counts.map(({ emotion, count }) => {
              const pct = Math.round((count / total) * 100);
              const color = emotionColorClass(emotion);
              return (
                <div key={emotion} className="space-y-1">
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{emotion}</span>
                    <span className="text-slate-600 dark:text-slate-300">
                      {count}/{entries.length} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800/60 rounded-full overflow-hidden">
                    <div className={`h-3 ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-amber-100 dark:border-slate-700">
            <p className="text-sm font-semibold text-amber-700 dark:text-[#AAF0D1] mb-2">Most recent emotions</p>
            <div className="flex flex-wrap gap-2">
              {entries.map((e) => (
                <span
                  key={e.id}
                  className="text-xs px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-100 dark:!bg-slate-900/35 dark:!text-slate-100 dark:!border-slate-700"
                  title={e.createdAt?.toDate ? e.createdAt.toDate().toLocaleString() : ""}
                >
                  {e.emotion}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

