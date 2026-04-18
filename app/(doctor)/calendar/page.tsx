'use client';

import { useQuery } from '@tanstack/react-query';

type CalendarResponse = {
  weekSchedule: Record<string, Record<string, string>>;
};

async function getDoctorCalendar(): Promise<CalendarResponse> {
  const response = await fetch('/api/doctor/calendar', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('تعذر تحميل التقويم');
  }
  return response.json() as Promise<CalendarResponse>;
}

export default function CalendarPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['doctorCalendar'],
    queryFn: getDoctorCalendar,
  });

  const days = data ? Object.keys(data.weekSchedule) : [];
  const slots = days.length ? Object.keys(data!.weekSchedule[days[0]]) : [];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 h-full text-right">
      <h2 className="text-lg font-bold text-gray-800 mb-6">جدول المواعيد الأسبوعي</h2>

      {isLoading && <p className="text-sm text-gray-500">جاري التحميل...</p>}
      {isError && <p className="text-sm text-red-700">تعذر تحميل بيانات التقويم.</p>}

      {!isLoading && !isError && days.length === 0 && <p className="text-sm text-gray-500">لا توجد بيانات.</p>}

      {!isLoading && !isError && days.length > 0 && (
        <div className="overflow-auto">
          <table className="w-full border-collapse min-w-[720px]">
            <thead>
              <tr>
                <th className="border border-gray-200 bg-gray-50 p-2 text-sm font-semibold">الوقت</th>
                {days.map((day) => (
                  <th key={day} className="border border-gray-200 bg-gray-50 p-2 text-sm font-semibold">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => (
                <tr key={slot}>
                  <td className="border border-gray-200 p-2 text-sm font-medium">{slot}</td>
                  {days.map((day) => {
                    const status = data!.weekSchedule[day][slot];
                    return (
                      <td key={`${day}-${slot}`} className="border border-gray-200 p-2">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            status === 'booked'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {status === 'booked' ? 'محجوز' : 'متاح'}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
