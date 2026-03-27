import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithCustomToken,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { collection, deleteDoc, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { auth, googleProvider } from "../lib/firebase";
import { db } from "../lib/firebase";
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

  const demoEmail = import.meta.env.VITE_DEMO_EMAIL || "demo@empathyjournal.app";
  const isDemoUser = import.meta.env.DEV && (user?.email || "").toLowerCase() === demoEmail.toLowerCase();

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
    if (lambdaUrl.endsWith("/analyze")) return `${lambdaUrl.slice(0, -"/analyze".length)}/demo-login`;
    return `${lambdaUrl.replace(/\/$/, "")}/demo-login`;
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      uiTheme,
      setUiTheme,
      profileFirstName,
      profileLastName,
      refreshUserProfile,
      login: (email, password) => signInWithEmailAndPassword(auth, email, password),
      signup: async (name, email, password) => {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (name) await updateProfile(cred.user, { displayName: name });
        return cred;
      },
      demoLogin: async () => {
        const demoUrl = resolveDemoLoginUrl();
        if (!demoUrl) throw new Error("Missing demo login endpoint URL.");
        const res = await fetch(demoUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok || !body?.customToken) {
          throw new Error(body?.error || "Demo login failed.");
        }
        return signInWithCustomToken(auth, body.customToken);
      },
      loginWithGoogle: () => signInWithPopup(auth, googleProvider),
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
    [user, loading, uiTheme, profileFirstName, profileLastName, refreshUserProfile, isDemoUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

