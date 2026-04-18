import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';

const APPOINTMENT_STATUSES = [
  'pending',
  'accepted',
  'rejected',
  'rescheduled',
  'completed',
  'no_show',
  'cancelled',
] as const;
const BLOCKING_STATUSES = new Set(['pending', 'accepted', 'rescheduled']);
const DEFAULT_SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

function normalizeSlots(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return DEFAULT_SLOTS;
  }

  const slots = value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  return slots.length ? slots : DEFAULT_SLOTS;
}

function getAllowedDateSet(days: number) {
  const dates = new Set<string>();
  const base = new Date();
  base.setHours(0, 0, 0, 0);

  for (let offset = 0; offset < days; offset += 1) {
    const candidate = new Date(base);
    candidate.setDate(base.getDate() + offset);
    dates.add(candidate.toISOString().split('T')[0]);
  }

  return dates;
}

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const snapshot = await adminDb.collection('appointments').where(`${session.role}Id`, '==', session.id).get();
    const appointments = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'patient') {
      return NextResponse.json({ error: 'Only patients can create appointments' }, { status: 403 });
    }

    const { doctorId, slot, appointmentDate, note } = await request.json();

    if (!doctorId || !slot || !appointmentDate) {
      return NextResponse.json({ error: 'doctorId, slot and appointmentDate are required' }, { status: 400 });
    }

    const normalizedDate = String(appointmentDate);
    const normalizedSlot = String(slot);
    const allowedDates = getAllowedDateSet(7);

    if (!allowedDates.has(normalizedDate)) {
      return NextResponse.json({ error: 'يمكنك الحجز خلال 7 ايام القادمة فقط' }, { status: 400 });
    }

    const doctorDoc = await adminDb.collection('doctors').doc(String(doctorId)).get();
    if (!doctorDoc.exists) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    const doctorData = doctorDoc.data()!;
    const availableSlots = normalizeSlots(doctorData.availableSlots);
    if (!availableSlots.includes(normalizedSlot)) {
      return NextResponse.json({ error: 'Selected slot is not in doctor schedule' }, { status: 400 });
    }

    const existingAtSlot = await adminDb
      .collection('appointments')
      .where('doctorId', '==', String(doctorId))
      .where('appointmentDate', '==', normalizedDate)
      .where('slot', '==', normalizedSlot)
      .get();

    const isTaken = existingAtSlot.docs.some((doc) => BLOCKING_STATUSES.has(String(doc.data().status)));
    if (isTaken) {
      return NextResponse.json({ error: 'Selected slot is no longer available' }, { status: 409 });
    }

    const patientDoc = await adminDb.collection('users').doc(session.id).get();
    if (!patientDoc.exists) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const patientData = patientDoc.data()!;
    const status: (typeof APPOINTMENT_STATUSES)[number] = 'pending';

    const appointmentPayload = {
      doctorId: String(doctorId),
      doctorName: (doctorData.full_name ?? '') as string,
      specialty: (doctorData.specialty ?? '') as string,
      patientId: session.id,
      patientName: (patientData.full_name ?? '') as string,
      appointmentDate: normalizedDate,
      slot: normalizedSlot,
      requested_time: normalizedSlot,
      note: typeof note === 'string' ? note.trim() : '',
      status,
      createdAt: new Date().toISOString(),
    };

    const created = await adminDb.collection('appointments').add(appointmentPayload);

    return NextResponse.json(
      {
        success: true,
        appointment: {
          id: created.id,
          ...appointmentPayload,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

