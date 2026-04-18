"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, LogIn, User } from 'lucide-react';

type AuthUser = {
  role?: 'doctor' | 'patient';
};

export default function Navbar() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const isDoctorsActive = pathname === '/doctors' || pathname.startsWith('/doctor/');
  const isAppointmentsActive =
    isAuthenticated && (pathname === '/profile' || pathname.startsWith('/profile/'));
  const appointmentsHref = isAuthenticated ? '/profile' : '/login';
  const profileHref = user?.role === 'doctor' ? '/dashboard' : '/profile';

  useEffect(() => {
    let isCancelled = false;

    async function loadSession() {
      try {
        const response = await fetch('/api/auth/me', { cache: 'no-store' });
        if (!response.ok) {
          if (!isCancelled) {
            setIsAuthenticated(false);
            setUser(null);
          }
          return;
        }

        const data = (await response.json()) as {
          authenticated?: boolean;
          user?: AuthUser;
        };

        if (!isCancelled) {
          setIsAuthenticated(Boolean(data.authenticated));
          setUser(data.user ?? null);
        }
      } catch {
        if (!isCancelled) {
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    }

    loadSession();
    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <nav className="bg-white border-b border-gray-100 flex items-center justify-between px-6 py-4 sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-cyan-600 rounded-md flex items-center justify-center text-white font-bold text-xl">
            د
          </div>
          <span className="text-xl font-bold text-gray-800">Doc</span>
        </Link>
        <div className="hidden md:flex items-center gap-2 text-sm font-medium">
          <Link
            href="/doctors"
            className={`px-4 py-2 rounded-full transition-all duration-200 ${
              isDoctorsActive ? 'bg-gray-100 text-gray-800' : 'text-gray-600 hover:text-cyan-600'
            }`}
          >
            البحث عن أطباء
          </Link>
          <Link
            href={appointmentsHref}
            className={`px-4 py-2 rounded-full transition-all duration-200 ${
              isAppointmentsActive ? 'bg-gray-100 text-gray-800' : 'text-gray-600 hover:text-cyan-600'
            }`}
          >
            مواعيدي
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <button className="relative text-gray-500 hover:text-gray-700" type="button" aria-label="الإشعارات">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                1
              </span>
            </button>
            <Link
              href={profileHref}
              className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden"
              aria-label="الحساب الشخصي"
            >
              <User className="w-5 h-5 text-gray-400" />
            </Link>
          </>
        ) : (
          <Link
            href="/login"
            data-testid="navbar-login-button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            <span>تسجيل الدخول</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
