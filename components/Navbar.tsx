import Link from 'next/link';
import { Search, MapPin, Bell, User } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-100 flex items-center justify-between px-6 py-4 sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-cyan-600 rounded-md flex items-center justify-center text-white font-bold text-xl">
            د
          </div>
          <span className="text-xl font-bold text-gray-800">Doc</span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-gray-600 text-sm font-medium">
          <Link href="/doctors" className="bg-gray-100 px-4 py-2 rounded-full text-gray-800">البحث عن أطباء</Link>
          <Link href="/profile" className="hover:text-cyan-600">مواعيدي</Link>
          <button className="hover:text-cyan-600">المفضلة</button>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative text-gray-500 hover:text-gray-700">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
            1
          </span>
        </button>
        <Link href="/login" className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
          <User className="w-5 h-5 text-gray-400" />
        </Link>
      </div>
    </nav>
  );
}
