import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

const DEFAULT_SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
const BLOCKING_STATUSES = new Set(['pending', 'accepted', 'rescheduled']);

function normalizeSlots(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return DEFAULT_SLOTS;
  }

  const slots = value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  return slots.length ? slots : DEFAULT_SLOTS;
}

function getTodayIsoDate() {
  return new Date().toISOString().split('T')[0];
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get('q')?.trim().toLowerCase() ?? '';
    const today = getTodayIsoDate();

    const [doctorsSnapshot, appointmentsSnapshot] = await Promise.all([
      adminDb.collection('doctors').get(),
      adminDb.collection('appointments').where('appointmentDate', '==', today).get(),
    ]);

    const bookedSlotsByDoctor = new Map<string, Set<string>>();

    appointmentsSnapshot.forEach((doc) => {
      const appointment = doc.data();
      if (!BLOCKING_STATUSES.has(appointment.status)) {
        return;
      }

      const doctorId = appointment.doctorId as string | undefined;
      const slot = appointment.slot as string | undefined;

      if (!doctorId || !slot) {
        return;
      }

      if (!bookedSlotsByDoctor.has(doctorId)) {
        bookedSlotsByDoctor.set(doctorId, new Set());
      }
      bookedSlotsByDoctor.get(doctorId)!.add(slot);
    });

    const doctors = doctorsSnapshot.docs
      .map((doc) => {
        const data = doc.data();
        const full_name = (data.full_name ?? '') as string;
        const specialty = (data.specialty ?? '') as string;
        const matches = !q || full_name.toLowerCase().includes(q) || specialty.toLowerCase().includes(q);

        if (!matches) {
          return null;
        }

        const configuredSlots = normalizeSlots(data.availableSlots);
        const booked = bookedSlotsByDoctor.get(doc.id) ?? new Set();
        const todayAvailableSlots = configuredSlots.filter((slot) => !booked.has(slot));

        return {
          id: doc.id,
          full_name,
          specialty,
          bio: (data.bio ?? '') as string,
          phone: (data.phone ?? '') as string,
          todayAvailableSlots,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ doctors });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
