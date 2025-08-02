"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  FaSearch,
  FaFilter,
  FaChevronDown,
  FaChevronUp,
  FaUsers,
  FaArrowLeft,
} from "react-icons/fa";
import { useRouter } from "next/navigation";

interface Donor {
  userId: string;
  amount: number;
  timestamp: string;
  fundraiserId: string;
}

interface User {
  name: string;
  email: string;
}

interface FundraiserData {
  createdBy: string;
  donors: Donor[];
}

interface LeaderboardEntry {
  userId: string;
  total: number;
  donations: (Donor & { fundraiserOwner?: string })[];
  userInfo?: User;
  expanded?: boolean;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [amountFilter, setAmountFilter] = useState("");
  const [sortOption, setSortOption] = useState("highest");

  const router = useRouter();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const fundraiserSnap = await getDocs(collection(db, "fundraisers"));
        const donationMap = new Map<string, LeaderboardEntry>();

        for (const docSnap of fundraiserSnap.docs) {
          const data = docSnap.data() as FundraiserData;
          const fundraiserId = docSnap.id;
          const fundraiserOwnerId = data.createdBy || "unknown";
          const donors = data.donors || [];

          donors.forEach((donor) => {
            const extendedDonation = {
              ...donor,
              fundraiserOwner: fundraiserOwnerId,
              fundraiserId,
            };

            if (donationMap.has(donor.userId)) {
              const entry = donationMap.get(donor.userId)!;
              entry.total += donor.amount;
              entry.donations.push(extendedDonation);
            } else {
              donationMap.set(donor.userId, {
                userId: donor.userId,
                total: donor.amount,
                donations: [extendedDonation],
              });
            }
          });
        }

        const leaderboardArray = Array.from(donationMap.values());

        await Promise.all(
          leaderboardArray.map(async (entry) => {
            const userSnap = await getDoc(doc(db, "users", entry.userId));
            entry.userInfo = userSnap.exists()
              ? (userSnap.data() as User)
              : { name: "Anonymous", email: "" };

            await Promise.all(
              entry.donations.map(async (donation) => {
                const ownerSnap = await getDoc(
                  doc(db, "users", donation.fundraiserOwner || "unknown")
                );
                donation.fundraiserOwner = ownerSnap.exists()
                  ? (ownerSnap.data() as User).name
                  : "Unknown";
              })
            );
          })
        );

        setLeaderboard(leaderboardArray);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const toggleExpand = (index: number) => {
    setLeaderboard((prev) =>
      prev.map((entry, i) =>
        i === index ? { ...entry, expanded: !entry.expanded } : entry
      )
    );
  };

  const filteredLeaderboard = leaderboard
    .filter(
      (entry) =>
        (entry.userInfo?.name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (entry.userInfo?.email || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    )
    .filter((entry) => {
      const amount = parseInt(amountFilter);
      return isNaN(amount) ? true : entry.total >= amount;
    })
    .sort((a, b) => {
      if (sortOption === "highest") return b.total - a.total;
      if (sortOption === "lowest") return a.total - b.total;
      if (sortOption === "az")
        return (a.userInfo?.name || "").localeCompare(b.userInfo?.name || "");
      if (sortOption === "za")
        return (b.userInfo?.name || "").localeCompare(a.userInfo?.name || "");
      return 0;
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <span className="animate-spin text-primary text-xl">⏳</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-muted text-foreground text-sm rounded-md hover:bg-muted/80 transition"
      >
        <FaArrowLeft className="text-muted-foreground" />
        Back to Dashboard
      </button>

      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
          <FaUsers className="w-6 h-6" />
          Top Donors Leaderboard
        </h1>
        <p className="text-muted-foreground text-sm mt-2">
          Tap a donor to view their donation history.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 mb-6">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted text-sm text-foreground placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition"
          />
          <FaSearch className="absolute left-3 top-3 text-muted-foreground" />
        </div>

        {/* Min Amount Filter */}
        <div className="relative w-full sm:w-48">
          <input
            type="number"
            placeholder="Min ₹ amount"
            value={amountFilter}
            onChange={(e) => setAmountFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted text-sm text-foreground placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition"
          />
          <FaFilter className="absolute left-3 top-3 text-muted-foreground" />
        </div>

        {/* Sort Option */}
        <div className="w-full sm:w-48">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="w-full pl-4 pr-2 py-2 rounded-lg bg-muted text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
          >
            <option value="highest">Highest Total</option>
            <option value="lowest">Lowest Total</option>
            <option value="az">Name A-Z</option>
            <option value="za">Name Z-A</option>
          </select>
        </div>
      </div>

      {/* Leaderboard List */}
      {filteredLeaderboard.length === 0 ? (
        <p className="text-center text-muted-foreground">No donors found.</p>
      ) : (
        filteredLeaderboard.map((entry, index) => (
          <motion.div
            key={entry.userId}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="group border border-border rounded-xl px-6 py-4 mb-4 bg-background hover:shadow-md hover:border-primary transition cursor-pointer"
            onClick={() => toggleExpand(index)}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition">
                  {entry.userInfo?.name || "Anonymous"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {entry.userInfo?.email}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-green-600 font-bold text-lg">
                  ₹{entry.total.toLocaleString()}
                </span>
                <div className="bg-muted p-1 rounded-full">
                  {entry.expanded ? (
                    <FaChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <FaChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {entry.expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden mt-4"
                >
                  <div className="space-y-2">
                    {entry.donations.map((donation, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center text-sm px-4 py-2 rounded-md bg-muted hover:bg-muted/80 transition"
                      >
                        <div>
                          Donated ₹{donation.amount.toLocaleString()}{" "}
                          <span className="text-muted-foreground text-xs ml-2">
                            to {donation.fundraiserOwner}
                          </span>
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {new Date(donation.timestamp).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))
      )}
    </div>
  );
}
