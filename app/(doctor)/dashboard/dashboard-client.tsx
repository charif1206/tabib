'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Clock } from 'lucide-react';

async function getDoctorDashboard() {
  const res = await fetch('/api/doctor/dashboard', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch dashboard');
  return res.json();
}

async function getDoctorAppointments(type: 'requests' | 'bookings') {
  const res = await fetch(`/api/doctor/appointments?type=${type}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch ${type}`);
  return res.json();
}

async function updateDoctorAppointment(appointmentId: string, action: string, newSlot?: string) {
  const res = await fetch(`/api/doctor/appointments/${appointmentId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, new_time: newSlot }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update appointment');
  }
  return res.json();
}

export default function DoctorDashboardClient() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'requests' | 'bookings'>('requests');
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [rescheduleSlot, setRescheduleSlot] = useState('');
  const [actionType, setActionType] = useState<'accept' | 'reject' | 'reschedule' | null>(null);

  const { data: dashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: ['doctorDashboard'],
    queryFn: getDoctorDashboard,
  });

  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['doctorAppointments', activeTab],
    queryFn: () => getDoctorAppointments(activeTab),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, action, slot }: { id: string; action: string; slot?: string }) =>
      updateDoctorAppointment(id, action, slot),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctorAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['doctorDashboard'] });
      setSelectedAppointment(null);
      setActionType(null);
      setRescheduleSlot('');
    },
  });

  const handleAction = () => {
    if (!selectedAppointment || !actionType) return;

    updateMutation.mutate({
      id: selectedAppointment,
      action: actionType,
      slot: actionType === 'reschedule' ? rescheduleSlot : undefined,
    });
  };

  if (dashboardLoading) return <div className="p-6 text-gray-500">جاري التحميل...</div>;

  const availableSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

  return (
    <div className="space-y-6 p-6">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-100 rounded-lg p-4 text-right">
          <p className="text-gray-600 text-sm">طلبات pending</p>
          <p className="text-3xl font-bold text-cyan-600">{dashboard?.totalRequests || 0}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-lg p-4 text-right">
          <p className="text-gray-600 text-sm">حجوزات مؤكدة</p>
          <p className="text-3xl font-bold text-emerald-600">{dashboard?.totalBookings || 0}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-100 rounded-lg">
        <div className="flex gap-0 border-b border-gray-100">
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-3 text-sm font-medium text-center border-b-2 ${
              activeTab === 'requests'
                ? 'border-cyan-600 text-cyan-700'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            الطلبات
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex-1 py-3 text-sm font-medium text-center border-b-2 ${
              activeTab === 'bookings'
                ? 'border-cyan-600 text-cyan-700'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            الحجوزات المؤكدة
          </button>
        </div>

        {appointmentsLoading ? (
          <div className="p-6 text-gray-500">جاري التحميل...</div>
        ) : appointments?.appointments?.length === 0 ? (
          <div className="p-6 text-gray-500">لا توجد نتائج</div>
        ) : (
          <div className="p-4 space-y-3">
            {appointments?.appointments?.map((apt: any) => (
              <div
                key={apt.id}
                className="border border-gray-200 rounded-lg p-4 text-right hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <button
                    onClick={() => setSelectedAppointment(apt.id)}
                    className="text-cyan-600 text-sm font-medium hover:underline"
                  >
                    إجراء
                  </button>
                  <h3 className="font-bold text-gray-900">{apt.patientName}</h3>
                </div>
                <div className="flex items-center gap-1 text-gray-600 text-sm mb-2">
                  <Clock className="w-4 h-4" />
                  {apt.appointmentDate} - {apt.slot}
                </div>
                <div className="flex justify-between items-center">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-md ${
                      apt.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : apt.status === 'accepted'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {apt.status}
                  </span>
                  {apt.note && <span className="text-gray-500 text-xs">{apt.note}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 text-right">
            <h2 className="text-lg font-bold text-gray-900 mb-4">إجراء على الموعد</h2>

            <div className="space-y-3 mb-6">
              {activeTab === 'requests' && (
                <>
                  <button
                    onClick={() => setActionType('accept')}
                    className={`w-full py-2 px-4 rounded-lg border text-sm font-medium ${
                      actionType === 'accept'
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    قبول
                  </button>
                  <button
                    onClick={() => setActionType('reject')}
                    className={`w-full py-2 px-4 rounded-lg border text-sm font-medium ${
                      actionType === 'reject'
                        ? 'bg-red-100 border-red-300 text-red-700'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    رفض
                  </button>
                  <button
                    onClick={() => setActionType('reschedule')}
                    className={`w-full py-2 px-4 rounded-lg border text-sm font-medium ${
                      actionType === 'reschedule'
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    إعادة جدولة
                  </button>
                </>
              )}
            </div>

            {actionType === 'reschedule' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">اختر موعد جديد</label>
                <select
                  value={rescheduleSlot}
                  onChange={(e) => setRescheduleSlot(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2 text-sm"
                >
                  <option value="">اختر وقت</option>
                  {availableSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedAppointment(null);
                  setActionType(null);
                  setRescheduleSlot('');
                }}
                className="flex-1 py-2 px-4 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                إلغاء
              </button>
              <button
                onClick={handleAction}
                disabled={updateMutation.isPending || (actionType === 'reschedule' && !rescheduleSlot)}
                className="flex-1 py-2 px-4 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:bg-gray-300 text-sm font-medium"
              >
                {updateMutation.isPending ? 'جاري...' : 'تأكيد'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


