"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, Save, User, Mail, Phone, ArrowLeft } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        toast.error("You must be logged in.");
        return;
      }

      try {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
          });
        } else {
          toast.info("Profile not found. Please complete your profile.");
        }
      } catch (error) {
        toast.error("Failed to fetch user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated.");

      await setDoc(doc(db, "users", user.uid), formData, { merge: true });
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Error saving settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen p-6 bg-white dark:bg-zinc-950 text-black dark:text-white transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-2xl mx-auto shadow-xl rounded-xl bg-white dark:bg-zinc-900 p-6 sm:p-8 border-l-4 border-green-500"
      >
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-sm text-green-600 hover:underline transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-semibold flex items-center gap-2">
            <User className="w-6 h-6 text-green-500" />
            Settings
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Update your profile details below.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="animate-spin w-6 h-6 text-green-500" />
          </div>
        ) : (
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            {/* Name */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <User className="w-4 h-4 text-green-500" />
                Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                className="px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <Mail className="w-4 h-4 text-green-500" />
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className="px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              />
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <Phone className="w-4 h-4 text-green-500" />
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="1234567890"
                value={formData.phone}
                onChange={handleChange}
                className="px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              />
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={handleUpdate}
                disabled={saving}
                className="flex gap-2 items-center justify-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md w-full sm:w-auto disabled:opacity-70 transition"
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
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </main>
  );
}
