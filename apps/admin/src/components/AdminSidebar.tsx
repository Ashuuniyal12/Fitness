"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";

const navItems = [
  { label: "Dashboard",   href: "/",            icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { label: "Members",     href: "/members",      icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { label: "Memberships", href: "/memberships",  icon: "M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" },
  { label: "Attendance",  href: "/attendance",   icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
  { label: "Workouts",    href: "/workouts",     icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" },
  { label: "Revenue",     href: "/revenue",      icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { label: "Settings",    href: "/settings",     icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
];

const superAdminNavItems = [
  { label: "Gyms", href: "/gyms", icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10" },
  { label: "Admins", href: "/admins", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
];

export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (!user) return null;

  return (
    <>
      {/* Mobile Top Header */}
      <header className="mobile-header">
        <div className="mobile-header-logo">
          <div className="logo-icon-sm">
            <svg width="14" height="14" viewBox="0 0 32 32" fill="none">
              <path d="M4 16H8M24 16H28M8 16V10C8 8.9 8.9 8 10 8H14M8 16V22C8 21 8.9 24 10 24H14M24 16V10C24 8.9 23.1 8 22 8H18M24 16V22C24 23.1 23.1 24 22 24H18M14 8H18M14 24H18M14 8V24M18 8V24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="logo-text-sm">Maximus Admin</span>
        </div>
        <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle Menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {mobileOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </header>

      {/* Backdrop for Mobile Sidebar Drawer */}
      <div 
        className={`sidebar-backdrop ${mobileOpen ? "open" : ""}`} 
        onClick={() => setMobileOpen(false)} 
      />

      {/* Sidebar Drawer */}
      <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
        {/* Logo */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                <path d="M4 16H8M24 16H28M8 16V10C8 8.9 8.9 8 10 8H14M8 16V22C8 21 8.9 24 10 24H14M24 16V10C24 8.9 23.1 8 22 8H18M24 16V22C24 23.1 23.1 24 22 24H18M14 8H18M14 24H18M14 8V24M18 8V24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            {!collapsed && <span className="logo-text">Maximus</span>}
          </div>
          <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {collapsed
                ? <path d="M9 18l6-6-6-6"/>
                : <path d="M15 18l-6-6 6-6"/>}
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {navItems
            .filter((item) => !(user.role === "SUPER_ADMIN" && item.href === "/memberships"))
            .map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`nav-item ${isActive ? "active" : ""}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon}/>
                </svg>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
          {user.role === "SUPER_ADMIN" && (
            <>
              {!collapsed && <div className="nav-section-label">SaaS Management</div>}
              {superAdminNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} className={`nav-item ${isActive ? "active" : ""}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d={item.icon}/>
                    </svg>
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* User */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">
              {user.profile?.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="user-info">
                <span className="user-name">{user.profile?.name || "Admin"}</span>
                <span className="user-role">{user.role.replace("_", " ")}</span>
              </div>
            )}
          </div>
          {!collapsed && (
            <button className="logout-btn" onClick={logout} title="Sign out">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
            </button>
          )}
        </div>

        <style>{`
          .sidebar {
            width: 240px;
            min-height: 100vh;
            background: #111113;
            border-right: 1px solid rgba(255,255,255,0.06);
            display: flex;
            flex-direction: column;
            transition: width 0.25s ease, transform 0.3s ease;
            flex-shrink: 0;
            position: sticky;
            top: 0;
            height: 100vh;
          }
          .sidebar.collapsed { width: 64px; }
          .sidebar-header {
            padding: 16px 14px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            min-height: 60px;
          }
          .sidebar-logo { display: flex; align-items: center; gap: 10px; overflow: hidden; }
          .logo-icon {
            width: 34px; height: 34px;
            background: linear-gradient(135deg, #eab308, #d97706);
            border-radius: 8px;
            display: flex; align-items: center; justify-content: center;
            color: #09090b;
            flex-shrink: 0;
          }
          .logo-text { font-size: 16px; font-weight: 800; color: #f4f4f5; white-space: nowrap; }
          .collapse-btn {
            background: rgba(255,255,255,0.05);
            border: none;
            color: #71717a;
            cursor: pointer;
            border-radius: 6px;
            width: 28px; height: 28px;
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0;
            transition: background 0.2s, color 0.2s;
          }
          .collapse-btn:hover { background: rgba(255,255,255,0.1); color: #e4e4e7; }
          .sidebar-nav {
            flex: 1;
            padding: 10px 8px;
            display: flex;
            flex-direction: column;
            gap: 2px;
            overflow-y: auto;
          }
          .nav-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 9px 10px;
            border-radius: 8px;
            text-decoration: none;
            color: #71717a;
            font-size: 13px;
            font-weight: 500;
            transition: all 0.15s;
            white-space: nowrap;
            overflow: hidden;
          }
          .nav-item:hover { background: rgba(255,255,255,0.06); color: #e4e4e7; }
          .nav-item.active {
            background: rgba(234,179,8,0.12);
            color: #eab308;
            border: 1px solid rgba(234,179,8,0.18);
          }
          .nav-item svg { flex-shrink: 0; }
          .nav-section-label {
            font-size: 10px;
            font-weight: 600;
            color: #52525b;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            padding: 14px 12px 4px;
            white-space: nowrap;
          }
          .sidebar-footer {
            padding: 12px 8px;
            border-top: 1px solid rgba(255,255,255,0.05);
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .sidebar-user { display: flex; align-items: center; gap: 8px; flex: 1; overflow: hidden; }
          .user-avatar {
            width: 32px; height: 32px;
            background: linear-gradient(135deg, #eab308, #d97706);
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            color: #09090b;
            font-size: 13px;
            font-weight: 700;
            flex-shrink: 0;
          }
          .user-info { overflow: hidden; }
          .user-name { display: block; font-size: 12px; font-weight: 600; color: #e4e4e7; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .user-role { display: block; font-size: 10px; color: #52525b; text-transform: uppercase; letter-spacing: 0.05em; }
          .logout-btn {
            background: none; border: none; color: #52525b;
            cursor: pointer; padding: 6px; border-radius: 6px;
            display: flex; align-items: center; flex-shrink: 0;
            transition: color 0.2s, background 0.2s;
          }
          .logout-btn:hover { color: #f87171; background: rgba(239,68,68,0.1); }

          /* Mobile responsive layout */
          .mobile-header {
            display: none;
          }
          .sidebar-backdrop {
            display: none;
          }

          @media (max-width: 768px) {
            .mobile-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              height: 56px;
              background: #111113;
              border-bottom: 1px solid rgba(255,255,255,0.06);
              padding: 0 16px;
              z-index: 150;
            }
            .mobile-header-logo {
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .logo-icon-sm {
              width: 26px; height: 26px;
              background: linear-gradient(135deg, #eab308, #d97706);
              border-radius: 6px;
              display: flex; align-items: center; justify-content: center;
              color: #09090b;
            }
            .logo-text-sm {
              font-size: 14px;
              font-weight: 700;
              color: #f4f4f5;
            }
            .mobile-menu-btn {
              background: none;
              border: none;
              color: #a1a1aa;
              cursor: pointer;
              padding: 6px;
              display: flex;
              align-items: center;
            }
            .mobile-menu-btn:hover {
              color: #fafafa;
            }

            .sidebar-backdrop {
              display: block;
              position: fixed;
              inset: 0;
              background: rgba(0, 0, 0, 0.6);
              z-index: 180;
              opacity: 0;
              pointer-events: none;
              transition: opacity 0.3s ease;
            }
            .sidebar-backdrop.open {
              opacity: 1;
              pointer-events: auto;
            }

            .sidebar {
              position: fixed;
              left: 0;
              top: 0;
              bottom: 0;
              z-index: 200;
              transform: translateX(-100%);
              width: 240px !important;
              box-shadow: 10px 0 30px rgba(0, 0, 0, 0.7);
            }
            .sidebar.mobile-open {
              transform: translateX(0);
            }
            .collapse-btn {
              display: none;
            }

            /* Global override for padding on mobile */
            main {
              padding-top: 56px !important;
            }
          }
        `}</style>
      </aside>
    </>
  );
}
