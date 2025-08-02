"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ClipboardCopy } from "lucide-react";
import RewardsSection from "@/components/RewardsSection";
import { Gift } from "lucide-react";
import { Trophy } from "lucide-react";

import { auth, db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  deleteDoc,
} from "firebase/firestore";
import {
  onAuthStateChanged,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";

import {
  LogOut,
  Pencil,
  Trash2,
  PlusCircle,
  UserCircle,
  BarChart3,
  FileX2,
  Download,
} from "lucide-react";

type Fundraiser = {
  id: string;
  title: string;
  amount: number;
  raised?: number;
  category: string;
  status: string;
};

export default function DashboardPage() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [fundraisers, setFundraisers] = useState<Fundraiser[]>([]);
  const [totalFundraisers, setTotalFundraisers] = useState<number>(0);
  const [referralToken, setReferralToken] = useState<string>("");
  const [showExitModal, setShowExitModal] = useState(false);

  // Detect browser back button
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      setShowExitModal(true);
      window.history.pushState(null, "", window.location.href); // Re-push to avoid actual back
    };

    window.history.pushState(null, "", window.location.href); // Push initial state
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        toast.warning("🚫 You must be logged in!");
        router.push("/login");
        return;
      }

      setUser(currentUser);

      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        const nameFromDoc = userDoc.exists()
          ? userDoc.data()?.name
          : currentUser.displayName || currentUser.email || "User";

        setUserName(nameFromDoc);

        // Generate referral token: lowercase-name + 4-letter random suffix
        const generateReferralToken = (name: string) => {
          const randomSuffix = Math.random().toString(36).substring(2, 6);
          return `${name.toLowerCase().replace(/\s+/g, "-")}-${randomSuffix}`;
        };

        setReferralToken(generateReferralToken(nameFromDoc));

        const myQuery = query(
          collection(db, "fundraisers"),
          where("userId", "==", currentUser.uid)
        );
        const mySnapshot = await getDocs(myQuery);
        const myFundraisers = mySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Fundraiser, "id">),
        }));
        setFundraisers(myFundraisers);

        const allSnapshot = await getDocs(collection(db, "fundraisers"));
        setTotalFundraisers(allSnapshot.docs.length);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch dashboard data.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    toast.success("👋 Logged out successfully!");
    router.push("/login");
  };

  const handleDelete = async (id: string) => {
    toast.custom(
      (t) => (
        <div className="flex flex-col gap-2 p-2">
          <p className="text-sm text-gray-800 dark:text-white">
            Are you sure you want to{" "}
            <span className="font-semibold text-red-500">delete</span> this
            fundraiser?
          </p>
          <div className="flex justify-end gap-3 mt-2">
            <button
              onClick={async () => {
                toast.dismiss(t);
                try {
                  await deleteDoc(doc(db, "fundraisers", id));
                  setFundraisers((prev) => prev.filter((f) => f.id !== id));
                  toast.success("✅ Fundraiser deleted!");
                } catch (err) {
                  console.error(err);
                  toast.error("❌ Failed to delete fundraiser.");
                }
              }}
              className="px-4 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              Yes, Delete
            </button>
            <button
              onClick={() => toast.dismiss(t)}
              className="px-4 py-1 text-sm border rounded hover:bg-gray-100 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: 10000 }
    );
  };

  const handleWithdraw = (id: string) => {
    toast("💸 Withdraw feature coming soon!", {
      description: `Fundraiser ID: ${id}`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#d4f5e6] to-[#edf4f8] dark:from-[#10002B] dark:to-[#1a0a2d]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#d4f5e6] to-[#edf4f8] dark:from-[#10002B] dark:to-[#1a0a2d] transition-all duration-500 p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto bg-white/80 dark:bg-[#1a0a2d]/80 rounded-xl shadow-lg p-8 backdrop-blur-lg border border-gray-200 dark:border-white/10"
      >
        {/* Brand Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* Icon Circle */}
{/* Icon with animation, hover effect, no border */}
<div className="w-14 h-14 rounded-full transition-all duration-300 hover:shadow-lg hover:scale-105 hover:rotate-1">
  <img
    src="/favicon.png"
    alt="FlowFund Logo"
    className="w-full h-full object-contain p-1"
  />
</div>





            {/* Text Block */}
            <div className="flex flex-col justify-center">
              <h1
                className="
                  text-3xl font-extrabold tracking-tight leading-tight
                  bg-gradient-to-r 
                  from-green-600 to-white
                  dark:from-white dark:to-green-400
                  text-transparent bg-clip-text
                "
              >
                Flow
                <span className="text-green-600 dark:text-green-400">Fund</span>
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                A modern platform to raise hope through meaningful fundraisers
              </p>
            </div>
          </div>
        </div>

        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          {/* Welcome Section */}
          <div className="flex items-center gap-3">
            <UserCircle className="text-green-600 dark:text-green-300 w-10 h-10" />
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Welcome, {userName}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
              {/* Referral Code Section */}
              <div className="mt-1 flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Referral Code:
                </span>
                <div className="flex items-center gap-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded font-mono text-sm">
                  {referralToken}
                  <ClipboardCopy
                    className="w-4 h-4 cursor-pointer ml-1 hover:text-green-600"
                    onClick={() => {
                      navigator.clipboard.writeText(referralToken);
                      toast.success("Referral code copied!");
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {/* Profile */}
            <button
              onClick={() => router.push("/profile")}
              className="group relative flex items-center gap-2 text-sm px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-gray-800 dark:text-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-green-500 dark:hover:border-green-400"
            >
              <span className="absolute inset-0 border-b-2 border-green-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              <UserCircle className="w-4 h-4 z-10" />
              <span className="z-10">Profile</span>
            </button>
            {/* Settings */}
            <button
              onClick={() => router.push("/settings")}
              className="group relative flex items-center gap-2 text-sm px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-gray-800 dark:text-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-blue-500 dark:hover:border-blue-400"
            >
              <span className="absolute inset-0 border-b-2 border-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              <Pencil className="w-4 h-4 z-10" />
              <span className="z-10">Settings</span>
            </button>
            {/* Logout */}
            <button
              onClick={handleLogout}
              className="group relative flex items-center gap-2 text-sm px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-all duration-300 overflow-hidden hover:shadow-lg"
            >
              <LogOut className="w-4 h-4 z-10" />
              <span className="z-10">Logout</span>
              <span className="absolute inset-0 border-b-2 border-white scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </button>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard
            icon={
              <BarChart3 className="w-10 h-10 text-green-600 dark:text-green-300" />
            }
            title="Total Fundraisers"
            value={`${totalFundraisers}`}
            bg="bg-green-100 dark:bg-green-900/20"
            onClick={() => router.push("/total-fundraisers")}
          />
          <DashboardCard
            icon={
              <UserCircle className="w-10 h-10 text-purple-600 dark:text-purple-300" />
            }
            title="My Fundraisers"
            value={fundraisers.length ? `${fundraisers.length} Active` : "None"}
            bg="bg-purple-100 dark:bg-purple-900/20"
            onClick={() => router.push("/fundraisers")}
          />
          <DashboardCard
            icon={
              <PlusCircle className="w-10 h-10 text-blue-600 dark:text-blue-300" />
            }
            title="Create Fundraiser"
            value="Start Now"
            bg="bg-blue-100 dark:bg-blue-900/20"
            onClick={() => router.push("/fundraisers/create")}
          />

          {/* 🔥 NEW: Leaderboard Card */}
          <DashboardCard
            icon={
              <Trophy className="w-10 h-10 text-yellow-500 dark:text-yellow-300" />
            }
            title="Leaderboard"
            value="Top Donors"
            bg="bg-yellow-100 dark:bg-yellow-900/20"
            onClick={() => router.push("/leaderboard")}
          />
        </div>

        {/* Rewards Section (clean card below dashboard metrics) */}
        <div className="my-8 flex justify-center">
          <div className="w-full max-w-2xl">
            <div className="rounded-2xl shadow-md bg-gradient-to-r from-green-50 to-blue-50 dark:from-zinc-900 dark:to-zinc-800 border border-green-200 dark:border-zinc-700 py-5 px-6">
              {/* Header with Icon */}
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-5 h-5 text-green-700 dark:text-green-300" />
                <h3 className="text-base font-semibold text-green-800 dark:text-green-300">
                  Your Rewards
                </h3>
              </div>

              {/* Rewards Display */}
              {!!user?.email && (
                <div className="mt-0">
                  <RewardsSection userId={user.uid} />{" "}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Your Fundraisers */}
        {fundraisers.length > 0 ? (
          <div className="mt-10 space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              Your Fundraisers
            </h3>
            {fundraisers.map((f) => (
              <div
                key={f.id}
                className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-lg p-5 flex justify-between flex-col md:flex-row items-start md:items-center shadow-sm hover:shadow-md transition"
              >
                {/* Fundraiser Info */}
                <div>
                  <h4 className="text-lg font-bold text-green-700 dark:text-green-300">
                    {f.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    ₹{f.raised?.toLocaleString("en-IN") ?? 0} raised of ₹
                    {f.amount.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Category: {f.category} | Status: {f.status}
                  </p>
                </div>
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 mt-5 md:mt-0">
                  <Link
                    href={`/fundraisers/edit/${f.id}`}
                    className="flex items-center gap-1 border border-gray-300 dark:border-gray-600 px-4 py-2 rounded text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 transition"
                  >
                    <Pencil size={16} />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(f.id)}
                    className="flex items-center gap-1 text-red-600 border border-red-300 px-4 py-2 rounded text-sm hover:bg-red-50 dark:hover:bg-red-900/30 transition"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                  <button
                    onClick={() => router.push(`/withdraw/${f.id}`)}
                    className="flex items-center gap-1 text-yellow-700 border border-yellow-400 px-4 py-2 rounded text-sm hover:bg-yellow-100 dark:hover:bg-yellow-900/20 transition"
                  >
                    <Download size={16} />
                    Withdraw
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // No fundraisers UI
          <div className="mt-10 flex flex-col items-center justify-center text-center">
            <FileX2 className="w-12 h-12 text-red-400 mb-2" />
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You don’t have any fundraisers yet.
            </p>
            <button
              onClick={() => router.push("/fundraisers/create")}
              className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Launch Fundraiser
            </button>
          </div>
        )}
        {showExitModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-md w-full max-w-sm">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Are you sure you want to leave?
              </h2>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowExitModal(false)}
                  className="px-4 py-2 rounded-md border dark:border-zinc-600"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await signOut(auth);
                    toast.success("👋 Logged out successfully!");
                    router.push("/login");
                  }}
                  className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                >
                  Yes, Exit
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
          🚀 Your dashboard is improving constantly.
        </div>
      </motion.div>
    </main>
  );
}

// 🔹 Reusable Card Component
function DashboardCard({
  icon,
  title,
  value,
  bg,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  bg: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`${bg} p-4 rounded-lg flex items-center gap-4 cursor-pointer hover:shadow-md transition`}
    >
      {icon}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
          {title}
        </h4>
        <p className="text-gray-700 dark:text-gray-300">{value}</p>
      </div>
    </div>
  );
}
