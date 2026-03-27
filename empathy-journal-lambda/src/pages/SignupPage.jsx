import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import PageFade from "../components/PageFade";
import { getLastEmail, rememberEmail as rememberEmailOnDevice } from "../utils/recentEmails";

export default function SignupPage() {
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberEmail, setRememberEmail] = useState(true);
  const [savedEmail, setSavedEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const remembered = getLastEmail();
    setSavedEmail(remembered);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(name, email, password);
      if (rememberEmail) {
        rememberEmailOnDevice(email);
        setSavedEmail(email.trim());
      }
      navigate("/app/dashboard", { replace: true });
    } catch (error) {
      console.error(error);
      alert("Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageFade>
      <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-2xl p-6">
        <h1 className="text-2xl font-bold mb-4">Create account</h1>
        <form onSubmit={submit} className="space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full border border-slate-200 rounded-lg px-3 py-2" />
          <input
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
            className="w-full border border-slate-200 rounded-lg px-3 py-2"
          />
          <input
            name="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            className="w-full border border-slate-200 rounded-lg px-3 py-2"
          />
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={rememberEmail}
              onChange={(e) => setRememberEmail(e.target.checked)}
            />
            Remember this email on this device
          </label>
          <button disabled={loading} className="w-full rounded-lg bg-emerald-200 py-2 hover:bg-emerald-300 disabled:bg-slate-200">
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>
        {savedEmail ? (
          <div className="mt-3 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-600">
            Saved account email on this device: <span className="font-medium text-slate-800">{savedEmail}</span>
          </div>
        ) : null}
        <p className="text-sm text-slate-600 mt-4">
          Already have an account? <Link to="/login" className="text-indigo-700">Login</Link>
        </p>
      </div>
    </PageFade>
  );
}

