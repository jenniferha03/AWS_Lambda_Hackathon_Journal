import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getRedirectResult } from "firebase/auth";
import { auth } from "../lib/firebase";
import { rememberEmail } from "../utils/recentEmails";

/** Completes signInWithRedirect flow after user returns from Google. */
export default function GoogleAuthRedirectResolve() {
  const navigate = useNavigate();

  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          if (result.user.email) rememberEmail(result.user.email);
          navigate("/app/dashboard", { replace: true });
        }
      })
      .catch((e) => {
        console.error("Google redirect result:", e);
      });
  }, [navigate]);

  return null;
}
