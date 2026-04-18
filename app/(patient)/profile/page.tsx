'use client';

import { useQuery } from '@tanstack/react-query';
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
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
  });

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
              <p className="font-medium text-gray-900">{appointment.doctorName || 'طبيب'}</p>
              <p className="text-gray-600">{appointment.specialty || '-'}</p>
              <p className="text-gray-600">
                {appointment.appointmentDate} - {appointment.slot}
              </p>
              <p className="text-cyan-700 font-medium">{STATUS_LABELS[appointment.status] || appointment.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
