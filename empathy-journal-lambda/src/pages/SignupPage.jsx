import { useMemo, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { useAuth } from "../auth/AuthContext";
import { db } from "../lib/firebase";
import PageFade from "../components/PageFade";
import PasswordInput from "../components/PasswordInput";
import { getLastEmail, rememberEmail as rememberEmailOnDevice } from "../utils/recentEmails";
import { getPasswordChecks, validatePassword } from "../utils/passwordValidation";

const inputClass =
  "w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-200 dark:focus:ring-emerald-300/40";

export default function SignupPage() {
  const { signup, refreshUserProfile } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberEmail, setRememberEmail] = useState(true);
  const [savedEmail, setSavedEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  const pwdChecks = useMemo(() => getPasswordChecks(password), [password]);

  const allRequiredFilled = useMemo(() => {
    return (
      firstName.trim() !== "" &&
      lastName.trim() !== "" &&
      email.trim() !== "" &&
      password !== "" &&
      confirmPassword !== ""
    );
  }, [firstName, lastName, email, password, confirmPassword]);

  useEffect(() => {
    const remembered = getLastEmail();
    setSavedEmail(remembered);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const nextErrors = {};

    if (!firstName.trim()) nextErrors.firstName = "First name is required.";
    if (!lastName.trim()) nextErrors.lastName = "Last name is required.";
    if (!email.trim()) nextErrors.email = "Email is required.";
    if (!password) nextErrors.password = "Password is required.";
    if (!confirmPassword) nextErrors.confirmPassword = "Please confirm your password.";

    const pwdCheck = validatePassword(password);
    if (!pwdCheck.ok) {
      nextErrors.password = pwdCheck.message;
    }
    if (password && confirmPassword && password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const displayName = `${firstName.trim()} ${lastName.trim()}`.trim();

    setLoading(true);
    try {
      const cred = await signup(displayName, email.trim(), password);
      if (cred?.user?.uid) {
        await setDoc(
          doc(db, "user_profiles", cred.user.uid),
          {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            displayName,
            email: email.trim(),
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
        );
        await refreshUserProfile();
      }
      if (rememberEmail) {
        rememberEmailOnDevice(email.trim());
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

  const ReqLine = ({ ok, children }) => (
    <li className={`flex items-start gap-2 text-sm ${ok ? "text-emerald-700 dark:text-emerald-300" : "text-slate-600 dark:text-slate-400"}`}>
      <span className="mt-0.5 shrink-0" aria-hidden>
        {ok ? "✓" : "○"}
      </span>
      <span>{children}</span>
    </li>
  );

  return (
    <PageFade>
      <div className="max-w-md mx-auto bg-white/80 dark:bg-slate-900/40 border border-amber-100 dark:border-slate-700 rounded-2xl p-6 backdrop-blur">
        <h1 className="text-2xl font-bold mb-1 text-amber-700 dark:text-[#AAF0D1]">Create account</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Fill in all fields below. Password must meet the requirements shown.
        </p>
        <form onSubmit={submit} className="space-y-3" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                First name <span className="text-rose-600">*</span>
              </label>
              <input
                id="firstName"
                name="given-name"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (fieldErrors.firstName) setFieldErrors((p) => ({ ...p, firstName: undefined }));
                }}
                type="text"
                placeholder="First name"
                className={`${inputClass} ${fieldErrors.firstName ? "border-rose-400 ring-1 ring-rose-200" : ""}`}
              />
              {fieldErrors.firstName ? <p className="mt-1 text-xs text-rose-600 dark:text-rose-300">{fieldErrors.firstName}</p> : null}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Last name <span className="text-rose-600">*</span>
              </label>
              <input
                id="lastName"
                name="family-name"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  if (fieldErrors.lastName) setFieldErrors((p) => ({ ...p, lastName: undefined }));
                }}
                type="text"
                placeholder="Last name"
                className={`${inputClass} ${fieldErrors.lastName ? "border-rose-400 ring-1 ring-rose-200" : ""}`}
              />
              {fieldErrors.lastName ? <p className="mt-1 text-xs text-rose-600 dark:text-rose-300">{fieldErrors.lastName}</p> : null}
            </div>
          </div>

          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email <span className="text-rose-600">*</span>
            </label>
            <input
              id="signup-email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
              }}
              type="email"
              placeholder="Email"
              className={`${inputClass} ${fieldErrors.email ? "border-rose-400 ring-1 ring-rose-200" : ""}`}
            />
            {fieldErrors.email ? <p className="mt-1 text-xs text-rose-600 dark:text-rose-300">{fieldErrors.email}</p> : null}
          </div>

          <div>
            <label htmlFor="signup-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Password <span className="text-rose-600">*</span>
            </label>
            <PasswordInput
              id="signup-password"
              variant="signup"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
              }}
              autoComplete="new-password"
              placeholder="Password"
              inputClassName={`${inputClass} pr-11 ${fieldErrors.password ? "border-rose-400 ring-1 ring-rose-200" : ""}`}
            />
            <div
              className="mt-2 rounded-lg border border-amber-100 dark:border-slate-700 bg-amber-50/80 dark:bg-slate-900/40 px-3 py-2"
              role="status"
              aria-live="polite"
            >
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password requirements</p>
              <ul className="space-y-1">
                <ReqLine ok={pwdChecks.minLength}>At least 8 characters</ReqLine>
                <ReqLine ok={pwdChecks.hasSpecial}>At least one special character (not only letters and numbers)</ReqLine>
              </ul>
            </div>
            {fieldErrors.password ? <p className="mt-1 text-xs text-rose-600 dark:text-rose-300">{fieldErrors.password}</p> : null}
          </div>

          <div>
            <label htmlFor="signup-confirm" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Confirm password <span className="text-rose-600">*</span>
            </label>
            <PasswordInput
              id="signup-confirm"
              variant="signup"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (fieldErrors.confirmPassword) setFieldErrors((p) => ({ ...p, confirmPassword: undefined }));
              }}
              autoComplete="new-password"
              placeholder="Confirm password"
              inputClassName={`${inputClass} pr-11 ${fieldErrors.confirmPassword ? "border-rose-400 ring-1 ring-rose-200" : ""}`}
            />
            {fieldErrors.confirmPassword ? (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-300">{fieldErrors.confirmPassword}</p>
            ) : null}
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              checked={rememberEmail}
              onChange={(e) => setRememberEmail(e.target.checked)}
            />
            Remember this email on this device
          </label>
          <button
            type="submit"
            disabled={loading || !allRequiredFilled}
            className="w-full rounded-lg bg-emerald-200 text-emerald-950 py-2 hover:bg-emerald-300 transition transform-gpu hover:-translate-y-0.5 hover:shadow-md disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none dark:!bg-[#AAF0D1] dark:!text-slate-900 dark:hover:!bg-[#D6FFF0] dark:hover:shadow-lg"
          >
            {loading ? "Creating..." : "Create account"}
          </button>
          {!allRequiredFilled ? (
            <p className="text-xs text-center text-slate-500 dark:text-slate-400">Complete all required fields to enable sign up.</p>
          ) : null}
        </form>
        {savedEmail ? (
          <div className="mt-3 text-xs bg-amber-50 dark:bg-slate-900/35 border border-amber-100 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-600 dark:text-slate-300">
            Saved account email on this device: <span className="font-medium text-slate-800 dark:text-slate-100">{savedEmail}</span>
          </div>
        ) : null}
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-amber-800 hover:underline dark:text-[#AAF0D1]">
            Login
          </Link>
        </p>
      </div>
    </PageFade>
  );
}
