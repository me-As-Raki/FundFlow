'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { toast } from 'sonner';
import {
  Loader2,
  ArrowLeft,
  Wallet,
  Banknote,
  BadgeCheck,
  IndianRupee,
  QrCode,
  Landmark,
  Smartphone,
  CreditCard,
} from 'lucide-react';

export default function WithdrawPage() {
  const { id } = useParams();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [fundraiser, setFundraiser] = useState<any>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [details, setDetails] = useState('');

  const withdrawalMethods = [
    { label: 'GPay', value: 'GPay', icon: <Smartphone className="w-4 h-4" /> },
    { label: 'PhonePe', value: 'PhonePe', icon: <Smartphone className="w-4 h-4" /> },
    { label: 'Paytm', value: 'Paytm', icon: <Smartphone className="w-4 h-4" /> },
    { label: 'UPI', value: 'UPI', icon: <QrCode className="w-4 h-4" /> },
    { label: 'Bank Transfer', value: 'Bank', icon: <Landmark className="w-4 h-4" /> },
  ];

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (usr) => {
      if (!usr) {
        toast.error('Please log in to request a withdrawal.');
        router.push('/login');
      } else {
        setUser(usr);
      }
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ref = doc(db, 'fundraisers', String(id));
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setFundraiser({ id: snap.id, ...snap.data() });
        } else {
          toast.error('Fundraiser not found.');
          router.push('/');
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load fundraiser details.');
      } finally {
        setInitialLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, router]);

  const handleWithdraw = async () => {
    const withdrawAmount = parseInt(amount);
    const raised = fundraiser?.raised ?? 0;
    const withdrawn = fundraiser?.withdrawn ?? 0;
    const available = raised - withdrawn;

    if (!withdrawAmount || withdrawAmount <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }

    if (withdrawAmount > available) {
      toast.error(`Only ₹${available} is available for withdrawal.`);
      return;
    }

    if (!method) {
      toast.error('Please select a withdrawal method.');
      return;
    }

    try {
      setProcessing(true);
      const withdrawalRef = doc(db, 'withdrawals', `${id}_${Date.now()}`);
      await setDoc(withdrawalRef, {
        fundraiserId: id,
        userId: user.uid,
        amount: withdrawAmount,
        method,
        account: `${method} - auto generated`,
        timestamp: serverTimestamp(),
      });

      const fundraiserRef = doc(db, 'fundraisers', String(id));
      await updateDoc(fundraiserRef, {
        withdrawn: withdrawn + withdrawAmount,
      });

      toast.success('Your withdrawal request has been submitted.');
      setFundraiser((prev: any) => ({
        ...prev,
        withdrawn: withdrawn + withdrawAmount,
      }));

      setAmount('');
      setMethod('');
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong. Please try again later.');
    } finally {
      setProcessing(false);
    }
  };

  if (initialLoading || !fundraiser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin w-10 h-10 text-yellow-600" />
      </div>
    );
  }

  const available = (fundraiser.raised ?? 0) - (fundraiser.withdrawn ?? 0);

  return (
    <div className="relative max-w-xl mx-auto p-6">
      {processing && (
        <div className="absolute inset-0 z-10 bg-white/60 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-2xl">
          <Loader2 className="animate-spin w-8 h-8 text-yellow-600" />
        </div>
      )}

      <button
        onClick={() => router.back()}
        className="flex items-center text-sm text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </button>

      <h1 className="text-3xl font-bold mb-6 dark:text-white flex items-center gap-2">
        <Wallet className="text-yellow-600 w-7 h-7" /> Withdraw Funds
      </h1>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border dark:border-zinc-700 space-y-6">
        <div className="space-y-1">
          <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">
            {fundraiser.title}
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
            <p>Total Raised: ₹{(fundraiser.raised ?? 0).toLocaleString()}</p>
            <p>Total Withdrawn: ₹{(fundraiser.withdrawn ?? 0).toLocaleString()}</p>
            <p>Available: ₹{available.toLocaleString()}</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
            <IndianRupee className="w-4 h-4" /> Withdrawal Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={processing}
            className="w-full px-4 py-2 rounded-xl border dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Withdrawal Method
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {withdrawalMethods.map(({ label, value, icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setMethod(value)}
                className={`flex items-center gap-2 border px-4 py-2 rounded-xl text-sm font-medium transition ${
                  method === value
                    ? 'bg-yellow-100 border-yellow-500 dark:bg-yellow-600/20 dark:border-yellow-400'
                    : 'border-zinc-300 dark:border-zinc-700 hover:border-yellow-500'
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleWithdraw}
          disabled={processing}
          className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:opacity-60 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition shadow hover:shadow-md"
        >
          {processing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <BadgeCheck className="w-5 h-5" />
          )}
          {processing ? 'Submitting...' : 'Submit Withdrawal Request'}
        </button>
      </div>
    </div>
  );
}
