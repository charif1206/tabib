'use client';

import { useQuery } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { getMe } from '@/services/meService';

const STATUS_LABELS: Record<string, string> = {
  pending: 'pending',
  accepted: 'accepted',
  rejected: 'rejected',
  rescheduled: 'rescheduled',
  completed: 'completed',
  no_show: 'no_show',
  cancelled: 'cancelled',
};

export default function PatientProfilePage() {
  const queryClient = useQueryClient();
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<'cancel' | 'accept_reschedule' | 'reject_reschedule' | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
  });

  const appointmentActionMutation = useMutation({
    mutationFn: async ({ appointmentId, action }: { appointmentId: string; action: string }) => {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.error || 'تعذر تحديث الموعد');
      }
      return body;
    },
    onSuccess: () => {
      setSelectedAppointmentId(null);
      setSelectedAction(null);
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['doctorAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['doctorDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['doctor'] });
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
    },
  });

  const selectedAppointment = data?.appointments.find((item) => item.id === selectedAppointmentId);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">المعلومات الشخصية</h2>

        {isLoading && <p className="text-sm text-gray-500">جاري التحميل...</p>}
        {isError && <p className="text-sm text-red-700">{(error as Error).message || 'تعذر تحميل الملف الشخصي'}</p>}

        {data && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="border border-gray-100 rounded-lg p-3">
              <p className="text-gray-500">الاسم</p>
              <p className="font-medium text-gray-900">{data.user.full_name || '-'}</p>
            </div>
            <div className="border border-gray-100 rounded-lg p-3">
              <p className="text-gray-500">رقم الهاتف</p>
              <p className="font-medium text-gray-900">{data.user.phone || '-'}</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">مواعيدي</h2>

        {data && data.appointments.length === 0 && <p className="text-sm text-gray-500">لا توجد مواعيد حتى الآن.</p>}

        <div className="space-y-3">
          {data?.appointments.map((appointment) => (
            <div key={appointment.id} className="border border-gray-100 rounded-lg p-4 text-sm">
              <div className="flex items-start justify-between gap-3">
                <button
                  onClick={() => setSelectedAppointmentId(appointment.id)}
                  className="text-xs text-cyan-700 hover:underline"
                >
                  إجراء
                </button>
                <p className="font-medium text-gray-900">{appointment.doctorName || 'طبيب'}</p>
              </div>
              <p className="text-gray-600">{appointment.specialty || '-'}</p>
              <p className="text-gray-600">
                {appointment.appointmentDate} - {appointment.slot}
              </p>
              <p className="text-cyan-700 font-medium">{STATUS_LABELS[appointment.status] || appointment.status}</p>
              {appointment.rescheduledSlot && (
                <p className="text-xs text-amber-700 mt-1">موعد مقترح جديد: {appointment.rescheduledSlot}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedAppointmentId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-5 w-full max-w-sm text-right">
            <h3 className="font-bold text-gray-900 mb-3">إدارة الموعد</h3>

            <div className="space-y-2 mb-4">
              {selectedAppointment && ['pending', 'accepted', 'rescheduled'].includes(selectedAppointment.status) && (
                <button
                  onClick={() => setSelectedAction('cancel')}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                >
                  إلغاء الموعد
                </button>
              )}
              {selectedAppointment?.status === 'rescheduled' && (
                <>
                  <button
                    onClick={() => setSelectedAction('accept_reschedule')}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  >
                    قبول الموعد البديل
                  </button>
                  <button
                    onClick={() => setSelectedAction('reject_reschedule')}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  >
                    رفض الموعد البديل
                  </button>
                </>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedAppointmentId(null);
                  setSelectedAction(null);
                }}
                className="flex-1 px-3 py-2 border rounded-md text-sm"
              >
                إغلاق
              </button>
              <button
                disabled={!selectedAction || appointmentActionMutation.isPending}
                onClick={() => {
                  if (!selectedAction) return;
                  appointmentActionMutation.mutate({ appointmentId: selectedAppointmentId, action: selectedAction });
                }}
                className="flex-1 px-3 py-2 bg-cyan-600 text-white rounded-md text-sm disabled:bg-gray-300"
              >
                {appointmentActionMutation.isPending ? 'جاري...' : 'تأكيد'}
              </button>
            </div>

            {appointmentActionMutation.isError && (
              <p className="text-xs text-red-600 mt-2">{(appointmentActionMutation.error as Error).message}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
