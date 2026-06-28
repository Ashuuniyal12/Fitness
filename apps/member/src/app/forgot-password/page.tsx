"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function MemberForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
    } else {
      setSuccess(true);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg-glow" />
        <div className="auth-bg-grid" />
      </div>

      <div className="auth-container">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <path d="M4 16H8M24 16H28M8 16V10C8 8.9 8.9 8 10 8H14M8 16V22C8 21 8.9 24 10 24H14M24 16V10C24 8.9 23.1 8 22 8H18M24 16V22C24 23.1 23.1 24 22 24H18M14 8H18M14 24H18M14 8V24M18 8V24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="auth-logo-text">Maximus</span>
        </div>

        <div className="auth-card">
          {success ? (
            <div className="success-state">
              <div className="success-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <h1 className="auth-title">Check your email</h1>
              <p className="success-msg">
                We sent a reset link to <strong>{email}</strong>. Click it to set a new password.
              </p>
              <button className="auth-btn-primary" onClick={() => router.push("/login")}>
                Back to Sign In
              </button>
            </div>
          ) : (
            <>
              <div className="auth-card-header">
                <h1 className="auth-title">Reset Password</h1>
                <p className="auth-subtitle">Enter your email and we&apos;ll send you a reset link</p>
              </div>

              {error && (
                <div className="auth-error">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleReset} className="auth-form">
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

                <button id="member-reset-btn" type="submit" className="auth-btn-primary" disabled={loading}>
                  {loading ? <><span className="spinner" />&nbsp;Sending...</> : "Send Reset Link"}
                </button>
              </form>

              <p className="auth-footer-text">
                Remember it?{" "}
                <a href="/login" className="form-link">Back to Sign In</a>
              </p>
            </>
          )}
        </div>
      </div>

      <style>{`
        .auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; background: #09090b; font-family: 'Montserrat', sans-serif; }
        .auth-bg { position: absolute; inset: 0; z-index: 0; }
        .auth-bg-glow { position: absolute; top: -20%; left: 50%; transform: translateX(-50%); width: 800px; height: 600px; background: radial-gradient(ellipse at center, rgba(234,179,8,0.12) 0%, transparent 70%); pointer-events: none; }
        .auth-bg-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 60px 60px; }
        .auth-container { position: relative; z-index: 1; width: 100%; max-width: 440px; padding: 24px 20px; }
        .auth-logo { display: flex; align-items: center; gap: 10px; justify-content: center; margin-bottom: 32px; }
        .auth-logo-icon { width: 44px; height: 44px; background: linear-gradient(135deg, #eab308, #d97706); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #09090b; }
        .auth-logo-text { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #f4f4f5; }
        .auth-card { background: rgba(24,24,27,0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 36px; backdrop-filter: blur(20px); box-shadow: 0 25px 50px rgba(0,0,0,0.5); }
        .auth-card-header { text-align: center; margin-bottom: 28px; }
        .auth-title { font-size: 24px; font-weight: 700; color: #f4f4f5; margin: 0 0 6px; }
        .auth-subtitle { font-size: 13px; color: #71717a; margin: 0; }
        .auth-error { display: flex; align-items: center; gap: 8px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #f87171; font-size: 13px; padding: 10px 14px; border-radius: 10px; margin-bottom: 20px; }
        .auth-form { display: flex; flex-direction: column; gap: 18px; }
        .form-field { display: flex; flex-direction: column; gap: 6px; }
        .form-label { font-size: 13px; font-weight: 600; color: #a1a1aa; }
        .form-link { font-size: 12px; color: #eab308; text-decoration: none; font-weight: 500; }
        .form-link:hover { color: #fbbf24; }
        .input-wrapper { position: relative; display: flex; align-items: center; }
        .input-icon { position: absolute; left: 14px; color: #52525b; pointer-events: none; }
        .form-input { width: 100%; background: rgba(39,39,42,0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px 14px 12px 42px; color: #f4f4f5; font-size: 14px; font-family: 'Montserrat', sans-serif; outline: none; transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box; }
        .form-input::placeholder { color: #52525b; }
        .form-input:focus { border-color: rgba(234,179,8,0.5); box-shadow: 0 0 0 3px rgba(234,179,8,0.08); }
        .auth-btn-primary { width: 100%; padding: 13px; background: linear-gradient(135deg, #eab308, #d97706); border: none; border-radius: 10px; color: #09090b; font-size: 14px; font-weight: 700; font-family: 'Montserrat', sans-serif; cursor: pointer; transition: opacity 0.2s, transform 0.15s; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .auth-btn-primary:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .auth-btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
        .auth-footer-text { text-align: center; margin-top: 20px; font-size: 13px; color: #71717a; }
        .success-state { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 16px; }
        .success-icon { width: 64px; height: 64px; border-radius: 50%; background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.3); display: flex; align-items: center; justify-content: center; color: #4ade80; }
        .success-msg { color: #a1a1aa; font-size: 14px; line-height: 1.6; margin: 0; }
        .success-msg strong { color: #e4e4e7; }
        .spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(9,9,11,0.3); border-top-color: #09090b; border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
