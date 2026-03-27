/**
 * Password rules: at least 8 characters and at least one special (non-alphanumeric) character.
 */
export function getPasswordChecks(password) {
  const p = typeof password === "string" ? password : "";
  return {
    minLength: p.length >= 8,
    hasSpecial: /[^A-Za-z0-9]/.test(p),
  };
}

export function validatePassword(password) {
  const p = typeof password === "string" ? password : "";
  const { minLength, hasSpecial } = getPasswordChecks(p);
  if (!minLength) {
    return { ok: false, message: "Password must be at least 8 characters." };
  }
  if (!hasSpecial) {
    return {
      ok: false,
      message: "Password must include at least one special character (e.g. ! @ # $).",
    };
  }
  return { ok: true };
}
