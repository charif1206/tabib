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

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const today = getTodayIsoDate();

    const [doctorDoc, appointmentsSnapshot] = await Promise.all([
      adminDb.collection('doctors').doc(id).get(),
      adminDb
        .collection('appointments')
        .where('doctorId', '==', id)
        .where('appointmentDate', '==', today)
        .get(),
    ]);

    if (!doctorDoc.exists) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    const doctorData = doctorDoc.data()!;
    const baseSlots = normalizeSlots(doctorData.availableSlots);
    const bookedSlots = new Set<string>();

    appointmentsSnapshot.forEach((appointmentDoc) => {
      const appointment = appointmentDoc.data();
      if (BLOCKING_STATUSES.has(appointment.status) && typeof appointment.slot === 'string') {
        bookedSlots.add(appointment.slot);
      }
    });

    const todayAvailableSlots = baseSlots.filter((slot) => !bookedSlots.has(slot));

    return NextResponse.json({
      doctor: {
        id: doctorDoc.id,
        full_name: (doctorData.full_name ?? '') as string,
        specialty: (doctorData.specialty ?? '') as string,
        bio: (doctorData.bio ?? '') as string,
        phone: (doctorData.phone ?? '') as string,
        availableSlots: baseSlots,
        todayAvailableSlots,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

