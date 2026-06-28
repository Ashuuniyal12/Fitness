import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700', '900'],
  variable: '--font-montserrat',
});

export const metadata: Metadata = {
  title: 'Maximus Fitness | Premium Gym & Training Ecosystem',
  description: 'Unleash your potential with Maximus Fitness. Custom workouts, personalized nutrition plans, and elite tracking tools.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${montserrat.className} antialiased min-h-screen bg-neutral-950 text-neutral-100 selection:bg-yellow-400 selection:text-black`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
