"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  updateDoc,
  increment,
  arrayUnion,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import {
  Loader2,
  HeartHandshake,
  Wallet,
  CheckCircle,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

export default function DonatePage() {
  const { id } = useParams();
  const router = useRouter();

  const [fundraiser, setFundraiser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [donateAmount, setDonateAmount] = useState("");
  const [user, setUser] = useState<any>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [donating, setDonating] = useState(false);

  useEffect(() => {
    const fetchFundraiser = async () => {
      try {
        const docRef = doc(db, "fundraisers", id as string);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          toast.error("Fundraiser not found");
          router.push("/");
          return;
        }

        const data = docSnap.data();
        setFundraiser({
          ...data,
          goal: data.amount ?? 0,
          raised: data.raised ?? 0,
          withdrawn: data.withdrawn ?? 0,
          status: data.status ?? "open",
          title: data.title ?? "Untitled Fundraiser",
        });
      } catch (error) {
        console.error("Error fetching fundraiser:", error);
        toast.error("Failed to load fundraiser.");
      } finally {
        setLoading(false);
      }
    };

    fetchFundraiser();
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsubscribe();
  }, [id, router]);

  const handleDonate = async () => {
    setConfirmOpen(false);
    setDonating(true);

    if (!user) {
      toast.error("Please log in to donate.");
      setDonating(false);
      return;
    }

    const amount = parseInt(donateAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid donation amount");
      setDonating(false);
      return;
    }

    const availableToRaise = fundraiser.goal - fundraiser.raised;
    if (amount > availableToRaise) {
      toast.error(
        `Only ₹${availableToRaise.toLocaleString()} left to reach the goal`
      );
      setDonating(false);
      return;
    }

    try {
      const fundraiserRef = doc(db, "fundraisers", id as string);
      const newRaised = fundraiser.raised + amount;
      const isGoalReached = newRaised >= fundraiser.goal;

      await updateDoc(fundraiserRef, {
        raised: increment(amount),
        ...(isGoalReached && { status: "closed" }),
      });

      await updateDoc(fundraiserRef, {
        donors: arrayUnion({
          userId: user.uid,
          amount,
          timestamp: new Date().toISOString(),
        }),
      });

      const donationQuery = query(
        collection(db, "donations"),
        where("fundraiserId", "==", id),
        where("userId", "==", user.uid)
      );
      const donationSnap = await getDocs(donationQuery);

      if (!donationSnap.empty) {
        const donationDoc = donationSnap.docs[0];
        await updateDoc(donationDoc.ref, {
          amount: increment(amount),
          timestamp: serverTimestamp(),
        });
      } else {
        const newDonationRef = doc(collection(db, "donations"));
        await setDoc(newDonationRef, {
          fundraiserId: id,
          userId: user.uid,
          amount,
          timestamp: serverTimestamp(),
          userEmail: user.email ?? "",
        });
      }

      setFundraiser((prev: any) => ({
        ...prev,
        raised: newRaised,
        status: isGoalReached ? "closed" : prev.status,
      }));

      setDonateAmount("");
      toast.success(`🎉 Thank you for donating ₹${amount}`);
    } catch (err) {
      console.error("Donation failed due to Firestore error:", err);
      toast.error("Donation failed. Please try again.");
    } finally {
      setDonating(false);
    }
  };

  const { title, goal, raised, withdrawn, status } = fundraiser || {};
  const percent =
    goal > 0 ? Math.min(100, Math.floor((raised / goal) * 100)) : 0;
  const available = raised - withdrawn;

  return (
    <div className="relative max-w-xl mx-auto px-4 py-10 animate-fade-in">
      {/* Loading overlay */}
      {donating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-xl flex flex-col items-center">
            <Loader2 className="w-6 h-6 animate-spin text-green-600 mb-2" />
            <p className="text-sm text-gray-800 dark:text-gray-200">
              Processing your donation...
            </p>
          </div>
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-1 text-green-600 hover:text-green-700 font-medium transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {loading ? (
        <div className="flex justify-center items-center h-60">
          <Loader2 className="w-6 h-6 animate-spin text-green-600" />
        </div>
      ) : fundraiser ? (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 border border-green-400 hover:shadow-2xl transition-shadow duration-300">
          <h1 className="text-2xl md:text-3xl font-bold text-green-700 dark:text-green-400 flex items-center gap-2 mb-2">
            <HeartHandshake className="w-6 h-6" />
            {title}
          </h1>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Goal: ₹{goal?.toLocaleString?.() ?? 0}
          </p>

          <div className="mb-4">
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-700"
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-sm text-gray-700 dark:text-gray-300">
              <span>
                ₹{raised?.toLocaleString?.() ?? 0} raised ({percent}%)
              </span>
              <span>Available: ₹{available?.toLocaleString?.() ?? 0}</span>
            </div>
          </div>

          {status === "closed" ? (
            <div className="mt-4 flex items-center text-green-700 font-semibold animate-pulse">
              <CheckCircle className="h-5 w-5 mr-2" />
              🎉 Goal Reached! Donations closed.
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <input
                type="number"
                value={donateAmount}
                onChange={(e) => setDonateAmount(e.target.value)}
                placeholder="Enter amount (₹)"
                className="w-full border border-green-400 dark:border-green-600 px-4 py-2 rounded-md bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              />
              <button
                onClick={() => setConfirmOpen(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded flex items-center justify-center gap-2 transition"
                disabled={donating}
              >
                {donating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4" />
                    Donate Now
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      ) : null}

      {/* Confirmation Modal with animation */}
      <Transition show={confirmOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setConfirmOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="transition-all ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="transition-all ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="bg-white dark:bg-zinc-900 rounded-xl p-6 max-w-md w-full border border-green-500 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="text-yellow-500" />
                  <Dialog.Title className="text-lg font-semibold">
                    Confirm Donation
                  </Dialog.Title>
                </div>
                <p className="text-sm mb-4">
                  Are you sure you want to donate ₹{donateAmount} to{" "}
                  <span className="font-semibold">{title}</span>?
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setConfirmOpen(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDonate}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition"
                  >
                    Confirm
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
