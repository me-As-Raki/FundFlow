// src/app/page.tsx
import { redirect } from 'next/navigation';

export default function Page() {
  console.log('>>> Loading root page (/)...');
  
  redirect('/login'); // ✅ Call redirect *inside* the component

  return null; // optional, redirect happens before this
}
