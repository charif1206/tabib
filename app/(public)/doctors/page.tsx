'use client';

import { Search, Clock } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { getDoctors } from '@/services/doctorService';
import { useBookingStore } from '@/lib/stores/bookingStore';
import { distanceKm, FIXED_USER_LOCATION, isValidLocation } from '@/lib/location';
import type { DoctorListItem } from '@/lib/types/booking';

type DoctorsLeafletMapProps = {
  doctors: DoctorListItem[];
  selectedLocation?: { lat: number; lng: number } | null;
  userLocation?: { lat: number; lng: number };
};

const DoctorsLeafletMap = dynamic<DoctorsLeafletMapProps>(() => import('./doctors-leaflet-map'), { ssr: false });

type SearchForm = {
  q: string;
};

type SortMode = 'default' | 'nearest' | 'most-available-today';

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

  const [sortMode, setSortMode] = useState<SortMode>('default');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);

  const sortedDoctors = useMemo(() => {
    const list = [...doctors];

    if (sortMode === 'nearest') {
      list.sort((a, b) => {
        const aDistance = isValidLocation(a.location) ? distanceKm(FIXED_USER_LOCATION, a.location) : Number.POSITIVE_INFINITY;
        const bDistance = isValidLocation(b.location) ? distanceKm(FIXED_USER_LOCATION, b.location) : Number.POSITIVE_INFINITY;
        return aDistance - bDistance;
      });
      return list;
    }

    if (sortMode === 'most-available-today') {
      list.sort((a, b) => {
        const byAvailability = b.todayAvailableSlots.length - a.todayAvailableSlots.length;
        if (byAvailability !== 0) {
          return byAvailability;
        }

        const aDistance = isValidLocation(a.location) ? distanceKm(FIXED_USER_LOCATION, a.location) : Number.POSITIVE_INFINITY;
        const bDistance = isValidLocation(b.location) ? distanceKm(FIXED_USER_LOCATION, b.location) : Number.POSITIVE_INFINITY;
        return aDistance - bDistance;
      });
    }

    return list;
  }, [doctors, sortMode]);

  const selectedDoctor = useMemo(() => {
    const fromState = sortedDoctors.find((doctor) => doctor.id === selectedDoctorId);
    if (fromState) return fromState;
    return sortedDoctors.find((doctor) => isValidLocation(doctor.location)) ?? sortedDoctors[0] ?? null;
  }, [sortedDoctors, selectedDoctorId]);

  const selectedLocation = isValidLocation(selectedDoctor?.location) ? selectedDoctor.location : null;

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
        <select
          value={sortMode}
          onChange={(event) => setSortMode(event.target.value as SortMode)}
          className="px-3 py-3 rounded-lg border border-gray-200 text-sm bg-white text-gray-700"
          data-testid="doctors-sort"
        >
          <option value="default">ترتيب افتراضي</option>
          <option value="nearest">الطبيب الاقرب</option>
          <option value="most-available-today">المواعيد الاكثر اليوم</option>
        </select>
      </form>

      <p className="text-xs text-gray-500 mb-3 text-right">
        الموقع الحالي (تجريبي): {FIXED_USER_LOCATION.lat}, {FIXED_USER_LOCATION.lng}
      </p>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4 pb-4">
        <div className="overflow-y-auto space-y-4 pb-16">
          <p className="text-gray-500 text-sm">{sortedDoctors.length} طبيب</p>

          {isLoading && <div className="bg-white border border-gray-100 rounded-xl p-4 text-sm text-gray-500">جاري التحميل...</div>}
          {isError && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">فشل تحميل قائمة الأطباء.</div>}

          {!isLoading && !isError && doctors.length === 0 && (
            <div className="bg-white border border-gray-100 rounded-xl p-4 text-sm text-gray-500">لا يوجد نتائج مطابقة.</div>
          )}

          {sortedDoctors.map((doc) => {
            const isSelected = selectedDoctor?.id === doc.id;
            const doctorDistance = isValidLocation(doc.location) ? distanceKm(FIXED_USER_LOCATION, doc.location) : null;
            return (
              <div
                key={doc.id}
                data-testid={`doctor-card-${doc.id}`}
                onClick={() => setSelectedDoctorId(doc.id)}
                className={`bg-white border rounded-xl p-4 text-right cursor-pointer transition-colors ${
                  isSelected ? 'border-cyan-400 bg-cyan-50/30' : 'border-gray-100'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <button
                    type="button"
                    data-testid={`doctor-focus-${doc.id}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedDoctorId(doc.id);
                    }}
                    className="text-xs text-cyan-700 bg-cyan-50 px-2 py-1 rounded-md"
                  >
                    عرض على الخريطة
                  </button>
                  <div>
                    <h3 className="font-bold text-gray-900">{doc.full_name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{doc.specialty}</p>
                  </div>
                </div>
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
                <div className="text-xs text-gray-500 mb-3">
                  {doctorDistance !== null ? `يبعد عنك حوالي ${doctorDistance.toFixed(1)} كم` : 'المسافة غير متوفرة'}
                </div>
                <Link
                  href={`/doctor/${doc.id}`}
                  data-testid={`doctor-link-${doc.id}`}
                  onClick={(event) => event.stopPropagation()}
                  className="inline-block bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-cyan-700"
                >
                  عرض الملف والحجز
                </Link>
              </div>
            );
          })}
        </div>

        <div className="hidden lg:block">
          <div className="bg-white border border-gray-100 rounded-xl p-3 h-full min-h-[420px] sticky top-4">
            <p data-testid="selected-doctor-name" className="text-sm text-gray-600 mb-2 text-right">
              {selectedDoctor ? `الموقع الحالي: ${selectedDoctor.full_name}` : 'اختر طبيباً لعرض موقعه'}
            </p>
            {selectedLocation ? (
              <>
                <p data-testid="selected-doctor-coords" className="text-xs text-gray-500 mb-2 text-right">
                  {selectedLocation.lat},{selectedLocation.lng}
                </p>
                <DoctorsLeafletMap doctors={sortedDoctors} selectedLocation={selectedLocation} userLocation={FIXED_USER_LOCATION} />
              </>
            ) : (
              <div className="h-[calc(100%-28px)] rounded-lg border border-dashed border-gray-200 flex items-center justify-center text-sm text-gray-500 text-center p-4">
                لا يوجد موقع محفوظ لهذا الطبيب.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
