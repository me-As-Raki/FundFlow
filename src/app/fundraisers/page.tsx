'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft } from 'lucide-react';

interface Fundraiser {
  id: string;
  title: string;
  category: string;
  amount: number;
  [key: string]: any;
}

export default function FundraisersPage() {
  const [user, setUser] = useState<User | null>(null);
  const [fundraisers, setFundraisers] = useState<Fundraiser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        toast.warning('Please login first');
        router.push('/login');
        return;
      }

      setUser(currentUser);

      try {
        const q = query(
          collection(db, 'fundraisers'),
          where('userId', '==', currentUser.uid)
        );
        const snap = await getDocs(q);
        const result = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Fundraiser[];
        setFundraisers(result);
      } catch (error) {
        toast.error('Failed to load fundraisers');
        console.error(error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [router]);

  const openFundraiser = (id: string) => {
    router.push(`/fundraisers/${id}`);
  };

  const goBack = () => {
    router.back();
  };

  return (
    <main className="min-h-screen p-6 bg-gradient-to-br from-[#d4f5e6] to-[#edf4f8] dark:from-[#10002B] dark:to-[#1a0a2d] transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        {/* Back Button */}
        <button
          onClick={goBack}
          className="flex items-center gap-2 mb-6 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Page Title */}
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
          My Fundraisers
        </h1>

        {/* Loader */}
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-300" />
          </div>
        ) : fundraisers.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No fundraisers found.</p>
        ) : (
          <motion.div
            layout
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {fundraisers.map((f) => (
              <motion.div
                key={f.id}
                layout
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
                onClick={() => openFundraiser(f.id)}
                className="bg-white dark:bg-[#1a0a2d]/90 border border-gray-200 dark:border-white/10 p-5 rounded-xl cursor-pointer hover:shadow-lg transition-all"
              >
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">{f.title}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">{f.category}</p>
                <p className="mt-3 text-green-700 dark:text-green-300 font-bold text-lg">₹{f.amount}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}
