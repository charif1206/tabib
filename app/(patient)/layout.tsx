import Navbar from '@/components/Navbar';
import { ReactNode } from 'react';
import { getSession } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';

export default async function PatientLayout({ children }: { children: ReactNode }) {
  let patientName = 'مريض';

  try {
    const session = await getSession();
    if (session?.role === 'patient') {
      const userDoc = await adminDb.collection('users').doc(session.id).get();
      if (userDoc.exists) {
        const userData = userDoc.data() as { full_name?: string };
        patientName = userData.full_name || patientName;
      }
    }
  } catch {
    // Keep fallback label when session/profile data is unavailable.
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 flex gap-6 mt-6">
        {/* Patient Sidebar */}
        <div className="w-64 bg-white rounded-xl border border-gray-100 p-4 h-fit hidden md:block">
          <div className="text-center pb-6 border-b border-gray-100 mb-4">
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3"></div>
            <h3 className="font-bold text-gray-900">{patientName}</h3>
            <p className="text-sm text-gray-500">مريض</p>
          </div>
          <nav className="space-y-1">
            <a href="/profile" className="flex items-center gap-3 px-4 py-2.5 bg-cyan-50 text-cyan-700 rounded-lg font-medium">
              حسابي
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg">
              مواعيدي
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg">
              المفضلة
            </a>
          </nav>
        </div>
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
