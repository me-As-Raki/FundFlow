"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  User,
  Pencil,
  Trash2,
  Download,
  Loader2,
  X,
  ArrowLeft,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/useAuth";

type Fundraiser = {
  id: string;
  title: string;
  description: string;
  amount: number;
  raised?: number;
  createdAt: Timestamp;
  userId: string;
  status: string;
  category: string;
};

type UserData = {
  name: string;
  email: string;
};

export default function FundraiserDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [fundraiser, setFundraiser] = useState<Fundraiser | null>(null);
  const [creator, setCreator] = useState<UserData | null>(null);
  const [relatedFundraisers, setRelatedFundraisers] = useState<Fundraiser[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchFundraiserAndCreator = async () => {
      try {
        const docRef = doc(db, "fundraisers", id as string);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          toast.error("Fundraiser not found");
          setLoading(false);
          return;
        }

        const data = docSnap.data();
        const fundraiserData = {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt as Timestamp,
        } as Fundraiser;

        setFundraiser(fundraiserData);

        const userRef = doc(db, "users", data.userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data() as Partial<UserData>;
          setCreator({
            name: userData.name ?? "Anonymous",
            email: userData.email ?? "Not provided",
          });
        } else {
          setCreator({
            name: "Unknown User",
            email: "Unavailable",
          });
        }

        await fetchRelated(data.category, docSnap.id);
      } catch (err) {
        console.error("Error loading fundraiser:", err);
        toast.error("Failed to load fundraiser");
      } finally {
        setLoading(false);
      }
    };

    const fetchRelated = async (category: string, currentId: string) => {
      try {
        const q = query(
          collection(db, "fundraisers"),
          where("category", "==", category)
        );
        const snapshot = await getDocs(q);
        const results = snapshot.docs
          .filter((doc) => doc.id !== currentId)
          .map((doc) => ({ id: doc.id, ...doc.data() } as Fundraiser));
        setRelatedFundraisers(results.slice(0, 3));
      } catch (err) {
        console.error("Error loading related fundraisers:", err);
      }
    };

    fetchFundraiserAndCreator();
  }, [id]);

  const handleDelete = async () => {
    if (!fundraiser) return;
    try {
      setDeleting(true);
      await deleteDoc(doc(db, "fundraisers", fundraiser.id));
      toast.success("Fundraiser deleted");
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete fundraiser");
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200 dark:from-[#0f0c29] dark:to-[#302b63]">
        <Loader2 className="animate-spin h-6 w-6 text-green-600" />
      </div>
    );
  }

  if (!fundraiser) {
    return (
      <div className="text-center mt-20 text-gray-500 dark:text-gray-300 text-lg">
        Fundraiser not found.
      </div>
    );
  }

  const {
    title,
    description,
    amount,
    raised = 0,
    createdAt,
    userId,
    status,
    category,
  } = fundraiser;

  const capitalizedTitle = title.charAt(0).toUpperCase() + title.slice(1);
  const percentageRaised = Math.min((raised / amount) * 100, 100).toFixed(0);
  const isCreator = user?.uid === userId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-green-50 dark:from-[#0f0c29] dark:to-[#302b63] py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white dark:bg-[#1c1c2b] rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold text-green-700 dark:text-green-400 mb-4">
          {capitalizedTitle}
        </h1>

        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
          {description}
        </p>

        <div className="bg-gray-100 dark:bg-zinc-800 p-4 rounded-lg mb-4">
          <p className="font-medium text-sm text-gray-600 dark:text-gray-400">
            ₹{raised.toLocaleString("en-IN")} raised of ₹
            {amount.toLocaleString("en-IN")} ({percentageRaised}%)
          </p>
          <div className="h-2 bg-gray-300 dark:bg-zinc-700 rounded overflow-hidden mt-1">
            <div
              className="h-full bg-green-600 transition-all duration-500"
              style={{ width: `${percentageRaised}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mt-4 text-gray-600 dark:text-gray-400">
            <p>
              <strong>Category:</strong> {category}
            </p>
            <p>
              <strong>Status:</strong> {status}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {createdAt.toDate().toLocaleDateString("en-IN")}
            </p>
          </div>
        </div>

        {creator && (
          <div className="mt-8 border-t pt-6 bg-gray-50 dark:bg-zinc-800 rounded-md p-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Fundraiser Creator
            </h3>
            <p className="text-gray-800 dark:text-gray-300">
              <span className="font-medium">Name:</span> {creator.name}
            </p>
            <p className="text-gray-800 dark:text-gray-300">
              <span className="font-medium">Email:</span> {creator.email}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-3 mb-6 mt-6">
          <Link
            href={`/donate/${fundraiser.id}`}
            className="bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2 rounded shadow-sm transition"
          >
            Donate Now
          </Link>

          {isCreator && (
            <>
              <Link
                href={`/fundraisers/edit/${fundraiser.id}`}
                className="flex items-center gap-1 border border-gray-300 dark:border-gray-600 px-4 py-2 rounded text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 transition"
              >
                <Pencil size={16} /> Edit
              </Link>
              <button
                onClick={() => setShowConfirm(true)}
                className="flex items-center gap-1 text-red-600 border border-red-300 px-4 py-2 rounded text-sm hover:bg-red-50 dark:hover:bg-red-900/30 transition"
              >
                <Trash2 size={16} /> Delete
              </button>
              <button
                onClick={() => router.push(`/withdraw/${fundraiser.id}`)}
                className="flex items-center gap-1 text-yellow-700 border border-yellow-400 px-4 py-2 rounded text-sm hover:bg-yellow-100 dark:hover:bg-yellow-900/20 transition"
              >
                <Download size={16} /> Withdraw
              </button>
            </>
          )}
        </div>

        {relatedFundraisers.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-3 text-gray-800 dark:text-white">
              Related Fundraisers
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {relatedFundraisers.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/fundraisers/${rel.id}`}
                  className="block border border-gray-200 dark:border-zinc-700 rounded-lg p-4 bg-white dark:bg-zinc-800 hover:shadow-lg transition"
                >
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {rel.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {rel.description}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                    ₹{(rel.raised ?? 0).toLocaleString("en-IN")} raised
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-zinc-900 rounded-lg p-6 max-w-sm w-full shadow-lg relative"
            >
              <button
                className="absolute top-2 right-2 text-gray-500 dark:text-gray-400 hover:text-red-500"
                onClick={() => setShowConfirm(false)}
              >
                <X size={18} />
              </button>
              <h3 className="text-lg font-semibold mb-2">Are you sure?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                This will permanently delete this fundraiser.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 text-sm rounded border border-gray-300 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700 transition"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
