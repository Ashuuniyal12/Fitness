"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function MemberLoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push("/");
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          phone,
        },
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      // Auto-confirmed — create backend record then redirect
      router.push("/");
    } else {
      setSuccess("Account created! Please check your email to confirm your address before logging in.");
      setTab("login");
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg-glow" />
        <div className="auth-bg-grid" />
      </div>

      <div className="auth-container">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <path d="M4 16H8M24 16H28M8 16V10C8 8.9 8.9 8 10 8H14M8 16V22C8 21 8.9 24 10 24H14M24 16V10C24 8.9 23.1 8 22 8H18M24 16V22C24 23.1 23.1 24 22 24H18M14 8H18M14 24H18M14 8V24M18 8V24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="auth-logo-text">Maximus</span>
        </div>

        <div className="auth-card">
          {/* Tab switcher */}
          <div className="tab-bar">
            <button className={`tab-btn ${tab === "login" ? "active" : ""}`} onClick={() => { setTab("login"); setError(""); setSuccess(""); }}>
              Sign In
            </button>
            <button className={`tab-btn ${tab === "signup" ? "active" : ""}`} onClick={() => { setTab("signup"); setError(""); setSuccess(""); }}>
              Create Account
            </button>
          </div>

          {success && (
            <div className="auth-success">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              {success}
            </div>
          )}

          {error && (
            <div className="auth-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {tab === "login" ? (
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-field">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input type="email" className="form-input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
                </div>
              </div>

              <div className="form-field">
                <div className="form-label-row">
                  <label className="form-label">Password</label>
                  <Link href="/forgot-password" className="form-link">Forgot password?</Link>
                </div>
                <div className="input-wrapper">
                  <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input type={showPassword ? "text" : "password"} className="form-input" placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
                  <button type="button" className="input-toggle" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>

              <button id="member-login-btn" type="submit" className="auth-btn-primary" disabled={loading}>
                {loading ? <><span className="spinner" />&nbsp;Signing in...</> : "Sign In"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="auth-form">
              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Full Name</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                    <input type="text" className="form-input" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                </div>
                <div className="form-field">
                  <label className="form-label">Phone</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.36 13 19.79 19.79 0 0 1 1.27 4.4 2 2 0 0 1 3.22 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    <input type="tel" className="form-input" placeholder="+91 98765 43210" value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input type="email" className="form-input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Password</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <input type="password" className="form-input" placeholder="Min. 8 chars" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
                  </div>
                </div>
                <div className="form-field">
                  <label className="form-label">Confirm Password</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <input type="password" className="form-input" placeholder="Repeat password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required autoComplete="new-password" />
                  </div>
                </div>
              </div>

              <button id="member-signup-btn" type="submit" className="auth-btn-primary" disabled={loading}>
                {loading ? <><span className="spinner" />&nbsp;Creating account...</> : "Create Account"}
              </button>
            </form>
          )}

          <div className="auth-divider"><span>or</span></div>

          <button id="member-google-btn" type="button" className="auth-btn-google" onClick={handleGoogleLogin}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <p className="auth-footer-text">
            Staff or trainer?{" "}
            <a href="http://localhost:3001/login" className="form-link">Go to Admin Portal →</a>
          </p>
        </div>
      </div>

      <style>{`
        .auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; background: #09090b; font-family: 'Montserrat', sans-serif; }
        .auth-bg { position: absolute; inset: 0; z-index: 0; }
        .auth-bg-glow { position: absolute; top: -20%; left: 50%; transform: translateX(-50%); width: 800px; height: 600px; background: radial-gradient(ellipse at center, rgba(234,179,8,0.12) 0%, transparent 70%); pointer-events: none; }
        .auth-bg-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 60px 60px; }
        .auth-container { position: relative; z-index: 1; width: 100%; max-width: 500px; padding: 24px 20px; }
        .auth-logo { display: flex; align-items: center; gap: 10px; justify-content: center; margin-bottom: 32px; }
        .auth-logo-icon { width: 44px; height: 44px; background: linear-gradient(135deg, #eab308, #d97706); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #09090b; }
        .auth-logo-text { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #f4f4f5; }
        .auth-card { background: rgba(24,24,27,0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 36px; backdrop-filter: blur(20px); box-shadow: 0 25px 50px rgba(0,0,0,0.5); }
        .tab-bar { display: flex; background: rgba(39,39,42,0.6); border-radius: 10px; padding: 4px; margin-bottom: 24px; gap: 4px; }
        .tab-btn { flex: 1; padding: 9px; border: none; background: transparent; border-radius: 8px; color: #71717a; font-size: 13px; font-weight: 600; font-family: 'Montserrat', sans-serif; cursor: pointer; transition: all 0.2s; }
        .tab-btn.active { background: rgba(234,179,8,0.15); color: #eab308; border: 1px solid rgba(234,179,8,0.2); }
        .auth-error { display: flex; align-items: center; gap: 8px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #f87171; font-size: 13px; padding: 10px 14px; border-radius: 10px; margin-bottom: 20px; }
        .auth-success { display: flex; align-items: center; gap: 8px; background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3); color: #4ade80; font-size: 13px; padding: 10px 14px; border-radius: 10px; margin-bottom: 20px; }
        .auth-form { display: flex; flex-direction: column; gap: 16px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .form-field { display: flex; flex-direction: column; gap: 6px; }
        .form-label-row { display: flex; justify-content: space-between; align-items: center; }
        .form-label { font-size: 12px; font-weight: 600; color: #a1a1aa; letter-spacing: 0.02em; }
        .form-link { font-size: 12px; color: #eab308; text-decoration: none; font-weight: 500; }
        .form-link:hover { color: #fbbf24; }
        .input-wrapper { position: relative; display: flex; align-items: center; }
        .input-icon { position: absolute; left: 12px; color: #52525b; pointer-events: none; flex-shrink: 0; }
        .form-input { width: 100%; background: rgba(39,39,42,0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 11px 36px 11px 38px; color: #f4f4f5; font-size: 13px; font-family: 'Montserrat', sans-serif; outline: none; transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box; }
        .form-input::placeholder { color: #52525b; }
        .form-input:focus { border-color: rgba(234,179,8,0.5); box-shadow: 0 0 0 3px rgba(234,179,8,0.08); }
        .input-toggle { position: absolute; right: 12px; background: none; border: none; color: #52525b; cursor: pointer; padding: 0; display: flex; align-items: center; transition: color 0.2s; }
        .input-toggle:hover { color: #a1a1aa; }
        .auth-btn-primary { width: 100%; padding: 13px; background: linear-gradient(135deg, #eab308, #d97706); border: none; border-radius: 10px; color: #09090b; font-size: 14px; font-weight: 700; font-family: 'Montserrat', sans-serif; cursor: pointer; transition: opacity 0.2s, transform 0.15s; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 4px; }
        .auth-btn-primary:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .auth-btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
        .auth-divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; color: #52525b; font-size: 12px; }
        .auth-divider::before, .auth-divider::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.07); }
        .auth-btn-google { width: 100%; padding: 12px; background: rgba(39,39,42,0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; color: #e4e4e7; font-size: 13px; font-weight: 600; font-family: 'Montserrat', sans-serif; cursor: pointer; transition: background 0.2s, border-color 0.2s, transform 0.15s; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .auth-btn-google:hover { background: rgba(63,63,70,0.8); border-color: rgba(255,255,255,0.15); transform: translateY(-1px); }
        .auth-footer-text { text-align: center; margin-top: 20px; font-size: 13px; color: #71717a; }
        .spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(9,9,11,0.3); border-top-color: #09090b; border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 480px) { .form-row { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
