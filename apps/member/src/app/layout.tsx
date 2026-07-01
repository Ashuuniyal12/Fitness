import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import { AuthProvider } from '../context/AuthContext';
import MemberSidebar from '../components/MemberSidebar';
import PWAInstallBanner from '../components/PWAInstallBanner';
import './globals.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700', '900'],
  variable: '--font-montserrat',
});

// Authenticated member portal — never statically prerender
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Maximus Member Portal | Your Fitness Journey',
  description: 'Log workouts, track daily nutrition, view goals, check-in, and level up with badges.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Maximus',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#eab308',
    'theme-color': '#eab308',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="theme-color" content="#eab308" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Maximus" />
      </head>
      <body className={`${montserrat.className} antialiased bg-zinc-950 text-zinc-100 min-h-screen`} suppressHydrationWarning>
        <AuthProvider>
          <div style={{ display: 'flex', minHeight: '100vh' }}>
            <MemberSidebar />
            <main style={{ flex: 1, overflow: 'auto' }}>
              {children}
            </main>
          </div>
          <PWAInstallBanner />
        </AuthProvider>
      </body>
    </html>
  );
}
