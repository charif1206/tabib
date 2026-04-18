'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProcessingClient() {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(5);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    const timer = window.setTimeout(() => {
      router.replace('/doctor/subscription');
    }, 5000);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timer);
    };
  }, [router]);

  return (
    <div className="mt-6 text-sm text-gray-600">
      سيتم تحويلك إلى صفحة الدفع خلال {secondsLeft} ثوان...
    </div>
  );
}


