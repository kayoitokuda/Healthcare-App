import { useEffect, useRef, useState, type FormEvent } from "react";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { LanguageToggle, translateText, useAppLanguage, type AppLanguage } from "../i18n";

const signupStepNames: Record<AppLanguage, [string, string, string]> = {
  en: ["Your name", "Your email", "Choose a password"],
  ja: ["お名前", "メールアドレス", "パスワードを設定"],
  zh: ["你的姓名", "你的电子邮件", "设置密码"],
  es: ["Tu nombre", "Tu correo electrónico", "Elige una contraseña"],
  vi: ["Tên của bạn", "Email của bạn", "Chọn mật khẩu"],
};

function signupProgress(step: number, language: AppLanguage) {
  const current = step + 1;
  const name = signupStepNames[language][step];
  return {
    en: `Step ${current} of 3 · ${name}`,
    ja: `全3ステップ中 ${current} · ${name}`,
    zh: `第 ${current} 步，共 3 步 · ${name}`,
    es: `Paso ${current} de 3 · ${name}`,
    vi: `Bước ${current} trên 3 · ${name}`,
  }[language];
}

function validationMessage(input: HTMLInputElement) {
  if (input.validity.valueMissing) {
    if (input.type === "email") return "Please enter your email address.";
    if (input.type === "password") return "Please enter a password.";
    return "Please enter your name.";
  }
  if (input.validity.typeMismatch) return "Please enter a valid email address.";
  if (input.validity.tooShort) return "Use at least 8 characters.";
  return "Please check this field.";
}

function localizeAuthError(message: string, language: AppLanguage) {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials") || normalized.includes("invalid email or password")) {
    return translateText("Invalid email or password.", language);
  }
  if (normalized.includes("email not confirmed") || normalized.includes("email address not confirmed")) {
    return translateText("Please confirm your email before signing in.", language);
  }
  if (normalized.includes("already registered") || normalized.includes("user already exists")) {
    return translateText("An account with this email already exists.", language);
  }
  if (normalized.includes("rate limit") || normalized.includes("too many requests")) {
    return translateText("Too many attempts. Please wait a moment and try again.", language);
  }
  if (normalized.includes("password") && (normalized.includes("at least") || normalized.includes("characters"))) {
    return translateText("Use at least 8 characters.", language);
  }
  return translateText("Something went wrong. Please try again.", language);
}

export default function SignIn({
  initialMode = "sign-in",
  onBack,
}: {
  initialMode?: "sign-in" | "sign-up";
  onBack?: () => void;
}) {
  const { signIn, signUp, configured } = useAuth();
  const { language } = useAppLanguage();
  const [mode, setMode] = useState<"sign-in" | "sign-up">(initialMode);
  const [signupStep, setSignupStep] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (mode === "sign-up") formRef.current?.querySelector("input")?.focus();
  }, [mode, signupStep]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === "sign-up" && signupStep < 2) {
      setSignupStep(signupStep + 1);
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (mode === "sign-in") {
        const result = await signIn(email.trim(), password);
        if (result) setError(localizeAuthError(result, language));
      } else {
        const result = await signUp(fullName.trim(), email.trim(), password);
        if (result.error) {
          setError(localizeAuthError(result.error, language));
        } else if (result.needsEmailConfirmation) {
          setNotice("Check your email for a confirmation link, then return here to sign in.");
        }
      }
    } catch {
      setError(translateText("Something went wrong. Please try again.", language));
    } finally {
      setBusy(false);
    }
  }

  function changeMode(nextMode: "sign-in" | "sign-up") {
    setMode(nextMode);
    setSignupStep(0);
    setError("");
    setNotice("");
  }

  return (
    <main className="auth-screen">
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-brand-row">
          <a className="brand auth-brand" href="/" aria-label={translateText("Referral Navigator", language)}>
            <span className="brand-mark auth-brand-mark"><img className="brand-mark-image" src="/brand-mark.svg" alt="" /></span>
            <span>Referral Navigator</span>
          </a>
          <LanguageToggle />
        </div>
        {onBack && (
          <button className="auth-back" type="button" onClick={onBack}>
            {translateText("← Back to home", language)}
          </button>
        )}
        <p className="auth-eyebrow">{translateText("YOUR REFERRAL, ORGANIZED", language)}</p>
        <h1 id="auth-title">{translateText(mode === "sign-in" ? "Welcome back" : "Create your account", language)}</h1>
        <p className="auth-intro">
          {translateText(
            mode === "sign-in"
              ? "Sign in to keep your referral details and updates together."
              : "Create an account to save your referral details securely for your own use.",
            language,
          )}
        </p>

        {!configured && (
          <p className="auth-alert" role="alert">
            {translateText("This preview isn’t connected to Supabase yet. Check its Vercel environment variables.", language)}
          </p>
        )}
        {error && <p className="auth-alert" role="alert">{error}</p>}
        {notice && <p className="auth-notice" role="status">{translateText(notice, language)}</p>}

        {mode === "sign-up" && (
          <p role="status">{signupProgress(signupStep, language)}</p>
        )}
        <form ref={formRef} className="auth-form" onSubmit={handleSubmit} aria-busy={busy}>
          {mode === "sign-up" && signupStep === 0 && (
            <label>
              {translateText("Name", language)}
              <input
                autoComplete="name"
                value={fullName}
                onChange={(event) => {
                  event.currentTarget.setCustomValidity("");
                  setFullName(event.target.value);
                }}
                onInput={(event) => event.currentTarget.setCustomValidity("")}
                onInvalid={(event) => event.currentTarget.setCustomValidity(translateText(validationMessage(event.currentTarget), language))}
                required
              />
            </label>
          )}
          {(mode === "sign-in" || signupStep === 1) && <label>
            {translateText("Email", language)}
            <input
              autoComplete="email"
              type="email"
              value={email}
              onChange={(event) => {
                event.currentTarget.setCustomValidity("");
                setEmail(event.target.value);
              }}
              onInput={(event) => event.currentTarget.setCustomValidity("")}
              onInvalid={(event) => event.currentTarget.setCustomValidity(translateText(validationMessage(event.currentTarget), language))}
              required
            />
          </label>}
          {(mode === "sign-in" || signupStep === 2) && <label>
            {translateText("Password", language)}
            <input
              autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
              type="password"
              minLength={mode === "sign-up" ? 8 : undefined}
              aria-describedby={mode === "sign-up" ? "signup-password-hint" : undefined}
              value={password}
              onChange={(event) => {
                event.currentTarget.setCustomValidity("");
                setPassword(event.target.value);
              }}
              onInput={(event) => event.currentTarget.setCustomValidity("")}
              onInvalid={(event) => event.currentTarget.setCustomValidity(translateText(validationMessage(event.currentTarget), language))}
              required
            />
            {mode === "sign-up" && <small id="signup-password-hint">{translateText("Use at least 8 characters.", language)}</small>}
          </label>}
          <button className="auth-submit" type="submit" disabled={busy || !configured} aria-busy={busy}>
            {busy
              ? translateText("Please wait…", language)
              : mode === "sign-in"
                ? translateText("Sign in", language)
                : translateText(signupStep < 2 ? "Continue" : "Create account", language)}
          </button>
          {mode === "sign-up" && signupStep > 0 && (
            <button className="auth-back" type="button" disabled={busy} onClick={() => setSignupStep(signupStep - 1)}>
              {translateText("Back", language)}
            </button>
          )}
          <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            {busy ? translateText("Please wait…", language) : ""}
          </span>
        </form>

        <p className="auth-switch">
          {translateText(mode === "sign-in" ? "New to Referral Navigator?" : "Already have an account?", language)}{" "}
          <button
            type="button"
            onClick={() => changeMode(mode === "sign-in" ? "sign-up" : "sign-in")}
          >
            {translateText(mode === "sign-in" ? "Create an account" : "Sign in", language)}
          </button>
        </p>

        <p className="auth-privacy">
          <ShieldCheck size={15} />
          {translateText("Updates are entered by you. Referral status isn’t checked automatically.", language)}
        </p>
      </section>
    </main>
  );
}
