import { Link, NavLink, Outlet } from "react-router-dom";
import { useTheme } from "../theme/ThemeContext";

export default function PublicLayout() {
  const { isDark, toggleTheme } = useTheme();
  const year = new Date().getFullYear();
  return (
    <div
      className={`min-h-screen text-slate-800 relative overflow-hidden ${
        isDark
          ? "bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950"
          : "bg-gradient-to-b from-orange-50 via-amber-50 to-emerald-50"
      }`}
    >
      <div
        className={`pointer-events-none rounded-full blur-3xl animate-pulse h-72 w-72 ${
          isDark
            ? "absolute -top-20 -left-10 bg-amber-300/22"
            : "absolute -top-20 -right-10 bg-orange-200/35"
        }`}
      />
      <div
        className={`pointer-events-none rounded-full blur-3xl animate-pulse ${
          isDark
            ? "absolute top-36 -right-16 h-72 w-72 bg-[#AAF0D1]/30"
            : "absolute top-40 -left-12 h-60 w-60 bg-emerald-200/35"
        }`}
      />
      <header
        className={`h-16 border-b backdrop-blur sticky top-0 z-10 ${
          isDark ? "border-slate-700 bg-slate-900/80" : "border-amber-100 bg-white/80"
        }`}
      >
        <nav className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
          <Link to="/" className="font-bold text-lg text-amber-700 dark:text-[#AAF0D1]">
            Empathy Journal
          </Link>
          <div className="flex items-center gap-5 text-base font-semibold">
            <NavLink
              to="/pricing"
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-lg transition transform-gpu hover:-translate-y-0.5 hover:shadow-sm ${
                  isActive
                    ? isDark
                      ? "bg-slate-900/55 text-[#AAF0D1]"
                      : "bg-orange-50 text-amber-700"
                    : isDark
                      ? "text-slate-200 hover:bg-slate-900/55 hover:text-[#AAF0D1]"
                      : "text-slate-600 hover:bg-orange-50 hover:text-amber-700"
                }`
              }
            >
              Pricing
            </NavLink>
            <NavLink
              to="/faq"
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-lg transition transform-gpu hover:-translate-y-0.5 hover:shadow-sm ${
                  isActive
                    ? isDark
                      ? "bg-slate-900/55 text-[#AAF0D1]"
                      : "bg-orange-50 text-amber-700"
                    : isDark
                      ? "text-slate-200 hover:bg-slate-900/55 hover:text-[#AAF0D1]"
                      : "text-slate-600 hover:bg-orange-50 hover:text-amber-700"
                }`
              }
            >
              FAQ
            </NavLink>
            <NavLink
              to="/blog"
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-lg transition transform-gpu hover:-translate-y-0.5 hover:shadow-sm ${
                  isActive
                    ? isDark
                      ? "bg-slate-900/55 text-[#AAF0D1]"
                      : "bg-orange-50 text-amber-700"
                    : isDark
                      ? "text-slate-200 hover:bg-slate-900/55 hover:text-[#AAF0D1]"
                      : "text-slate-600 hover:bg-orange-50 hover:text-amber-700"
                }`
              }
            >
              Blog
            </NavLink>
            <button
              onClick={toggleTheme}
              className="px-3.5 py-2 rounded-lg transition transform-gpu hover:-translate-y-0.5 hover:shadow-md hover:ring-1 hover:ring-amber-200 bg-white/70 border border-amber-100 text-slate-700 hover:bg-amber-50 dark:!bg-slate-900/35 dark:!border-slate-700 dark:!text-slate-100 dark:hover:!bg-slate-900/55 dark:hover:shadow-md dark:hover:ring-slate-500/30"
            >
              {isDark ? "Light" : "Dark"}
            </button>
            <NavLink
              to="/login"
              className="px-3.5 py-2 rounded-lg transition transform-gpu hover:-translate-y-0.5 hover:shadow-md bg-orange-100 text-amber-700 hover:bg-orange-200 dark:!bg-slate-900/35 dark:!text-[#AAF0D1] dark:hover:!bg-slate-900/55 dark:hover:shadow-md border border-orange-200/70 dark:border-slate-700"
            >
              Login
            </NavLink>
          </div>
        </nav>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-10">
        <Outlet />
      </main>
      <footer
        className={`mt-10 border-t ${
          isDark ? "border-slate-700/70 bg-slate-950/30" : "border-amber-100 bg-amber-50/70"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-10 text-sm">
          <div className="space-y-2">
            <p className={`font-semibold ${isDark ? "text-[#AAF0D1]" : "text-amber-700"}`}>Empathy Journal</p>
            <p className={isDark ? "text-slate-300" : "text-slate-600"}>
              Reflect better, grow gently.
            </p>
            <p className={isDark ? "text-slate-400" : "text-slate-500"}>
              © {year} Empathy Journal. All rights reserved.
            </p>
          </div>

          <div className="space-y-2 md:pl-4">
            <p className={`font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>Explore</p>
            <div className="flex flex-col gap-1">
              <Link to="/pricing" className={isDark ? "text-slate-300 hover:text-[#AAF0D1]" : "text-slate-600 hover:text-amber-700"}>
                Pricing
              </Link>
              <Link to="/faq" className={isDark ? "text-slate-300 hover:text-[#AAF0D1]" : "text-slate-600 hover:text-amber-700"}>
                FAQ
              </Link>
              <Link to="/blog" className={isDark ? "text-slate-300 hover:text-[#AAF0D1]" : "text-slate-600 hover:text-amber-700"}>
                Blog
              </Link>
              <Link to="/login" className={isDark ? "text-slate-300 hover:text-[#AAF0D1]" : "text-slate-600 hover:text-amber-700"}>
                Login
              </Link>
            </div>
          </div>

          <div className="space-y-2">
            <p className={`font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>Product</p>
            <div className="flex flex-col gap-1">
              <Link to="/app/dashboard" className={isDark ? "text-slate-300 hover:text-[#AAF0D1]" : "text-slate-600 hover:text-amber-700"}>
                Dashboard
              </Link>
              <Link to="/app/journal" className={isDark ? "text-slate-300 hover:text-[#AAF0D1]" : "text-slate-600 hover:text-amber-700"}>
                Journal
              </Link>
              <Link to="/app/analytics" className={isDark ? "text-slate-300 hover:text-[#AAF0D1]" : "text-slate-600 hover:text-amber-700"}>
                Analytics
              </Link>
              <Link to="/app/toolkit" className={isDark ? "text-slate-300 hover:text-[#AAF0D1]" : "text-slate-600 hover:text-amber-700"}>
                Toolkit
              </Link>
            </div>
          </div>

          <div className="space-y-2">
            <p className={`font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>Contact</p>
            <a
              href="mailto:support@empathyjournal.app"
              className={isDark ? "text-slate-300 hover:text-[#AAF0D1]" : "text-slate-600 hover:text-amber-700"}
            >
              support@empathyjournal.app
            </a>
            <p className={isDark ? "text-slate-400" : "text-slate-500"}>
              We typically reply within 24–48 hours.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

