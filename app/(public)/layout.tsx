import Navbar from '@/components/Navbar';
import { ReactNode } from 'react';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
