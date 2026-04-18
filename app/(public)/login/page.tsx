'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/patient/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (res.ok) {
        router.push('/profile');
        router.refresh();
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">تسجيل الدخول كـ مريض</h1>
          <p className="text-gray-500">مرحباً بك مجدداً! يرجى إدخال بياناتك.</p>
        </div>
        
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
            <input 
              type="tel" 
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-cyan-500" 
              placeholder="05xxxxxxxxx" 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-cyan-500" 
              placeholder="••••••••" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2.5 rounded-lg transition-colors mt-6 disabled:opacity-50">
            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>
        
        <p className="mt-6 text-center text-gray-600 text-sm">
          ليس لديك حساب؟ <Link href="/register" className="text-cyan-600 font-medium hover:underline">إنشاء حساب جديد</Link>
        </p>
        
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <Link href="/doctor/login" className="text-sm text-gray-500 hover:text-cyan-600">تسجيل الدخول كطبيب</Link>
        </div>
      </div>
    </div>
  );
}
