import { useEffect, useMemo, useRef, useState } from "react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "../lib/firebase";
import PageFade from "../components/PageFade";

function formatMMSS(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

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

function actionsForEmotion(emotion) {
  const e = (emotion || "").toLowerCase();
  if (e.includes("anx") || e.includes("stress")) {
    return ["4-7-8 breathing for 3 minutes", "Drink water and walk 10 minutes", "Write down 3 controllable tasks"];
  }
  if (e.includes("sad") || e.includes("down")) {
    return ["Message one close friend", "Take a warm shower and rest", "List 3 small wins from today"];
  }
  if (e.includes("happy") || e.includes("joy")) {
    return ["Capture this moment in one sentence", "Share gratitude with someone", "Plan one meaningful task for tomorrow"];
  }
  return ["Pause and breathe for 1 minute", "Do a quick body stretch", "Write one thing you appreciate today"];
}

export default function ToolkitPage() {
  const [latestEmotion, setLatestEmotion] = useState("Unknown");
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [mode, setMode] = useState("focus"); // "focus" | "break"
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const intervalRef = useRef(null);

  // Micro-habits (local-only, demo friendly)
  const HABITS_KEY = "empathy_micro_habits_v1";
  const [habits, setHabits] = useState(() =>
    safeJsonParse(localStorage.getItem(HABITS_KEY), {
      streak: 0,
      lastDoneDay: "",
      items: {
        water: false,
        walk: false,
        stretch: false,
      },
    }),
  );

  useEffect(() => {
    localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    // Reset daily checkboxes at midnight boundary (based on local date key).
    const key = todayKey();
    if (habits.lastDoneDay && habits.lastDoneDay !== key && (habits.items.water || habits.items.walk || habits.items.stretch)) {
      setHabits((h) => ({ ...h, items: { water: false, walk: false, stretch: false } }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const completeHabitsForToday = () => {
    const key = todayKey();
    setHabits((h) => {
      const alreadyCounted = h.lastDoneDay === key;
      const nextStreak = alreadyCounted ? h.streak : h.streak + 1;
      return {
        ...h,
        streak: nextStreak,
        lastDoneDay: key,
      };
    });
  };

  // To-do list (local-only)
  const TODO_KEY = "empathy_toolkit_todos_v1";
  const [todoText, setTodoText] = useState("");
  const [todos, setTodos] = useState(() =>
    safeJsonParse(localStorage.getItem(TODO_KEY), [
      { id: "t1", text: "Review lecture notes (10 min)", done: false },
      { id: "t2", text: "Pomodoro focus session", done: false },
      { id: "t3", text: "1 journal reflection prompt", done: false },
    ]),
  );

  useEffect(() => {
    localStorage.setItem(TODO_KEY, JSON.stringify(todos));
  }, [todos]);

  // Calm sounds (WebAudio)
  const [sound, setSound] = useState("off"); // off | white | rain | ocean
  const [volume, setVolume] = useState(0.35);
  const audioRef = useRef({
    ctx: null,
    gain: null,
    noiseSrc: null,
    filter: null,
    osc: null,
  });

  const stopSound = () => {
    const a = audioRef.current;
    try {
      a.noiseSrc?.stop?.();
    } catch {
      // ignore
    }
    try {
      a.osc?.stop?.();
    } catch {
      // ignore
    }
    a.noiseSrc = null;
    a.osc = null;
    a.filter = null;
    if (a.ctx) {
      a.ctx.close?.();
    }
    a.ctx = null;
    a.gain = null;
    setSound("off");
  };

  const startSound = async (kind) => {
    stopSound();
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const gain = ctx.createGain();
    gain.gain.value = volume;
    gain.connect(ctx.destination);

    const makeNoise = () => {
      const bufferSize = 2 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i += 1) {
        data[i] = Math.random() * 2 - 1;
      }
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = true;
      return src;
    };

    const noise = makeNoise();

    if (kind === "white") {
      noise.connect(gain);
    } else if (kind === "rain") {
      const filter = ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = 900;
      noise.connect(filter);
      filter.connect(gain);
      audioRef.current.filter = filter;
    } else if (kind === "ocean") {
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 220;
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = 0.12;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.22;
      osc.connect(lfoGain);
      lfoGain.connect(gain.gain);

      noise.connect(filter);
      filter.connect(gain);
      osc.start();
      audioRef.current.filter = filter;
      audioRef.current.osc = osc;
    }

    noise.start();
    audioRef.current.ctx = ctx;
    audioRef.current.gain = gain;
    audioRef.current.noiseSrc = noise;
    setSound(kind);
    try {
      await ctx.resume();
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const a = audioRef.current;
    if (a.gain) a.gain.gain.value = volume;
  }, [volume]);

  useEffect(() => {
    return () => stopSound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const q = query(collection(db, "journals"), orderBy("createdAt", "desc"), limit(1));
        const snap = await getDocs(q);
        const first = snap.docs[0]?.data();
        if (first?.insight?.emotion) setLatestEmotion(first.insight.emotion);
      } catch (error) {
        console.error("Error reading latest emotion:", error);
      }
    };
    fetchLatest();
  }, []);

  useEffect(() => {
    const next = Math.max(1, Number(mode === "focus" ? focusMinutes : breakMinutes) || 1) * 60;
    setSecondsLeft(next);
  }, [focusMinutes, breakMinutes, mode]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) return 0;
        return s - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [running]);

  useEffect(() => {
    if (!running) return;
    if (secondsLeft !== 0) return;
    // Auto-switch mode when timer completes.
    setRunning(false);
    setMode((m) => (m === "focus" ? "break" : "focus"));
  }, [secondsLeft, running]);

  const actions = useMemo(() => actionsForEmotion(latestEmotion), [latestEmotion]);

  return (
    <PageFade>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <section className="bg-white/80 dark:bg-slate-900/40 rounded-2xl shadow-sm p-6 border border-amber-100 dark:border-slate-700">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Micro-habits</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Tiny rituals that keep your nervous system steady.</p>

          <div className="mt-4 space-y-2">
            {[
              ["water", "Drink water"],
              ["walk", "Walk 10 minutes"],
              ["stretch", "Stretch 2 minutes"],
            ].map(([key, label]) => (
              <label
                key={key}
                className="flex items-center justify-between gap-3 rounded-xl bg-amber-50 dark:bg-slate-900/35 border border-amber-100 dark:border-slate-700 px-3 py-2"
              >
                <span className="text-sm text-slate-800 dark:text-slate-100">{label}</span>
                <input
                  type="checkbox"
                  checked={Boolean(habits.items[key])}
                  onChange={(e) =>
                    setHabits((h) => ({
                      ...h,
                      items: { ...h.items, [key]: e.target.checked },
                    }))
                  }
                />
              </label>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Streak: <span className="font-semibold text-amber-900 dark:text-[#AAF0D1]">{habits.streak}</span> day(s)
            </p>
            <button
              type="button"
              onClick={completeHabitsForToday}
              className="px-4 py-2 rounded-lg bg-amber-200 text-amber-950 hover:bg-amber-300 transition dark:!bg-[#AAF0D1] dark:!text-slate-900 dark:hover:!bg-[#D6FFF0]"
            >
              Mark day complete
            </button>
          </div>

          <button
            type="button"
            onClick={() =>
              setHabits({
                streak: 0,
                lastDoneDay: "",
                items: { water: false, walk: false, stretch: false },
              })
            }
            className="mt-3 w-full px-4 py-2 rounded-lg bg-white/70 border border-amber-100 text-amber-900 hover:bg-amber-50 transition dark:!bg-slate-900/35 dark:!border-slate-700 dark:!text-slate-100 dark:hover:!bg-slate-900/55"
          >
            Reset micro-habits
          </button>
        </section>

        <section className="bg-white/80 dark:bg-slate-900/40 rounded-2xl shadow-sm p-6 border border-amber-100 dark:border-slate-700">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Breathing Exercise</h3>
          <div className="h-52 flex items-center justify-center">
            <div className="relative h-28 w-28">
              <div className="absolute inset-0 rounded-full bg-amber-100 animate-ping dark:!bg-[#AAF0D1]/25" />
              <div className="absolute inset-2 rounded-full bg-amber-200 animate-pulse dark:!bg-[#AAF0D1]/40" />
              <div className="absolute inset-6 rounded-full bg-amber-300 dark:!bg-[#AAF0D1]" />
            </div>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-200 mt-2">Inhale 4s, hold 4s, exhale 6s.</p>
        </section>

        <section className="bg-white/80 dark:bg-slate-900/40 rounded-2xl shadow-sm p-6 border border-amber-100 dark:border-slate-700">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-1">Recommended Actions</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">Based on latest mood: {latestEmotion}</p>
          <ul className="space-y-2 text-slate-800 dark:text-slate-200">
            {actions.map((a) => (
              <li key={a} className="bg-amber-50 dark:bg-slate-900/35 rounded-lg px-3 py-2 border border-amber-100 dark:border-slate-700">
                {a}
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white/80 dark:bg-slate-900/40 rounded-2xl shadow-sm p-6 border border-amber-100 dark:border-slate-700">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Study to‑do list</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Lightweight task list that pairs with Focus Mode.</p>

          <div className="mt-4 flex gap-2">
            <input
              value={todoText}
              onChange={(e) => setTodoText(e.target.value)}
              placeholder="Add a task…"
              className="flex-1 border border-amber-100 dark:border-slate-700 rounded-lg px-3 py-2 bg-white/90 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100"
            />
            <button
              type="button"
              onClick={() => {
                const t = todoText.trim();
                if (!t) return;
                setTodos((prev) => [{ id: `${Date.now()}`, text: t, done: false }, ...prev]);
                setTodoText("");
              }}
              className="px-4 py-2 rounded-lg bg-amber-200 text-amber-950 hover:bg-amber-300 transition dark:!bg-[#AAF0D1] dark:!text-slate-900 dark:hover:!bg-[#D6FFF0]"
            >
              Add
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {todos.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-amber-50 dark:bg-slate-900/35 border border-amber-100 dark:border-slate-700 px-3 py-2"
              >
                <button
                  type="button"
                  onClick={() => setTodos((prev) => prev.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))}
                  className={`text-left flex-1 text-sm ${
                    t.done ? "line-through text-slate-500 dark:text-slate-400" : "text-slate-800 dark:text-slate-100"
                  }`}
                >
                  {t.text}
                </button>
                <button
                  type="button"
                  onClick={() => setTodos((prev) => prev.filter((x) => x.id !== t.id))}
                  className="text-xs px-2 py-1 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 transition dark:!bg-rose-950/30 dark:!text-rose-200 dark:hover:!bg-rose-950/45 border border-rose-200/50 dark:border-rose-900/40"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Done:{" "}
              <span className="font-semibold text-amber-900 dark:text-[#AAF0D1]">
                {todos.filter((t) => t.done).length}
              </span>
              /{todos.length}
            </p>
            <button
              type="button"
              onClick={() => setTodos((prev) => prev.filter((t) => !t.done))}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/70 border border-amber-100 text-amber-900 hover:bg-amber-50 transition dark:!bg-slate-900/35 dark:!border-slate-700 dark:!text-slate-100 dark:hover:!bg-slate-900/55"
            >
              Clear completed
            </button>
          </div>
        </section>

        <section className="bg-white/80 dark:bg-slate-900/40 rounded-2xl shadow-sm p-6 border border-amber-100 dark:border-slate-700">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Focus Mode</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Pomodoro-style timer to help you focus gently.
              </p>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-full border ${
                mode === "focus"
                  ? "bg-amber-50 text-amber-900 border-amber-100 dark:!bg-[#AAF0D1]/15 dark:!text-[#AAF0D1] dark:!border-[#AAF0D1]/35"
                  : "bg-emerald-50 text-emerald-900 border-emerald-100 dark:!bg-slate-900/35 dark:!text-slate-100 dark:!border-slate-700"
              }`}
            >
              {mode === "focus" ? "Focus" : "Break"}
            </span>
          </div>

          <div className="mt-4 rounded-2xl bg-amber-50 dark:bg-slate-900/35 border border-amber-100 dark:border-slate-700 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-300">Time left</p>
              <p className="text-4xl font-bold tracking-tight text-amber-900 dark:text-slate-100">
                {formatMMSS(secondsLeft)}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setRunning((r) => !r)}
                className="px-4 py-2 rounded-lg bg-amber-200 text-amber-950 hover:bg-amber-300 transition transform-gpu hover:-translate-y-0.5 hover:shadow-md dark:!bg-[#AAF0D1] dark:!text-slate-900 dark:hover:!bg-[#D6FFF0] dark:hover:shadow-lg"
              >
                {running ? "Pause" : "Start"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setRunning(false);
                  const next = Math.max(1, Number(mode === "focus" ? focusMinutes : breakMinutes) || 1) * 60;
                  setSecondsLeft(next);
                }}
                className="px-4 py-2 rounded-lg bg-white/70 border border-amber-100 text-amber-900 hover:bg-amber-50 transition dark:!bg-slate-900/35 dark:!border-slate-700 dark:!text-slate-100 dark:hover:!bg-slate-900/55"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="text-sm">
              <span className="block text-xs text-slate-600 dark:text-slate-300 mb-1">Focus (min)</span>
              <input
                type="number"
                min={1}
                max={120}
                value={focusMinutes}
                onChange={(e) => setFocusMinutes(Number(e.target.value) || 1)}
                className="w-full border border-amber-100 dark:border-slate-700 rounded-lg px-3 py-2 bg-white/90 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100"
              />
            </label>
            <label className="text-sm">
              <span className="block text-xs text-slate-600 dark:text-slate-300 mb-1">Break (min)</span>
              <input
                type="number"
                min={1}
                max={60}
                value={breakMinutes}
                onChange={(e) => setBreakMinutes(Number(e.target.value) || 1)}
                className="w-full border border-amber-100 dark:border-slate-700 rounded-lg px-3 py-2 bg-white/90 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100"
              />
            </label>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setRunning(false);
                setMode("focus");
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-100 text-amber-900 hover:bg-amber-100 transition dark:!bg-slate-900/35 dark:!border-slate-700 dark:!text-slate-100 dark:hover:!bg-slate-900/55"
            >
              Switch to Focus
            </button>
            <button
              type="button"
              onClick={() => {
                setRunning(false);
                setMode("break");
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-100 text-amber-900 hover:bg-amber-100 transition dark:!bg-slate-900/35 dark:!border-slate-700 dark:!text-slate-100 dark:hover:!bg-slate-900/55"
            >
              Switch to Break
            </button>
          </div>
        </section>

        <section className="bg-white/80 dark:bg-slate-900/40 rounded-2xl shadow-sm p-6 border border-amber-100 dark:border-slate-700">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Lofi Playlist</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a className="text-amber-800 hover:underline dark:text-[#AAF0D1]" href="https://www.youtube.com/watch?v=jfKfPfyJRdk" target="_blank" rel="noreferrer">
                Lofi Girl - beats to relax/study
              </a>
            </li>
            <li>
              <a className="text-amber-800 hover:underline dark:text-[#AAF0D1]" href="https://www.youtube.com/watch?v=DWcJFNfaw9c" target="_blank" rel="noreferrer">
                Peaceful Piano + Rain
              </a>
            </li>
            <li>
              <a className="text-amber-800 hover:underline dark:text-[#AAF0D1]" href="https://www.youtube.com/watch?v=5qap5aO4i9A" target="_blank" rel="noreferrer">
                Chillhop Essentials Mix
              </a>
            </li>
          </ul>

          <div className="mt-5 rounded-2xl border border-amber-100 dark:border-slate-700 overflow-hidden bg-amber-50/70 dark:bg-slate-900/35">
            <div className="relative aspect-video">
              <img
                src="https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg"
                alt="Lofi Girl YouTube preview"
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-white/25 dark:bg-slate-950/55" />

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-full p-3 bg-white/80 dark:bg-slate-900/60 border border-amber-100 dark:border-slate-700 shadow-sm">
                  <div className="w-0 h-0 border-y-[10px] border-y-transparent border-l-[16px] border-l-amber-700 dark:border-l-[#AAF0D1] ml-1" />
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-white/80 to-transparent dark:from-slate-950/70">
                <p className="text-xs font-semibold text-amber-900 dark:text-slate-100">Now playing (demo)</p>
                <p className="text-xs text-slate-700 dark:text-slate-300">Lofi Girl — beats to relax / study</p>
              </div>
            </div>

            <div className="p-3 flex items-center justify-between gap-3">
              <div className="h-2 flex-1 rounded-full bg-amber-100 dark:bg-slate-800/60 overflow-hidden">
                <div className="h-2 w-[42%] bg-amber-400 dark:bg-[#AAF0D1]" />
              </div>
              <a
                href="https://www.youtube.com/watch?v=jfKfPfyJRdk"
                target="_blank"
                rel="noreferrer"
                className="text-xs px-3 py-1.5 rounded-lg bg-white/70 border border-amber-100 text-amber-900 hover:bg-amber-50 transition dark:!bg-slate-900/35 dark:!border-slate-700 dark:!text-slate-100 dark:hover:!bg-slate-900/55"
              >
                Open on YouTube
              </a>
            </div>
          </div>
        </section>

        <section className="bg-white/80 dark:bg-slate-900/40 rounded-2xl shadow-sm p-6 border border-amber-100 dark:border-slate-700">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Calm Sounds</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Quick ambient sounds to support focus and recovery.</p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => (sound === "rain" ? stopSound() : startSound("rain"))}
              className={`px-3 py-2 rounded-lg border transition ${
                sound === "rain"
                  ? "bg-amber-200 text-amber-950 border-amber-100 dark:!bg-[#AAF0D1] dark:!text-slate-900 dark:!border-[#83e7c6]"
                  : "bg-white/70 text-slate-800 border-amber-100 hover:bg-amber-50 dark:!bg-slate-900/35 dark:!text-slate-100 dark:!border-slate-700 dark:hover:!bg-slate-900/55"
              }`}
            >
              Rain
            </button>
            <button
              type="button"
              onClick={() => (sound === "ocean" ? stopSound() : startSound("ocean"))}
              className={`px-3 py-2 rounded-lg border transition ${
                sound === "ocean"
                  ? "bg-amber-200 text-amber-950 border-amber-100 dark:!bg-[#AAF0D1] dark:!text-slate-900 dark:!border-[#83e7c6]"
                  : "bg-white/70 text-slate-800 border-amber-100 hover:bg-amber-50 dark:!bg-slate-900/35 dark:!text-slate-100 dark:!border-slate-700 dark:hover:!bg-slate-900/55"
              }`}
            >
              Ocean
            </button>
            <button
              type="button"
              onClick={() => (sound === "white" ? stopSound() : startSound("white"))}
              className={`px-3 py-2 rounded-lg border transition ${
                sound === "white"
                  ? "bg-amber-200 text-amber-950 border-amber-100 dark:!bg-[#AAF0D1] dark:!text-slate-900 dark:!border-[#83e7c6]"
                  : "bg-white/70 text-slate-800 border-amber-100 hover:bg-amber-50 dark:!bg-slate-900/35 dark:!text-slate-100 dark:!border-slate-700 dark:hover:!bg-slate-900/55"
              }`}
            >
              White noise
            </button>
            <button
              type="button"
              onClick={stopSound}
              className="px-3 py-2 rounded-lg border border-amber-100 bg-amber-50 text-amber-900 hover:bg-amber-100 transition dark:!bg-slate-900/35 dark:!border-slate-700 dark:!text-slate-100 dark:hover:!bg-slate-900/55"
            >
              Stop
            </button>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
              <span>Volume</span>
              <span>{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="mt-2 w-full"
            />
          </div>
        </section>
      </div>
    </PageFade>
  );
}

