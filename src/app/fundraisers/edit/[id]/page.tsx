'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { ArrowLeft, Save, Loader2, Pencil, BadgeDollarSign, FileText, Target, FolderOpen, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EditFundraiserPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchFundraiser = async () => {
      try {
        const fundraiserRef = doc(db, 'fundraisers', String(id));
        const docSnap = await getDoc(fundraiserRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setTitle(data.title || '');
          setDescription(data.description || '');
          setGoal(data.amount?.toString() || '');
          setCategory(data.category || '');
          setStatus(data.status || '');
        } else {
          toast.error('Fundraiser not found');
          router.push('/total-fundraisers');
        }
      } catch (error) {
        console.error(error);
        toast.error('Error loading fundraiser');
      } finally {
        setLoading(false);
      }
    };

    fetchFundraiser();
  }, [id, router]);

  const handleSave = async () => {
    if (!title || !description || !goal || !category || !status) {
      toast.warning('Please fill all fields');
      return;
    }

    try {
      setSaving(true);
      const fundraiserRef = doc(db, 'fundraisers', String(id));

      await updateDoc(fundraiserRef, {
        title,
        description,
        amount: parseInt(goal),
        category,
        status,
      });

      toast.success('Fundraiser updated successfully!');
      router.push('/total-fundraisers');
    } catch (error) {
      console.error(error);
      toast.error('Error saving fundraiser');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-green-600 dark:text-green-400" />
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-4 sm:p-6 md:p-8 space-y-6 text-foreground">
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
        <Pencil className="w-6 h-6 text-green-600" />
        Edit Fundraiser
      </h1>

      <div className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1 text-muted-foreground flex items-center gap-1">
            <FileText className="w-4 h-4" />
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 rounded border border-border bg-white dark:bg-zinc-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            placeholder="e.g. Help for Medical Treatment"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1 text-muted-foreground flex items-center gap-1">
            <FileText className="w-4 h-4" />
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 rounded border border-border bg-white dark:bg-zinc-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition resize-none"
            placeholder="Write a short story or details about your fundraiser"
          />
        </div>

        {/* Goal */}
        <div>
          <label className="block text-sm font-medium mb-1 text-muted-foreground flex items-center gap-1">
            <Target className="w-4 h-4" />
            Goal Amount (₹)
          </label>
          <input
            type="number"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full px-4 py-2 rounded border border-border bg-white dark:bg-zinc-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            placeholder="e.g. 50000"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-1 text-muted-foreground flex items-center gap-1">
            <FolderOpen className="w-4 h-4" />
            Category
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 rounded border border-border bg-white dark:bg-zinc-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            placeholder="e.g. Medical, Education"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium mb-1 text-muted-foreground flex items-center gap-1">
            <Tag className="w-4 h-4" />
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-2 rounded border border-border bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          >
            <option value="">Select status</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        disabled={saving}
        onClick={handleSave}
        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded shadow-sm flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            Save Changes
          </>
        )}
      </motion.button>
    </main>
  );
}
