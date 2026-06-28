import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import { AuthProvider } from '../context/AuthContext';
import MemberSidebar from '../components/MemberSidebar';
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${montserrat.className} antialiased bg-zinc-950 text-zinc-100 min-h-screen`} suppressHydrationWarning>
        <AuthProvider>
          <div style={{ display: 'flex', minHeight: '100vh' }}>
            <MemberSidebar />
            <main style={{ flex: 1, overflow: 'auto' }}>
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
