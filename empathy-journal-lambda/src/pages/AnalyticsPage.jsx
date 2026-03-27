import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import EmotionTrends from "../components/EmotionTrends";
import { db } from "../lib/firebase";
import PageFade from "../components/PageFade";
import { useAuth } from "../auth/AuthContext";

function dateKey(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function streakFromDaySet(daySet, fromDate = new Date()) {
  let streak = 0;
  const start = new Date(fromDate);
  start.setHours(0, 0, 0, 0);
  for (let i = 0; i < 365; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() - i);
    if (daySet.has(dateKey(d))) streak += 1;
    else break;
  }
  return streak;
}

function longestStreak(daySet) {
  if (daySet.size === 0) return 0;
  const days = Array.from(daySet).sort();
  let longest = 1;
  let current = 1;
  for (let i = 1; i < days.length; i += 1) {
    const prev = new Date(`${days[i - 1]}T00:00:00`);
    const curr = new Date(`${days[i]}T00:00:00`);
    const diff = Math.round((curr - prev) / (24 * 60 * 60 * 1000));
    if (diff === 1) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }
  return longest;
}

function milestoneInfo(score) {
  const milestones = [20, 40, 60, 80, 95];
  const next = milestones.find((m) => score < m);
  if (!next) return "Top garden tier unlocked. Keep the streak alive!";
  return `${next - score} more growth points to unlock the next garden stage.`;
}

function StreakGarden({ dayCounts }) {
  const today = new Date();
  const counts = dayCounts;
  const activeDaySet = new Set(counts.keys());

  // Current streak: consecutive days (including today) with at least one entry.
  const currentStreak = streakFromDaySet(activeDaySet, today);
  const bestStreak = longestStreak(activeDaySet);

  // Consistency in the last 30 days (0-1). Captures how regular writing is.
  let activeDays = 0;
  for (let i = 0; i < 30; i += 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if ((counts.get(dateKey(d)) || 0) > 0) activeDays += 1;
  }
  const consistency = activeDays / 30;
  const growthScore = Math.max(0, Math.min(100, Math.round(currentStreak * 4 + consistency * 60)));

  const treeHeight = 72 + growthScore * 1.05;
  const growthLevel = growthScore >= 80 ? 4 : growthScore >= 55 ? 3 : growthScore >= 30 ? 2 : growthScore >= 12 ? 1 : 0;
  const flowerMood =
    growthScore >= 80
      ? "Blooming"
      : growthScore >= 55
      ? "Growing Strong"
      : growthScore >= 30
      ? "Sprouting"
      : "Needs More Care";
  const plantCountByLevel = [1, 2, 4, 6, 9];
  const plantCount = plantCountByLevel[growthLevel];
  const canopySizes = ["w-4 h-4", "w-5 h-5", "w-6 h-6", "w-7 h-7", "w-8 h-8"];
  const canopyClass = canopySizes[growthLevel];
  const canopyTone = [
    "bg-emerald-200 dark:!bg-[#AAF0D1]/40",
    "bg-emerald-300 dark:!bg-[#AAF0D1]/55",
    "bg-emerald-400 dark:!bg-[#AAF0D1]/70",
    "bg-emerald-500 dark:!bg-[#AAF0D1]/85",
    "bg-emerald-600 dark:!bg-[#AAF0D1]",
  ][growthLevel];
  const milestoneText = milestoneInfo(growthScore);
  const bloomLevel = growthScore >= 85 ? 3 : growthScore >= 60 ? 2 : growthScore >= 35 ? 1 : 0;
  const bloomCountByLevel = [0, 4, 8, 12];
  const bloomCount = bloomCountByLevel[bloomLevel];
  const blooms = Array.from({ length: bloomCount }).map((_, idx) => {
    const t = idx + 1;
    const left = ((t * 37) % 86) + 7; // 7..93
    const top = ((t * 29) % 48) + 10; // 10..58
    const size = bloomLevel >= 3 ? 7 : bloomLevel >= 2 ? 6 : 5;
    return { id: idx, left, top, size };
  });

  return (
    <div className="bg-white/80 dark:bg-slate-900/40 rounded-2xl shadow-sm p-6 border border-amber-100 dark:border-slate-700">
      <h3 className="text-xl font-bold text-amber-700 dark:text-[#AAF0D1] mb-1">Streak Garden</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Your garden grows from active writing days, current streak, and 30-day consistency.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        <div className="bg-emerald-50 dark:bg-slate-950/35 rounded-2xl p-4 relative overflow-hidden min-h-72 flex items-end justify-center border border-emerald-100/60 dark:border-slate-800/60">
          {bloomLevel > 0 ? (
            <div className="absolute inset-0 pointer-events-none">
              {blooms.map((b) => (
                <div
                  key={b.id}
                  className="absolute opacity-90"
                  style={{
                    left: `${b.left}%`,
                    top: `${b.top}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <div
                    className="relative"
                    style={{
                      width: `${b.size * 4}px`,
                      height: `${b.size * 4}px`,
                      animationDelay: `${b.id * 90}ms`,
                    }}
                  >
                    {/* petals */}
                    <div className="absolute inset-0 animate-pulse">
                      {Array.from({ length: 5 }).map((__, p) => (
                        <span
                          // eslint-disable-next-line react/no-array-index-key
                          key={p}
                          className="absolute rounded-full bg-rose-200 dark:!bg-[#D6FFF0]/70 shadow-sm"
                          style={{
                            width: `${b.size * 1.3}px`,
                            height: `${b.size * 1.3}px`,
                            left: "50%",
                            top: "50%",
                            transform: `translate(-50%, -50%) rotate(${p * 72}deg) translate(${b.size * 1.2}px)`,
                          }}
                        />
                      ))}
                    </div>
                    {/* center */}
                    <span
                      className="absolute rounded-full bg-amber-300 dark:!bg-[#AAF0D1] shadow-sm"
                      style={{
                        width: `${b.size}px`,
                        height: `${b.size}px`,
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          <div
            className="absolute bottom-7 w-3 rounded-full bg-emerald-700 dark:!bg-[#AAF0D1] origin-bottom animate-pulse"
            style={{ height: `${treeHeight}px` }}
          />
          <div className="absolute left-1/2 -translate-x-1/2 bottom-8 w-56 h-44">
            <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-52 h-7 rounded-full bg-emerald-100 dark:!bg-[#AAF0D1]/25" />
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-1 place-items-end">
              {Array.from({ length: plantCount }).map((_, idx) => {
                const stemHeight = Math.max(24, treeHeight - (idx % 3) * 12 - Math.floor(idx / 3) * 8);
                return (
                  <div key={idx} className="relative flex items-end justify-center w-full h-full">
                    <div
                      className="w-1 rounded-full bg-emerald-700 dark:!bg-[#AAF0D1] animate-pulse"
                      style={{ height: `${stemHeight}px`, animationDelay: `${idx * 90}ms` }}
                    />
                    <div className={`absolute -top-1 rounded-full ${canopyClass} ${canopyTone} shadow-sm`} />
                  </div>
                );
              })}
            </div>
          </div>
          <div className="absolute bottom-2 w-36 h-8 bg-emerald-100 dark:!bg-[#AAF0D1]/25 rounded-full" />
        </div>

        <div className="space-y-4">
          <div className="bg-slate-50 dark:bg-slate-900/35 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-300">Current streak</p>
            <p className="text-3xl font-bold text-amber-700 dark:text-[#AAF0D1]">{currentStreak} day(s)</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/35 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-300">Best streak</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{bestStreak} day(s)</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/35 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-300">Consistency (30 days)</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{Math.round(consistency * 100)}%</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/35 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-300">Garden status</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{flowerMood}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{milestoneText}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [journalEntries, setJournalEntries] = useState([]);
  const [postEntries, setPostEntries] = useState([]);

  useEffect(() => {
    if (!user?.uid) {
      setJournalEntries([]);
      setPostEntries([]);
      return;
    }
    const journalQ = query(
      collection(db, "journals"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
    );
    const postQ = query(
      collection(db, "mood_posts"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
    );
    const unsubJournals = onSnapshot(
      journalQ,
      (snap) => setJournalEntries(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))),
      (error) => console.error("Error listening journals:", error),
    );
    const unsubPosts = onSnapshot(
      postQ,
      (snap) => setPostEntries(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))),
      (error) => console.error("Error listening mood_posts:", error),
    );
    return () => {
      unsubJournals();
      unsubPosts();
    };
  }, [user?.uid]);

  const totalEntries = useMemo(() => {
    const validJournals = journalEntries.filter((e) => e?.createdAt?.toDate);
    const validPosts = postEntries.filter((e) => e?.createdAt?.toDate);
    return validJournals.length + validPosts.length;
  }, [journalEntries, postEntries]);
  const dayCounts = useMemo(() => {
    const map = new Map();
    const all = [...journalEntries, ...postEntries];
    for (const e of all) {
      if (!e.createdAt?.toDate) continue;
      const key = dateKey(e.createdAt.toDate());
      map.set(key, (map.get(key) || 0) + 1);
    }
    return map;
  }, [journalEntries, postEntries]);

  return (
    <PageFade>
      <div className="space-y-6">
        <div className="bg-orange-50 text-amber-900 dark:bg-slate-900/35 dark:text-slate-100 rounded-2xl p-4 border border-amber-100 dark:border-slate-700">
          Total entries tracked: <span className="font-semibold text-amber-700 dark:text-[#AAF0D1]">{totalEntries}</span>
        </div>
        <EmotionTrends />
        <StreakGarden dayCounts={dayCounts} />
      </div>
    </PageFade>
  );
}

