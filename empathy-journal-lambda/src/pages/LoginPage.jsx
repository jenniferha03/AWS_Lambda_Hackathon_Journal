import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import PageFade from "../components/PageFade";
import PasswordInput from "../components/PasswordInput";
import { getLastEmail, getRecentEmails, rememberEmail, removeRememberedEmail } from "../utils/recentEmails";

export default function LoginPage() {
  const { login, loginWithGoogle, demoLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [savedEmail, setSavedEmail] = useState("");
  const [recentEmails, setRecentEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/app/dashboard";
  const demoEmail = import.meta.env.VITE_DEMO_EMAIL || "demo@empathyjournal.app";
  const canUseDemoLogin = Boolean(import.meta.env.VITE_DEMO_LOGIN_URL || import.meta.env.VITE_LAMBDA_URL);

  useEffect(() => {
    const remembered = getLastEmail();
    if (remembered) {
      setSavedEmail(remembered);
      setEmail((prev) => prev || remembered);
    }
    setRecentEmails(getRecentEmails());
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      rememberEmail(email);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      console.error(error);
      alert("Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const loginGoogle = async () => {
    try {
      const cred = await loginWithGoogle();
      if (cred?.user?.email) rememberEmail(cred.user.email);
      navigate("/app/dashboard", { replace: true });
    } catch (error) {
      console.error(error);
      alert("Google login failed.");
    }
  };

  return (
    <PageFade>
      <div className="max-w-md mx-auto bg-white/80 dark:bg-slate-900/40 border border-amber-100 dark:border-slate-700 rounded-2xl p-6 backdrop-blur">
        <h1 className="text-2xl font-bold mb-4 text-amber-700 dark:text-[#AAF0D1]">Login</h1>
        <form onSubmit={submit} className="space-y-3">
          <input
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
            className="w-full border border-amber-100 dark:border-slate-700 rounded-lg px-3 py-2 bg-white/90 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-200 dark:focus:ring-emerald-300/40"
          />
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="Password"
          />
          <button
            disabled={loading}
            className="w-full rounded-lg bg-amber-200 text-amber-950 py-2 hover:bg-amber-300 transition transform-gpu hover:-translate-y-0.5 hover:shadow-md disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none dark:!bg-[#AAF0D1] dark:!text-slate-900 dark:hover:!bg-[#D6FFF0] dark:hover:shadow-lg"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        {canUseDemoLogin ? (
          <button
            type="button"
            onClick={async () => {
              setLoading(true);
              try {
                const cred = await demoLogin();
                if (cred?.user?.email) rememberEmail(cred.user.email);
                navigate(redirectTo, { replace: true });
              } catch (error) {
                console.error(error);
                alert(error?.message || "Demo login failed.");
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="mt-3 w-full rounded-lg bg-orange-100 text-amber-900 border border-amber-100 py-2 hover:bg-orange-200 transition transform-gpu hover:-translate-y-0.5 hover:shadow-sm dark:!bg-slate-900/35 dark:!text-slate-100 dark:!border-slate-700 dark:hover:!bg-slate-900/55"
          >
            {loading ? "Signing in demo..." : `Use demo account (${demoEmail})`}
          </button>
        ) : null}
        <button
          onClick={loginGoogle}
          className="mt-3 w-full rounded-lg bg-amber-50 text-slate-800 border border-amber-100 py-2 hover:bg-amber-100 transition transform-gpu hover:-translate-y-0.5 hover:shadow-sm dark:!bg-slate-900/35 dark:!text-slate-100 dark:!border-slate-700 dark:hover:!bg-slate-900/55"
        >
          Continue with Google
        </button>
        {savedEmail ? (
          <div className="mt-3 text-xs bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-slate-700 dark:bg-slate-900/35 dark:border-slate-700 dark:text-slate-200">
            Remembered email:{" "}
            <span className="font-medium text-slate-900 dark:text-slate-100">{savedEmail}</span>
          </div>
        ) : null}
        {recentEmails.length > 0 ? (
          <div className="mt-3 rounded-lg border border-amber-100 dark:border-slate-700 p-3 bg-white/60 dark:bg-slate-900/25">
            <p className="text-xs text-slate-700 dark:text-slate-300 mb-2">Recent accounts</p>
            <div className="space-y-1">
              {recentEmails.map((item) => (
                <div key={item} className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setEmail(item)}
                    className="text-sm text-left text-amber-800 hover:underline truncate dark:text-[#AAF0D1]"
                  >
                    {item}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const next = removeRememberedEmail(item);
                      setRecentEmails(next);
                      if (savedEmail === item) setSavedEmail(next[0] || "");
                      if (email === item) setEmail(next[0] || "");
                    }}
                    className="text-xs px-2 py-0.5 rounded bg-amber-50 border border-amber-100 hover:bg-amber-100 transition dark:!bg-slate-900/35 dark:!border-slate-700 dark:hover:!bg-slate-900/55 dark:text-slate-200"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        <p className="text-sm text-slate-700 dark:text-slate-300 mt-4">
          No account?{" "}
          <Link to="/signup" className="text-amber-800 hover:underline dark:text-[#AAF0D1]">
            Create one
          </Link>
        </p>
      </div>
    </PageFade>
  );
}

