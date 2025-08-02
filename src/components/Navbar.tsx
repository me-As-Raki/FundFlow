'use client';

import Link from 'next/link';
import { Sun, Moon, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useCustomTheme } from './ThemeProvider';

export default function Navbar() {
  const { theme, toggleTheme } = useCustomTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <header className="w-full fixed top-0 z-50 shadow-sm">
      <div className="w-full bg-gradient-to-r from-green-100 via-white to-green-100 dark:from-[#0f0f0f] dark:via-black dark:to-[#0f0f0f] border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="text-2xl font-bold tracking-tight text-green-700 dark:text-green-400 hover:opacity-90 transition"
          >
            FundPortal
          </Link>

          {/* Right Side */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md bg-green-50 dark:bg-neutral-800 hover:bg-green-100 dark:hover:bg-neutral-700 transition"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-green-700" />
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="p-2 rounded-md bg-gray-50 dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700 border border-gray-200 dark:border-neutral-700 transition"
                aria-label="User Menu"
              >
                <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 shadow-xl rounded-md overflow-hidden z-50">
                  <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-neutral-700">
                    {user?.email || 'User'}
                  </div>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900 transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
