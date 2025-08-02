"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { toast } from "sonner";
import {
  Mail,
  Smartphone,
  CalendarDays,
  UserCircle2,
  ArrowLeft,
} from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        toast.error("You must be logged in to view your profile.");
        return;
      }

      setUser(currentUser);

      try {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProfile(docSnap.data());
        } else {
          toast.warning("User profile not found.");
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch profile data.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-green-500 rounded-full" />
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 sm:px-6 py-10 bg-gradient-to-br from-[#f9f9fb] to-[#e6f4ea] dark:from-[#10002B] dark:to-[#1a0a2d] text-gray-800 dark:text-white">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl mx-auto bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-xl shadow-xl p-6 sm:p-8 backdrop-blur-md"
      >
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-md border border-transparent text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6 sm:mb-8">
          <UserCircle2 className="w-10 h-10 text-green-600 dark:text-green-300" />
          <h1 className="text-2xl font-bold">Profile</h1>
        </div>

        {/* Profile Fields */}
        <div className="space-y-5">
          <ProfileField
            label="Full Name"
            value={profile?.name || user?.displayName || "N/A"}
            icon={<UserCircle2 className="w-5 h-5 text-green-500" />}
          />
          <ProfileField
            label="Email"
            value={user?.email || "N/A"}
            icon={<Mail className="w-5 h-5 text-blue-500" />}
          />
          {profile?.phone && (
            <ProfileField
              label="Phone"
              value={profile.phone}
              icon={<Smartphone className="w-5 h-5 text-purple-500" />}
            />
          )}
          <ProfileField
            label="Joined On"
            value={
              user?.metadata?.creationTime
                ? new Date(user.metadata.creationTime).toLocaleDateString()
                : "N/A"
            }
            icon={<CalendarDays className="w-5 h-5 text-yellow-500" />}
          />
        </div>

        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400 text-center">
          🔒 Your information is secure and private.
        </div>
      </motion.div>
    </main>
  );
}

// 🔹 Reusable Profile Field Component
function ProfileField({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group flex items-start gap-4 border-l-4 border-transparent hover:border-green-500 dark:hover:border-green-400 px-4 py-3 bg-gray-50 dark:bg-zinc-800 rounded-md transition w-full">
      <div className="mt-1 shrink-0">{icon}</div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-green-500 transition">
          {label}
        </p>
        <p className="text-base font-medium text-gray-800 dark:text-white break-words max-w-full">
          {value}
        </p>
      </div>
    </div>
  );
}
