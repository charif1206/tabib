'use client';

import { useState } from 'react';

export default function SubscriptionClient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: 'doctor_monthly_20' }),
      });

      const data = await response.json();
      if (!response.ok || !data.url) {
        throw new Error(data.error || 'تعذر بدء عملية الدفع');
      }

      window.location.href = data.url as string;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 mt-5">
      <button
        type="button"
        onClick={handleSubscribe}
        disabled={loading}
        className="w-full px-4 py-3 rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {loading ? 'جاري تحويلك...' : 'الاشتراك الآن - $20 / month'}
      </button>

      {error && <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg p-3">{error}</p>}
    </div>
  );
}

