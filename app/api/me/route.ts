import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const collection = session.role === 'doctor' ? 'doctors' : 'users';
    const userDoc = await adminDb.collection(collection).doc(session.id).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data()!;
    const { password, ...safeUser } = userData;

    const appointmentField = session.role === 'doctor' ? 'doctorId' : 'patientId';
    const appointmentsSnapshot = await adminDb
      .collection('appointments')
      .where(appointmentField, '==', session.id)
      .get();

    const appointments = appointmentsSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as Record<string, unknown>)
      .sort((a, b) => {
        const aDate = `${String(a['appointmentDate'])} ${String(a['slot'])}`;
        const bDate = `${String(b['appointmentDate'])} ${String(b['slot'])}`;
        return bDate.localeCompare(aDate);
      });

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.id,
        role: session.role,
        ...safeUser,
      },
      appointments,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


