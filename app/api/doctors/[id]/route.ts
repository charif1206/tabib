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

function getNextDaysIsoDates(days: number) {
  const result: string[] = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);

  for (let offset = 0; offset < days; offset += 1) {
    const next = new Date(base);
    next.setDate(base.getDate() + offset);
    result.push(next.toISOString().split('T')[0]);
  }

  return result;
}

function normalizeLocation(data: Record<string, unknown>) {
  const raw = data.location;
  if (raw && typeof raw === 'object') {
    const candidate = raw as { lat?: unknown; lng?: unknown };
    if (typeof candidate.lat === 'number' && typeof candidate.lng === 'number') {
      return { lat: candidate.lat, lng: candidate.lng };
    }
  }

  const latitude = data.latitude;
  const longitude = data.longitude;
  if (typeof latitude === 'number' && typeof longitude === 'number') {
    return { lat: latitude, lng: longitude };
  }

  return null;
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const today = getTodayIsoDate();
    const weekDates = getNextDaysIsoDates(7);
    const weekDateSet = new Set(weekDates);

    const [doctorDoc, appointmentsSnapshot] = await Promise.all([
      adminDb.collection('doctors').doc(id).get(),
      adminDb
        .collection('appointments')
        .where('doctorId', '==', id)
        .get(),
    ]);

    if (!doctorDoc.exists) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    const doctorData = doctorDoc.data() as Record<string, unknown>;
    const baseSlots = normalizeSlots(doctorData.availableSlots);
    const bookedSlotsByDate = new Map<string, Set<string>>();

    appointmentsSnapshot.forEach((appointmentDoc) => {
      const appointment = appointmentDoc.data();
      const appointmentDate = appointment.appointmentDate;
      const slot = appointment.slot;

      if (!weekDateSet.has(String(appointmentDate))) {
        return;
      }

      if (BLOCKING_STATUSES.has(appointment.status) && typeof slot === 'string') {
        if (!bookedSlotsByDate.has(String(appointmentDate))) {
          bookedSlotsByDate.set(String(appointmentDate), new Set());
        }
        bookedSlotsByDate.get(String(appointmentDate))!.add(slot);
      }
    });

    const weeklyAvailability = weekDates.map((date) => {
      const bookedSlots = bookedSlotsByDate.get(date) ?? new Set();
      const slots = baseSlots.filter((slot) => !bookedSlots.has(slot));
      return { date, slots };
    });

    const todayAvailability = weeklyAvailability.find((entry) => entry.date === today);
    const todayAvailableSlots = todayAvailability?.slots ?? [];

    return NextResponse.json({
      doctor: {
        id: doctorDoc.id,
        full_name: (doctorData.full_name ?? '') as string,
        specialty: (doctorData.specialty ?? '') as string,
        bio: (doctorData.bio ?? '') as string,
        phone: (doctorData.phone ?? '') as string,
        location: normalizeLocation(doctorData),
        availableSlots: baseSlots,
        todayAvailableSlots,
        weeklyAvailability,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

