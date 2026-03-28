import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { addDoc, collection, deleteDoc, doc, getDocs, query, Timestamp, where } from "firebase/firestore";
import { useAuth } from "../auth/AuthContext";
import { useTheme } from "../theme/ThemeContext";
import { db } from "../lib/firebase";
import { greetingFromProfile } from "../utils/profileNames";

const links = [
  { to: "/app/dashboard", label: "Dashboard" },
  { to: "/app/journal", label: "Journal" },
  { to: "/app/analytics", label: "Analytics" },
  { to: "/app/toolkit", label: "Toolkit" },
];

export default function AppLayout() {
  const { user, logout, uiTheme, profileFirstName, profileLastName, isDemoUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [openPanel, setOpenPanel] = useState(false);
  const [demoWorking, setDemoWorking] = useState(false);
  const initials = useMemo(() => {
    const fn = String(profileFirstName || "").trim();
    const ln = String(profileLastName || "").trim();
    if (fn && ln) return `${fn[0]}${ln[0]}`.toUpperCase();
    const base = user?.displayName || user?.email || "U";
    const parts = base.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return base.slice(0, 2).toUpperCase();
  }, [profileFirstName, profileLastName, user?.displayName, user?.email]);

  const greetingName = useMemo(
    () => greetingFromProfile(profileFirstName, user?.displayName, user?.email),
    [profileFirstName, user?.displayName, user?.email],
  );

  const goProfile = () => {
    setOpenPanel(false);
    navigate("/app/profile");
  };

  const goComingSoon = (label) => {
    alert(`${label} is coming soon.`);
  };

  const demoEmail = import.meta.env.VITE_DEMO_EMAIL || "demo@empathyjournal.app";
  const accountEmailLabel = user?.email || (isDemoUser ? demoEmail : "") || "No email";

  const clearDemoContent = async () => {
    if (!user?.uid) return;
    const [postSnap, journalSnap] = await Promise.all([
      getDocs(query(collection(db, "mood_posts"), where("userId", "==", user.uid))),
      getDocs(query(collection(db, "journals"), where("userId", "==", user.uid))),
    ]);
    await Promise.all([
      ...postSnap.docs.map((d) => deleteDoc(doc(db, "mood_posts", d.id))),
      ...journalSnap.docs.map((d) => deleteDoc(doc(db, "journals", d.id))),
    ]);
  };

  const seedDemoContent = async () => {
    if (!user?.uid) return;
    const shouldReplace = window.confirm("Replace existing demo content? (Recommended for clean demo)");

    const now = Date.now();
    const daysAgo = (n) => new Date(now - n * 24 * 60 * 60 * 1000);
    const ts = (d) => Timestamp.fromDate(d);

    const demoPosts = [
      { text: "Quick check-in: feeling calmer after a short walk + tea.", imageDataUrl: null, createdAt: ts(daysAgo(0.2)) },
      { text: "A bit overwhelmed today — trying to take it one task at a time.", imageDataUrl: null, createdAt: ts(daysAgo(2)) },
      { text: "Small win: I finished a tricky bug and took breaks when I needed.", imageDataUrl: null, createdAt: ts(daysAgo(5)) },
      { text: "Grateful moment: sunlight + fresh air + a kind message from a friend.", imageDataUrl: null, createdAt: ts(daysAgo(9)) },
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
    ];

    setDemoWorking(true);
    try {
      if (shouldReplace) await clearDemoContent();
      await Promise.all(
        demoPosts.map((p) =>
          addDoc(collection(db, "mood_posts"), {
            userId: user.uid,
            ...p,
          }),
        ),
      );
      await Promise.all(
        demoJournals.map((j) =>
          addDoc(collection(db, "journals"), {
            userId: user.uid,
            ...j,
          }),
        ),
      );
      alert("Demo content seeded.");
    } catch (e) {
      console.error("Error seeding demo content:", e);
      alert("Could not seed demo content.");
    } finally {
      setDemoWorking(false);
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

    setDemoWorking(true);
    try {
      if (shouldReplace) await clearDemoContent();
      await Promise.all(items.map((p) => addDoc(collection(db, "mood_posts"), p)));
      alert("30-day streak seeded.");
    } catch (e) {
      console.error("Error seeding 30-day streak:", e);
      alert("Could not seed 30-day streak.");
    } finally {
      setDemoWorking(false);
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("accent-calm", "accent-cozy", "accent-focus");
    const key = String(uiTheme || "Calm").toLowerCase();
    root.classList.add(key === "cozy" ? "accent-cozy" : key === "focus" ? "accent-focus" : "accent-calm");
  }, [uiTheme]);

  return (
    <div className={`min-h-screen relative overflow-hidden ${isDark ? "bg-slate-950 text-slate-100" : "text-slate-800"}`}>
      <div
        className={`pointer-events-none absolute -top-16 -left-16 h-64 w-64 rounded-full blur-3xl animate-pulse ${
          isDark ? "bg-amber-300/22" : "bg-[color:var(--ui-accent-soft)]/70"
        }`}
      />
      <div
        className={`pointer-events-none absolute rounded-full blur-3xl animate-pulse ${
          isDark
            ? "top-16 -right-16 h-[22rem] w-[22rem] bg-emerald-500/50"
            : "top-28 right-12 h-56 w-56 bg-[color:var(--ui-accent)]/35"
        }`}
      />
      <header className={`h-16 border-b backdrop-blur sticky top-0 z-10 ${isDark ? "border-slate-700 bg-slate-900/85" : "border-amber-100 bg-white/80"}`}>
        <nav className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-lg text-base font-semibold transition transform-gpu hover:-translate-y-0.5 hover:shadow-sm ${
                    isActive
                      ? isDark
                        ? "bg-slate-800 text-[#AAF0D1] shadow-sm"
                        : "bg-[color:var(--ui-accent-soft)] text-[color:var(--ui-accent-ink)] shadow-sm"
                      : isDark
                        ? "text-slate-300 hover:bg-slate-800/60"
                        : "text-slate-600 hover:bg-[color:var(--ui-accent-soft)]/80"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
          <div className="flex items-center gap-3.5">
            <button
              onClick={toggleTheme}
              className={`px-3.5 py-2 rounded-lg text-base font-semibold transition ${
                isDark
                  ? "bg-slate-900/60 border border-slate-700 text-slate-200 hover:bg-[#AAF0D1]/15 hover:-translate-y-0.5 hover:shadow-md hover:ring-1 hover:ring-[#AAF0D1]/35 transform-gpu"
                  : "bg-white/70 border border-orange-100 text-slate-700 hover:bg-orange-50 hover:-translate-y-0.5 hover:shadow-md hover:ring-1 hover:ring-amber-200 transform-gpu"
              }`}
              title="Toggle theme"
            >
              {isDark ? "Light" : "Dark"}
            </button>
            <button
              onClick={() => setOpenPanel(true)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition ${isDark ? "hover:bg-slate-800/60" : "hover:bg-orange-50"}`}
            >
              <div
                className={`w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-sm font-semibold ${
                  isDark ? "bg-emerald-300/20 text-[#AAF0D1]" : "bg-[color:var(--ui-accent)] text-[color:var(--ui-accent-ink-strong)]"
                }`}
              >
                {user?.photoURL ? <img src={user.photoURL} alt="avatar" className="w-full h-full object-cover" /> : initials}
              </div>
              <span className={`text-base font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>{greetingName}</span>
            </button>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-5">
        <Outlet />
      </main>

      {openPanel ? (
        <div className="fixed inset-0 z-40">
          <button className="absolute inset-0 bg-black/20" onClick={() => setOpenPanel(false)} aria-label="Close panel" />
          <aside className="absolute right-0 top-0 h-full w-full max-w-xs bg-white/90 dark:!bg-slate-950 border-l border-amber-100 dark:border-slate-700 shadow-2xl p-4 backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Account</h2>
              <button
                onClick={() => setOpenPanel(false)}
                className="text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-xl bg-[color:var(--ui-accent-soft)] p-3 border border-[color:var(--ui-accent-border)] dark:!bg-slate-900/35 dark:!border-slate-700">
              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-[color:var(--ui-accent)] text-[color:var(--ui-accent-ink-strong)] flex items-center justify-center font-semibold dark:!bg-emerald-300/20 dark:!text-[#AAF0D1]">
                {user?.photoURL ? <img src={user.photoURL} alt="avatar" className="w-full h-full object-cover" /> : initials}
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">{greetingName}</p>
                <p className="text-xs text-slate-600 dark:text-slate-300">{accountEmailLabel}</p>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <button
                onClick={goProfile}
                className="w-full text-left px-3 py-2 rounded-lg transition transform-gpu hover:-translate-y-0.5 hover:shadow-md hover:ring-1 hover:ring-amber-200 hover:bg-[color:var(--ui-accent-soft)]/70 dark:hover:bg-slate-900/55 dark:hover:ring-slate-500/30 dark:hover:shadow-md text-slate-800 dark:text-slate-100"
              >
                Profile
              </button>
              <button
                onClick={() => goComingSoon("Username settings")}
                className="w-full text-left px-3 py-2 rounded-lg transition transform-gpu hover:-translate-y-0.5 hover:shadow-md hover:ring-1 hover:ring-amber-200 hover:bg-[color:var(--ui-accent-soft)]/70 dark:hover:bg-slate-900/55 dark:hover:ring-slate-500/30 dark:hover:shadow-md text-slate-800 dark:text-slate-100"
              >
                Username
              </button>
              <button
                onClick={() => goComingSoon("Change password")}
                className="w-full text-left px-3 py-2 rounded-lg transition transform-gpu hover:-translate-y-0.5 hover:shadow-md hover:ring-1 hover:ring-amber-200 hover:bg-[color:var(--ui-accent-soft)]/70 dark:hover:bg-slate-900/55 dark:hover:ring-slate-500/30 dark:hover:shadow-md text-slate-800 dark:text-slate-100"
              >
                Change Password
              </button>
              <button
                onClick={() => goComingSoon("Notification settings")}
                className="w-full text-left px-3 py-2 rounded-lg transition transform-gpu hover:-translate-y-0.5 hover:shadow-md hover:ring-1 hover:ring-amber-200 hover:bg-[color:var(--ui-accent-soft)]/70 dark:hover:bg-slate-900/55 dark:hover:ring-slate-500/30 dark:hover:shadow-md text-slate-800 dark:text-slate-100"
              >
                Notification Settings
              </button>
              <button
                onClick={() => goComingSoon("Connected apps")}
                className="w-full text-left px-3 py-2 rounded-lg transition transform-gpu hover:-translate-y-0.5 hover:shadow-md hover:ring-1 hover:ring-amber-200 hover:bg-[color:var(--ui-accent-soft)]/70 dark:hover:bg-slate-900/55 dark:hover:ring-slate-500/30 dark:hover:shadow-md text-slate-800 dark:text-slate-100"
              >
                Connected Apps
              </button>
            </div>

            {isDemoUser ? (
              <div className="mt-6 rounded-xl border border-amber-100 bg-orange-50 p-3 dark:!bg-slate-900/35 dark:!border-slate-700">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">Demo tools (dev-only)</p>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={seedDemoContent}
                    disabled={demoWorking}
                    className="w-full px-3 py-2 rounded-lg bg-amber-200 text-amber-950 hover:bg-amber-300 transition transform-gpu hover:-translate-y-0.5 hover:shadow-md disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none dark:!bg-[#FFD9B0] dark:!text-slate-900 dark:hover:!bg-[#FFE6C9] dark:hover:shadow-lg"
                  >
                    {demoWorking ? "Working..." : "Seed demo content"}
                  </button>
                  <button
                    type="button"
                    onClick={seed30DayStreak}
                    disabled={demoWorking}
                    className="w-full px-3 py-2 rounded-lg bg-[#AAF0D1] text-slate-900 border border-[#83e7c6] hover:bg-[#D6FFF0] transition transform-gpu hover:-translate-y-0.5 hover:shadow-sm disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none dark:!bg-[#AAF0D1] dark:!text-slate-900 dark:hover:!bg-[#D6FFF0] dark:hover:shadow-lg"
                  >
                    {demoWorking ? "Working..." : "Seed 30-day streak"}
                  </button>
                </div>
              </div>
            ) : null}

            <div className="mt-8 pt-4 border-t border-slate-200">
              <button
                onClick={logout}
                className="w-full text-left px-3 py-2 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 transition dark:!bg-rose-950/30 dark:!text-rose-200 dark:hover:!bg-rose-950/45 border border-rose-200/50 dark:border-rose-900/40"
              >
                Logout
              </button>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

