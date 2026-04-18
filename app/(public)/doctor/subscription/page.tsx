import { redirect } from 'next/navigation';
import { getDoctorAccessState } from '@/lib/server/doctor-access';
import SubscriptionClient from './subscription-client';

export default async function DoctorSubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string }>;
}) {
  const state = await getDoctorAccessState();

  if (!state) {
    redirect('/doctor/login');
  }

  if (state.verificationStatus === 'pending_verification') {
    redirect('/doctor/processing');
  }

  if (state.subscriptionStatus === 'active') {
    redirect('/dashboard');
  }

  const params = await searchParams;

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-xl rounded-2xl border border-gray-100 p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">تفعيل اشتراك الطبيب</h1>
        <p className="text-gray-600">حسابك تم التحقق منه. لإدارة المواعيد والوصول للوحة التحكم، فعّل اشتراكك الشهري.</p>

        <div className="mt-5 rounded-xl border border-cyan-100 bg-cyan-50 p-5">
          <p className="text-sm text-gray-600">الخطة الحالية</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">$20<span className="text-base font-medium text-gray-600"> / month</span></p>
        </div>

        {params.canceled === '1' && (
          <p className="mt-4 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-3">
            تم إلغاء عملية الدفع. يمكنك المحاولة مرة أخرى.
          </p>
        )}

        <SubscriptionClient />
      </div>
    </div>
  );
}

