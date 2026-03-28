import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import PageFade from "../components/PageFade";
import { useAuth } from "../auth/AuthContext";
import { greetingFromProfile } from "../utils/profileNames";

function todayKey() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function safeJsonParse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function formatDateKey(date) {
  return startOfDay(date).toISOString().slice(0, 10);
}

function MiniCalendar({ markedDays }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDateKey, setSelectedDateKey] = useState(formatDateKey(today));

  const y = viewYear;
  const m = viewMonth;
  const first = new Date(y, m, 1);
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const blanks = first.getDay();
  const cells = [];
  for (let i = 0; i < blanks; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(new Date(y, m, d));

  const monthLabel = new Date(y, m, 1).toLocaleDateString("en-US", { month: "long" });

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((v) => v - 1);
    } else {
      setViewMonth((v) => v - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((v) => v + 1);
    } else {
      setViewMonth((v) => v + 1);
    }
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/40 rounded-2xl shadow-sm p-4 border border-amber-100 dark:border-slate-700">
      <h3 className="font-semibold mb-3 text-slate-800 dark:text-slate-100">Posting Calendar</h3>
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="px-2 py-1 rounded-md text-sm bg-amber-50 hover:bg-amber-100 transition transform-gpu hover:-translate-y-0.5 hover:shadow-md hover:ring-1 hover:ring-amber-300 dark:!bg-slate-900/35 dark:hover:!bg-slate-900/55 dark:hover:shadow-md dark:text-slate-100"
          aria-label="Previous month"
        >
          ←
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{monthLabel}</span>
          <input
            type="number"
            min="2000"
            max="2100"
            value={viewYear}
            onChange={(e) => setViewYear(Number(e.target.value) || today.getFullYear())}
            className="w-20 rounded-md border border-amber-100 dark:border-slate-700 px-2 py-1 text-sm bg-white/90 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100"
          />
        </div>
        <button
          onClick={nextMonth}
          className="px-2 py-1 rounded-md text-sm bg-amber-50 hover:bg-amber-100 transition transform-gpu hover:-translate-y-0.5 hover:shadow-md hover:ring-1 hover:ring-amber-300 dark:!bg-slate-900/35 dark:hover:!bg-slate-900/55 dark:hover:shadow-md dark:text-slate-100"
          aria-label="Next month"
        >
          →
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-600 dark:text-slate-300 mb-2">
        {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, idx) => {
          if (!d) return <div key={`blank-${idx}`} className="h-8" />;
          const key = formatDateKey(d);
          const marked = markedDays.has(key);
          const isToday = formatDateKey(d) === formatDateKey(today);
          const isSelected = key === selectedDateKey;
          return (
            <button
              key={key}
              onClick={() => setSelectedDateKey(key)}
              className={`h-9 rounded-md text-xs relative flex items-center justify-center transition ${
                marked
                  ? "bg-amber-100 text-amber-900 dark:!bg-[#AAF0D1] dark:text-slate-900"
                  : "bg-amber-50 text-slate-700 dark:!bg-slate-900/35 dark:text-slate-200"
              } ${isToday ? "ring-1 ring-amber-300 dark:ring-[#AAF0D1]" : ""} ${isSelected ? "ring-2 ring-amber-300 dark:ring-[#AAF0D1]" : ""}`}
            >
              <span>{d.getDate()}</span>
              {marked ? <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-slate-900" /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, profileFirstName, isDemoUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [journals, setJournals] = useState([]);
  const [text, setText] = useState("");
  const [imageData, setImageData] = useState("");
  const [saving, setSaving] = useState(false);
  const userLabel = useMemo(
    () => greetingFromProfile(profileFirstName, user?.displayName, user?.email),
    [profileFirstName, user?.displayName, user?.email],
  );

  const prompts = useMemo(
    () => [
      "What’s one emotion you’re carrying today, and what does it need from you?",
      "Name one small win from today. What helped it happen?",
      "If your mind feels noisy, what is one controllable next step?",
      "What boundary would make tomorrow 10% gentler?",
      "Write a short note to your future self for the next hard moment.",
      "What’s something you can release — even a little — right now?",
      "What does “good enough” look like for you today?",
      "List 3 things you can do in the next 15 minutes to support your calm.",
    ],
    [],
  );
  const [prompt, setPrompt] = useState(prompts[0]);
  const generatePrompt = () => setPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      alert("Prompt copied.");
    } catch {
      alert("Could not copy prompt.");
    }
  };

  const GROUNDING_KEY = "empathy_grounding_v1";
  const [grounding, setGrounding] = useState(() =>
    safeJsonParse(localStorage.getItem(GROUNDING_KEY), {
      day: todayKey(),
      see: ["", "", "", "", ""],
      feel: ["", "", "", ""],
      hear: ["", "", ""],
      smell: ["", ""],
      taste: [""],
    }),
  );

  useEffect(() => {
    localStorage.setItem(GROUNDING_KEY, JSON.stringify(grounding));
  }, [grounding]);

  useEffect(() => {
    if (!user?.uid) {
      setPosts([]);
      setJournals([]);
      return;
    }
    const postQ = query(
      collection(db, "mood_posts"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(30),
    );
    const journalQ = query(
      collection(db, "journals"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(50),
    );

    const unsubPosts = onSnapshot(
      postQ,
      (snap) => setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (error) => console.error("Error listening mood_posts:", error),
    );
    const unsubJournals = onSnapshot(
      journalQ,
      (snap) => setJournals(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (error) => console.error("Error listening journals:", error),
    );

    return () => {
      unsubPosts();
      unsubJournals();
    };
  }, [user?.uid]);

  const clearDemoContent = async () => {
    if (!user?.uid) return { clearedPosts: 0, clearedJournals: 0 };
    const [postSnap, journalSnap] = await Promise.all([
      getDocs(query(collection(db, "mood_posts"), where("userId", "==", user.uid))),
      getDocs(query(collection(db, "journals"), where("userId", "==", user.uid))),
    ]);

    const postDeletes = postSnap.docs.map((d) => deleteDoc(doc(db, "mood_posts", d.id)));
    const journalDeletes = journalSnap.docs.map((d) => deleteDoc(doc(db, "journals", d.id)));
    await Promise.all([...postDeletes, ...journalDeletes]);
    return { clearedPosts: postSnap.size, clearedJournals: journalSnap.size };
  };

  const seedDemoContent = async () => {
    if (!user?.uid) return;
    const shouldReplace =
      posts.length > 0 || journals.length > 0
        ? window.confirm("Replace existing demo content? (OK = replace/reset, Cancel = add more)")
        : false;

    const now = Date.now();
    const daysAgo = (n) => new Date(now - n * 24 * 60 * 60 * 1000);
    const ts = (d) => Timestamp.fromDate(d);
    const svgDataUrl = (svg) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    const demoImage1 = svgDataUrl(
      `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="520" viewBox="0 0 900 520">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#FFE7D0"/>
            <stop offset="1" stop-color="#F8FFFB"/>
          </linearGradient>
        </defs>
        <rect width="900" height="520" rx="32" fill="url(#g)"/>
        <circle cx="700" cy="120" r="70" fill="#FCD34D" opacity="0.65"/>
        <path d="M0 360 C160 320 250 420 420 380 C560 348 650 420 900 360 V520 H0 Z" fill="#A7F3D0" opacity="0.45"/>
        <path d="M0 390 C180 350 260 460 430 415 C570 380 660 455 900 395 V520 H0 Z" fill="#FDBA74" opacity="0.35"/>
        <g opacity="0.9">
          <rect x="210" y="240" width="14" height="120" rx="7" fill="#065F46"/>
          <circle cx="217" cy="240" r="32" fill="#34D399" opacity="0.85"/>
          <circle cx="245" cy="252" r="22" fill="#10B981" opacity="0.75"/>
          <rect x="520" y="235" width="14" height="140" rx="7" fill="#065F46"/>
          <circle cx="527" cy="235" r="34" fill="#34D399" opacity="0.85"/>
          <circle cx="558" cy="248" r="24" fill="#10B981" opacity="0.75"/>
        </g>
      </svg>`,
    );
    const demoImage2 = svgDataUrl(
      `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="520" viewBox="0 0 900 520">
        <rect width="900" height="520" rx="32" fill="#FFF8F1"/>
        <circle cx="170" cy="150" r="72" fill="#FDBA74" opacity="0.55"/>
        <circle cx="240" cy="140" r="48" fill="#FDE68A" opacity="0.6"/>
        <path d="M0 360 C220 300 320 420 520 365 C690 320 780 420 900 370 V520 H0 Z" fill="#D1FAE5" opacity="0.65"/>
        <g>
          <circle cx="520" cy="270" r="10" fill="#FCA5A5"/>
          <circle cx="545" cy="290" r="9" fill="#FDA4AF"/>
          <circle cx="570" cy="270" r="10" fill="#FBCFE8"/>
          <circle cx="595" cy="290" r="9" fill="#FDE68A"/>
          <circle cx="620" cy="270" r="10" fill="#A7F3D0"/>
        </g>
      </svg>`,
    );

    const demoPosts = [
      {
        text: "Quick check-in: feeling calmer after a short walk + tea.",
        imageDataUrl: demoImage1,
        createdAt: ts(daysAgo(0.2)),
      },
      {
        text: "A soft moment outdoors — trying to notice small details and breathe slower.",
        imageDataUrl:
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
        createdAt: ts(daysAgo(0.9)),
      },
      {
        text: "A bit overwhelmed today — trying to take it one task at a time.",
        imageDataUrl: null,
        createdAt: ts(daysAgo(2)),
      },
      {
        text: "Small win: I finished a tricky bug and took breaks when I needed.",
        imageDataUrl: demoImage2,
        createdAt: ts(daysAgo(5)),
      },
      {
        text: "Reset ritual: tea + journal + a cozy playlist.",
        imageDataUrl:
          "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1400&q=80",
        createdAt: ts(daysAgo(6.2)),
      },
      {
        text: "Grateful moment: sunlight + fresh air + a kind message from a friend.",
        imageDataUrl: null,
        createdAt: ts(daysAgo(9)),
      },
      {
        text: "Nature always helps. I’m letting this be enough for today.",
        imageDataUrl:
          "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=80",
        createdAt: ts(daysAgo(10.4)),
      },
    ];

    const demoJournals = [
      {
        content:
          "Today I noticed my mind racing. I paused, breathed, and wrote down what I can control. That helped me feel grounded again.\n\nI want to build a habit of checking in with myself before reacting.",
        insight: {
          emotion: "Anxious",
          themes: ["stress", "self-regulation", "habit building"],
          reflection_prompts: [
            "What is one controllable next step you can take right now?",
            "What helped you feel even 5% calmer today?",
            "What would you tell a friend in the same situation?",
          ],
          summary: "You’re feeling anxious and looking for practical ways to regain control and build a steadier routine.",
        },
        createdAt: ts(daysAgo(1)),
      },
      {
        content:
          "I felt a quiet joy today. Nothing huge happened — it was just a steady sense that I’m moving forward.\n\nI want to protect this feeling by keeping my boundaries and resting on purpose.",
        insight: {
          emotion: "Happy",
          themes: ["gratitude", "progress", "boundaries"],
          reflection_prompts: [
            "What made today feel quietly good?",
            "How can you recreate this kind of day on purpose?",
            "What boundary supports your peace the most?",
          ],
          summary: "You’re experiencing calm happiness and want to sustain it through intentional rest and boundaries.",
        },
        createdAt: ts(daysAgo(4)),
      },
      {
        content:
          "I’ve been feeling low and tired. I keep comparing myself to others and it drains me.\n\nI want to be kinder to myself and focus on small steps.",
        insight: {
          emotion: "Sad",
          themes: ["comparison", "self-compassion", "energy"],
          reflection_prompts: [
            "What is one small step that would be kind to your future self?",
            "What comparison thought shows up most often?",
            "What evidence do you have that you’re making progress?",
          ],
          summary: "You’re feeling sad and depleted, and you’re seeking self-compassion and small, sustainable progress.",
        },
        createdAt: ts(daysAgo(7)),
      },
      {
        content:
          "This week I’m practicing consistency. Even 10 minutes of writing helps me reflect and reset.\n\nI want to keep showing up gently, not perfectly.",
        insight: {
          emotion: "Motivated",
          themes: ["consistency", "growth mindset", "gentleness"],
          reflection_prompts: [
            "What does “gentle consistency” look like for you?",
            "What gets in the way when you aim for perfection?",
            "How will you celebrate showing up this week?",
          ],
          summary: "You’re motivated to build a consistent practice while staying gentle with yourself instead of chasing perfection.",
        },
        createdAt: ts(daysAgo(11)),
      },
    ];

    setSaving(true);
    try {
      if (shouldReplace) {
        await clearDemoContent();
        setPosts([]);
        setJournals([]);
      }
      const postRefs = await Promise.all(
        demoPosts.map((p) =>
          addDoc(collection(db, "mood_posts"), {
            userId: user.uid,
            ...p,
          }),
        ),
      );
      const journalRefs = await Promise.all(
        demoJournals.map((j) =>
          addDoc(collection(db, "journals"), {
            userId: user.uid,
            ...j,
          }),
        ),
      );

      setPosts((prev) => [
        ...postRefs.map((r, idx) => ({ id: r.id, userId: user.uid, ...demoPosts[idx] })),
        ...prev,
      ]);
      setJournals((prev) => [
        ...journalRefs.map((r, idx) => ({ id: r.id, userId: user.uid, ...demoJournals[idx] })),
        ...prev,
      ]);
      alert("Demo content added.");
    } catch (error) {
      console.error("Error seeding demo content:", error);
      alert("Could not add demo content.");
    } finally {
      setSaving(false);
    }
  };

  const seed30DayStreak = async () => {
    if (!user?.uid) return;
    const shouldReplace = window.confirm("Replace existing demo content before seeding 30-day streak?");

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const atNoon = (d) => {
      const x = new Date(d);
      x.setHours(12, 0, 0, 0);
      return x;
    };

    // Create at least one entry per day for the last 30 days (including today).
    const items = Array.from({ length: 30 }).map((_, i) => {
      const daysBack = 29 - i;
      const date = atNoon(new Date(now - daysBack * dayMs));
      return {
        userId: user.uid,
        text: `Day ${i + 1}/30 — gentle check-in.`,
        imageDataUrl: null,
        createdAt: Timestamp.fromDate(date),
      };
    });

    setSaving(true);
    try {
      if (shouldReplace) {
        await clearDemoContent();
        setPosts([]);
        setJournals([]);
      }
      const refs = await Promise.all(items.map((p) => addDoc(collection(db, "mood_posts"), p)));
      setPosts((prev) => [...refs.map((r, idx) => ({ id: r.id, ...items[idx] })), ...prev]);
      alert("30-day streak seeded.");
    } catch (error) {
      console.error("Error seeding 30-day streak:", error);
      alert("Could not seed 30-day streak.");
    } finally {
      setSaving(false);
    }
  };

  const markedDays = useMemo(() => {
    const set = new Set();
    for (const p of posts) if (p.createdAt?.toDate) set.add(formatDateKey(p.createdAt.toDate()));
    return set;
  }, [posts]);

  const weeklyMoodSummary = useMemo(() => {
    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const recent = journals.filter((j) => j.createdAt?.toDate && now - j.createdAt.toDate().getTime() <= weekMs);
    const byEmotion = new Map();
    for (const j of recent) {
      const e = j?.insight?.emotion || "Unknown";
      byEmotion.set(e, (byEmotion.get(e) || 0) + 1);
    }
    const top = Array.from(byEmotion.entries()).sort((a, b) => b[1] - a[1])[0];
    return top ? `${top[0]} appeared ${top[1]} time(s) this week.` : "No emotion data this week yet.";
  }, [journals]);

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageData(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const submitPost = async () => {
    const trimmed = text.trim();
    if (!trimmed && !imageData) return;
    setSaving(true);
    try {
      const payload = {
        userId: user.uid,
        text: trimmed,
        imageDataUrl: imageData || null,
        createdAt: Timestamp.now(),
      };
      const ref = await addDoc(collection(db, "mood_posts"), payload);
      setPosts((prev) => [{ id: ref.id, ...payload }, ...prev]);
      setText("");
      setImageData("");
    } catch (error) {
      console.error("Error posting mood update:", error);
      alert("Could not create post.");
    } finally {
      setSaving(false);
    }
  };

  const deletePost = async (postId) => {
    const ok = window.confirm("Delete this post?");
    if (!ok) return;
    try {
      await deleteDoc(doc(db, "mood_posts", postId));
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Could not delete this post.");
    }
  };

  return (
    <PageFade>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-4">
        <div className="space-y-4 order-2 lg:order-1">
          {isDemoUser ? (
            <div className="bg-orange-50 dark:bg-slate-900/35 rounded-2xl shadow-sm p-4 border border-amber-100 dark:border-slate-700">
              <h3 className="font-semibold mb-3 text-slate-800 dark:text-slate-100">Demo tools (dev-only)</h3>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={seedDemoContent}
                  disabled={saving}
                  className="w-full px-4 py-2 rounded-lg bg-amber-200 text-amber-950 hover:bg-amber-300 transition transform-gpu hover:-translate-y-0.5 hover:shadow-lg hover:ring-1 hover:ring-amber-300 disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none dark:!bg-[#FFD9B0] dark:!text-slate-900 dark:hover:!bg-[#FFE6C9] dark:hover:shadow-lg"
                >
                  {saving ? "Working..." : "Seed demo content"}
                </button>
                <button
                  type="button"
                  onClick={seed30DayStreak}
                  disabled={saving}
                  className="w-full px-4 py-2 rounded-lg bg-[#AAF0D1] text-slate-900 border border-[#83e7c6] hover:bg-[#D6FFF0] transition transform-gpu hover:-translate-y-0.5 hover:shadow-lg hover:ring-1 hover:ring-emerald-200 disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none dark:!bg-[#AAF0D1] dark:!text-slate-900 dark:hover:!bg-[#D6FFF0] dark:hover:shadow-lg"
                >
                  {saving ? "Working..." : "Seed 30-day streak (garden boost)"}
                </button>
              </div>
            </div>
          ) : null}
          <MiniCalendar markedDays={markedDays} />

          <div className="bg-white/80 dark:bg-slate-900/40 rounded-2xl shadow-sm p-4 border border-amber-100 dark:border-slate-700">
            <h3 className="font-semibold mb-3 text-slate-800 dark:text-slate-100">Gentle prompt (when you feel stuck)</h3>
            <div className="rounded-xl bg-amber-50 dark:bg-slate-900/35 border border-amber-100 dark:border-slate-700 p-3">
              <p className="text-slate-900 dark:text-slate-100 leading-relaxed">{prompt}</p>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={generatePrompt}
                className="flex-1 px-3 py-2 rounded-lg bg-amber-200 text-amber-950 hover:bg-amber-300 transition transform-gpu hover:-translate-y-0.5 hover:shadow-md hover:ring-1 hover:ring-amber-300 dark:!bg-[#FFD9B0] dark:!text-slate-900 dark:hover:!bg-[#FFE6C9] dark:hover:shadow-md"
              >
                New
              </button>
              <button
                type="button"
                onClick={copyPrompt}
                className="flex-1 px-3 py-2 rounded-lg bg-white/70 border border-amber-100 text-amber-900 hover:bg-amber-50 transition transform-gpu hover:-translate-y-0.5 hover:shadow-md hover:ring-1 hover:ring-amber-200 dark:!bg-slate-900/35 dark:!border-slate-700 dark:!text-slate-100 dark:hover:!bg-slate-900/55 dark:hover:shadow-md"
              >
                Copy
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4 order-3 lg:order-2">
          <div className="bg-white/80 dark:bg-slate-900/40 rounded-2xl shadow-sm p-4 border border-amber-100 dark:border-slate-700">
            <h3 className="font-semibold mb-3 text-slate-800 dark:text-slate-100">What&apos;s on your mind?</h3>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full min-h-24 border border-amber-100 dark:border-slate-700 rounded-xl p-3 bg-white/90 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-200 dark:focus:ring-emerald-300/40"
              placeholder="Share your mood..."
            />
            {imageData ? (
              <img src={imageData} alt="preview" className="mt-3 max-h-52 rounded-lg object-cover w-full" />
            ) : null}
            <div className="mt-3 flex items-center justify-between">
              <label className="text-sm px-3 py-1.5 rounded-lg bg-amber-100 text-amber-900 cursor-pointer hover:bg-amber-200 transition transform-gpu hover:-translate-y-0.5 hover:shadow-md hover:ring-1 hover:ring-amber-300 dark:!bg-slate-900/35 dark:!text-[#AAF0D1] dark:hover:!bg-slate-900/55 dark:hover:shadow-md">
                Upload photo
                <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
              </label>
              <button
                onClick={submitPost}
                disabled={saving || (!text.trim() && !imageData)}
                className="px-4 py-2 rounded-lg bg-emerald-100 text-emerald-950 border border-emerald-200 hover:bg-emerald-200 transition transform-gpu hover:-translate-y-0.5 hover:shadow-lg hover:ring-1 hover:ring-emerald-200 disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none dark:!bg-[#AAF0D1] dark:!text-slate-900 dark:hover:!bg-[#D6FFF0] dark:hover:shadow-lg"
              >
                {saving ? "Posting..." : "Post"}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {posts.map((post) => (
              <article key={post.id} className="bg-white/80 dark:bg-slate-900/40 rounded-2xl shadow-sm p-4 border border-amber-100 dark:border-slate-700">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-slate-900 dark:text-slate-100 whitespace-pre-wrap">{post.text || "(Image post)"}</p>
                  <button
                    onClick={() => deletePost(post.id)}
                    className="px-2.5 py-1 text-xs rounded-md bg-rose-100 text-rose-700 hover:bg-rose-200 transition transform-gpu hover:-translate-y-0.5 hover:shadow-md hover:ring-1 hover:ring-rose-200 shrink-0 dark:!bg-rose-950/30 dark:!text-rose-200 dark:hover:!bg-rose-950/45 dark:hover:shadow-md border border-rose-200/50 dark:border-rose-900/40"
                  >
                    Delete
                  </button>
                </div>
                {post.imageDataUrl ? (
                  <img src={post.imageDataUrl} alt="mood post" className="mt-3 rounded-lg max-h-72 object-cover w-full" />
                ) : null}
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                  {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleString() : "Just now"}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="space-y-4 order-1 lg:order-3">
          <div className="bg-white/80 dark:bg-slate-900/40 rounded-2xl shadow-sm p-4 border border-amber-100 dark:border-slate-700">
            <h3 className="font-semibold mb-2 text-slate-800 dark:text-slate-100">Personal greeting</h3>
            <h3 className="text-lg font-semibold text-amber-900 dark:text-[#AAF0D1] mt-1">
              Hi {userLabel}, how are you feeling today?
            </h3>
          </div>
          <div className="bg-white/80 dark:bg-slate-900/40 rounded-2xl shadow-sm p-4 border border-amber-100 dark:border-slate-700">
            <h3 className="font-semibold mb-2 text-slate-800 dark:text-slate-100">Weekly mood summary</h3>
            <p className="text-slate-800 dark:text-slate-200">{weeklyMoodSummary}</p>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/40 rounded-2xl shadow-sm p-4 border border-amber-100 dark:border-slate-700">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">Grounding 5‑4‑3‑2‑1</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">A quick reset: name what you notice right now.</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setGrounding({
                    day: todayKey(),
                    see: ["", "", "", "", ""],
                    feel: ["", "", "", ""],
                    hear: ["", "", ""],
                    smell: ["", ""],
                    taste: [""],
                  })
                }
                className="text-xs px-2 py-1 rounded-lg bg-amber-50 border border-amber-100 text-amber-900 hover:bg-amber-100 transition transform-gpu hover:-translate-y-0.5 hover:shadow-sm dark:!bg-slate-900/35 dark:!border-slate-700 dark:!text-slate-100 dark:hover:!bg-slate-900/55 dark:hover:shadow-md"
              >
                Clear
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {[
                ["see", "See (5)", 5],
                ["feel", "Feel (4)", 4],
                ["hear", "Hear (3)", 3],
                ["smell", "Smell (2)", 2],
                ["taste", "Taste (1)", 1],
              ].map(([k, label, count]) => (
                <div key={k} className="rounded-xl bg-amber-50 dark:bg-slate-900/35 border border-amber-100 dark:border-slate-700 p-3">
                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">{label}</p>
                  <div className="space-y-2">
                    {Array.from({ length: count }).map((_, idx) => (
                      <input
                        key={`${k}-${idx}`}
                        value={grounding[k][idx] || ""}
                        onChange={(e) =>
                          setGrounding((g) => {
                            const nextArr = [...g[k]];
                            nextArr[idx] = e.target.value;
                            return { ...g, day: todayKey(), [k]: nextArr };
                          })
                        }
                        placeholder="Type a quick note…"
                        className="w-full border border-amber-100 dark:border-slate-700 rounded-lg px-3 py-2 bg-white/90 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageFade>
  );
}

