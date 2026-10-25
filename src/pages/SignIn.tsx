import { useState, type FormEvent } from "react";
import { HeartHandshake, ShieldCheck } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

export default function SignIn({
  initialMode = "sign-in",
  onBack,
}: {
  initialMode?: "sign-in" | "sign-up";
  onBack?: () => void;
}) {
  const { signIn, signUp, configured } = useAuth();
  const [mode, setMode] = useState<"sign-in" | "sign-up">(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (mode === "sign-in") {
        const result = await signIn(email.trim(), password);
        if (result) setError(result);
      } else {
        const result = await signUp(fullName.trim(), email.trim(), password);
        if (result.error) {
          setError(result.error);
        } else if (result.needsEmailConfirmation) {
          setNotice("Check your email for a confirmation link, then return here to sign in.");
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function changeMode(nextMode: "sign-in" | "sign-up") {
    setMode(nextMode);
    setError("");
    setNotice("");
  }

  return (
    <main className="auth-screen">
      <section className="auth-card" aria-labelledby="auth-title">
        <a className="brand auth-brand" href="/" aria-label="Referral Navigator">
          <span className="brand-mark auth-brand-mark"><HeartHandshake size={20} /></span>
          <span>Referral Navigator</span>
        </a>
        {onBack && (
          <button className="auth-back" type="button" onClick={onBack}>
            ← Back to home
          </button>
        )}
        <p className="auth-eyebrow">YOUR REFERRAL, ORGANIZED</p>
        <h1 id="auth-title">{mode === "sign-in" ? "Welcome back" : "Create your account"}</h1>
        <p className="auth-intro">
          {mode === "sign-in"
            ? "Sign in to keep your referral details and updates together."
            : "Create an account to save your referral details securely for your own use."}
        </p>

        {!configured && (
          <p className="auth-alert" role="alert">
            This preview isn’t connected to Supabase yet. Check its Vercel environment variables.
          </p>
        )}
        {error && <p className="auth-alert" role="alert">{error}</p>}
        {notice && <p className="auth-notice" role="status">{notice}</p>}

        <form className="auth-form" onSubmit={handleSubmit} aria-busy={busy}>
          {mode === "sign-up" && (
            <label>
              Name
              <input
                autoComplete="name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
              />
            </label>
          )}
          <label>
            Email
            <input
              autoComplete="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
              type="password"
              minLength={8}
              aria-describedby={mode === "sign-up" ? "signup-password-hint" : undefined}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            {mode === "sign-up" && <small id="signup-password-hint">Use at least 8 characters.</small>}
          </label>
          <button className="auth-submit" type="submit" disabled={busy || !configured} aria-busy={busy}>
            {busy ? "Please wait…" : mode === "sign-in" ? "Sign in" : "Create account"}
          </button>
          <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            {busy ? "Please wait…" : ""}
          </span>
        </form>

        <p className="auth-switch">
          {mode === "sign-in" ? "New to Referral Navigator?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => changeMode(mode === "sign-in" ? "sign-up" : "sign-in")}
          >
            {mode === "sign-in" ? "Create an account" : "Sign in"}
          </button>
        </p>

        <p className="auth-privacy">
          <ShieldCheck size={15} />
          Updates are entered by you. Referral status isn’t checked automatically.
        </p>
      </section>
    </main>
  );
}
