'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react'; // ✅ Use Lucide icons

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const finalTheme = storedTheme || (systemPrefersDark ? 'dark' : 'light');
    setTheme(finalTheme);
    document.documentElement.classList.add(finalTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.classList.remove(theme);
    document.documentElement.classList.add(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <>
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 p-2 rounded-full bg-white dark:bg-black shadow-md transition-colors duration-300 hover:scale-105"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 text-white" />
        ) : (
          <Moon className="w-5 h-5 text-black" />
        )}
      </button>
      {children}
    </>
  );
}
