import Link from 'next/link';
import { ReactNode } from 'react';
import { LayoutDashboard, Calendar, Users, LogOut, ClipboardList } from 'lucide-react';
import { requireDoctorAccessForDashboard } from '@/lib/server/doctor-access';

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
        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/dashboard"
            data-testid="doctor-nav-dashboard"
            className="flex items-center gap-3 px-4 py-3 bg-slate-800 rounded-lg text-cyan-400"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>لوحة التحكم</span>
          </Link>
          <Link
            href="/requests"
            data-testid="doctor-nav-requests"
            className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ClipboardList className="w-5 h-5" />
            <span>الطلبات الجديدة</span>
          </Link>
          <Link
            href="/calendar"
            data-testid="doctor-nav-calendar"
            className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Calendar className="w-5 h-5" />
            <span>جدول المواعيد</span>
          </Link>
          <Link
            href="/bookings"
            data-testid="doctor-nav-bookings"
            className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Users className="w-5 h-5" />
            <span>المرضى</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-slate-800 rounded-lg w-full transition-colors">
            <LogOut className="w-5 h-5" />
            <span>تسجيل الخروج</span>
          </button>
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
