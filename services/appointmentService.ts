export type CreateAppointmentPayload = {
  doctorId: string;
  slot: string;
  appointmentDate: string;
  note?: string;
};

export async function createAppointment(payload: CreateAppointmentPayload) {
  const response = await fetch('/api/appointments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'تعذر إرسال طلب الحجز');
  }

  return data;
}

