'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Loader2,
  Eye,
  Search,
  Target,
  Banknote,
  User2,
} from 'lucide-react';
import { motion } from 'framer-motion';

// Interfaces
interface Fundraiser {
  id: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  createdBy: string; // now will be name, not uid
}

interface User {
  uid: string;
  name: string;
}

export default function TotalFundraisersPage() {
  const [fundraisers, setFundraisers] = useState<Fundraiser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchFundraisersWithNames = async () => {
      try {
        setLoading(true);

        // Fetch all users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersMap: Record<string, string> = {};
        usersSnapshot.forEach((doc) => {
          const user = doc.data() as User;
          usersMap[doc.id] = user.name || 'Unknown';
        });

        // Fetch all fundraisers
        const fundraiserSnapshot = await getDocs(collection(db, 'fundraisers'));
        const fundraiserData: Fundraiser[] = fundraiserSnapshot.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            title: capitalizeFirst(d.title || 'No Title'),
            description: capitalizeFirst(d.description || 'No Description'),
            goal: typeof d.amount === 'number' ? d.amount : 0,
            raised: typeof d.raised === 'number' ? d.raised : 0,
            createdBy: usersMap[d.userId] || 'Unknown',
          };
        });

        setFundraisers(fundraiserData);
      } catch (error) {
        toast.error('Failed to load fundraisers');
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFundraisersWithNames();
  }, []);

  const capitalizeFirst = (text: string) =>
    text.charAt(0).toUpperCase() + text.slice(1);

  const filteredFundraisers = fundraisers.filter((f) =>
    f.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen p-6 sm:p-10 bg-gradient-to-br from-green-50 to-green-100 dark:from-black dark:to-zinc-900 text-foreground">
      {/* Header Section */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">All Fundraisers</h1>
          <p className="text-muted-foreground text-sm">
            Browse fundraisers created by all users.
          </p>
        </div>
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search fundraisers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-md border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filteredFundraisers.length === 0 ? (
        <div className="text-center text-muted-foreground mt-20 text-lg">
          No fundraisers found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFundraisers.map((f) => (
            <motion.div
              key={f.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push(`/fundraisers/${f.id}`)}
              className="group cursor-pointer bg-card border border-gray-200 dark:border-zinc-800 shadow-sm rounded-xl p-5 transition-all hover:shadow-md"
            >
              <h2 className="text-lg font-semibold mb-2 text-primary group-hover:underline line-clamp-1">
                {f.title}
              </h2>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {f.description}
              </p>

              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-500" />
                  <span>
                    <strong>Goal:</strong> ₹{f.goal.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-blue-500" />
                  <span>
                    <strong>Raised:</strong> ₹{f.raised.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User2 className="w-4 h-4 text-purple-500" />
                  <span>
                    <strong>Created By:</strong> {f.createdBy}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex justify-end items-center text-green-600 dark:text-green-400 hover:text-green-700 transition">
                <Eye className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">View Details</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
}
