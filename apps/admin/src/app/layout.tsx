import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import { AuthProvider } from '../context/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import './globals.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700', '900'],
  variable: '--font-montserrat',
});

export const metadata: Metadata = {
  title: 'Maximus Admin Portal | Core Operations',
  description: 'Manage members, payments, check-ins, class allocations, leads, and operational analytics.',
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
            <AdminSidebar />
            <main style={{ flex: 1, overflow: 'auto' }}>
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
