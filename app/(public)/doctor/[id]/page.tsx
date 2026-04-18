'use client';

import { useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useParams } from 'next/navigation';
import { getDoctorById } from '@/services/doctorService';
import { createAppointment } from '@/services/appointmentService';
import { useBookingStore } from '@/lib/stores/bookingStore';

type BookingForm = {
  slot: string;
  note: string;
};

function getTodayIsoDate() {
  return new Date().toISOString().split('T')[0];
}

export default function DoctorProfilePage() {
  const params = useParams<{ id: string }>();
  const doctorId = params.id;
  const queryClient = useQueryClient();

  const selectedSlot = useBookingStore((state) => state.selectedSlotByDoctor[doctorId] ?? '');
  const setSelectedSlot = useBookingStore((state) => state.setSelectedSlot);
  const bookingMessage = useBookingStore((state) => state.bookingMessage);
  const setBookingMessage = useBookingStore((state) => state.setBookingMessage);
  const clearBookingMessage = useBookingStore((state) => state.clearBookingMessage);

  const { data: doctor, isLoading, isError } = useQuery({
    queryKey: ['doctor', doctorId],
    queryFn: () => getDoctorById(doctorId),
    enabled: Boolean(doctorId),
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<BookingForm>({
    defaultValues: {
      slot: selectedSlot,
      note: '',
    },
  });

  useEffect(() => {
    setValue('slot', selectedSlot);
  }, [selectedSlot, setValue]);

  const bookingMutation = useMutation({
    mutationFn: (values: BookingForm) =>
      createAppointment({
        doctorId,
        slot: values.slot,
        note: values.note,
        appointmentDate: getTodayIsoDate(),
      }),
    onSuccess: () => {
      setBookingMessage('تم إرسال طلب الحجز بنجاح وحالته pending.');
      reset({ slot: '', note: '' });
      setSelectedSlot(doctorId, '');
      queryClient.invalidateQueries({ queryKey: ['doctor', doctorId] });
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (error: Error) => {
      setBookingMessage(error.message);
    },
  });

  const onSubmit = (values: BookingForm) => {
    clearBookingMessage();
    bookingMutation.mutate(values);
  };

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto p-4 py-8">
      {isLoading && <div className="bg-white border border-gray-100 rounded-xl p-6 text-gray-500">جاري تحميل بيانات الطبيب...</div>}
      {isError && <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">تعذر تحميل صفحة الطبيب.</div>}

      {doctor && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm text-right">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{doctor.full_name}</h1>
          <p className="text-cyan-700 mb-3">{doctor.specialty}</p>
          <p className="text-gray-600 mb-6">{doctor.bio || 'لا يوجد نبذة متاحة.'}</p>

          <div className="flex items-center gap-2 text-gray-700 mb-3">
            <Clock className="w-4 h-4" />
            <span className="font-medium">المواعيد المتاحة اليوم</span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {doctor.todayAvailableSlots.length === 0 && (
                <p className="text-sm text-gray-500">لا توجد مواعيد متاحة حالياً.</p>
              )}

              {doctor.todayAvailableSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => {
                    setSelectedSlot(doctorId, slot);
                    setValue('slot', slot, { shouldValidate: true });
                  }}
                  className={`px-3 py-2 rounded-lg border text-sm ${
                    selectedSlot === slot ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-white text-gray-700 border-gray-200'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>

            <input type="hidden" {...register('slot', { required: 'يرجى اختيار وقت الموعد' })} />
            {errors.slot && <p className="text-sm text-red-600">{errors.slot.message}</p>}

            <textarea
              rows={3}
              placeholder="ملاحظة (اختياري)"
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-cyan-500"
              {...register('note')}
            />

            <button
              type="submit"
              disabled={bookingMutation.isPending || doctor.todayAvailableSlots.length === 0}
              className="px-6 py-3 bg-cyan-600 text-white font-medium rounded-lg hover:bg-cyan-700 disabled:bg-gray-300"
            >
              {bookingMutation.isPending ? 'جاري الإرسال...' : 'إرسال طلب الحجز'}
            </button>
          </form>

          {bookingMessage && (
            <p className={`mt-4 text-sm ${bookingMessage.includes('نجاح') ? 'text-emerald-700' : 'text-red-700'}`}>{bookingMessage}</p>
          )}
        </div>
      )}
    </div>
  );
}
