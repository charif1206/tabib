import { NextResponse } from 'next/server';
import { getDoctorAccessState } from '@/lib/server/doctor-access';

export async function GET() {
  try {
    const state = await getDoctorAccessState();
    if (!state) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      doctorId: state.id,
      verificationStatus: state.verificationStatus,
      subscriptionStatus: state.subscriptionStatus,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

