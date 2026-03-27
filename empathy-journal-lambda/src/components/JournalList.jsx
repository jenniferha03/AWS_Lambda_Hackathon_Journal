import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../auth/AuthContext";

function normalizeEmotion(value) {
  if (typeof value !== "string") return "Unknown";
  const trimmed = value.trim();
  return trimmed ? trimmed : "Unknown";
}

const formatDate = (timestamp) => {
  if (!timestamp) return "No date";
  const date = timestamp.toDate();
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function JournalList() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setEntries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(collection(db, "journals"), where("userId", "==", user.uid));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .sort((a, b) => {
            const at = a.createdAt?.toMillis?.() || 0;
            const bt = b.createdAt?.toMillis?.() || 0;
            return bt - at;
          });
        setEntries(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching journals:", error);
        setLoading(false);
      },
    );
    return () => unsub();
  }, [user?.uid]);

  if (loading) {
    return (
      <div className="w-full max-w-3xl pt-10">
        <h2 className="text-2xl font-bold text-amber-700 dark:text-[#AAF0D1] mb-4">Previous Journals</h2>
        <p className="text-slate-700 dark:text-slate-200 text-center bg-amber-50 dark:bg-slate-900/35 p-6 rounded-xl shadow-sm border border-amber-100 dark:border-slate-700">
          Loading journals...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full pt-8 mb-12">
      <h2 className="text-2xl font-bold text-amber-700 dark:text-[#AAF0D1] mb-6">Previous Journals</h2>
      {entries.length === 0 ? (
        <p className="text-slate-700 dark:text-slate-200 text-center bg-amber-50 dark:bg-slate-900/35 p-6 rounded-xl shadow-sm border border-amber-100 dark:border-slate-700">
          No journals submitted yet.
        </p>
      ) : (
        <div className="rounded-2xl border border-amber-100 dark:border-slate-700 bg-white/50 dark:bg-slate-900/20 p-3 md:p-4">
          <div className="max-h-[70vh] overflow-y-auto overscroll-contain pr-1 md:pr-2 space-y-6">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white/80 dark:bg-slate-900/40 p-6 md:p-8 rounded-2xl shadow-sm border border-amber-100 dark:border-slate-700"
              >
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{formatDate(entry.createdAt)}</p>
                <p className="text-slate-900 dark:text-slate-100 leading-relaxed mb-4 whitespace-pre-line">
                  {entry.content}
                </p>

                {entry.insight ? (
                  <div className="mt-4 border-t border-amber-100 dark:border-slate-700 pt-4">
                    <p className="text-sm font-semibold text-amber-700 dark:text-[#AAF0D1] mb-2">AI Insight:</p>
                    <p className="text-sm text-slate-700 dark:text-slate-200 mb-1">
                      Emotion:{" "}
                      <span className="font-semibold text-amber-700 dark:text-[#AAF0D1]">
                        {normalizeEmotion(entry.insight.emotion) || "N/A"}
                      </span>
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-200">
                      Themes: {entry.insight.themes?.join(", ") || "N/A"}
                    </p>
                    {entry.insight.summary && (
                      <p className="text-sm text-slate-700 dark:text-slate-200 mt-2">
                        Summary: {entry.insight.summary}
                      </p>
                    )}
                    {entry.insight.reflection_prompts && Array.isArray(entry.insight.reflection_prompts) && (
                      <div className="mt-3">
                        <p className="text-sm font-semibold text-amber-700 dark:text-[#AAF0D1] mb-2">
                          Reflection Prompts:
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-700 dark:text-slate-200 space-y-1">
                          {entry.insight.reflection_prompts.map((q, qIdx) => (
                            <li key={qIdx}>{q}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-600 dark:text-slate-300 text-sm mt-4 border-t border-amber-100 dark:border-slate-700 pt-4">
                    No AI insight for this entry yet.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

