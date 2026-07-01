"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { usePathname } from "next/navigation";

// How many days before showing again after dismiss
const DISMISS_DAYS = 2;
const STORAGE_KEY = "maximus-admin-pwa-dismiss";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallBanner() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  // Register service worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => console.warn("SW registration failed:", err));
    }
    // Detect if already installed as PWA
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }
  }, []);

  // Capture install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Detect iOS Safari
  useEffect(() => {
    const ua = navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua) && !(window as Window & { MSStream?: unknown }).MSStream;
    setIsIOS(ios);
  }, []);

  // Show banner when user is logged in, not on login page, not dismissed recently, not installed
  useEffect(() => {
    if (!user) { setShowBanner(false); return; }
    if (pathname === "/login" || pathname === "/forgot-password" || pathname === "/reset-password") {
      setShowBanner(false);
      return;
    }
    if (isInstalled) { setShowBanner(false); return; }

    // Check dismiss cooldown (2 days)
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      const diffDays = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
      if (diffDays < DISMISS_DAYS) { setShowBanner(false); return; }
    }

    // Show if we have an install event (Chrome/Edge) or if iOS
    if (installEvent || isIOS) {
      // Small delay so it doesn't feel jarring right after login
      const t = setTimeout(() => setShowBanner(true), 2500);
      return () => clearTimeout(t);
    }
  }, [user, pathname, installEvent, isIOS, isInstalled]);

  const handleInstall = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
      setInstallEvent(null);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <>
      <div className="pwa-banner">
        <div className="pwa-banner-icon">
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
            <path d="M4 16H8M24 16H28M8 16V10C8 8.9 8.9 8 10 8H14M8 16V22C8 21 8.9 24 10 24H14M24 16V10C24 8.9 23.1 8 22 8H18M24 16V22C24 23.1 23.1 24 22 24H18M14 8H18M14 24H18M14 8V24M18 8V24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="pwa-banner-content">
          <div className="pwa-banner-title">Install Maximus Admin</div>
          {isIOS ? (
            <div className="pwa-banner-sub">
              Tap <strong>Share</strong> then <strong>"Add to Home Screen"</strong> in Safari
            </div>
          ) : (
            <div className="pwa-banner-sub">Get the app for faster access & offline use</div>
          )}
        </div>
        <div className="pwa-banner-actions">
          {!isIOS && (
            <button className="pwa-btn-install" onClick={handleInstall}>
              Install
            </button>
          )}
          <button className="pwa-btn-dismiss" onClick={handleDismiss} aria-label="Dismiss">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      <style>{`
        .pwa-banner {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(24, 24, 27, 0.95);
          border: 1px solid rgba(234, 179, 8, 0.3);
          border-radius: 16px;
          padding: 14px 16px;
          backdrop-filter: blur(20px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(234,179,8,0.1);
          max-width: calc(100vw - 32px);
          width: max-content;
          animation: pwa-slide-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes pwa-slide-up {
          from { opacity: 0; transform: translateX(-50%) translateY(24px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .pwa-banner-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #eab308, #d97706);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #09090b;
          flex-shrink: 0;
        }
        .pwa-banner-content {
          flex: 1;
          min-width: 0;
        }
        .pwa-banner-title {
          font-size: 14px;
          font-weight: 700;
          color: #fafafa;
          white-space: nowrap;
        }
        .pwa-banner-sub {
          font-size: 12px;
          color: #a1a1aa;
          margin-top: 2px;
          white-space: nowrap;
        }
        .pwa-banner-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .pwa-btn-install {
          background: linear-gradient(135deg, #eab308, #d97706);
          border: none;
          border-radius: 8px;
          color: #09090b;
          font-size: 13px;
          font-weight: 700;
          padding: 8px 16px;
          cursor: pointer;
          white-space: nowrap;
          transition: opacity 0.2s, transform 0.15s;
        }
        .pwa-btn-install:hover { opacity: 0.9; transform: translateY(-1px); }
        .pwa-btn-dismiss {
          background: rgba(63,63,70,0.6);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          color: #71717a;
          cursor: pointer;
          padding: 6px;
          display: flex;
          align-items: center;
          transition: color 0.2s, background 0.2s;
        }
        .pwa-btn-dismiss:hover { color: #a1a1aa; background: rgba(63,63,70,0.9); }
        @media (max-width: 480px) {
          .pwa-banner { bottom: 16px; border-radius: 14px; }
          .pwa-banner-sub { white-space: normal; max-width: 160px; }
        }
      `}</style>
    </>
  );
}
