"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Waves,
  ArrowUpRight,
  ChevronDown,
  Menu,
  X,
  User,
  Settings,
  LogOut,
  ArrowRight,
} from "lucide-react";
import { RandomLetterSwap } from "./ui/random-letter-swap";
import { BothwayLogo } from "@/components/brand/BothwayLogo";
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: string;
}
export function PublicNavbar({
  initialUser,
  workspace = false,
}: {
  initialUser?: AuthUser | null;
  workspace?: boolean;
}) {
  const [user, setUser] = useState<AuthUser | null>(initialUser ?? null);
  const [loading, setLoading] = useState(!initialUser);
  const [mobile, setMobile] = useState(false);
  const [menu, setMenu] = useState(false);
  const [error, setError] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    fetch("/api/auth/me", { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.authenticated) setUser(d.user);
      })
      .catch(() => {})
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [initialUser]);
  useEffect(() => {
    function outside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenu(false);
    }
    function escape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenu(false);
        setMobile(false);
        trigger.current?.focus();
      }
    }
    document.addEventListener("mousedown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, []);
  async function logout() {
    setError("");
    try {
      const r = await fetch("/api/auth/logout", { method: "POST" });
      if (!r.ok) throw Error();
      setUser(null);
      setMenu(false);
      setMobile(false);
      router.push("/login");
      router.refresh();
    } catch {
      setError("Couldn't sign out. Please try again.");
    }
  }
  const links = user
    ? [
        ["/agreements", "My agreements"],
        ["/dashboard", "Dashboard"],
      ]
    : [
        ["/#how-it-works", "How it works"],
        ["/#for-customers", "For customers"],
        ["/#for-providers", "For providers"],
      ];
  return (
    <header className="tide-nav">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div className="tide-nav-inner">
        <Link className="wordmark flex items-center" href={workspace ? "/dashboard" : "/"}>
          <BothwayLogo size={32} showWordmark subtext="FINANCIAL WORKSPACE" />
        </Link>
        <nav className="desktop-links" aria-label="Main navigation">
          {links.map(([href, label]) => (
            <RandomLetterSwap key={label} href={href} label={label} />
          ))}
        </nav>
        <div className="desktop-account">
          {loading ? (
            <span className="nav-loading" aria-label="Checking session" />
          ) : user ? (
            <div className="account-wrap" ref={menuRef}>
              <button
                className="account-trigger"
                ref={trigger}
                aria-expanded={menu}
                aria-controls="account-links"
                onClick={() => setMenu(!menu)}
              >
                <span className="user-avatar">
                  {user.name?.slice(0, 1).toUpperCase() || "U"}
                </span>
                {user.name}
                <ChevronDown size={14} />
              </button>
              {menu && (
                <div className="account-dropdown" id="account-links">
                  <div>
                    <b>{user.name}</b>
                    <small>{user.email}</small>
                  </div>
                  <Link href="/settings" onClick={() => setMenu(false)}>
                    <User size={16} />
                    Profile
                  </Link>
                  <Link href="/settings" onClick={() => setMenu(false)}>
                    <Settings size={16} />
                    Settings
                  </Link>
                  <button onClick={logout}>
                    <LogOut size={16} />
                    Sign out
                  </button>
                  {error && <p role="alert">{error}</p>}
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="nav-login">
                Log in
              </Link>
              <Link href="/signup" className="tide-button nav-cta">
                Get started <ArrowUpRight size={16} />
              </Link>
            </>
          )}
        </div>
        <button
          className="mobile-menu-toggle"
          aria-label={mobile ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobile}
          aria-controls="mobile-navigation"
          onClick={() => setMobile(!mobile)}
        >
          {mobile ? <X /> : <Menu />}
        </button>
      </div>
      {mobile && (
        <nav
          className="mobile-navigation"
          id="mobile-navigation"
          aria-label="Mobile navigation"
        >
          {links.map(([href, label]) => (
            <Link key={label} href={href} onClick={() => setMobile(false)}>
              {label}
              <ArrowRight size={17} />
            </Link>
          ))}
          {user ? (
            <>
              <Link href="/settings" onClick={() => setMobile(false)}>
                Profile & settings
              </Link>
              <span className="mobile-user">{user.name}</span>
              <button onClick={logout}>
                Sign out <LogOut size={16} />
              </button>
              {error && <p role="alert">{error}</p>}
            </>
          ) : (
            !loading && (
              <>
                <Link href="/login">Log in</Link>
                <Link href="/signup">
                  Get started <ArrowUpRight size={17} />
                </Link>
              </>
            )
          )}
        </nav>
      )}
    </header>
  );
}
