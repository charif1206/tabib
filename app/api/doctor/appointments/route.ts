import { NextResponse } from 'next/server';
import { canAccessDoctorDashboard, getDoctorAccessState } from '@/lib/server/doctor-access';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(request: Request) {
  try {
    const state = await getDoctorAccessState();
    if (!state) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!canAccessDoctorDashboard(state)) {
      return NextResponse.json({ error: 'Doctor access is restricted' }, { status: 403 });
    }

    const url = new URL(request.url);
    const type = url.searchParams.get('type');

    const snapshot = await adminDb
      .collection('appointments')
      .where('doctorId', '==', state.id)
      .get();

    let appointments = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as Record<string, unknown>)
      .sort((a, b) => {
        const aDate = `${String(b['appointmentDate'])} ${String(b['slot'])}`;
        const bDate = `${String(a['appointmentDate'])} ${String(a['slot'])}`;
        return aDate.localeCompare(bDate);
      });

    if (type === 'requests') {
      appointments = appointments.filter((a) => a['status'] === 'pending');
    } else if (type === 'bookings') {
      appointments = appointments.filter((a) => a['status'] === 'accepted');
    }

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
