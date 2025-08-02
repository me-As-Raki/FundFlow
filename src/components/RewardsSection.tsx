'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Loader2,
  Award,
  Medal,
  Star,
  Gem,
  Trophy,
  BadgeCheck,
  BadgeX,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function RewardsSection({ userId }: { userId: string }) {
  const [raisedAmount, setRaisedAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = onSnapshot(
      collection(db, 'fundraisers'),
      (snapshot) => {
        let total = 0;
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.userId === userId) {
            total += data.raised || 0;
          }
        });
        setRaisedAmount(total);
        setLoading(false);
      },
      (error) => {
        console.error('Live update error:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [userId]);

  return (
    <div className="bg-muted px-6 py-6 rounded-xl shadow-lg w-full max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <Trophy className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Your Rewards</h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-6">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm text-muted-foreground">
            Calculating your raised amount...
          </span>
        </div>
      ) : (
        <>
          <p className="text-sm mb-6 text-muted-foreground">
            You've raised:{' '}
            <span className="font-bold text-foreground text-base">
              ₹{raisedAmount.toLocaleString()}
            </span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            <RewardTile
              label="Bronze Supporter"
              amount={5000}
              raised={raisedAmount}
              Icon={Medal}
              color="border-amber-500"
            />
            <RewardTile
              label="Silver Supporter"
              amount={15000}
              raised={raisedAmount}
              Icon={Star}
              color="border-slate-400"
            />
            <RewardTile
              label="Gold Supporter"
              amount={30000}
              raised={raisedAmount}
              Icon={Award}
              color="border-yellow-500"
            />
            <RewardTile
              label="Platinum Supporter"
              amount={50000}
              raised={raisedAmount}
              Icon={Gem}
              color="border-purple-500"
            />
          </div>
        </>
      )}
    </div>
  );
}

type RewardTileProps = {
  label: string;
  amount: number;
  raised: number;
  Icon: React.ElementType;
  color: string;
};

function RewardTile({ label, amount, raised, Icon, color }: RewardTileProps) {
  const unlocked = raised >= amount;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={`rounded-xl border px-5 py-6 text-center bg-background hover:shadow-md transition-all ${
        unlocked ? `${color} border-2` : 'border-muted'
      }`}
    >
      <motion.div
        whileHover={{ scale: 1.08 }}
        transition={{ type: 'spring', stiffness: 250 }}
      >
        <Icon
          className={`w-7 h-7 mx-auto mb-3 ${
            unlocked ? 'text-green-500' : 'text-muted-foreground'
          }`}
        />
      </motion.div>

      <h4 className="text-base font-semibold text-foreground mb-1">{label}</h4>
      <p className="text-sm text-muted-foreground mb-3">
        Raise ₹{amount.toLocaleString()} to unlock
      </p>

      <div className="flex items-center justify-center gap-2 mt-2">
        {unlocked ? (
          <>
            <BadgeCheck className="w-4 h-4 text-green-500" />
            <span className="text-xs font-medium text-green-600">Unlocked</span>
          </>
        ) : (
          <>
            <BadgeX className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Locked</span>
          </>
        )}
      </div>
    </motion.div>
  );
}
