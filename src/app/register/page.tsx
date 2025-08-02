'use client';

import { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { auth, googleProvider, db } from '@/lib/firebase';
import {
  Mail,
  Lock,
  UserPlus,
  Loader2,
  ShieldCheck,
  Eye,
  EyeOff,
  User,
} from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('❌ Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name,
        email,
        createdAt: new Date(),
      });

      toast.success('✅ Account created successfully!');
router.replace('/dashboard');
    } catch (err: any) {
      const msg =
        err?.code === 'auth/email-already-in-use'
          ? '📧 Email already in use.'
          : '❌ Registration failed.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          name: user.displayName ?? '',
          email: user.email,
          createdAt: new Date(),
        });
      }

      toast.success('✅ Signed up with Google');
router.replace('/dashboard');
    } catch {
      toast.error('⚠️ Google sign-up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#d4f5e6] to-[#edf4f8] dark:from-[#10002B] dark:to-[#1a0a2d] px-4 relative">
      {loading && (
        <div className="absolute inset-0 z-10 backdrop-blur-sm flex items-center justify-center">
          <Loader2 className="animate-spin h-10 w-10 text-green-600 dark:text-green-300" />
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`w-full max-w-md bg-white/90 dark:bg-[#1a0a2d]/80 backdrop-blur-md rounded-xl p-8 shadow-lg border dark:border-white/10 ${
          loading ? 'opacity-40 pointer-events-none' : ''
        }`}
      >
        <div className="text-center mb-6">
          <ShieldCheck size={48} className="mx-auto text-green-600 dark:text-green-300" />
          <h2 className="text-3xl font-semibold text-gray-800 dark:text-white">Create Account</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Join the <strong>Fundraiser Portal</strong>
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
              <User className="w-4 h-4" />
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g., John Doe"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
              <Mail className="w-4 h-4" />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="e.g., yourname@example.com"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
              <Lock className="w-4 h-4" />
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 dark:text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
              <Lock className="w-4 h-4" />
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 dark:text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white py-2 rounded-md font-medium shadow-sm transition"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">OR</div>

        <button
          onClick={handleGoogleRegister}
          disabled={loading}
          className="mt-3 w-full flex items-center justify-center gap-3 bg-white dark:bg-white/10 border border-gray-300 dark:border-white/20 text-black dark:text-white py-2 rounded-md font-medium hover:bg-gray-100 dark:hover:bg-white/20 transition"
        >
<img
  src="https://www.svgrepo.com/show/380993/google-logo-search-new.svg"
  alt="Google logo"
  className="w-6 h-6 sm:w-6 sm:h-6 object-contain rounded-sm"
/>

          {loading ? 'Please wait...' : 'Continue with Google'}
        </button>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-green-600 hover:underline dark:text-green-400 font-medium"
          >
            Login
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
