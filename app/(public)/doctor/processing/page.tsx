import { redirect } from 'next/navigation';
import { getDoctorAccessState } from '@/lib/server/doctor-access';
import ProcessingClient from './processing-client';

export default async function DoctorProcessingPage() {
  const state = await getDoctorAccessState();

  if (!state) {
    redirect('/doctor/login');
  }

  if (state.verificationStatus === 'verified' && state.subscriptionStatus === 'active') {
    redirect('/dashboard');
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-2xl rounded-2xl border border-gray-100 p-8 text-center">
        <div className="mx-auto mb-5 h-16 w-16 rounded-full border-4 border-cyan-100 border-t-cyan-600 animate-spin" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">طلبك قيد المراجعة</h1>
        <p className="text-gray-600 leading-8">
          شكرا لتسجيلك. فريق الشركة يقوم حاليا بالتحقق من الهوية الوطنية وشهادة التخرج قبل تفعيل حساب الطبيب.
        </p>
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-3 mt-4">
          الحالة: Processing - pending_verification
        </p>
        <ProcessingClient />
      </div>
    </div>
  );
}


