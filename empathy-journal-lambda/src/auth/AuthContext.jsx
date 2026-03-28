import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithCustomToken,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateProfile,
} from "firebase/auth";
import { collection, deleteDoc, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { auth, googleProvider } from "../lib/firebase";
import { db } from "../lib/firebase";
import { isDemoUserAccount } from "../utils/demoUser";
import { splitFullName } from "../utils/profileNames";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uiTheme, setUiTheme] = useState("Calm");
  const [profileFirstName, setProfileFirstName] = useState("");
  const [profileLastName, setProfileLastName] = useState("");

  const applyUserProfileDoc = (data, authDisplayName) => {
    const fn = String(data?.firstName ?? "").trim();
    const ln = String(data?.lastName ?? "").trim();
    if (fn || ln) {
      setProfileFirstName(fn);
      setProfileLastName(ln);
      return;
    }
    const merged = splitFullName(authDisplayName || data?.displayName || "");
    setProfileFirstName(merged.firstName);
    setProfileLastName(merged.lastName);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      setUiTheme("Calm");
      setProfileFirstName("");
      setProfileLastName("");
      return;
    }
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, "user_profiles", user.uid));
        const data = snap.data() || {};
        setUiTheme(data.theme || "Calm");
        applyUserProfileDoc(data, user.displayName);
      } catch (e) {
        console.error("Error loading ui theme:", e);
        setUiTheme("Calm");
        applyUserProfileDoc({}, user.displayName);
      }
    };
    load();
  }, [user?.uid, user?.displayName]);

  const refreshUserProfile = useCallback(async () => {
    const u = auth.currentUser;
    if (!u?.uid) return;
    try {
      const snap = await getDoc(doc(db, "user_profiles", u.uid));
      const data = snap.data() || {};
      setUiTheme(data.theme || "Calm");
      applyUserProfileDoc(data, u.displayName);
    } catch (e) {
      console.error("Error refreshing user profile:", e);
      applyUserProfileDoc({}, u.displayName);
    }
  }, []);

  const [isDemoUser, setIsDemoUser] = useState(false);
  useEffect(() => {
    if (!user) {
      setIsDemoUser(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        await user.getIdToken(true);
        const r = await user.getIdTokenResult();
        if (cancelled) return;
        if (r.claims?.demo === true) {
          setIsDemoUser(true);
          return;
        }
      } catch (e) {
        console.error("Demo token claim check:", e);
      }
      if (cancelled) return;
      setIsDemoUser(isDemoUserAccount(user));
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const clearDemoContent = async (uid) => {
    if (!uid) return;
    const [postSnap, journalSnap] = await Promise.all([
      getDocs(query(collection(db, "mood_posts"), where("userId", "==", uid))),
      getDocs(query(collection(db, "journals"), where("userId", "==", uid))),
    ]);
    await Promise.all([
      ...postSnap.docs.map((d) => deleteDoc(doc(db, "mood_posts", d.id))),
      ...journalSnap.docs.map((d) => deleteDoc(doc(db, "journals", d.id))),
    ]);
  };

  const resolveDemoLoginUrl = () => {
    const explicit = String(import.meta.env.VITE_DEMO_LOGIN_URL || "").trim();
    if (explicit) return explicit;
    const lambdaUrl = String(import.meta.env.VITE_LAMBDA_URL || "").trim();
    if (!lambdaUrl) return "";
    const base = lambdaUrl.replace(/\/$/, "");
    if (base.endsWith("/analyze")) return `${base.slice(0, -"/analyze".length)}/demo-login`;
    if (base.endsWith("/gptJournalAnalyzer")) return `${base.slice(0, -"/gptJournalAnalyzer".length)}/demo-login`;
    return `${base}/demo-login`;
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      uiTheme,
      setUiTheme,
      profileFirstName,
      profileLastName,
      isDemoUser,
      refreshUserProfile,
      login: (email, password) => signInWithEmailAndPassword(auth, email, password),
      signup: async (name, email, password) => {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (name) await updateProfile(cred.user, { displayName: name });
        return cred;
      },
      demoLogin: async () => {
        const demoUrl = resolveDemoLoginUrl();
        const demoEm = String(import.meta.env.VITE_DEMO_EMAIL || "demo@empathyjournal.app").trim();
        const devDemoPw = import.meta.env.DEV ? String(import.meta.env.VITE_DEMO_PASSWORD || "").trim() : "";

        const signInDevDemoWithPassword = () => signInWithEmailAndPassword(auth, demoEm, devDemoPw);

        if (demoUrl) {
          try {
            // No Content-Type / body: avoids CORS preflight so API Gateway without OPTIONS still works.
            const res = await fetch(demoUrl, { method: "POST", mode: "cors" });
            const rawText = await res.text();
            let body = {};
            try {
              body = rawText ? JSON.parse(rawText) : {};
            } catch {
              throw new Error("Demo server returned invalid JSON.");
            }
            let customToken = body?.customToken;
            if (!customToken && typeof body?.body === "string") {
              try {
                const inner = JSON.parse(body.body);
                customToken = inner?.customToken;
                if (!customToken && inner?.error) throw new Error(inner.error);
              } catch (e) {
                if (e?.message && e.message !== "[object Object]") throw e;
              }
            }
            if (!customToken) {
              let msg = body?.error;
              if (!msg && typeof body?.body === "string") {
                try {
                  msg = JSON.parse(body.body)?.error;
                } catch {
                  /* ignore */
                }
              }
              throw new Error(msg || `Demo login failed (HTTP ${res.status}).`);
            }
            return signInWithCustomToken(auth, customToken);
          } catch (e) {
            if (import.meta.env.DEV && devDemoPw) {
              console.warn("Demo API unreachable or error; using VITE_DEMO_PASSWORD for local dev:", e?.message || e);
              return signInDevDemoWithPassword();
            }
            throw e instanceof Error ? e : new Error(String(e));
          }
        }

        if (import.meta.env.DEV && devDemoPw) {
          return signInDevDemoWithPassword();
        }

        throw new Error(
          "Demo login: set VITE_LAMBDA_URL (or VITE_DEMO_LOGIN_URL) for API token login, or in local dev add VITE_DEMO_PASSWORD to .env.",
        );
      },
      loginWithGoogle: async () => {
        try {
          return await signInWithPopup(auth, googleProvider);
        } catch (e) {
          if (e?.code === "auth/popup-blocked" || e?.code === "auth/cancelled-popup-request") {
            await signInWithRedirect(auth, googleProvider);
            return null;
          }
          throw e;
        }
      },
      logout: async () => {
        try {
          if (isDemoUser && user?.uid) await clearDemoContent(user.uid);
        } catch (e) {
          console.error("Error clearing demo content on logout:", e);
        } finally {
          await signOut(auth);
        }
      },
      getIdToken: async () => (auth.currentUser ? auth.currentUser.getIdToken() : ""),
    }),
    [user, loading, uiTheme, profileFirstName, profileLastName, isDemoUser, refreshUserProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

