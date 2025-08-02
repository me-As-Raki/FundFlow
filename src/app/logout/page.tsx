import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Image from 'next/image';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FundFlow',
  description: 'Fundraising Intern Portal',
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="flex items-center gap-3 p-4">
          {/* ✅ This shows the logo on every page */}
          <Image
            src="/favicon.png"
            alt="FundFlow Logo"
            width={40}
            height={40}
            className="rounded-full"
          />
          <span className="text-xl font-bold text-green-600">FundFlow</span>
        </header>

        {/* Render page content */}
        {children}
      </body>
    </html>
  );
}
