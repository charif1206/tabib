'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

type TabType = 'requests' | 'bookings';

async function getDoctorAppointments(type: TabType) {
  const response = await fetch(`/api/doctor/appointments?type=${type}`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('تعذر تحميل المواعيد');
  }
  return response.json() as Promise<{ appointments: Array<Record<string, unknown>> }>;
}

async function updateDoctorAppointment(appointmentId: string, action: string, newTime?: string) {
  const response = await fetch(`/api/doctor/appointments/${appointmentId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, new_time: newTime }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'تعذر تحديث الموعد');
  }

  return data;
}

export default function DoctorAppointmentsList({ type }: { type: TabType }) {
  const queryClient = useQueryClient();
  const [openId, setOpenId] = useState<string | null>(null);
  const [action, setAction] = useState<'accept' | 'reject' | 'reschedule' | null>(null);
  const [newTime, setNewTime] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['doctorAppointments', type],
    queryFn: () => getDoctorAppointments(type),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, actionType, time }: { id: string; actionType: string; time?: string }) =>
      updateDoctorAppointment(id, actionType, time),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctorAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['doctorDashboard'] });
      setOpenId(null);
      setAction(null);
      setNewTime('');
    },
  });

  const slots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4">{type === 'requests' ? 'الطلبات الجديدة' : 'الحجوزات المؤكدة'}</h2>

      {isLoading && <p className="text-sm text-gray-500">جاري التحميل...</p>}

      {!isLoading && (!data?.appointments || data.appointments.length === 0) && (
        <p className="text-sm text-gray-500">لا توجد مواعيد حالياً.</p>
      )}

      <div className="space-y-3">
        {data?.appointments?.map((appointment) => {
          const id = String(appointment.id ?? '');
          return (
            <div key={id} className="border border-gray-100 rounded-lg p-4 text-right">
              <div className="flex items-start justify-between gap-2">
                <button
                  onClick={() => setOpenId(id)}
                  className="text-sm text-cyan-700 hover:underline"
                >
                  إجراء
                </button>
                <div>
                  <p className="font-semibold text-gray-900">{String(appointment.patientName || '-')}</p>
                  <p className="text-sm text-gray-600">
                    {String(appointment.appointmentDate || '-')} - {String(appointment.slot || '-')}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">الحالة: {String(appointment.status || '-')}</p>
            </div>
          );
        })}
      </div>

      {openId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-sm p-5 text-right">
            <h3 className="font-bold text-gray-900 mb-4">إدارة الموعد</h3>

            <div className="space-y-2">
              <button onClick={() => setAction('accept')} className="w-full px-3 py-2 border rounded-md text-sm">
                قبول
              </button>
              <button onClick={() => setAction('reject')} className="w-full px-3 py-2 border rounded-md text-sm">
                رفض
              </button>
              <button onClick={() => setAction('reschedule')} className="w-full px-3 py-2 border rounded-md text-sm">
                إعادة جدولة
              </button>
            </div>

            {action === 'reschedule' && (
              <select
                value={newTime}
                onChange={(event) => setNewTime(event.target.value)}
                className="w-full mt-3 px-3 py-2 border rounded-md text-sm"
              >
                <option value="">اختر وقت جديد</option>
                {slots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            )}

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setOpenId(null);
                  setAction(null);
                  setNewTime('');
                }}
                className="flex-1 px-3 py-2 border rounded-md text-sm"
              >
                إغلاق
              </button>
              <button
                disabled={!action || updateMutation.isPending || (action === 'reschedule' && !newTime)}
                onClick={() => {
                  if (!action) return;
                  updateMutation.mutate({ id: openId, actionType: action, time: newTime || undefined });
                }}
                className="flex-1 px-3 py-2 bg-cyan-600 text-white rounded-md text-sm disabled:bg-gray-300"
              >
                {updateMutation.isPending ? 'جاري...' : 'تأكيد'}
              </button>
            </div>

            {updateMutation.isError && (
              <p className="text-xs text-red-600 mt-2">{(updateMutation.error as Error).message}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

