'use client';

import { Search, Clock } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { getDoctors } from '@/services/doctorService';
import { useBookingStore } from '@/lib/stores/bookingStore';

type SearchForm = {
  q: string;
};

export default function DoctorsPage() {
  const doctorSearch = useBookingStore((state) => state.doctorSearch);
  const setDoctorSearch = useBookingStore((state) => state.setDoctorSearch);

  const { register, handleSubmit } = useForm<SearchForm>({
    defaultValues: {
      q: doctorSearch,
    },
  });

  const { data: doctors = [], isLoading, isError } = useQuery({
    queryKey: ['doctors', doctorSearch],
    queryFn: () => getDoctors(doctorSearch),
  });

  const onSubmit = (values: SearchForm) => {
    setDoctorSearch(values.q);
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto p-4 flex flex-col h-[calc(100vh-73px)] overflow-hidden">
      <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-2 mb-6">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="ابحث عن طبيب أو تخصص"
            className="w-full pl-4 pr-10 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-cyan-500 text-sm"
            {...register('q')}
          />
        </div>
        <button type="submit" className="px-4 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 text-sm">
          بحث
        </button>
      </form>

      <div className="flex-1 overflow-y-auto space-y-4 pb-16">
        <p className="text-gray-500 text-sm">{doctors.length} طبيب</p>

        {isLoading && <div className="bg-white border border-gray-100 rounded-xl p-4 text-sm text-gray-500">جاري التحميل...</div>}
        {isError && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">فشل تحميل قائمة الأطباء.</div>}

        {!isLoading && !isError && doctors.length === 0 && (
          <div className="bg-white border border-gray-100 rounded-xl p-4 text-sm text-gray-500">لا يوجد نتائج مطابقة.</div>
        )}

        {doctors.map((doc) => (
          <div key={doc.id} className="bg-white border border-gray-100 rounded-xl p-4 text-right">
            <h3 className="font-bold text-gray-900">{doc.full_name}</h3>
            <p className="text-gray-600 text-sm mb-3">{doc.specialty}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-3">
              <Clock className="w-4 h-4" />
              {doc.todayAvailableSlots.length ? (
                doc.todayAvailableSlots.slice(0, 4).map((slot) => (
                  <span key={slot} className="bg-gray-100 px-2 py-1 rounded-md">
                    {slot}
                  </span>
                ))
              ) : (
                <span>لا توجد مواعيد متاحة اليوم</span>
              )}
            </div>
            <Link href={`/doctor/${doc.id}`} className="inline-block bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-cyan-700">
              عرض الملف والحجز
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
