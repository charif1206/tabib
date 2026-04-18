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

    const doctorDoc = await adminDb.collection('doctors').doc(String(doctorId)).get();
    if (!doctorDoc.exists) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
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

    const doctorData = doctorDoc.data()!;
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

