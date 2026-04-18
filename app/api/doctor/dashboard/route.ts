import { NextResponse } from 'next/server';
import { canAccessDoctorDashboard, getDoctorAccessState } from '@/lib/server/doctor-access';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const state = await getDoctorAccessState();
    if (!state) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!canAccessDoctorDashboard(state)) {
      return NextResponse.json({ error: 'Doctor access is restricted' }, { status: 403 });
    }

    const snapshot = await adminDb
      .collection('appointments')
      .where('doctorId', '==', state.id)
      .get();

    const appointments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Record<string, unknown>[];

    const pendingRequests = appointments.filter((a) => a['status'] === 'pending').length;
    const confirmedBookings = appointments.filter((a) => a['status'] === 'accepted').length;

    return NextResponse.json({
      totalRequests: pendingRequests,
      totalBookings: confirmedBookings,
      appointments,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}



