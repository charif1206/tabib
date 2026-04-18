'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export default function DoctorLogoutButton() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogout() {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      queryClient.clear();
    } finally {
      router.replace('/doctor/login');
      router.refresh();
      setIsSubmitting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isSubmitting}
      data-testid="doctor-logout-button"
      className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-slate-800 rounded-lg w-full transition-colors disabled:opacity-60"
    >
      <LogOut className="w-5 h-5" />
      <span>{isSubmitting ? 'جاري تسجيل الخروج...' : 'تسجيل الخروج'}</span>
    </button>
  );
}
