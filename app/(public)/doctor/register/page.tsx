'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DoctorRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ full_name: '', phone: '', specialty: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.specialty) {
      setError('يرجى اختيار التخصص');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/doctor/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-12">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">تسجيل طبيب جديد</h1>
          <p className="text-gray-500">انضم لمنصتنا وابدأ باستقبال الحجوزات.</p>
        </div>
        
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل (دكتور ...)</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-cyan-500" 
              placeholder="د. أحمد محمد" 
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
            />
          </div>
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
             <label className="block text-sm font-medium text-gray-700 mb-1">التخصص</label>
             <select 
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-cyan-500"
              value={formData.specialty}
              onChange={(e) => setFormData({...formData, specialty: e.target.value})}
             >
               <option value="">اختر التخصص...</option>
               <option value="أمراض القلب">أمراض القلب</option>
               <option value="طب الأطفال">طب الأطفال</option>
               <option value="طب الأسنان">طب الأسنان</option>
               <option value="باطنية">باطنية</option>
             </select>
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
          <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-lg transition-colors mt-6 disabled:opacity-50">
            {loading ? 'جاري التسجيل...' : 'إنشاء حساب طبيب'}
          </button>
        </form>
        
        <p className="mt-6 text-center text-gray-600 text-sm">
          لديك حساب بالفعل؟ <Link href="/doctor/login" className="text-cyan-600 font-medium hover:underline">تسجيل الدخول كطبيب</Link>
        </p>
      </div>
    </div>
  );
}
