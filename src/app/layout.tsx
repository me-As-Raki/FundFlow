// src/app/layout.tsx
import './globals.css';
import ThemeProvider from '@/components/ThemeProvider';
import type { Metadata } from 'next';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Fundraiser Portal',
  description: 'Professional login with theme toggle',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="min-h-screen font-sans transition-colors duration-300 bg-white text-black dark:bg-black dark:text-white">
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
