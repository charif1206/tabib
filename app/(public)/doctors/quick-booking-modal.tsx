'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { createAppointment } from '@/services/appointmentService';
import { SYMPTOMS, type DoctorListItem, type Symptom } from '@/lib/types/booking';
import { distanceKm, FIXED_USER_LOCATION, isValidLocation } from '@/lib/location';

type QuickBookingModalProps = {
  isOpen: boolean;
  onCloseAction?: () => void;
  doctors: DoctorListItem[];
};

type SortOption = 'highest-rating' | 'nearest' | 'most-available-today';

export default function QuickBookingModal({ isOpen, onCloseAction, doctors }: QuickBookingModalProps) {
  const queryClient = useQueryClient();
  const [selectedSymptom, setSelectedSymptom] = useState<Symptom | ''>('');
  const [sortBy, setSortBy] = useState<SortOption>('highest-rating');
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorListItem | null>(null);
  const [step, setStep] = useState<'symptoms' | 'confirmation' | 'booking'>('symptoms');

  const getSortedDoctors = () => {
    const sorted = [...doctors];
    if (sortBy === 'highest-rating') {
      sorted.sort((a, b) => {
        const aRating = typeof a.rating === 'number' ? a.rating : Number.NEGATIVE_INFINITY;
        const bRating = typeof b.rating === 'number' ? b.rating : Number.NEGATIVE_INFINITY;
        return bRating - aRating;
      });
    } else if (sortBy === 'nearest') {
      sorted.sort((a, b) => {
        const aDistance = isValidLocation(a.location) ? distanceKm(FIXED_USER_LOCATION, a.location) : Number.POSITIVE_INFINITY;
        const bDistance = isValidLocation(b.location) ? distanceKm(FIXED_USER_LOCATION, b.location) : Number.POSITIVE_INFINITY;
        return aDistance - bDistance;
      });
    } else if (sortBy === 'most-available-today') {
      sorted.sort((a, b) => b.todayAvailableSlots.length - a.todayAvailableSlots.length);
    }
    return sorted;
  };

  const bookingMutation = useMutation({
    mutationFn: (values: { doctorId: string; slot: string; note: string }) =>
      createAppointment({
        doctorId: values.doctorId,
        appointmentDate: new Date().toISOString().split('T')[0],
        slot: values.slot,
        note: values.note,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
      setStep('booking');
      setTimeout(() => {
        onCloseAction?.();
        setStep('symptoms');
        setSelectedSymptom('');
        setSortBy('highest-rating');
        setSelectedDoctor(null);
      }, 2000);
    },
  });

  const handleConfirm = () => {
    if (!selectedSymptom) {
      return;
    }

    const sorted = getSortedDoctors();
    if (sorted.length === 0) {
      return;
    }

    setSelectedDoctor(sorted[0]);
    setStep('confirmation');
  };

  const handleBook = () => {
    const slot = selectedDoctor?.todayAvailableSlots[0];
    if (!selectedDoctor || !slot) {
      return;
    }

    bookingMutation.mutate({
      doctorId: selectedDoctor.id,
      slot,
      note: `الأعراض: ${selectedSymptom}`,
    });
  };

  const handleClose = () => {
    onCloseAction?.();
    setStep('symptoms');
    setSelectedSymptom('');
    setSortBy('highest-rating');
    setSelectedDoctor(null);
  };

  if (!isOpen) {
    return null;
  }

  if (step === 'booking') {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-6 w-full max-w-sm text-right">
          <h3 className="font-bold text-gray-900 mb-4 text-lg">✓ تم إرسال طلب الحجز بنجاح</h3>
          <p className="text-sm text-gray-600 mb-4">سيتم التواصل معك قريباً لتأكيد الموعد</p>
          <button
            type="button"
            onClick={handleClose}
            className="w-full px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700"
          >
            حسناً
          </button>
        </div>
      </div>
    );
  }

  if (step === 'confirmation') {
    const nextSlot = selectedDoctor?.todayAvailableSlots[0];

    if (!selectedDoctor) {
      return null;
    }

    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-6 w-full max-w-md text-right max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <h3 className="font-bold text-gray-900 text-lg">تأكيد الحجز</h3>
          </div>

          {selectedDoctor && (
            <div className="bg-cyan-50 rounded-lg p-4 mb-4">
              <h4 className="font-bold text-gray-900 mb-1">{selectedDoctor.full_name}</h4>
              <p className="text-sm text-gray-600 mb-2">{selectedDoctor.specialty}</p>
              {typeof selectedDoctor.rating === 'number' && (
                <p className="text-sm text-amber-700">⭐ {selectedDoctor.rating.toFixed(1)} / 5</p>
              )}
              <p className="text-sm text-gray-700 mt-2">
                أقرب موعد متاح اليوم: {nextSlot || 'لا توجد مواعيد متاحة اليوم'}
              </p>
            </div>
          )}

          <div className="flex gap-2 mt-6">
            <button
              type="button"
              onClick={() => {
                setStep('symptoms');
                setSelectedDoctor(null);
              }}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              رجوع
            </button>
            <button
              type="button"
              onClick={handleBook}
              disabled={!nextSlot || bookingMutation.isPending}
              data-testid="quick-book-confirm"
              className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700 disabled:bg-gray-300 transition-colors"
            >
              {bookingMutation.isPending ? 'جاري...' : 'تأكيد الحجز'}
            </button>
          </div>

          {bookingMutation.isError && (
            <p className="text-xs text-red-600 mt-3">
              {(bookingMutation.error as Error).message}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md text-right">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
          <h3 className="font-bold text-gray-900 text-lg">احجز موعدك الآن</h3>
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-600 mb-3 font-medium" htmlFor="quick-book-symptom">
            من ما تعاني؟
          </label>
          <select
            id="quick-book-symptom"
            value={selectedSymptom}
            onChange={(event) => setSelectedSymptom(event.target.value as Symptom | '')}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm text-gray-700 focus:outline-none focus:border-cyan-500"
            data-testid="quick-book-symptom"
          >
            <option value="">اختر العرض</option>
            {SYMPTOMS.map((symptom) => (
              <option key={symptom} value={symptom}>
                {symptom}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-600 mb-3 font-medium">الترتيب حسب</label>
          <div className="space-y-2">
            {(
              [
                { value: 'highest-rating', label: 'الأعلى تقييماً' },
                { value: 'nearest', label: 'الأقرب مكاناً' },
                { value: 'most-available-today', label: 'الأقرب موعد متاح' },
              ] as const
            ).map(({ value, label }) => (
              <label key={value} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                <input
                  type="radio"
                  name="sort"
                  value={value}
                  checked={sortBy === value}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-4 h-4 accent-cyan-600"
                  data-testid={`sort-${value}`}
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedSymptom || doctors.length === 0}
            data-testid="quick-book-submit"
            className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700 disabled:bg-gray-300 transition-colors"
          >
            التالي
          </button>
        </div>
      </div>
    </div>
  );
}







