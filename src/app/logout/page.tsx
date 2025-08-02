// src/app/logout/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    signOut(auth)
      .then(() => {
        router.push('/login'); // Redirect to login after logout
      })
      .catch((error) => {
        console.error('Logout error:', error);
      });
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg font-medium">Logging you out...</p>
    </div>
  );
}
