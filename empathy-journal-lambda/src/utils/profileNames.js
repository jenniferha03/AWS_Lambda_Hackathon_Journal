/** Split a full display string into first + last (first word vs remainder). */
export function splitFullName(full) {
  const parts = String(full || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export function combineFullName(firstName, lastName) {
  return [String(firstName || "").trim(), String(lastName || "").trim()].filter(Boolean).join(" ");
}

/** Short label for greetings: first name, else first part of email local, else "there". */
export function greetingFromProfile(profileFirstName, displayName, email) {
  const fn = String(profileFirstName || "").trim();
  if (fn) return fn;
  const { firstName } = splitFullName(displayName);
  if (firstName) return firstName;
  const raw = String(email || "").trim();
  if (!raw) return "there";
  const local = raw.includes("@") ? raw.split("@")[0] : raw;
  return local ? local.charAt(0).toUpperCase() + local.slice(1) : "there";
}
