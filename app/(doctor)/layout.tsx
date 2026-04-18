import { ReactNode } from 'react';
import { requireDoctorAccessForDashboard } from '@/lib/server/doctor-access';
import DoctorSidebarNav from './components/doctor-sidebar-nav';
import DoctorLogoutButton from './components/doctor-logout-button';

export default async function DoctorLayout({ children }: { children: ReactNode }) {
  await requireDoctorAccessForDashboard();

  return (
    <div className="min-h-screen flex bg-gray-50 text-right" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800">
           <div className="w-10 h-10 bg-cyan-600 rounded-md flex items-center justify-center text-white font-bold text-2xl mb-2">
            د
          </div>
          <h2 className="text-xl font-bold">لوحة الطبيب</h2>
          <p className="text-slate-400 text-sm mt-1">د. محمد صالح</p>
        </div>
        <DoctorSidebarNav />
        <div className="p-4 border-t border-slate-800">
          <DoctorLogoutButton />
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-gray-100 p-4 flex justify-between items-center sticky top-0 px-8">
          <h1 className="font-bold text-gray-800 text-xl">مرحباً دكتور 👋</h1>
          <div className="flex items-center gap-4">
             <button className="relative text-gray-500 hover:text-gray-700">
                <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
             </button>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
