import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import PageFade from "../components/PageFade";
import { useAuth } from "../auth/AuthContext";
import { db } from "../lib/firebase";
import { isDemoUserAccount } from "../utils/demoUser";
import { combineFullName, splitFullName } from "../utils/profileNames";

export default function ProfilePage() {
  const { user, setUiTheme, refreshUserProfile } = useAuth();
  const demoEmail = import.meta.env.VITE_DEMO_EMAIL || "demo@empathyjournal.app";
  const isDemoUser = isDemoUserAccount(user);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [theme, setTheme] = useState("Calm");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [spotifyLink, setSpotifyLink] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    const loadProfile = async () => {
      try {
        const snap = await getDoc(doc(db, "user_profiles", user.uid));
        const data = snap.data() || {};
        const fn = String(data.firstName ?? "").trim();
        const ln = String(data.lastName ?? "").trim();
        if (fn || ln) {
          setFirstName(fn);
          setLastName(ln);
        } else {
          const merged = splitFullName(user.displayName || data.displayName || "");
          setFirstName(merged.firstName);
          setLastName(merged.lastName);
        }
        setBio(data.bio || "");
        setPronouns(data.pronouns || "");
        setTheme(data.theme || "Calm");
        setYoutubeLink(data.youtubeLink || "");
        setSpotifyLink(data.spotifyLink || "");
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };
    loadProfile();
  }, [user?.uid, user?.displayName]);

  const saveProfile = async () => {
    if (!user?.uid) return;
    const fullName = combineFullName(firstName, lastName) || user.displayName || "User";
    setSaving(true);
    try {
      await updateProfile(user, { displayName: fullName });
      await user.reload?.();

      await setDoc(
        doc(db, "user_profiles", user.uid),
        {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          displayName: fullName,
          email: user.email || "",
          bio,
          pronouns,
          theme,
          youtubeLink,
          spotifyLink,
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );
      setUiTheme(theme);
      await refreshUserProfile();

      alert("Profile updated.");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  const fillDemoProfile = async () => {
    if (!user?.uid) return;
    const demo = {
      firstName: "Demo User",
      lastName: "",
      displayName: "Demo User",
      pronouns: "they/them",
      theme: "Cozy",
      bio:
        "Building gentle consistency with journaling. I like calm rituals, nature walks, and small steps that add up.\n\nPresenting Empathy Journal — an AI-assisted space for reflection + habit-building.",
      youtubeLink: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
      spotifyLink: "https://open.spotify.com/playlist/37i9dQZF1DX3rxVfibe1L0",
    };

    setFirstName(demo.firstName);
    setLastName(demo.lastName);
    setPronouns(demo.pronouns);
    setTheme(demo.theme);
    setBio(demo.bio);
    setYoutubeLink(demo.youtubeLink);
    setSpotifyLink(demo.spotifyLink);

    setSaving(true);
    try {
      await updateProfile(user, { displayName: demo.displayName });
      // Force-refresh Firebase Auth user so UI updates immediately.
      await user.reload?.();
      await setDoc(
        doc(db, "user_profiles", user.uid),
        {
          firstName: demo.firstName,
          lastName: demo.lastName,
          displayName: demo.displayName,
          email: user.email || "",
          bio: demo.bio,
          pronouns: demo.pronouns,
          theme: demo.theme,
          youtubeLink: demo.youtubeLink,
          spotifyLink: demo.spotifyLink,
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );
      setUiTheme(demo.theme);
      await refreshUserProfile();
      alert("Demo profile filled.");
    } catch (error) {
      console.error("Error filling demo profile:", error);
      alert("Could not fill demo profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageFade>
      <div className="space-y-6 max-w-4xl mx-auto">
        {isDemoUser ? (
          <div className="bg-orange-50 dark:bg-slate-900/35 rounded-2xl border border-amber-100 dark:border-slate-700 p-4">
            <p className="text-sm text-slate-700 dark:text-slate-200 mb-2">Demo tools (dev-only)</p>
            <button
              type="button"
              onClick={fillDemoProfile}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-amber-200 text-amber-950 hover:bg-amber-300 transition transform-gpu hover:-translate-y-0.5 hover:shadow-md disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none dark:!bg-[#AAF0D1] dark:!text-slate-900 dark:hover:!bg-[#D6FFF0] dark:hover:shadow-lg"
            >
              {saving ? "Filling demo profile..." : "Auto-fill demo profile"}
            </button>
          </div>
        ) : null}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h1 className="text-2xl font-bold mb-5">Profile Settings</h1>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-orange-200 text-amber-800 border border-amber-100 dark:border-slate-700 flex items-center justify-center text-2xl font-semibold dark:!bg-emerald-300/20 dark:!text-[#AAF0D1]">
                {(firstName || user?.displayName || user?.email || "U").slice(0, 1).toUpperCase()}
              </div>
              <p className="text-xs text-slate-500">Default avatar mode (free tier friendly).</p>
            </div>

            <div className="md:col-span-2 grid gap-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-slate-500 mb-1">First name</p>
                  <p className="text-xs text-slate-400 mb-1">Shown in greetings</p>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2"
                    placeholder="First name"
                    autoComplete="given-name"
                  />
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Last name</p>
                  <p className="text-xs text-slate-400 mb-1">Used for full name</p>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2"
                    placeholder="Last name"
                    autoComplete="family-name"
                  />
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Pronouns</p>
                <input
                  value={pronouns}
                  onChange={(e) => setPronouns(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2"
                  placeholder="she/her"
                />
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Bio</p>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 min-h-20"
                  placeholder="Tell us a bit about your wellness journey..."
                />
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">UI Theme</p>
                <select value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2">
                  <option>Calm</option>
                  <option>Cozy</option>
                  <option>Focus</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm text-slate-500 mb-1">YouTube Healing Playlist</p>
              <input
                value={youtubeLink}
                onChange={(e) => setYoutubeLink(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2"
                placeholder="https://youtube.com/playlist?list=..."
              />
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm text-slate-500 mb-1">Spotify Playlist</p>
              <input
                value={spotifyLink}
                onChange={(e) => setSpotifyLink(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2"
                placeholder="https://open.spotify.com/playlist/..."
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Signed in as {user?.email || "N/A"} • UID: {user?.uid || "N/A"}
            </div>
            <button
              onClick={saveProfile}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-emerald-200 text-emerald-900 hover:bg-emerald-300 disabled:bg-slate-200"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-xl font-semibold mb-2">Connect Spotify (Coming Soon)</h2>
          <p className="text-slate-600">
            OAuth connection for Spotify recommendations is in progress. For now, paste your playlist link above.
          </p>
        </div>
      </div>
    </PageFade>
  );
}

