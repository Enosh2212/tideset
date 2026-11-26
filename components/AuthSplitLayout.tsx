"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Waves,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { AuthArtwork } from "./AuthArtwork";
import { BothwayLogo } from "@/components/brand/BothwayLogo";
export function AuthSplitLayout({
  initialMode,
  googleEnabled = false,
}: {
  initialMode: "login" | "signup";
  googleEnabled?: boolean;
}) {
  const pathname = usePathname();
  const mode = pathname === "/signup" ? "signup" : initialMode;
  const signup = mode === "signup";
  const router = useRouter();
  const params = useSearchParams();
  const heading = useRef<HTMLHeadingElement>(null);
  const [ready, setReady] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState<string | null>(params.get("error"));
  const [busy, setBusy] = useState(false);
  const [touched, setTouched] = useState(false);
  const queryError = params.get("error");
  const redirect = params.get("redirect");
  const destination =
    redirect?.startsWith("/") &&
    !redirect.startsWith("//") &&
    !redirect.includes("\\")
      ? redirect
      : "/dashboard";
  useEffect(() => {
    setReady(true);
    heading.current?.focus();
    setError(queryError);
  }, [pathname, queryError]);
  const passwordError = signup && touched && password.length < 8;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);
    if (signup && password.length < 8) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(
        signup ? "/api/auth/register" : "/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            signup
              ? { name: name.trim(), email: email.trim(), password }
              : { email: email.trim(), password },
          ),
        },
      );
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.error || "We couldn't complete that. Please try again.");
        setBusy(false);
        return;
      }
      router.push(destination);
      router.refresh();
    } catch {
      setError("We couldn't connect. Check your connection and try again.");
      setBusy(false);
    }
  }
  const switchHref =
    (signup ? "/login" : "/signup") +
    (redirect ? "?redirect=" + encodeURIComponent(destination) : "");
  return (
    <div className="auth-shell">
      <div className="auth-form-side">
        <header className="auth-nav">
          <Link href="/" className="wordmark flex items-center">
            <BothwayLogo size={32} showWordmark />
          </Link>
          <Link href="/" aria-label="Back to home">
            <ArrowLeft size={16} />
            <span>Back to home</span>
          </Link>
        </header>
        <main className="auth-form-wrap">
          <div className="auth-form-content" key={mode}>
            <span className="eyebrow">
              {signup ? "A BETTER BEGINNING" : "YOUR NEXT CHAPTER"}
            </span>
            <h1 ref={heading} tabIndex={-1}>
              {signup ? (
                <>
                  Let’s make
                  <br />
                  <em>good work happen.</em>
                </>
              ) : (
                <>
                  Welcome
                  <br />
                  <em>back.</em>
                </>
              )}
            </h1>
            <p>
              {signup
                ? "Create an account. Put a clear plan between you and your next project."
                : "Sign in to your agreements, milestones and the work ahead."}
            </p>
            {googleEnabled && (
              <>
                <a className="google-signin" href="/api/auth/google">
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fill="#4285F4"
                      d="M22 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.6a4.8 4.8 0 0 1-2.1 3.1v2.6h3.4c2-1.8 3.1-4.4 3.1-7.6Z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 22c2.8 0 5.1-.9 6.9-2.5l-3.4-2.6c-.9.6-2 1-3.5 1-2.7 0-5.1-1.9-5.9-4.4H2.6v2.7A10.4 10.4 0 0 0 12 22Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M6.1 13.5a6.1 6.1 0 0 1 0-3.9V6.9H2.6a10 10 0 0 0 0 9.3l3.5-2.7Z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.7c1.6 0 2.9.5 4 1.6l3-3A10.1 10.1 0 0 0 2.6 6.9l3.5 2.7C6.9 7.3 9.3 5.7 12 5.7Z"
                    />
                  </svg>
                  Continue with Google
                </a>
                <div className="auth-divider">
                  <span>or use email</span>
                </div>
              </>
            )}
            <form
              onSubmit={submit}
              className="auth-form"
              aria-label={signup ? "Create account" : "Sign in"}
            >
              {signup && (
                <div className="auth-field">
                  <label htmlFor="full-name">Full name</label>
                  <input
                    disabled={!ready}
                    id="full-name"
                    name="name"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={80}
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}
              <div className="auth-field">
                <label htmlFor="email">Email address</label>
                <input
                  disabled={!ready}
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="auth-field">
                <label htmlFor="password">Password</label>
                <div className="password-field">
                  <input
                    disabled={!ready}
                    id="password"
                    name="password"
                    type={visible ? "text" : "password"}
                    autoComplete={signup ? "new-password" : "current-password"}
                    required
                    maxLength={100}
                    minLength={signup ? 8 : 1}
                    placeholder={
                      signup ? "At least 8 characters" : "Your password"
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouched(true)}
                    aria-invalid={passwordError || undefined}
                    aria-describedby={
                      passwordError ? "password-help" : undefined
                    }
                  />
                  <button
                    disabled={!ready}
                    type="button"
                    aria-label={visible ? "Hide password" : "Show password"}
                    aria-pressed={visible}
                    onClick={() => setVisible(!visible)}
                  >
                    {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordError && (
                  <small id="password-help" className="field-error">
                    Use at least 8 characters.
                  </small>
                )}
              </div>
              {error && (
                <div role="alert" className="auth-error">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}
              <button
                type="submit"
                className="tide-button auth-submit"
                disabled={!ready || busy}
              >
                {busy ? (
                  <>
                    <Loader2 className="loading-spinner" size={18} />
                    {signup ? "Creating your account…" : "Signing you in…"}
                  </>
                ) : (
                  <>
                    {signup ? "Create account" : "Sign in"}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
            <p className="auth-switch">
              {signup ? "Already have an account?" : "New to TIDESET?"}{" "}
              <Link href={switchHref}>
                {signup ? "Sign in" : "Create an account"} <ArrowUpRightSmall />
              </Link>
            </p>
            <p className="auth-reassurance">
              One account. A customer in one project, a provider in another.
            </p>
          </div>
        </main>
        <footer className="auth-form-footer">
          <span>Built for better working relationships.</span>
          <Link href="/security">Security</Link>
        </footer>
      </div>
      <AuthArtwork mode={mode} />
    </div>
  );
}
function ArrowUpRightSmall() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path d="M5 15 15 5M5 5h10v10" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
