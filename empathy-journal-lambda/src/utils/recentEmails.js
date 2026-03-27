const LAST_EMAIL_KEY = "empathy_journal_last_email";
const RECENT_EMAILS_KEY = "empathy_journal_recent_emails";
const MAX_RECENT = 5;

export function getLastEmail() {
  return localStorage.getItem(LAST_EMAIL_KEY) || "";
}

export function getRecentEmails() {
  try {
    const raw = localStorage.getItem(RECENT_EMAILS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function rememberEmail(email) {
  const value = (email || "").trim().toLowerCase();
  if (!value) return;
  localStorage.setItem(LAST_EMAIL_KEY, value);
  const next = [value, ...getRecentEmails().filter((x) => x !== value)].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_EMAILS_KEY, JSON.stringify(next));
}

export function removeRememberedEmail(email) {
  const value = (email || "").trim().toLowerCase();
  if (!value) return getRecentEmails();
  const next = getRecentEmails().filter((x) => x !== value);
  localStorage.setItem(RECENT_EMAILS_KEY, JSON.stringify(next));
  if (getLastEmail() === value) {
    localStorage.setItem(LAST_EMAIL_KEY, next[0] || "");
  }
  return next;
}

