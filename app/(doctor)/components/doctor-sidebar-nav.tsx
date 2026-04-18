'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, ClipboardList, LayoutDashboard, type LucideIcon, Users } from 'lucide-react';

type NavItem = {
  href: string;
  label: string;
  testId: string;
  Icon: LucideIcon;
};

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'لوحة التحكم', testId: 'doctor-nav-dashboard', Icon: LayoutDashboard },
  { href: '/requests', label: 'الطلبات الجديدة', testId: 'doctor-nav-requests', Icon: ClipboardList },
  { href: '/calendar', label: 'جدول المواعيد', testId: 'doctor-nav-calendar', Icon: Calendar },
  { href: '/bookings', label: 'المرضى', testId: 'doctor-nav-bookings', Icon: Users },
];

export default function DoctorSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 p-4 space-y-1">
      {navItems.map(({ href, label, testId, Icon }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            data-testid={testId}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-slate-800 text-cyan-400 translate-x-[-2px]'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

