import { Link } from "react-router-dom";
import PageFade from "../components/PageFade";
import heroNature from "../assets/hero-nature.jpg";

export default function LandingPage() {
  return (
    <PageFade>
      <div className="space-y-10">
        <section className="relative overflow-hidden w-screen left-1/2 -translate-x-1/2 -mt-10 min-h-[calc(100vh-4rem)] flex items-center">
          <img
            src={heroNature}
            alt="Nature landscape"
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-amber-50/85 via-amber-50/70 to-emerald-50/65 dark:from-slate-950/75 dark:via-slate-950/55 dark:to-emerald-950/35" />
          <div className="relative z-10 text-center py-14 px-6 w-full">
            <p className="inline-block px-3 py-1 rounded-full bg-orange-100/90 text-amber-700 text-sm dark:bg-emerald-300/15 dark:text-[#AAF0D1]">
              AI-powered mental wellness SaaS
            </p>
            <h1 className="mt-4 text-5xl font-bold text-amber-700 dark:text-[#AAF0D1]">
              Reflect better, grow gently.
            </h1>
            <p className="mt-4 text-slate-700 dark:text-slate-200 max-w-2xl mx-auto">
              Empathy Journal helps users capture thoughts, understand emotions, and build healthy writing habits with AI insights.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Link
                to="/signup"
                className="px-5 py-3 rounded-xl bg-orange-200 text-amber-900 hover:bg-orange-300 transition transform-gpu hover:-translate-y-0.5 hover:shadow-md dark:!bg-[#FFD9B0] dark:!text-slate-900 dark:hover:!bg-[#FFE6C9] dark:hover:shadow-lg"
              >
                Start Free
              </Link>
              <Link
                to="/pricing"
                className="px-5 py-3 rounded-xl bg-emerald-100 text-emerald-950 border border-emerald-200 hover:bg-emerald-200 transition transform-gpu hover:-translate-y-0.5 hover:shadow-md dark:!bg-[#AAF0D1] dark:!text-slate-900 dark:!border-[#83e7c6] dark:hover:!bg-[#D6FFF0] dark:hover:shadow-lg"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto">
          <div className="rounded-3xl p-6 md:p-8 overflow-hidden">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-amber-700 dark:text-[#AAF0D1]">Nature-inspired healing</h2>
                <p className="mt-2 text-slate-700 dark:text-slate-200">
                  A gentle space designed for calm reflection—soft light, fresh greens, and simple rituals you can return to.
                </p>
              </div>

              <div className="flex-1 w-full">
                <svg
                  viewBox="0 0 720 260"
                  className="w-full h-auto"
                  role="img"
                  aria-label="Nature-inspired healing illustration"
                >
                  <defs>
                    <linearGradient id="ns-sky" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#fde68a" stopOpacity="0.65" />
                      <stop offset="1" stopColor="#a7f3d0" stopOpacity="0.85" />
                    </linearGradient>
                    <linearGradient id="ns-hill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#34d399" stopOpacity="0.8" />
                      <stop offset="1" stopColor="#065f46" stopOpacity="0.85" />
                    </linearGradient>
                    <filter id="ns-blur" x="-10%" y="-10%" width="120%" height="120%">
                      <feGaussianBlur stdDeviation="10" />
                    </filter>
                    <filter id="ns-soft" x="-10%" y="-10%" width="120%" height="120%">
                      <feGaussianBlur stdDeviation="1.5" />
                    </filter>
                  </defs>

                  <rect x="0" y="0" width="720" height="260" rx="22" fill="url(#ns-sky)" />

                  {/* clouds */}
                  <g opacity="0.22" filter="url(#ns-soft)">
                    <g fill="#ffffff">
                      <circle cx="520" cy="60" r="18" />
                      <circle cx="540" cy="58" r="22" />
                      <circle cx="565" cy="62" r="16" />
                      <rect x="510" y="62" width="72" height="20" rx="10" />
                    </g>
                    <g fill="#ffffff" opacity="0.85">
                      <circle cx="260" cy="52" r="14" />
                      <circle cx="276" cy="50" r="18" />
                      <circle cx="298" cy="54" r="12" />
                      <rect x="252" y="54" width="56" height="16" rx="8" />
                    </g>
                  </g>

                  <circle cx="120" cy="70" r="44" fill="#fdba74" opacity="0.55" filter="url(#ns-blur)" />
                  <circle cx="120" cy="70" r="22" fill="#fde68a" opacity="0.9" />

                  {/* far hills */}
                  <path
                    d="M0 150 C160 95 260 175 380 140 C520 100 610 155 720 120 L720 260 L0 260 Z"
                    fill="#6ee7b7"
                    opacity="0.22"
                  />

                  <path
                    d="M0 170 C140 120 230 210 360 165 C500 120 590 200 720 150 L720 260 L0 260 Z"
                    fill="url(#ns-hill)"
                    opacity="0.85"
                  />
                  <path
                    d="M0 195 C160 140 270 230 390 195 C520 160 600 210 720 175 L720 260 L0 260 Z"
                    fill="#a7f3d0"
                    opacity="0.35"
                  />

                  {/* trees (back layer) - softer, smaller canopies */}
                  <g opacity="0.55">
                    <g transform="translate(405 120) scale(0.7)">
                      <rect x="-4" y="38" width="8" height="30" rx="3" fill="#92400e" opacity="0.6" />
                      <circle cx="-6" cy="30" r="14" fill="#6ee7b7" opacity="0.72" />
                      <circle cx="10" cy="28" r="16" fill="#34d399" opacity="0.78" />
                      <circle cx="4" cy="44" r="12" fill="#a7f3d0" opacity="0.55" />
                    </g>
                    <g transform="translate(460 118) scale(0.75)">
                      <rect x="-4" y="38" width="8" height="30" rx="3" fill="#92400e" opacity="0.65" />
                      <circle cx="0" cy="30" r="17" fill="#34d399" opacity="0.82" />
                      <circle cx="-12" cy="42" r="13" fill="#6ee7b7" opacity="0.72" />
                      <circle cx="14" cy="42" r="12" fill="#a7f3d0" opacity="0.52" />
                    </g>
                    <g transform="translate(505 125) scale(0.7)">
                      <rect x="-4" y="38" width="8" height="30" rx="3" fill="#92400e" opacity="0.65" />
                      <circle cx="-4" cy="28" r="16" fill="#34d399" opacity="0.8" />
                      <circle cx="12" cy="34" r="14" fill="#6ee7b7" opacity="0.7" />
                      <circle cx="-14" cy="40" r="11" fill="#a7f3d0" opacity="0.5" />
                    </g>
                    <g transform="translate(560 122) scale(0.72)">
                      <rect x="-4" y="38" width="8" height="30" rx="3" fill="#92400e" opacity="0.6" />
                      <circle cx="0" cy="29" r="15" fill="#34d399" opacity="0.76" />
                      <circle cx="-14" cy="40" r="12" fill="#6ee7b7" opacity="0.66" />
                      <circle cx="12" cy="44" r="10" fill="#a7f3d0" opacity="0.5" />
                    </g>
                  </g>

                  {/* trees (mid layer) - wider canopies */}
                  <g opacity="0.75">
                    <g transform="translate(470 140) scale(0.9)">
                      <rect x="-5" y="42" width="10" height="34" rx="4" fill="#92400e" opacity="0.74" />
                      <circle cx="-6" cy="30" r="20" fill="#10b981" opacity="0.88" />
                      <circle cx="18" cy="34" r="18" fill="#34d399" opacity="0.82" />
                      <circle cx="-22" cy="46" r="14" fill="#6ee7b7" opacity="0.66" />
                      <circle cx="10" cy="52" r="12" fill="#a7f3d0" opacity="0.5" />
                    </g>
                    <g transform="translate(545 148) scale(0.78)">
                      <rect x="-5" y="42" width="10" height="34" rx="4" fill="#92400e" opacity="0.74" />
                      <circle cx="0" cy="28" r="20" fill="#10b981" opacity="0.86" />
                      <circle cx="-18" cy="42" r="16" fill="#34d399" opacity="0.8" />
                      <circle cx="18" cy="44" r="14" fill="#6ee7b7" opacity="0.64" />
                      <circle cx="0" cy="52" r="11" fill="#a7f3d0" opacity="0.48" />
                    </g>
                  </g>

                  {/* trees (front layer) - mix of round + pine */}
                  <g opacity="0.9">
                    <g transform="translate(520 128)">
                      <rect x="-4" y="38" width="8" height="30" rx="3" fill="#92400e" opacity="0.78" />
                      <circle cx="0" cy="28" r="18" fill="#10b981" opacity="0.92" />
                      <circle cx="-14" cy="38" r="14" fill="#34d399" opacity="0.88" />
                      <circle cx="14" cy="38" r="14" fill="#34d399" opacity="0.88" />
                    </g>
                    <g transform="translate(585 138) scale(0.85)">
                      <rect x="-4" y="38" width="8" height="30" rx="3" fill="#92400e" opacity="0.78" />
                      <circle cx="0" cy="28" r="18" fill="#10b981" opacity="0.92" />
                      <circle cx="-14" cy="38" r="14" fill="#34d399" opacity="0.88" />
                      <circle cx="14" cy="38" r="14" fill="#34d399" opacity="0.88" />
                    </g>
                    <g transform="translate(640 130) scale(0.9)">
                      <rect x="-4" y="52" width="8" height="22" rx="3" fill="#92400e" opacity="0.75" />
                      <path d="M0 12 L-22 54 H22 Z" fill="#10b981" opacity="0.88" />
                      <path d="M0 26 L-26 66 H26 Z" fill="#34d399" opacity="0.78" />
                      <path d="M0 40 L-20 76 H20 Z" fill="#6ee7b7" opacity="0.55" />
                    </g>
                  </g>

                  {/* big foreground trees - distinct shapes */}
                  <g opacity="0.95">
                    <g transform="translate(110 148) scale(1.25)">
                      <rect x="-6" y="52" width="12" height="40" rx="5" fill="#92400e" opacity="0.72" />
                      <circle cx="-10" cy="34" r="28" fill="#10b981" opacity="0.9" />
                      <circle cx="22" cy="40" r="24" fill="#34d399" opacity="0.86" />
                      <circle cx="-30" cy="54" r="20" fill="#6ee7b7" opacity="0.72" />
                      <circle cx="6" cy="62" r="16" fill="#a7f3d0" opacity="0.5" />
                    </g>
                    <g transform="translate(205 160) scale(1.05)">
                      <rect x="-6" y="52" width="12" height="40" rx="5" fill="#92400e" opacity="0.7" />
                      <path d="M0 6 L-26 54 H26 Z" fill="#10b981" opacity="0.86" />
                      <path d="M0 22 L-30 68 H30 Z" fill="#34d399" opacity="0.78" />
                      <path d="M0 38 L-22 82 H22 Z" fill="#6ee7b7" opacity="0.6" />
                      <circle cx="0" cy="88" r="12" fill="#a7f3d0" opacity="0.35" />
                    </g>
                  </g>
                </svg>
                <p className="mt-3 text-xs text-slate-600 dark:text-slate-300">
                  A calming visual cue—designed to feel fresh in light mode and softly luminous in dark mode.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-4">
          {[
            ["AI Journal Analysis", "Emotion, themes, reflection prompts, and summary in seconds."],
            ["Streak Garden", "Turn writing consistency into a visual growth journey."],
            ["Healing Toolkit", "Breathing, actions, and calm playlists in one place."],
          ].map(([title, text]) => (
            <article key={title} className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-lg text-slate-800">{title}</h3>
              <p className="mt-2 text-slate-600">{text}</p>
            </article>
          ))}
        </section>
      </div>
    </PageFade>
  );
}

