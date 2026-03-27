import { useId, useState } from "react";

const defaultInputClass =
  "w-full border border-amber-100 dark:border-slate-700 rounded-lg px-3 py-2 pr-11 bg-white/90 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-200 dark:focus:ring-emerald-300/40";

const signupInputClass =
  "w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 pr-11 bg-white dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-200 dark:focus:ring-emerald-300/40";

export default function PasswordInput({
  value,
  onChange,
  placeholder = "Password",
  autoComplete = "current-password",
  className = "",
  inputClassName,
  variant = "default",
  id: idProp,
}) {
  const reactId = useId();
  const id = idProp ?? `pwd-${reactId}`;
  const [show, setShow] = useState(false);

  const inner =
    inputClassName ||
    (variant === "signup" ? signupInputClass : defaultInputClass);

  return (
    <div className={`relative flex items-center ${className}`}>
      <input
        id={id}
        name={autoComplete === "new-password" ? "password" : "password"}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        className={inner}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((s) => !s)}
        className="absolute right-2 px-2 py-1 text-xs font-medium text-amber-800 hover:bg-amber-50 rounded-md dark:text-[#AAF0D1] dark:hover:bg-slate-800/60"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? "Hide" : "Show"}
      </button>
    </div>
  );
}
