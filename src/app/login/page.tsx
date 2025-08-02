"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, db, googleProvider } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import {
  Mail,
  Lock,
  LogIn,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Login successful.");
      router.replace("/dashboard");
    } catch (err: any) {
      const errorMessage =
        err?.code === "auth/user-not-found"
          ? "No user found with this email."
          : err?.code === "auth/wrong-password"
          ? "Incorrect password. Please try again."
          : "Login failed. Check your credentials.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          name: user.displayName || "",
          email: user.email || "",
          photoURL: user.photoURL || "",
          createdAt: serverTimestamp(),
        });
        console.log("User document created in Firestore.");
      }

      toast.success("Logged in with Google.");
      router.replace("/dashboard");
    } catch (err) {
      toast.error("Google sign-in failed. Try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-[#d4f5e6] to-[#edf4f8] dark:from-[#10002B] dark:to-[#1a0a2d] transition-colors duration-700 relative">
      {loading && (
        <div className="absolute inset-0 z-10 backdrop-blur-md flex items-center justify-center">
          <Loader2 className="animate-spin h-10 w-10 text-green-600 dark:text-green-300" />
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`w-full max-w-md bg-white/90 dark:bg-[#1a0a2d]/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 space-y-6 border border-gray-200 dark:border-white/10 ${
          loading ? "opacity-40 pointer-events-none" : ""
        }`}
      >
        <div className="text-center">
          <ShieldCheck
            size={48}
            className="mx-auto text-green-600 dark:text-green-300"
          />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mt-2">
            Welcome Back
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Sign in to <strong>Fundraiser Portal</strong>
          </p>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-5">
          {/* Email */}
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
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 transition"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
              <Lock className="w-4 h-4" />
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
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

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white py-2 rounded-md font-medium shadow-sm transition"
          >
            {loading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          OR
        </div>

        {/* Google Auth */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white dark:bg-white/10 text-black dark:text-white border border-gray-300 dark:border-white/20 py-2 rounded-md font-medium hover:bg-gray-100 dark:hover:bg-white/20 transition"
        >
          <img
            src="https://www.svgrepo.com/show/380993/google-logo-search-new.svg"
            alt="Google logo"
            className="w-6 h-6 sm:w-6 sm:h-6 object-contain rounded-sm"
          />

          {loading ? "Signing in..." : "Continue with Google"}
        </button>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-green-600 hover:underline font-medium dark:text-green-400"
          >
            Register here
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
