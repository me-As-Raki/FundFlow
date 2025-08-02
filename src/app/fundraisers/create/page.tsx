"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  PlusCircle,
  ArrowLeft,
  FileText,
  Wallet,
  Layers,
  StickyNote,
  Loader2,
} from "lucide-react";
import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

export default function CreateFundraiserPage() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const user = auth.currentUser;
    if (!user) {
      toast.error("Please log in to create a fundraiser.");
      return;
    }

    setLoading(true);

    try {
      const q = query(
        collection(db, "fundraisers"),
        where("userId", "==", user.uid),
        where("title", "==", title.trim())
      );
      const querySnapshot = await getDocs(q);

      if (!title || !amount || !category || !description) {
        toast.error("Please fill in all fields.");
        setLoading(false);
        return;
      }

      if (!isNaN(Number(amount)) && Number(amount) < 100) {
        toast.error("Amount must be at least ₹100.");
        setLoading(false);
        return;
      }

      if (!querySnapshot.empty) {
        toast.warning("You’ve already created a fundraiser with this title.");
        setLoading(false);
        return;
      }

      // 🔥 Get user name from users collection
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      const userName = userDocSnap.exists()
        ? userDocSnap.data().name || "Anonymous"
        : "Anonymous";

      // ✅ Add fundraiser with userName included
      await addDoc(collection(db, "fundraisers"), {
        title: title.trim(),
        amount: Number(amount),
        category: category.trim(),
        description: description.trim(),
        userId: user.uid,
        userName,
        createdAt: serverTimestamp(),
        status: "open",
      });

      toast.success("🎉 Fundraiser created successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 sm:px-8 bg-gradient-to-br from-green-50 via-green-100 to-green-200 dark:from-[#10002B] dark:to-[#1b1033] transition-all duration-300">
      <div className="max-w-2xl mx-auto bg-white dark:bg-[#1d1b2c] rounded-2xl p-6 sm:p-8 shadow-xl border dark:border-zinc-800">
        {/* Go Back */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>

        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
          Launch a Fundraiser
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
              <FileText className="w-4 h-4" />
              Fundraiser Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Medical Help for My Mother"
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
              <Wallet className="w-4 h-4" />
              Target Amount (₹)
            </label>
            <input
              type="number"
              required
              min="100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g., 50000"
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
              <Layers className="w-4 h-4" />
              Fundraiser Category
            </label>
            <input
              type="text"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Medical, Education, Emergency"
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
              <StickyNote className="w-4 h-4" />
              Fundraiser Description
            </label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the situation, why you need support, and how it will help."
              disabled={loading}
              className="w-full h-28 px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-xl shadow-md transition 
              ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <PlusCircle className="w-5 h-5" />
                Submit Fundraiser
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
